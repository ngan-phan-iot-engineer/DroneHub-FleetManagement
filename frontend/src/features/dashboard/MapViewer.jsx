import { useEffect, useRef, memo, useState, useMemo, useCallback } from "react";
import { createMapAdapterAsync } from "../../utils/map";
import { ENV } from "../../config/env";
import telemetryService from "../../services/telemetryService";
import telemetryDomain from "../../domain/telemetry";
import MapLayerController from "./MapLayerController";
import {
  MAP_INTERACTION_MODE_IDLE,
  MAP_INTERACTION_MODE_RESTRICTED_ZONE,
  MAP_INTERACTION_MODE_WAYPOINT,
} from "./mapInteractionModes";
import {
  handleEscapeKey,
  handleRestrictedZoneClick,
  handleRestrictedZoneFinalize,
  handleWaypointMapClick,
} from "./mapInteractions";

/**
 * MapViewer Component - Right panel displaying project map with aggregated view
 * Uses MapAdapter to render map compatible with future engine replacement
 */

// Fallback style when Mapbox token is not available
const FALLBACK_STYLE = {
  version: 8,
  sources: {
    "osm-tiles": { 
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

const getProjectCoordinates = (project) => {
  const geometry = project?.pathGeoJson?.geometry;

  if (geometry && Array.isArray(geometry.coordinates)) {
    if (geometry.type === "Point") {
      return [geometry.coordinates];
    }

    if (geometry.type === "LineString") {
      return geometry.coordinates;
    }

    if (geometry.type === "MultiLineString") {
      return geometry.coordinates[0] || [];
    }

    if (geometry.type === "Polygon") {
      return geometry.coordinates[0] || [];
    }

    if (geometry.type === "MultiPolygon") {
      return geometry.coordinates[0]?.[0] || [];
    }
  }

  return Array.isArray(project?.coordinates) ? project.coordinates : [];
};

const getProjectGeometry = (project) => project?.pathGeoJson?.geometry || null;

const getGeometryBoundsCoordinates = (geometry) => {
  if (!geometry || !Array.isArray(geometry.coordinates)) {
    return [];
  }

  if (geometry.type === "Point") {
    const [lng, lat] = geometry.coordinates;
    const delta = 0.001;
    return [
      [lng - delta, lat - delta],
      [lng + delta, lat + delta],
    ];
  }

  if (geometry.type === "LineString") {
    return geometry.coordinates;
  }

  if (geometry.type === "MultiLineString") {
    return geometry.coordinates.flat();
  }

  if (geometry.type === "Polygon") {
    return geometry.coordinates[0] || [];
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.flat(2);
  }

  return [];
};

const getClosedPolygonRing = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return [];
  }
  const normalizeCoordinate = (coord) => {
    if (!Array.isArray(coord) || coord.length < 2) return coord;
    let [a, b] = coord;
    if (!Number.isFinite(a) || !Number.isFinite(b)) return coord;
    // If second value looks outside latitude range, swap (likely [lat,lng] given)
    if (Math.abs(b) > 90 && Math.abs(a) <= 90) {
      return [b, a];
    }
    // If first value within lat range and second within lng range but appears swapped, swap
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180 && Math.abs(a) > Math.abs(b)) {
      return [b, a];
    }
    return [a, b];
  };

  const ring = coordinates.map((coordinate) => [...normalizeCoordinate(coordinate)]);

  const firstCoordinate = ring[0];
  const lastCoordinate = ring[ring.length - 1];
  const isValidCoordinate = (coordinate) => (
    Array.isArray(coordinate)
    && coordinate.length >= 2
    && Number.isFinite(coordinate[0])
    && Number.isFinite(coordinate[1])
  );

  if (!isValidCoordinate(firstCoordinate) || !isValidCoordinate(lastCoordinate)) {
    console.warn("[MapViewer] Invalid polygon coordinate", {
      firstCoordinate,
      lastCoordinate,
      ring,
    });
    return ring;
  }

  const [firstLng, firstLat] = firstCoordinate;
  const [lastLng, lastLat] = lastCoordinate;

  if (firstLng !== lastLng || firstLat !== lastLat) {
    ring.push([firstLng, firstLat]);
  }

  return ring;
};

const getCoordinateBounds = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return null;
  }

  let minLng = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLng = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;

  coordinates.forEach((coordinate) => {
    if (!Array.isArray(coordinate) || coordinate.length < 2) {
      return;
    }

    const [lng, lat] = coordinate;
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      return;
    }

    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  });

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(maxLat)
  ) {
    return null;
  }

  return { minLng, minLat, maxLng, maxLat };
};

const getBoundsCenter = (bounds) => [
  (bounds.minLng + bounds.maxLng) / 2,
  (bounds.minLat + bounds.maxLat) / 2,
];

const getSuggestedZoom = (bounds) => {
  const lngSpan = bounds.maxLng - bounds.minLng;
  const latSpan = bounds.maxLat - bounds.minLat;
  const span = Math.max(lngSpan, latSpan);

  if (span <= 0.002) return 18;
  if (span <= 0.005) return 17;
  if (span <= 0.01) return 16;
  if (span <= 0.02) return 15;
  return 14;
};

// Centralized project status color mapping
const PROJECT_STATUS_COLORS = {
  ACTIVE: {
    fill: "#ffedd5", // light orange
    line: "#f97316", // orange
    marker: "#f97316",
  },
  COMPLETED: {
    fill: "#dcfce7", // light green
    line: "#10b981", // green
    marker: "#10b981",
  },
  PENDING: {
    fill: "#fff7ed", // light yellow
    line: "#f59e0b", // yellow
    marker: "#f59e0b",
  },
  DEFAULT: {
    fill: "#e0e7ff",
    line: "#cbd5e1",
    marker: "#6b7280",
  }
};

const normalizeStatusKey = (status) => {
  if (!status) return "DEFAULT";
  const s = String(status).toLowerCase();
  if (s.includes("hoàn") || s.includes("completed") || s.includes("complete")) return "COMPLETED";
  if (s.includes("đang") || s.includes("active") || s.includes("bay")) return "ACTIVE";
  if (s.includes("chờ") || s.includes("pending") || s.includes("wait")) return "PENDING";
  return "DEFAULT";
};

// Compute polygon centroid (planar) from closed ring of [lng,lat]
const computePolygonCentroid = (ring) => {
  if (!Array.isArray(ring) || ring.length === 0) return null;
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i];
    const [x1, y1] = ring[i + 1];
    const a = x0 * y1 - x1 * y0;
    area += a;
    cx += (x0 + x1) * a;
    cy += (y0 + y1) * a;
  }
  if (area === 0) {
    // fallback to average
    const sum = ring.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0]);
    return [sum[0] / ring.length, sum[1] / ring.length];
  }
  area = area / 2;
  cx = cx / (6 * area);
  cy = cy / (6 * area);
  return [cx, cy];
};

const normalizeAngle = (angle) => {
  const next = Number(angle) || 0;
  return ((next % 360) + 360) % 360;
};

const interpolateHeading = (from, to, alpha) => {
  const start = normalizeAngle(from);
  const end = normalizeAngle(to);
  const delta = ((end - start + 540) % 360) - 180;
  return normalizeAngle(start + delta * alpha);
};

const buildDroneHeadingLine = (coordinates, headingDegrees, lengthMeters = 36) => {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return [];
  }

  const [lng, lat] = coordinates;
  const headingRadians = (normalizeAngle(headingDegrees) * Math.PI) / 180;
  const deltaLat = (lengthMeters / 111320) * Math.cos(headingRadians);
  const lngScale = Math.max(Math.cos((lat * Math.PI) / 180), 0.2);
  const deltaLng = (lengthMeters / (111320 * lngScale)) * Math.sin(headingRadians);

  return [
    [lng, lat],
    [lng + deltaLng, lat + deltaLat],
  ];
};

const getTelemetryDroneState = (drone) => {
  const missionStatus = String(drone?.missionStatus || "").toLowerCase();
  const battery = Number(drone?.batteryPercent ?? 100);
  const signal = Number(drone?.signalStrengthPercent ?? 100);
  const speed = Number(drone?.speedMetersPerSecond ?? 0);
  const altitude = Number(drone?.altitudeMeters ?? 0);

  if (signal <= 20) return "offline";
  if (missionStatus === "rtl") return "rtl";
  if (missionStatus === "landing") return "landing";
  if (battery <= 25) return "warning_battery";
  if (missionStatus === "idle" || (speed < 1 && altitude < 2)) return "idle";
  return "flying";
};

const pointInPolygon = (point, ring) => {
  if (!Array.isArray(point) || point.length < 2 || !Array.isArray(ring) || ring.length < 3) {
    return false;
  }

  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);

    if (intersects) inside = !inside;
  }

  return inside;
};

const getMapEventCoordinate = (event) => {
  if (event?.lngLat && Number.isFinite(event.lngLat.lng) && Number.isFinite(event.lngLat.lat)) {
    return [event.lngLat.lng, event.lngLat.lat];
  }

  if (event?.latlng && Number.isFinite(event.latlng.lng) && Number.isFinite(event.latlng.lat)) {
    return [event.latlng.lng, event.latlng.lat];
  }

  return null;
};

const getApproxDistanceMeters = (from, to) => {
  if (!Array.isArray(from) || !Array.isArray(to)) return Number.POSITIVE_INFINITY;
  const [lng1, lat1] = from;
  const [lng2, lat2] = to;
  const metersPerDegLat = 111320;
  const metersPerDegLng = Math.cos(((lat1 + lat2) * 0.5 * Math.PI) / 180) * 111320;
  const dx = (lng2 - lng1) * metersPerDegLng;
  const dy = (lat2 - lat1) * metersPerDegLat;
  return Math.sqrt(dx * dx + dy * dy);
};

const missionStateLabel = {
  flying: "Flying",
  rtl: "RTL",
  landing: "Landing",
  idle: "Idle",
  offline: "Offline",
  warning_battery: "Warning Battery",
};

const MAP_INTERACTION_MODE_POINT_ANNOTATION = "point_annotation";
const MAP_INTERACTION_MODE_LINE_ANNOTATION = "line_annotation";
const MAP_INTERACTION_MODE_AREA_ANNOTATION = "area_annotation";
const MAP_INTERACTION_MODE_TASK_AREA = "task_area";

const TOOL_COLOR_PRESETS = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Green', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Cyan', value: '#0ea5e9' },
];

const DEFAULT_TOOL_COLORS = {
  [MAP_INTERACTION_MODE_POINT_ANNOTATION]: '#2563eb',
  [MAP_INTERACTION_MODE_LINE_ANNOTATION]: '#10b981',
  [MAP_INTERACTION_MODE_AREA_ANNOTATION]: '#8b5cf6',
  [MAP_INTERACTION_MODE_TASK_AREA]: '#f59e0b',
  [MAP_INTERACTION_MODE_WAYPOINT]: '#0ea5e9',
  [MAP_INTERACTION_MODE_RESTRICTED_ZONE]: '#ef4444',
};

function MapViewer({ projects, selectedProject, hoveredProjectId, mapStyle, statusById, showOperationalToolbar = false }) {
  const safeProjects = Array.isArray(projects) ? projects : [];
  const mapContainerRef = useRef(null);
  const mapAdapterRef = useRef(null);
  const mapClickHandlerRef = useRef(null);
  const mapDoubleClickHandlerRef = useRef(null);
  const currentDronesRef = useRef(new Map());
  const previousEventStateRef = useRef(new Map());
  const controllerRef = useRef(null);
  const telemetryTimeoutRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedDroneId, setSelectedDroneId] = useState("");
  const [selectedDroneTelemetry, setSelectedDroneTelemetry] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [telemetryActive, setTelemetryActive] = useState(false);
  const [hudHost, setHudHost] = useState(null);
  const [interactionMode, setInteractionMode] = useState(MAP_INTERACTION_MODE_IDLE);
  const [toolColors, setToolColors] = useState(DEFAULT_TOOL_COLORS);
  const POINT_ANNOTATIONS_KEY = 'webgcs:point-annotations';
  const LINE_ANNOTATIONS_KEY = 'webgcs:line-annotations';
  const AREA_ANNOTATIONS_KEY = 'webgcs:area-annotations';
  const TASK_AREA_ANNOTATIONS_KEY = 'webgcs:task-area-annotations';
  const [pointAnnotations, setPointAnnotations] = useState(() => {
    try {
      const raw = localStorage.getItem(POINT_ANNOTATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  });
  const [lineAnnotations, setLineAnnotations] = useState(() => {
    try {
      const raw = localStorage.getItem(LINE_ANNOTATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  });
  const [areaAnnotations, setAreaAnnotations] = useState(() => {
    try {
      const raw = localStorage.getItem(AREA_ANNOTATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  });
  const [taskAreaAnnotations, setTaskAreaAnnotations] = useState(() => {
    try {
      const raw = localStorage.getItem(TASK_AREA_ANNOTATIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      return [];
    }
  });
  const [lineDraftPoints, setLineDraftPoints] = useState([]);
  const [areaDraftPoints, setAreaDraftPoints] = useState([]);
  const [taskAreaDraftPoints, setTaskAreaDraftPoints] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  // Mission workflow state (PHASE 4)
  const MISSION_STORAGE_KEY = 'webgcs:missions';
  const [missions, setMissions] = useState(() => {
    try {
      const raw = localStorage.getItem(MISSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentMission, setCurrentMission] = useState(null);
  const [missionState, setMissionState] = useState('draft'); // draft|ready|assigned|active|completed
  const [assignedDroneId, setAssignedDroneId] = useState(null);
  const [missionProgress, setMissionProgress] = useState({
    currentWaypointIndex: 0,
    totalWaypoints: 0,
    percent: 0,
  });
  const missionTimerRef = useRef(null);
  const MISSION_RUNTIME_KEY = 'webgcs:mission-runtime';
  const [hasToken] = useState(() => !!ENV.mapboxAccessToken);
  const isEditingMission = interactionMode === MAP_INTERACTION_MODE_WAYPOINT;
  const isRestrictedZoneEditMode = interactionMode === MAP_INTERACTION_MODE_RESTRICTED_ZONE;
  const isTaskAreaEditMode = interactionMode === MAP_INTERACTION_MODE_TASK_AREA;
  // Allow rendering by default (Leaflet adapter will be used when forced)
  const [canRenderMap] = useState(() => true);

  // Visual colors for map entities — desaturated, toned down for premium operational aesthetic
  const ENTITY_VISUAL_COLORS = {
    mission_area: {
      fill: "rgba(209, 250, 229, 1)",
      line: "#0d8b7a",
      marker: "#0d8b7a",
    },
    flight_path: {
      fill: "rgba(59,130,246,0.08)",
      line: "#5b7cb0",
      marker: "#5b7cb0",
    },
    drone_position: {
      fill: "#dff2ff",
      line: "#0284c7",
      marker: "#0284c7",
    },
    geofence: {
      fill: "rgba(239, 68, 68, 0.04)",
      line: "#cf7f7f",
      marker: "#cf7f7f",
    },
    delivery_route: {
      fill: "rgba(249, 115, 22, 0.05)",
      line: "#d69060",
      marker: "#d69060",
    },
    default: PROJECT_STATUS_COLORS.DEFAULT,
  };

  useEffect(() => {
    const canvas = mapAdapterRef.current?.getCanvas();
    if (!canvas) return;
    if (interactionMode === MAP_INTERACTION_MODE_TASK_AREA) {
      canvas.style.cursor = 'crosshair';
    }
  }, [interactionMode]);

  const activeToolLabel = useMemo(() => {
    if (interactionMode === MAP_INTERACTION_MODE_POINT_ANNOTATION) return 'Point annotations';
    if (interactionMode === MAP_INTERACTION_MODE_LINE_ANNOTATION) return 'Line annotations';
    if (interactionMode === MAP_INTERACTION_MODE_AREA_ANNOTATION) return 'Area annotations';
    if (interactionMode === MAP_INTERACTION_MODE_TASK_AREA) return 'Task area';
    if (interactionMode === MAP_INTERACTION_MODE_RESTRICTED_ZONE) return 'Restricted zone';
    if (interactionMode === MAP_INTERACTION_MODE_WAYPOINT) return 'Flight route planning';
    return 'Map-first interaction';
  }, [interactionMode]);

  const annotationLegend = useMemo(() => ([
    { label: 'Point', color: ENTITY_VISUAL_COLORS.drone_position.marker, text: 'Đánh dấu vị trí quan trọng' },
    { label: 'Line', color: ENTITY_VISUAL_COLORS.flight_path.marker, text: 'Vẽ tuyến đường / đường dây / ranh tuyến' },
    { label: 'Area', color: ENTITY_VISUAL_COLORS.mission_area.marker, text: 'Ghi chú khu vực / vùng khảo sát' },
    { label: 'Task area', color: '#0f766e', text: 'Sinh tuyến bay phủ kín khu vực nhiệm vụ' },
    { label: 'Restricted', color: ENTITY_VISUAL_COLORS.geofence.marker, text: 'Cảnh báo hoặc khóa bay' },
    { label: 'Route', color: ENTITY_VISUAL_COLORS.delivery_route.marker, text: 'Tuyến bay, cứu hộ hoặc kiểm tra' },
  ]), [ENTITY_VISUAL_COLORS]);

  const activeToolColor = toolColors[interactionMode] || DEFAULT_TOOL_COLORS[interactionMode] || '#2563eb';

  function getDraftEntityClass(mode) {
    if (mode === MAP_INTERACTION_MODE_POINT_ANNOTATION) return 'point_annotation';
    if (mode === MAP_INTERACTION_MODE_LINE_ANNOTATION) return 'line_annotation';
    if (mode === MAP_INTERACTION_MODE_AREA_ANNOTATION) return 'area_annotation';
    if (mode === MAP_INTERACTION_MODE_TASK_AREA) return 'task_area';
    if (mode === MAP_INTERACTION_MODE_RESTRICTED_ZONE) return 'restricted_zone';
    if (mode === MAP_INTERACTION_MODE_WAYPOINT) return 'waypoint_draft';
    return 'point_annotation';
  }

  function buildDraftFeatures(points, mode, color) {
    return (Array.isArray(points) ? points : []).map((coord, index) => ({
      type: 'Feature',
      id: `${mode || 'draft'}-${index}-${coord?.[0]}-${coord?.[1]}`,
      properties: {
        entityClass: getDraftEntityClass(mode),
        color,
        markerColor: color,
      },
      geometry: {
        type: 'Point',
        coordinates: coord,
      },
    }));
  }

  const toolbarActionGroups = useMemo(() => ([
    {
      title: 'Chú thích & lập tuyến',
      items: [
        { id: MAP_INTERACTION_MODE_POINT_ANNOTATION, label: 'Point', hint: 'Ghi chú điểm', icon: '•' },
        { id: MAP_INTERACTION_MODE_LINE_ANNOTATION, label: 'Line', hint: 'Vẽ đường', icon: '╱' },
        { id: MAP_INTERACTION_MODE_AREA_ANNOTATION, label: 'Area', hint: 'Vẽ vùng', icon: '▣' },
        { id: MAP_INTERACTION_MODE_TASK_AREA, label: 'Task area', hint: 'Vùng nhiệm vụ', icon: '⬚' },
        { id: MAP_INTERACTION_MODE_RESTRICTED_ZONE, label: 'Restricted', hint: 'Cấm / giới hạn bay', icon: '⛔' },
        { id: MAP_INTERACTION_MODE_WAYPOINT, label: 'Route', hint: 'Lập kế hoạch bay', icon: '➜' },
      ],
    },
    {
      title: 'Vận hành',
      items: [
        { id: 'dock-management', label: 'Dock', hint: 'Quản lý Dock', icon: '⌂' },
        { id: 'aircraft-tracking', label: 'Tracking', hint: 'Theo dõi drone', icon: '◎' },
        { id: 'device-list', label: 'Devices', hint: 'Danh sách thiết bị', icon: '≡' },
        { id: 'mission-workflow', label: 'Mission', hint: 'Luồng nhiệm vụ', icon: '↺' },
      ],
    },
  ]), []);

  function setToolbarMode(mode) {
    setInteractionMode((prev) => (prev === mode ? MAP_INTERACTION_MODE_IDLE : mode));
    if (mode !== MAP_INTERACTION_MODE_LINE_ANNOTATION) setLineDraftPoints([]);
    if (mode !== MAP_INTERACTION_MODE_AREA_ANNOTATION) setAreaDraftPoints([]);
    if (mode !== MAP_INTERACTION_MODE_TASK_AREA) setTaskAreaDraftPoints([]);
    if (controllerRef.current) {
      controllerRef.current.clearInteractionDraft();
    }
  }

  function handleToolbarAction(actionId) {
    if (actionId === MAP_INTERACTION_MODE_POINT_ANNOTATION
      || actionId === MAP_INTERACTION_MODE_LINE_ANNOTATION
      || actionId === MAP_INTERACTION_MODE_AREA_ANNOTATION
      || actionId === MAP_INTERACTION_MODE_TASK_AREA
      || actionId === MAP_INTERACTION_MODE_RESTRICTED_ZONE
      || actionId === MAP_INTERACTION_MODE_WAYPOINT) {
      setToolbarMode(actionId);
      addActivity(`Activated ${actionId.replace(/_/g, ' ')}`, 'info');
      return;
    }

    if (actionId === 'dock-management') {
      addActivity('Dock management is ready on the map shell', 'info');
      return;
    }

    if (actionId === 'aircraft-tracking') {
      if (selectedDroneId) {
        addActivity(`Tracking selected drone: ${selectedDroneId}`, 'info');
        return;
      }
      const firstDrone = currentDronesRef.current.keys().next().value;
      if (firstDrone) setSelectedDroneId(firstDrone);
      addActivity('Aircraft tracking is linked to live telemetry', 'info');
      return;
    }

    if (actionId === 'device-list') {
      addActivity('Device list shows live drones and docks from telemetry', 'info');
      return;
    }

    if (actionId === 'mission-workflow') {
      addActivity('Mission workflow includes save, load, assign, activate, and complete', 'info');
    }
  }

  // Single-action delete: clears drafts first, otherwise deletes last committed annotation by type
  const handleDeleteAction = useCallback(() => {
    // If any draft exists, clear drafts
    if ((lineDraftPoints && lineDraftPoints.length > 0) || (areaDraftPoints && areaDraftPoints.length > 0) || (taskAreaDraftPoints && taskAreaDraftPoints.length > 0)) {
      setLineDraftPoints([]);
      setAreaDraftPoints([]);
      setTaskAreaDraftPoints([]);
      if (controllerRef.current && typeof controllerRef.current.clearInteractionDraft === 'function') {
        controllerRef.current.clearInteractionDraft();
      }
      addActivity('Cleared draft annotations', 'info');
      return;
    }

    // No drafts — remove last committed annotation depending on availability
    if (pointAnnotations && pointAnnotations.length > 0) {
      setPointAnnotations((prev) => {
        const next = prev.slice(0, -1);
        addActivity('Deleted last point annotation', 'info');
        return next;
      });
      return;
    }

    if (lineAnnotations && lineAnnotations.length > 0) {
      setLineAnnotations((prev) => {
        const next = prev.slice(0, -1);
        addActivity('Deleted last line annotation', 'info');
        return next;
      });
      return;
    }

    if (areaAnnotations && areaAnnotations.length > 0) {
      setAreaAnnotations((prev) => {
        const next = prev.slice(0, -1);
        addActivity('Deleted last area annotation', 'info');
        return next;
      });
      return;
    }

    if (taskAreaAnnotations && taskAreaAnnotations.length > 0) {
      setTaskAreaAnnotations((prev) => {
        const next = prev.slice(0, -1);
        addActivity('Deleted last task area', 'info');
        return next;
      });
      return;
    }

    addActivity('No drafts or annotations to delete', 'warn');
  }, [lineDraftPoints, areaDraftPoints, taskAreaDraftPoints, pointAnnotations, lineAnnotations, areaAnnotations, taskAreaAnnotations]);

  const geofenceRings = useMemo(
    () => safeProjects
      .filter((project) => project?.entityClass === "geofence")
      .map((project) => {
        const geometry = getProjectGeometry(project);
        if (geometry?.type === "Polygon") {
          return geometry.coordinates[0] || [];
        }
        if (geometry?.type === "MultiPolygon") {
          return geometry.coordinates[0]?.[0] || [];
        }
        return [];
      })
      .filter((ring) => ring.length >= 3),
    [safeProjects]
  );

  // Telemetry subscription handler: push into domain buffer and forward to controller
  useEffect(() => {
    function handler(frame) {
      if (!frame || !frame.vehicleId) return;

      currentDronesRef.current.set(frame.vehicleId, frame);

      try {
        telemetryDomain.pushFrame(frame);
      } catch (error) {
        // Ignore telemetry domain buffering failures.
      }

      if (controllerRef.current) controllerRef.current.applyTelemetryFrame(frame);

      // Mark telemetry active when frames arrive
      if (!telemetryActive) setTelemetryActive(true);

      setSelectedDroneTelemetry((prev) => (prev && prev.vehicleId === frame.vehicleId ? frame : prev));
      if (!selectedDroneId) setSelectedDroneId(frame.vehicleId);
    }

    const unsubscribe = telemetryService.subscribe("*", handler);
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        // Ignore unsubscribe failures during teardown.
      }

      if (telemetryTimeoutRef.current) {
        clearTimeout(telemetryTimeoutRef.current);
      }
    };
  }, [selectedDroneId]);

  // Mission helpers
  function addActivity(message, level = 'info') {
    const item = { id: `evt-${Date.now()}`, message, level, ts: Date.now() };
    setActivityFeed((prev) => [item, ...prev].slice(0, 50));
  }

  function saveMission() {
    try {
      const mission = {
        id: `m-${Date.now()}`,
        name: `Mission ${new Date().toLocaleString()}`,
        waypoints: waypoints.slice(),
        ts: Date.now(),
      };
      const stored = missions.concat(mission);
      localStorage.setItem(MISSION_STORAGE_KEY, JSON.stringify(stored));
      setMissions(stored);
      setCurrentMission(mission);
      setMissionState('ready');
      setMissionProgress({ currentWaypointIndex: 0, totalWaypoints: mission.waypoints.length, percent: 0 });
      addActivity(`Mission saved: ${mission.name}`, 'info');
    } catch (err) {
      addActivity('Failed to save mission', 'error');
    }
  }

  function loadLastMission() {
    try {
      const raw = localStorage.getItem(MISSION_STORAGE_KEY);
      if (!raw) {
        addActivity('No saved mission found', 'warn');
        return;
      }
      const arr = JSON.parse(raw || '[]');
      if (!arr || arr.length === 0) {
        addActivity('No saved mission found', 'warn');
        return;
      }
      const mission = arr[arr.length - 1];
      setWaypoints(mission.waypoints || []);
      setCurrentMission(mission);
      setMissionState('ready');
      setMissionProgress({ currentWaypointIndex: 0, totalWaypoints: (mission.waypoints || []).length, percent: 0 });
      addActivity(`Loaded mission: ${mission.name}`, 'info');
    } catch (err) {
      addActivity('Failed to load mission', 'error');
    }
  }

  function assignMissionToSelected() {
    if (!currentMission) {
      addActivity('No mission to assign', 'warn');
      return;
    }
    if (!selectedDroneId) {
      addActivity('No drone selected', 'warn');
      return;
    }
    setAssignedDroneId(selectedDroneId);
    setMissionState('assigned');
    addActivity(`Assigned ${currentMission.name} → ${selectedDroneId}`, 'info');
  }

  function activateMission() {
    if (!currentMission || !assignedDroneId || !Array.isArray(currentMission.waypoints) || currentMission.waypoints.length < 2) {
      addActivity('Assign mission before activating', 'warn');
      return;
    }

    if (missionTimerRef.current) {
      clearInterval(missionTimerRef.current);
      missionTimerRef.current = null;
    }

    const missionWaypoints = currentMission.waypoints;
    const stepsPerSegment = 20;
    const sampledPoints = [];

    for (let i = 0; i < missionWaypoints.length - 1; i++) {
      const from = missionWaypoints[i]?.coord;
      const to = missionWaypoints[i + 1]?.coord;
      if (!Array.isArray(from) || !Array.isArray(to)) continue;

      const heading = Math.atan2(to[1] - from[1], to[0] - from[0]) * (180 / Math.PI);
      for (let s = 0; s < stepsPerSegment; s++) {
        const alpha = s / stepsPerSegment;
        sampledPoints.push({
          coord: [
            from[0] + (to[0] - from[0]) * alpha,
            from[1] + (to[1] - from[1]) * alpha,
          ],
          heading,
          segmentIndex: i,
        });
      }
    }

    const last = missionWaypoints[missionWaypoints.length - 1]?.coord;
    if (Array.isArray(last)) {
      sampledPoints.push({ coord: last, heading: sampledPoints.length ? sampledPoints[sampledPoints.length - 1].heading : 0, segmentIndex: missionWaypoints.length - 1 });
    }

    if (sampledPoints.length === 0) {
      addActivity('Mission has no valid waypoint path', 'warn');
      return;
    }

    setMissionState('active');
    addActivity(`Mission ${currentMission.name} activated on ${assignedDroneId}`, 'info');

    telemetryService.stopMock();
    let cursor = 0;
    missionTimerRef.current = setInterval(() => {
      const sample = sampledPoints[cursor];
      if (!sample) return;

      const progressPercent = Math.min(100, Math.round((cursor / Math.max(sampledPoints.length - 1, 1)) * 100));
      const currentWaypointIndex = Math.min(sample.segmentIndex + 1, missionWaypoints.length);
      setMissionProgress({
        currentWaypointIndex,
        totalWaypoints: missionWaypoints.length,
        percent: progressPercent,
      });

      telemetryService.publish({
        vehicleId: assignedDroneId,
        ts: Date.now(),
        droneCode: `DRONE-${String(assignedDroneId).toUpperCase()}`,
        coord: sample.coord,
        altitudeMeters: 40,
        speedMetersPerSecond: 8,
        batteryPercent: Math.max(20, 100 - Math.floor(cursor / 8)),
        signalStrengthPercent: 88,
        headingDegrees: sample.heading,
        gpsAccuracyMeters: 1.5,
        recordingVideo: true,
        missionStatus: 'active',
      });

      cursor += 1;
      if (cursor >= sampledPoints.length) {
        completeMission();
      }
    }, 300);
  }

  function completeMission() {
    if (missionTimerRef.current) {
      clearInterval(missionTimerRef.current);
      missionTimerRef.current = null;
    }
    setMissionState('completed');
    setMissionProgress((prev) => ({
      ...prev,
      currentWaypointIndex: prev.totalWaypoints,
      percent: 100,
    }));
    addActivity(`Mission ${currentMission?.name || ''} completed`, 'info');
    telemetryService.startMock({ vehicleIds: ['v1', 'v2', 'v3'], intervalMs: 500 });
    setAssignedDroneId(null);
  }

  useEffect(() => {
    const runtime = {
      currentMissionId: currentMission?.id || null,
      missionState,
      assignedDroneId,
      missionProgress,
    };
    localStorage.setItem(MISSION_RUNTIME_KEY, JSON.stringify(runtime));
  }, [currentMission?.id, missionState, assignedDroneId, missionProgress]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MISSION_RUNTIME_KEY);
      if (!raw) return;
      const runtime = JSON.parse(raw);
      if (runtime?.missionState) setMissionState(runtime.missionState);
      if (runtime?.assignedDroneId) setAssignedDroneId(runtime.assignedDroneId);
      if (runtime?.missionProgress) setMissionProgress(runtime.missionProgress);
      if (runtime?.currentMissionId && Array.isArray(missions) && missions.length > 0) {
        const found = missions.find((m) => m.id === runtime.currentMissionId);
        if (found) {
          setCurrentMission(found);
          setWaypoints(found.waypoints || []);
        }
      }
    } catch (error) {
      // Ignore invalid localStorage mission runtime payload.
    }
  }, [missions]);

  useEffect(() => () => {
    if (missionTimerRef.current) {
      clearInterval(missionTimerRef.current);
      missionTimerRef.current = null;
    }
  }, []);

  // Start telemetry mock when map is ready
  useEffect(() => {
    if (!isMapReady) return;
    telemetryService.startMock({ vehicleIds: ['v1', 'v2', 'v3'], intervalMs: 500 });
    return () => {
      telemetryService.stopMock();
    };
  }, [isMapReady]);

  // Update cursor based on interaction mode
  useEffect(() => {
    const canvas = mapAdapterRef.current?.getCanvas();
    if (!canvas) return;
    if (interactionMode === MAP_INTERACTION_MODE_WAYPOINT) {
      canvas.style.cursor = 'crosshair';
    } else if (interactionMode === MAP_INTERACTION_MODE_RESTRICTED_ZONE) {
      canvas.style.cursor = 'crosshair';
    } else if (interactionMode === MAP_INTERACTION_MODE_POINT_ANNOTATION) {
      canvas.style.cursor = 'crosshair';
    } else if (interactionMode === MAP_INTERACTION_MODE_LINE_ANNOTATION) {
      canvas.style.cursor = 'crosshair';
    } else if (interactionMode === MAP_INTERACTION_MODE_AREA_ANNOTATION) {
      canvas.style.cursor = 'crosshair';
    } else {
      canvas.style.cursor = 'grab';
    }
  }, [interactionMode]);

  useEffect(() => {
    localStorage.setItem(POINT_ANNOTATIONS_KEY, JSON.stringify(pointAnnotations));
  }, [pointAnnotations]);

  useEffect(() => {
    localStorage.setItem(LINE_ANNOTATIONS_KEY, JSON.stringify(lineAnnotations));
  }, [lineAnnotations]);

  useEffect(() => {
    localStorage.setItem(AREA_ANNOTATIONS_KEY, JSON.stringify(areaAnnotations));
  }, [areaAnnotations]);

  useEffect(() => {
    localStorage.setItem(TASK_AREA_ANNOTATIONS_KEY, JSON.stringify(taskAreaAnnotations));
  }, [taskAreaAnnotations]);

  // Sync waypoints state with map controller
  useEffect(() => {
    if (!controllerRef.current) return;
    const features = waypoints.map((wp, idx) => ({
      type: 'Feature',
      id: wp.waypointId,
      properties: { waypointIndex: idx + 1, altitude: wp.altitude, actionType: wp.actionType },
      geometry: { type: 'Point', coordinates: wp.coord },
    }));
    controllerRef.current.setWaypointFeatures(features);
    if (waypoints.length >= 2) {
      controllerRef.current.rebuildRouteFromWaypoints();
    }
  }, [waypoints]);
  // Keep selected drone telemetry in sync when selection changes
  useEffect(() => {
    if (!selectedDroneId) {
      setSelectedDroneTelemetry(null);
      return;
    }

    const last = currentDronesRef.current.get(selectedDroneId) || null;
    if (last) setSelectedDroneTelemetry(last);
  }, [selectedDroneId]);

  // Keyboard handler: keep edit mode logic centralized and cancel draft safely.
  useEffect(() => {
    const handleKeyDown = (event) => {
      const escaped = handleEscapeKey({
        event,
        isRestrictedZoneEditMode,
        controller: controllerRef.current,
        setInteractionMode,
      });
      if (escaped) return;

      if (event.key === "e" || event.key === "E") {
        setToolbarMode(MAP_INTERACTION_MODE_WAYPOINT);
        return;
      }

      if (event.key === "z" || event.key === "Z") {
        setToolbarMode(MAP_INTERACTION_MODE_RESTRICTED_ZONE);
        return;
      }

      if (event.key === "p" || event.key === "P") {
        setToolbarMode(MAP_INTERACTION_MODE_POINT_ANNOTATION);
        return;
      }

      if (event.key === "l" || event.key === "L") {
        setToolbarMode(MAP_INTERACTION_MODE_LINE_ANNOTATION);
        return;
      }

      if (event.key === "a" || event.key === "A") {
        setToolbarMode(MAP_INTERACTION_MODE_AREA_ANNOTATION);
      }

      if (event.key === 'Delete') {
        try {
          handleDeleteAction();
        } catch (err) {
          // ignore
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRestrictedZoneEditMode, handleDeleteAction]);

  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;

    let cancelled = false;

    const initializeMap = async () => {
      try {
        if (!mapContainer.isConnected) return;

        if (mapContainer.style.width === "" || mapContainer.style.height === "") {
          mapContainer.style.width = "100%";
          mapContainer.style.height = "100%";
        }

        // Force Leaflet adapter for Map Management main view to ensure deterministic dev experience
        let adapter = await createMapAdapterAsync('leaflet');
        if (cancelled || !mapContainer.isConnected) {
          adapter.remove();
          return;
        }

        mapAdapterRef.current = adapter;

        const styleToUse = mapStyle || ENV.mapboxStyleUrl || "mapbox://styles/mapbox/streets-v12";

        adapter.init(mapContainer, {
          center: [106.4705, 10.6262],
          zoom: 12,
          style: styleToUse,
        });

        adapter.addControl(adapter.createNavigationControl(), "top-right");

        controllerRef.current = new MapLayerController(adapter);
        setIsMapReady(true);
      } catch (error) {
        console.error("Failed to initialize map in MapViewer:", error);
      }
    };

    initializeMap();

    const resizeObserver = new ResizeObserver(() => {
      if (mapAdapterRef.current && mapAdapterRef.current.invalidateSize) {
        setTimeout(() => {
          mapAdapterRef.current.invalidateSize();
        }, 100);
      }
    });

    if (mapContainer) {
      resizeObserver.observe(mapContainer);
    }

    return () => {
      cancelled = true;
      resizeObserver.disconnect();
      setIsMapReady(false);
      if (controllerRef.current && typeof controllerRef.current.destroy === "function") {
        try {
          controllerRef.current.destroy();
        } catch (error) {
          // Ignore destroy failures during teardown.
        }
        controllerRef.current = null;
      }

      if (mapAdapterRef.current) {
        mapAdapterRef.current.remove();
        mapAdapterRef.current = null;
      }
    };
  }, [mapStyle, canRenderMap]);

  useEffect(() => {
    if (!isMapReady || !mapAdapterRef.current) return undefined;

    const adapter = mapAdapterRef.current;

    const handleMapClick = (event) => {
      const clickCoordinate = getMapEventCoordinate(event);
      if (!clickCoordinate) return;

      if (interactionMode === MAP_INTERACTION_MODE_POINT_ANNOTATION) {
        const annotation = {
          id: `pt-${Date.now()}`,
          name: `Point ${pointAnnotations.length + 1}`,
          coord: clickCoordinate,
          color: activeToolColor,
          ts: Date.now(),
        };
        setPointAnnotations((prev) => [...prev, annotation]);
        addActivity(`Point annotation created: ${annotation.name}`, 'info');
        return;
      }

      if (interactionMode === MAP_INTERACTION_MODE_LINE_ANNOTATION) {
        setLineDraftPoints((prev) => [...prev, clickCoordinate]);
        controllerRef.current?.setInteractionDraftFeatures(buildDraftFeatures([...lineDraftPoints, clickCoordinate], interactionMode, activeToolColor));
        return;
      }

      if (interactionMode === MAP_INTERACTION_MODE_AREA_ANNOTATION) {
        setAreaDraftPoints((prev) => [...prev, clickCoordinate]);
        controllerRef.current?.setInteractionDraftFeatures(buildDraftFeatures([...areaDraftPoints, clickCoordinate], interactionMode, activeToolColor));
        return;
      }

      if (interactionMode === MAP_INTERACTION_MODE_TASK_AREA) {
        setTaskAreaDraftPoints((prev) => [...prev, clickCoordinate]);
        controllerRef.current?.setInteractionDraftFeatures(buildDraftFeatures([...taskAreaDraftPoints, clickCoordinate], interactionMode, activeToolColor));
        return;
      }

      const restrictedZoneHandled = handleRestrictedZoneClick({
        controller: controllerRef.current,
        isRestrictedZoneEditMode,
        interactionMode,
        clickCoordinate,
        originalEvent: event?.originalEvent,
      });
      if (restrictedZoneHandled) return;

      const waypointHandled = handleWaypointMapClick({
        controller: controllerRef.current,
        isMissionEditMode: isEditingMission,
        clickCoordinate,
        setWaypoints,
      });
      if (waypointHandled) return;

      const nearest = Array.from(currentDronesRef.current.values())
        .map((drone) => ({
          drone,
          distance: getApproxDistanceMeters(clickCoordinate, drone.geometry?.coordinates),
        }))
        .sort((left, right) => left.distance - right.distance)[0];

      if (nearest && nearest.distance <= 120) {
        setSelectedDroneId(nearest.drone.id);
      }
    };

    mapClickHandlerRef.current = handleMapClick;
    adapter.on("click", handleMapClick);

    return () => {
      if (mapClickHandlerRef.current) {
        adapter.off("click", mapClickHandlerRef.current);
      }
      mapClickHandlerRef.current = null;
    };
  }, [isMapReady, isEditingMission, isRestrictedZoneEditMode, isTaskAreaEditMode, interactionMode, pointAnnotations.length, lineDraftPoints, areaDraftPoints, taskAreaDraftPoints, activeToolColor]);

  useEffect(() => {
    if (!isMapReady || !mapAdapterRef.current) return undefined;

    const adapter = mapAdapterRef.current;

    const handleMapDoubleClick = (event) => {
      if (interactionMode === MAP_INTERACTION_MODE_LINE_ANNOTATION) {
        if (lineDraftPoints.length >= 2) {
          const line = {
            id: `ln-${Date.now()}`,
            name: `Line ${lineAnnotations.length + 1}`,
            coordinates: [...lineDraftPoints],
            color: activeToolColor,
            ts: Date.now(),
          };
          setLineAnnotations((prev) => [...prev, line]);
          addActivity(`Line annotation created: ${line.name}`, 'info');
        }
        setLineDraftPoints([]);
        controllerRef.current?.clearInteractionDraft();
        return;
      }

      if (interactionMode === MAP_INTERACTION_MODE_AREA_ANNOTATION) {
        if (areaDraftPoints.length >= 3) {
          const ring = [...areaDraftPoints];
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first);
          }

          const area = {
            id: `ar-${Date.now()}`,
            name: `Area ${areaAnnotations.length + 1}`,
            ring,
            color: activeToolColor,
            ts: Date.now(),
          };
          setAreaAnnotations((prev) => [...prev, area]);
          addActivity(`Area annotation created: ${area.name}`, 'info');
        }
        setAreaDraftPoints([]);
        controllerRef.current?.clearInteractionDraft();
        return;
      }

      if (interactionMode === MAP_INTERACTION_MODE_TASK_AREA) {
        if (taskAreaDraftPoints.length >= 3) {
          const ring = [...taskAreaDraftPoints];
          const first = ring[0];
          const last = ring[ring.length - 1];
          if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push(first);
          }

          const taskArea = {
            id: `ta-${Date.now()}`,
            name: `Task area ${taskAreaAnnotations.length + 1}`,
            ring,
            color: activeToolColor,
            ts: Date.now(),
          };
          setTaskAreaAnnotations((prev) => [...prev, taskArea]);
          addActivity(`Task area created: ${taskArea.name}`, 'info');
        }
        setTaskAreaDraftPoints([]);
        controllerRef.current?.clearInteractionDraft();
        return;
      }

      handleRestrictedZoneFinalize({
        controller: controllerRef.current,
        isRestrictedZoneEditMode,
        event,
      });
    };

    mapDoubleClickHandlerRef.current = handleMapDoubleClick;
    adapter.on("dblclick", handleMapDoubleClick);

    return () => {
      if (mapDoubleClickHandlerRef.current) {
        adapter.off("dblclick", mapDoubleClickHandlerRef.current);
      }
      mapDoubleClickHandlerRef.current = null;
    };
  }, [isMapReady, isRestrictedZoneEditMode, interactionMode, lineDraftPoints, lineAnnotations.length, areaDraftPoints, areaAnnotations.length, taskAreaDraftPoints, taskAreaAnnotations.length]);

  useEffect(() => {
    const canvas = mapAdapterRef.current?.getCanvas?.();
    if (!canvas) return undefined;

    const nextCursor = isRestrictedZoneEditMode || isEditingMission || isTaskAreaEditMode ? "crosshair" : "";
    canvas.style.cursor = nextCursor;

    return () => {
      canvas.style.cursor = "";
    };
  }, [interactionMode, isEditingMission, isRestrictedZoneEditMode, isTaskAreaEditMode]);

  // Update project features on data or selection change
  useEffect(() => {
    if (!controllerRef.current) return;

    const controller = controllerRef.current;

    // Mission areas: polygons and any project explicitly marked as mission_area
    const missionAreaFeatures = safeProjects
      .filter((p) => (p?.entityClass === 'mission_area') || (getProjectGeometry(p)?.type === 'Polygon' || getProjectGeometry(p)?.type === 'MultiPolygon'))
      .map((project) => ({
        type: 'Feature',
        id: project.id,
        properties: { name: project.mapName || 'Project', id: project.id, entityClass: project.entityClass || 'mission_area' },
        geometry: getProjectGeometry(project) || { type: 'Polygon', coordinates: [] },
      }));

    const areaAnnotationFeatures = areaAnnotations.map((annotation) => ({
      type: 'Feature',
      id: annotation.id,
      properties: { name: annotation.name, id: annotation.id, entityClass: 'area_annotation', color: annotation.color, fillColor: annotation.color, lineColor: annotation.color, markerColor: annotation.color },
      geometry: { type: 'Polygon', coordinates: [annotation.ring] },
    }));

    const taskAreaAnnotationFeatures = taskAreaAnnotations.map((annotation) => ({
      type: 'Feature',
      id: annotation.id,
      properties: { name: annotation.name, id: annotation.id, entityClass: 'task_area', color: annotation.color, fillColor: annotation.color, lineColor: annotation.color, markerColor: annotation.color },
      geometry: { type: 'Polygon', coordinates: [annotation.ring] },
    }));

    controller.setMissionAreaFeatures([...missionAreaFeatures, ...areaAnnotationFeatures, ...taskAreaAnnotationFeatures]);

    // Route features: lines (planned routes, flight paths, delivery routes)
    const routeFeatures = safeProjects
      .filter((p) => (p?.entityClass === 'flight_path' || p?.entityClass === 'delivery_route') || getProjectGeometry(p)?.type === 'LineString')
      .map((project) => ({
        type: 'Feature',
        id: project.id,
        properties: { name: project.mapName || 'Route', id: project.id, entityClass: project.entityClass || 'flight_path' },
        geometry: getProjectGeometry(project) || { type: 'LineString', coordinates: [] },
      }));

    const lineAnnotationFeatures = lineAnnotations.map((annotation) => ({
      type: 'Feature',
      id: annotation.id,
      properties: { name: annotation.name, id: annotation.id, entityClass: 'line_annotation', color: annotation.color, fillColor: annotation.color, lineColor: annotation.color, markerColor: annotation.color },
      geometry: { type: 'LineString', coordinates: annotation.coordinates },
    }));

    controller.setRouteFeatures([...routeFeatures, ...lineAnnotationFeatures]);

    // Geofences
    const geofenceFeatures = safeProjects
      .filter((p) => p?.entityClass === 'geofence')
      .map((project) => ({
        type: 'Feature', id: project.id, properties: { name: project.mapName || 'Geofence', id: project.id }, geometry: getProjectGeometry(project) || { type: 'Polygon', coordinates: [] },
      }));

    controller.setGeofenceFeatures(geofenceFeatures);

    // Docks
    const dockFeatures = safeProjects
      .filter((p) => p?.entityClass === 'dock')
      .map((project) => ({
        type: 'Feature', id: project.id, properties: { name: project.mapName || 'Dock', id: project.id }, geometry: getProjectGeometry(project) || { type: 'Point', coordinates: [] },
      }));

    const pointAnnotationFeatures = pointAnnotations.map((annotation) => ({
      type: 'Feature',
      id: annotation.id,
      properties: {
        name: annotation.name,
        id: annotation.id,
        entityClass: 'point_annotation',
        color: annotation.color,
        fillColor: annotation.color,
        lineColor: annotation.color,
        markerColor: annotation.color,
      },
      geometry: {
        type: 'Point',
        coordinates: annotation.coord,
      },
    }));

    controller.setDockFeatures([...dockFeatures, ...pointAnnotationFeatures]);
  }, [safeProjects, selectedProject, hoveredProjectId, statusById, selectedDroneId, pointAnnotations, lineAnnotations, areaAnnotations, taskAreaAnnotations]);

  // Fit map to selected project bounds
  useEffect(() => {
    if (!mapAdapterRef.current || !selectedProject) return;

    // Prefer explicitly stored bbox/center+zoom if available (from MapManagement save)
    const adapter = mapAdapterRef.current;
    if (selectedProject.bbox && Array.isArray(selectedProject.bbox) && selectedProject.bbox.length === 2) {
      const fitBoundsInput = selectedProject.bbox;
      const suggestedZoom = selectedProject.zoom || getSuggestedZoom({ minLng: fitBoundsInput[0][0], minLat: fitBoundsInput[0][1], maxLng: fitBoundsInput[1][0], maxLat: fitBoundsInput[1][1] });
      mapAdapterRef.current.fitBounds(fitBoundsInput, { padding: Math.round((mapContainerRef.current?.clientHeight || 400) * 0.12), maxZoom: suggestedZoom, duration: 800 });
      return;
    }

    const geometry = getProjectGeometry(selectedProject);
    const fitBoundsCoordinates = getGeometryBoundsCoordinates(geometry);
    const bounds = getCoordinateBounds(fitBoundsCoordinates);

    if (!bounds) {
      console.warn("[MapViewer] No bounds calculated for selectedProject", selectedProject.id);
      return;
    }

    const fitBoundsInput = [
      [bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat],
    ];
    const suggestedZoom = getSuggestedZoom(bounds);

    const containerRect = mapContainerRef.current?.getBoundingClientRect();

    const viewportHeight = containerRect?.height || 400;
    const viewportWidth = containerRect?.width || 300;
    
    // Padding: 15% of viewport on all sides for better composition
    const padding = Math.min(
      Math.max(viewportHeight * 0.12, 30),
      Math.max(viewportWidth * 0.12, 30)
    );
    
    console.log("[MapViewer] FitBounds:", {
      projectId: selectedProject.id,
      geometry: geometry?.type,
      bounds,
      zoom: suggestedZoom,
      padding: Math.round(padding),
      viewport: { w: viewportWidth, h: viewportHeight },
    });

    // Prefer fitBounds so adapter can choose proper animation for engine
    mapAdapterRef.current.fitBounds(
      fitBoundsInput,
      { 
        padding: Math.round(padding),
        maxZoom: suggestedZoom, 
        duration: 800 
      }
    );
  }, [selectedProject?.id]);

  // Render placeholder when map cannot be rendered
  if (!canRenderMap) {
    const message = ENV.mapEngine === "leaflet"
      ? "Leaflet adapter không khả dụng. Vui lòng chạy 'npm install'."
      : "Mapbox token chưa được cấu hình";
    const hint = ENV.mapEngine === "leaflet"
      ? "Ensure leaflet package is installed via npm install"
      : "Vui lòng thiết lập VITE_MAPBOX_ACCESS_TOKEN để hiển thị bản đồ";

    return (
      <div className="map-management-map-panel">
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f3f4f6",
            color: "#6b7280",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "14px",
            textAlign: "center",
            padding: "20px",
          }}
        >
          <div>
            <p style={{ marginBottom: "8px" }}>{message}</p>
            <p style={{ fontSize: "12px", color: "#9ca3af" }}>
              {hint}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-management-map-panel map-management-map-panel--ops" style={{ display: "flex", flex: 1, minHeight: 0, height: "100%" }}>
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative" }}>
        {showOperationalToolbar && (
          <aside className="map-viewer-toolbar" aria-label="Leaflet operational toolbar">
            <div className="map-viewer-toolbar-header">
              <p className="map-viewer-toolbar-kicker">Tool Bar</p>
              <h3>Bản đồ là đầu tiên</h3>
              <p className="map-viewer-toolbar-note">
                Chọn công cụ rồi thao tác trực tiếp trên bản đồ Leaflet. Các nút bên dưới đổi mode ngay trong bản đồ.
              </p>
              <button
                type="button"
                className="map-viewer-delete-button"
                onClick={handleDeleteAction}
                title="Delete (Del)"
              >
                Xóa
              </button>
            </div>

            <div className="map-viewer-toolbar-state">
              <span className="map-viewer-toolbar-state-label">Active</span>
              <strong>{activeToolLabel}</strong>
            </div>

            {interactionMode !== MAP_INTERACTION_MODE_IDLE && (
              <section className="map-viewer-toolbar-section">
                <h4>Màu công cụ</h4>
                <div className="map-viewer-color-row">
                  {TOOL_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`map-viewer-color-swatch${activeToolColor === preset.value ? ' is-active' : ''}`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setToolColors((prev) => ({ ...prev, [interactionMode]: preset.value }))}
                      title={preset.label}
                      aria-label={preset.label}
                    />
                  ))}
                  <label className="map-viewer-color-custom">
                    <span>Custom</span>
                    <input
                      type="color"
                      value={activeToolColor}
                      onChange={(event) => setToolColors((prev) => ({ ...prev, [interactionMode]: event.target.value }))}
                      aria-label="Custom color"
                    />
                  </label>
                </div>
              </section>
            )}

            {toolbarActionGroups.map((group) => (
              <section className="map-viewer-toolbar-section" key={group.title}>
                <h4>{group.title}</h4>
                <div className="map-viewer-toolbar-grid">
                  {group.items.map((item) => {
                    const isActive = interactionMode === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`map-viewer-tool-button${isActive ? ' is-active' : ''}`}
                        onClick={() => handleToolbarAction(item.id)}
                        aria-pressed={isActive}
                        title={item.hint}
                      >
                        <span className="map-viewer-tool-icon" aria-hidden="true">{item.icon}</span>
                        <span className="map-viewer-tool-label">{item.label}</span>
                        <span className="map-viewer-tool-hint">{item.hint}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}

            <section className="map-viewer-toolbar-section">
              <h4>Chú thích</h4>
              <div className="map-viewer-legend-list">
                {annotationLegend.map((item) => (
                  <div className="map-viewer-legend-item" key={item.label}>
                    <span className="map-viewer-legend-dot" style={{ backgroundColor: item.color }} />
                    <div>
                      <strong>{item.label}</strong>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="map-viewer-toolbar-section">
              <h4>Mission workflow</h4>
              <div className="map-viewer-workflow-actions">
                <button type="button" onClick={saveMission}>Lưu</button>
                <button type="button" onClick={loadLastMission}>Tải</button>
                <button type="button" onClick={assignMissionToSelected}>Gán drone</button>
                <button type="button" onClick={activateMission}>Bắt đầu bay</button>
                <button type="button" onClick={completeMission}>Hoàn tất</button>
              </div>
            </section>

            <section className="map-viewer-toolbar-section">
              <h4>Thiết bị & tracking</h4>
              <div className="map-viewer-status-pills">
                <span>Drone: {currentDronesRef.current.size}</span>
                <span>Point: {pointAnnotations.length}</span>
                <span>Line: {lineAnnotations.length}</span>
                <span>Area: {areaAnnotations.length + taskAreaAnnotations.length}</span>
              </div>
              <div className="map-viewer-telemetry-card">
                <strong>{selectedDroneTelemetry?.droneCode || selectedDroneId || 'No drone selected'}</strong>
                <p>
                  {selectedDroneTelemetry
                    ? `Alt ${Math.round(selectedDroneTelemetry.altitudeMeters || 0)}m · ${Math.round(selectedDroneTelemetry.speedMetersPerSecond || 0)}m/s · Pin ${Math.round(selectedDroneTelemetry.batteryPercent || 0)}%`
                    : 'Aircraft tracking will follow the selected drone or the nearest live telemetry target.'}
                </p>
              </div>
            </section>
          </aside>
        )}
        <div
          ref={mapContainerRef}
          style={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            borderRadius: 12,
            overflow: "hidden",
            position: "relative",
          }}
        />
      </div>
    </div>
  );
}

export default memo(MapViewer);
