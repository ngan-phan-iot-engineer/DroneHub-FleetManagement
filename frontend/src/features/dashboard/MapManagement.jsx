import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ENV } from "../../config/env";
import { createMapAdapterAsync } from "../../utils/map";
import MapViewer from "./MapViewer";
import {
  createMapManagementItem,
  deleteMapManagementItem,
  fetchMapManagementData,
  fetchMapManagementFormOptions,
  updateMapManagementItem,
} from "../../services/dashboardApi";
import "./MapManagement.css";
import telemetryService from "../../services/telemetryService";

const PAGE_SIZE = 5;
const DEFAULT_CENTER = [106.4705, 10.6262];
const MAP_PATH_SOURCE_ID = "map-management-path-source";
const MAP_POINTS_SOURCE_ID = "map-management-points-source";

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

const EMPTY_MAP_FORM_OPTIONS = {
  regions: [],
  addresses: [],
  owners: [],
};

const createInitialFormState = (options) => ({
  mapName: "",
  regionName: options.regions[0] || "",
  address: options.addresses[0] || "",
  ownerName: options.owners[0] || "",
});

const createEmptyFeatureCollection = () => ({
  type: "FeatureCollection",
  features: [],
});

const createLineFeatureCollection = (coordinates) => ({
  type: "FeatureCollection",
  features: coordinates.length >= 2
    ? [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates,
          },
          properties: {},
        },
      ]
    : [],
});

const createPointFeatureCollection = (coordinates) => ({
  type: "FeatureCollection",
  features: coordinates.map((coordinate, index) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: coordinate,
    },
    properties: { index: index + 1 },
  })),
});

const PROJECT_STATUS_META = [
  { key: "complete", label: "Hoàn thành", accent: "complete" },
  { key: "active", label: "Đang bay", accent: "active" },
  { key: "pending", label: "Chờ bay", accent: "pending" },
];

const MAP_PANEL_SOURCE_ID = "map-management-projects-source";

const getProjectCoordinates = (project) => project?.pathGeoJson?.geometry?.coordinates || [];

const getClosedPolygonRing = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return [];
  }

  const ring = coordinates.map((coordinate) => [...coordinate]);
  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  if (firstLng !== lastLng || firstLat !== lastLat) {
    ring.push([firstLng, firstLat]);
  }

  return ring;
};

const getProjectCenter = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return DEFAULT_CENTER;
  }

  const totals = coordinates.reduce(
    (accumulator, coordinate) => ({
      lng: accumulator.lng + coordinate[0],
      lat: accumulator.lat + coordinate[1],
    }),
    { lng: 0, lat: 0 }
  );

  return [totals.lng / coordinates.length, totals.lat / coordinates.length];
};

const getProjectBounds = (projects) => {
  const allCoordinates = projects.flatMap((project) => getProjectCoordinates(project));

  if (allCoordinates.length === 0) {
    return null;
  }

  const initial = allCoordinates[0];
  const bounds = [[initial[0], initial[1]], [initial[0], initial[1]]];

  allCoordinates.forEach(([lng, lat]) => {
    bounds[0][0] = Math.min(bounds[0][0], lng);
    bounds[0][1] = Math.min(bounds[0][1], lat);
    bounds[1][0] = Math.max(bounds[1][0], lng);
    bounds[1][1] = Math.max(bounds[1][1], lat);
  });

  return bounds;
};

// Map rendering is handled in src/features/dashboard/MapViewer.jsx using the adapter.
// Utility to create a GeoJSON feature collection for projects (pure function).
const createMapProjectFeatureCollection = (projects, statusById, selectedProjectId, hoveredProjectId) => ({
  type: "FeatureCollection",
  features: projects.flatMap((project) => {
    const coordinates = getProjectCoordinates(project);
    if (!Array.isArray(coordinates) || coordinates.length < 3) return [];

    const ring = getClosedPolygonRing(coordinates);
    const statusMeta = statusById?.get(project.id) || { key: "pending" };

    const polygonFeature = {
      type: "Feature",
      geometry: { type: "Polygon", coordinates: [ring] },
      properties: {
        id: project.id,
        mapName: project.mapName || "",
        featureType: "polygon",
        statusKey: statusMeta.key || "pending",
      },
    };

    const labelFeature = {
      type: "Feature",
      geometry: { type: "Point", coordinates: getProjectCenter(ring) },
      properties: {
        id: project.id,
        featureType: "label",
        label: project.mapName || "",
        statusKey: statusMeta.key || "pending",
      },
    };

    return [polygonFeature, labelFeature];
  }),
});

const ProjectList = memo(function ProjectList({
  projects,
  searchText,
  selectedProjectId,
  hoveredProjectId,
  statusById,
  onSearchTextChange,
  onSelectProject,
  onHoverProject,
  onClearHover,
  onOpenCreateModal,
  onOpenViewOrEditModal,
  onDelete,
  activeMenuRowId,
  setActiveMenuRowId,
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  menuRef,
  mm,
}) {
  return (
    <section className="map-management-project-panel" aria-label={mm.listTitle || "Danh sách dự án bay"}>
      <header className="map-management-project-panel-header">
        <div>
          <p className="map-management-section-kicker">Project Panel</p>
          <h2>{mm.listTitle || "Danh sách dự án bay"}</h2>
        </div>
        <button type="button" className="map-management-primary-btn" onClick={onOpenCreateModal}>
          + {mm.addButton || "Thêm bản đồ bay"}
        </button>
      </header>

      <div className="map-management-search-wrap map-management-search-wrap--panel">
        <input
          type="text"
          placeholder={mm.searchPlaceholder || "Nhập tên vùng, địa chỉ hoặc chủ vùng"}
          value={searchText}
          onChange={(event) => onSearchTextChange(event.target.value)}
        />
        <span aria-hidden="true">⌕</span>
      </div>

      <div className="map-management-project-list" ref={menuRef}>
        {projects.length === 0 ? (
          <div className="map-management-project-empty">{mm.emptyText || "Không tìm thấy dữ liệu phù hợp."}</div>
        ) : (
          projects.map((project, index) => {
            const statusMeta = statusById.get(project.id)
              || PROJECT_STATUS_META.find((meta) => meta.key === project.statusKey)
              || PROJECT_STATUS_META[index % PROJECT_STATUS_META.length];
            const isSelected = selectedProjectId === project.id;
            const isHovered = hoveredProjectId === project.id;

            return (
              <article
                key={project.id}
                className={`map-management-project-card${isSelected ? " is-selected" : ""}${isHovered ? " is-hovered" : ""}`}
                onClick={() => onSelectProject(project)}
                onMouseEnter={() => onHoverProject(project.id)}
                onMouseLeave={onClearHover}
              >
                <div className="map-management-project-card-top">
                  <div>
                    <span className={`map-management-status-pill map-management-status-pill--${statusMeta.accent}`}>
                      {statusMeta.label}
                    </span>
                    <h3>{project.mapName}</h3>
                  </div>

                  <div className="map-management-action-wrap" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      className="map-management-action-btn"
                      onClick={() => setActiveMenuRowId((prev) => (prev === project.id ? "" : project.id))}
                    >
                      ...
                    </button>
                    {activeMenuRowId === project.id && (
                      <div className="map-management-row-menu">
                        <button type="button" onClick={() => onOpenViewOrEditModal(project, "view")}>{mm.actionView || "Xem"}</button>
                        <button type="button" onClick={() => onOpenViewOrEditModal(project, "edit")}>{mm.actionEdit || "Sửa"}</button>
                        <button type="button" className="danger" onClick={() => onDelete(project.id)}>{mm.actionDelete || "Xóa"}</button>
                      </div>
                    )}
                  </div>
                </div>

                <p className="map-management-project-card-meta">{project.regionName}</p>
                <p className="map-management-project-card-address">{project.address}</p>

                <footer className="map-management-project-card-footer">
                  <span>{project.ownerName}</span>
                  <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString("vi-VN") : ""}</span>
                </footer>
              </article>
            );
          })
        )}
      </div>

      <footer className="map-management-pagination-footer">
        <button type="button" className="map-management-pagination-btn" onClick={onPrevPage} disabled={currentPage === 1} aria-label={mm.prevPageAriaLabel || "Trang trước"}>
          &lt;
        </button>
        <span className="map-management-pagination-indicator">
          {currentPage} / {totalPages}
        </span>
        <button type="button" className="map-management-pagination-btn" onClick={onNextPage} disabled={currentPage === totalPages} aria-label={mm.nextPageAriaLabel || "Trang sau"}>
          &gt;
        </button>
      </footer>
    </section>
  );
});

function MapLoadingScreen({ text }) {
  return (
    <div className="map-management-loading">
      <svg width="80" height="80" viewBox="0 0 32 32" className="spinning-logo">
        <polygon points="13,0 32,7 32,25 13,32 0,16" className="spinning-hexagon" />
        <text
          x="18"
          y="16"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Montserrat, sans-serif"
          fontWeight="bold"
          fontSize="14"
          fill="#fff"
        >
          mi
        </text>
      </svg>
      <p className="loading-text">{text}</p>
    </div>
  );
}

function MapManagement() {
  const { t } = useTranslation();
  const mm = t("mapManagement", { returnObjects: true }) || {};
  const hasMapboxToken = Boolean(ENV.mapboxAccessToken);
  const mapStyle = hasMapboxToken ? ENV.mapboxStyleUrl : FALLBACK_STYLE;

  const [mapRows, setMapRows] = useState([]);
  const [mapFormOptions, setMapFormOptions] = useState(EMPTY_MAP_FORM_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuRowId, setActiveMenuRowId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapFocusMode, setIsMapFocusMode] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingMapId, setEditingMapId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [hoveredProjectId, setHoveredProjectId] = useState("");

  const [formState, setFormState] = useState(createInitialFormState(EMPTY_MAP_FORM_OPTIONS));

  const [draftCoordinates, setDraftCoordinates] = useState([]);

  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const mapAdapterRef = useRef(null); // Stores map adapter instance
  const draftCoordinatesRef = useRef([]);
  const simTimerRef = useRef(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const mapOnClickRef = useRef(null);
  const menuRef = useRef(null);

  const isReadOnlyModal = modalMode === "view";

  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    const shouldCollapseShell = isModalOpen || isMapFocusMode;
    if (shouldCollapseShell) {
      document.body.classList.add("map-management-focus-mode");
    } else {
      document.body.classList.remove("map-management-focus-mode");
    }

    return () => {
      document.body.classList.remove("map-management-focus-mode");
    };
  }, [isModalOpen, isMapFocusMode]);

  useEffect(() => {
    const loadMapRows = async () => {
      setIsLoading(true);
      const [mapRowsResponse, formOptionsResponse] = await Promise.all([
        fetchMapManagementData(),
        fetchMapManagementFormOptions(),
      ]);
      setMapRows(mapRowsResponse);
      setMapFormOptions(formOptionsResponse);
      setFormState((prev) => ({
        ...prev,
        regionName: prev.regionName || formOptionsResponse.regions[0] || "",
        address: prev.address || formOptionsResponse.addresses[0] || "",
        ownerName: prev.ownerName || formOptionsResponse.owners[0] || "",
      }));
      setIsLoading(false);
    };

    loadMapRows();
  }, []);

  useEffect(() => {
    const closeMenuIfOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuRowId("");
      }
    };

    document.addEventListener("mousedown", closeMenuIfOutside);
    return () => {
      document.removeEventListener("mousedown", closeMenuIfOutside);
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isModalOpen]);

  useEffect(() => {
    draftCoordinatesRef.current = draftCoordinates;
  }, [draftCoordinates]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();
    if (!normalizedKeyword) return mapRows;

    return mapRows.filter((row) => {
      const searchableText = `${row.mapName} ${row.regionName} ${row.address} ${row.ownerName}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  }, [mapRows, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const statusById = useMemo(
    () => new Map(
      mapRows.map((row, index) => [
        row.id,
        PROJECT_STATUS_META.find((meta) => meta.key === row.statusKey)
          || PROJECT_STATUS_META[index % PROJECT_STATUS_META.length],
      ])
    ),
    [mapRows]
  );

  const selectedProject = useMemo(
    () => filteredRows.find((row) => row.id === selectedProjectId) || null,
    [filteredRows, selectedProjectId]
  );

  useEffect(() => {
    if (selectedProjectId && !filteredRows.some((row) => row.id === selectedProjectId)) {
      setSelectedProjectId("");
      setHoveredProjectId("");
    }
  }, [filteredRows, selectedProjectId]);

  const handleSelectProject = (project) => {
    setSelectedProjectId(project.id);
    setHoveredProjectId(project.id);

    const nextIndex = filteredRows.findIndex((row) => row.id === project.id);
    if (nextIndex >= 0) {
      setCurrentPage(Math.floor(nextIndex / PAGE_SIZE) + 1);
    }
  };

  const handleHoverProject = (projectId) => {
    setHoveredProjectId(projectId);
  };

  const handleClearHover = () => {
    setHoveredProjectId(selectedProjectId);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const pushSourceData = (coordinates) => {
    if (!mapAdapterRef.current) return;

    const lineSource = mapAdapterRef.current.getSource(MAP_PATH_SOURCE_ID);
    const pointsSource = mapAdapterRef.current.getSource(MAP_POINTS_SOURCE_ID);

    if (lineSource && typeof lineSource.setData === "function") {
      lineSource.setData(createLineFeatureCollection(coordinates));
    }

    if (pointsSource && typeof pointsSource.setData === "function") {
      pointsSource.setData(createPointFeatureCollection(coordinates));
    }
  };

  useEffect(() => {
    if (!isModalOpen || !mapContainerRef.current) return undefined;

    const mapContainer = mapContainerRef.current;
    let resizeObserver = null;
    let resizeTimer = null;

    const scheduleInvalidateSize = () => {
      if (!mapAdapterRef.current || typeof mapAdapterRef.current.invalidateSize !== "function") {
        return;
      }

      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }

      resizeTimer = setTimeout(() => {
        if (mapAdapterRef.current && typeof mapAdapterRef.current.invalidateSize === "function") {
          mapAdapterRef.current.invalidateSize();
        }
      }, 80);
    };

    // Async initialization for both Mapbox and Leaflet adapters
    const initializeMap = async () => {
      try {
        // Create map adapter instance (force Leaflet for Map Management tab)
        const adapter = await createMapAdapterAsync('leaflet');
        if (!mapContainer || !mapContainer.isConnected) {
          adapter.remove();
          return;
        }

        mapAdapterRef.current = adapter;

        const initialCoordinates = [...draftCoordinatesRef.current];

        // Initialize map with adapter
        adapter.init(mapContainer, {
          style: mapStyle,
          center: initialCoordinates[0] || DEFAULT_CENTER,
          zoom: initialCoordinates.length ? 16 : 13,
        });

        // Leaflet needs explicit size invalidation after modal layout settles.
        scheduleInvalidateSize();
        setTimeout(scheduleInvalidateSize, 0);
        setTimeout(scheduleInvalidateSize, 180);

        // Add controls using adapter
        adapter.addControl(adapter.createNavigationControl({ visualizePitch: true }), "top-right");
        adapter.addControl(adapter.createFullscreenControl(), "top-right");

        // Wait for map to load before adding layers
        adapter.on("load", () => {
          // Add path source and layer
          adapter.addSource(MAP_PATH_SOURCE_ID, {
            type: "geojson",
            data: createEmptyFeatureCollection(),
          });

          adapter.addLayer({
            id: "map-management-path-line",
            type: "line",
            source: MAP_PATH_SOURCE_ID,
            paint: {
              "line-color": "#d23838",
              "line-width": 3,
              "line-opacity": 0.95,
            },
          });

          // Add points source and layer
          adapter.addSource(MAP_POINTS_SOURCE_ID, {
            type: "geojson",
            data: createEmptyFeatureCollection(),
          });

          adapter.addLayer({
            id: "map-management-path-points",
            type: "circle",
            source: MAP_POINTS_SOURCE_ID,
            paint: {
              "circle-radius": 4,
              "circle-color": "#d23838",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            },
          });

          // Update sources with initial coordinates
          pushSourceData(initialCoordinates);

          // Add a drone source for simulation (used only in Map Management modal)
          try {
            adapter.addSource("map-management-drone", {
              type: "geojson",
              data: createEmptyFeatureCollection(),
            });
          } catch (err) {
            console.debug("Could not add drone source for simulation:", err);
          }

          // Fit bounds if coordinates exist
          if (initialCoordinates.length >= 2) {
            const bounds = initialCoordinates.reduce(
              (acc, coordinate) => acc.extend(coordinate),
              adapter.createBounds(initialCoordinates[0])
            );

            adapter.fitBounds(bounds, {
              padding: 40,
              maxZoom: 18,
            });
          }
        });

        // Register click handler for drawing mode (not read-only)
        if (!isReadOnlyModal) {
          mapOnClickRef.current = (event) => {
            const lng = event?.lngLat?.lng ?? event?.latlng?.lng;
            const lat = event?.lngLat?.lat ?? event?.latlng?.lat;
            if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
              return;
            }
            const nextCoordinates = [...draftCoordinatesRef.current, [lng, lat]];
            setDraftCoordinates(nextCoordinates);
            pushSourceData(nextCoordinates);
          };

          adapter.on("click", mapOnClickRef.current);
          
          const canvas = adapter.getCanvas();
          if (canvas) {
            canvas.style.cursor = "crosshair";
          }
        }

        // Store map reference (for backward compatibility with mapRef)
        mapRef.current = adapter;

        resizeObserver = new ResizeObserver(() => {
          scheduleInvalidateSize();
        });
        resizeObserver.observe(mapContainer);
        window.addEventListener("resize", scheduleInvalidateSize);
      } catch (error) {
        console.error("Failed to initialize map in MapManagement:", error);
      }
    };

    // Call async initialization
    initializeMap();

    // Cleanup on unmount
    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      window.removeEventListener("resize", scheduleInvalidateSize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      if (mapOnClickRef.current && mapAdapterRef.current) {
        mapAdapterRef.current.off("click", mapOnClickRef.current);
      }
      mapOnClickRef.current = null;
      if (mapAdapterRef.current) {
        mapAdapterRef.current.remove();
        mapAdapterRef.current = null;
      }
      mapRef.current = null;
    };
  }, [isModalOpen, isReadOnlyModal, mapStyle]);

  const resetModalState = () => {
    setFormError("");
    setIsSaving(false);
    setEditingMapId("");
    setDraftCoordinates([]);
    setFormState(createInitialFormState(mapFormOptions));
    // stop any running simulation when resetting modal
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
      setIsSimulating(false);
      if (mapAdapterRef.current) {
        const src = mapAdapterRef.current.getSource("map-management-drone");
        if (src && typeof src.setData === "function") src.setData(createEmptyFeatureCollection());
      }
    }
  };

  const startSimulation = () => {
    if (!mapAdapterRef.current) return;
    const coords = draftCoordinatesRef.current || [];
    if (!coords || coords.length < 2) return;
    if (simTimerRef.current) return; // already running

    const stepsPerSegment = 20;
    const flatSegments = [];
    for (let i = 0; i < coords.length - 1; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[i + 1];
      for (let s = 0; s < stepsPerSegment; s++) {
        const t = s / stepsPerSegment;
        const lng = lng1 + (lng2 - lng1) * t;
        const lat = lat1 + (lat2 - lat1) * t;
        const heading = Math.atan2(lat2 - lat1, lng2 - lng1) * (180 / Math.PI);
        flatSegments.push([lng, lat, heading]);
      }
    }
    // include final point
    const last = coords[coords.length - 1];
    flatSegments.push([last[0], last[1], flatSegments.length ? flatSegments[flatSegments.length - 1][2] : 0]);

    let idx = 0;
    setIsSimulating(true);
    simTimerRef.current = setInterval(() => {
      const c = flatSegments[idx % flatSegments.length];
      const [lng, lat, heading] = c;

      // Update modal map source (if present)
      try {
        const src = mapAdapterRef.current.getSource("map-management-drone");
        if (src && typeof src.setData === "function") {
          const fc = {
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "Point", coordinates: [lng, lat] },
                properties: {
                  id: `sim-drone-1`,
                  entityClass: "drone_position",
                  headingDegrees: heading,
                  visualState: "flying",
                  selected: true,
                },
              },
            ],
          };
          src.setData(fc);
        }
      } catch (err) {
        console.warn("sim setData err", err);
      }

      // Publish telemetry frame so main MapViewer (and HUD) receive updates
      try {
        telemetryService.publish({
          vehicleId: 'sim-v1',
          ts: Date.now(),
          droneCode: 'SIM-DRONE-1',
          coord: [lng, lat],
          altitudeMeters: 40,
          speedMetersPerSecond: 8,
          batteryPercent: Math.max(20, 100 - Math.floor(idx / 10)),
          signalStrengthPercent: 90,
          headingDegrees: heading,
          gpsAccuracyMeters: 1.5,
          recordingVideo: false,
        });
      } catch (err) {
        console.warn('telemetry publish error', err);
      }

      idx += 1;
    }, 300);
  };

  const stopSimulation = () => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsSimulating(false);
    if (mapAdapterRef.current) {
      const src = mapAdapterRef.current.getSource("map-management-drone");
      if (src && typeof src.setData === "function") src.setData(createEmptyFeatureCollection());
    }
  };

  const openCreateModal = () => {
    resetModalState();
    setModalMode("create");
    setIsMapFocusMode(true);
    setIsModalOpen(false);
  };

  const openViewOrEditModal = (row, mode) => {
    setFormError("");
    setModalMode(mode);
    setEditingMapId(row.id);
    setSelectedProjectId(row.id);
    setFormState({
      mapName: row.mapName,
      regionName: row.regionName,
      address: row.address,
      ownerName: row.ownerName,
    });

    const lineCoordinates = row.pathGeoJson?.geometry?.coordinates || [];
    setDraftCoordinates([...lineCoordinates]);
    setIsModalOpen(true);
    setIsMapFocusMode(false);
  };

  const handleDelete = async (rowId) => {
    const confirmed = window.confirm(mm.confirmDelete || "Bạn có chắc muốn xóa bản đồ này?");
    if (!confirmed) return;

    await deleteMapManagementItem(rowId);
    setMapRows((prev) => prev.filter((item) => item.id !== rowId));
    setActiveMenuRowId("");
  };

  const exitMapFocusMode = () => {
    setIsMapFocusMode(false);
    setIsModalOpen(false);
  };

  const handleUndoPoint = () => {
    if (isReadOnlyModal || draftCoordinates.length === 0) return;
    const nextCoordinates = draftCoordinates.slice(0, -1);
    setDraftCoordinates(nextCoordinates);
    pushSourceData(nextCoordinates);
  };

  const handleClearPoints = () => {
    if (isReadOnlyModal) return;
    setDraftCoordinates([]);
    pushSourceData([]);
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();
    if (isReadOnlyModal) {
      setIsModalOpen(false);
      return;
    }

    setIsSaving(true);
    setFormError("");

    // Compute bbox and center/zoom suggestion from draft coordinates
    const coords = Array.isArray(draftCoordinates) ? draftCoordinates : [];
    let bbox = null;
    let center = null;
    let suggestedZoom = 13;
    if (coords.length >= 1) {
      let minLng = Number.POSITIVE_INFINITY;
      let minLat = Number.POSITIVE_INFINITY;
      let maxLng = Number.NEGATIVE_INFINITY;
      let maxLat = Number.NEGATIVE_INFINITY;
      coords.forEach(([lng, lat]) => {
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          minLng = Math.min(minLng, lng);
          minLat = Math.min(minLat, lat);
          maxLng = Math.max(maxLng, lng);
          maxLat = Math.max(maxLat, lat);
        }
      });
      if (Number.isFinite(minLng) && Number.isFinite(minLat) && Number.isFinite(maxLng) && Number.isFinite(maxLat)) {
        bbox = [[minLng, minLat], [maxLng, maxLat]];
        center = [(minLng + maxLng) / 2, (minLat + maxLat) / 2];
        const lngSpan = maxLng - minLng;
        const latSpan = maxLat - minLat;
        const span = Math.max(lngSpan, latSpan);
        if (span <= 0.002) suggestedZoom = 18;
        else if (span <= 0.005) suggestedZoom = 17;
        else if (span <= 0.01) suggestedZoom = 16;
        else if (span <= 0.02) suggestedZoom = 15;
        else suggestedZoom = 14;
      }
    }

    const payload = {
      mapName: formState.mapName,
      regionName: formState.regionName,
      address: formState.address,
      ownerName: formState.ownerName,
      pathGeoJson: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: draftCoordinates || [],
        },
        properties: {},
      },
      bbox,
      center,
      zoom: suggestedZoom,
    };

    try {
      if (modalMode === "create") {
        const created = await createMapManagementItem(payload);
        setMapRows((prev) => [created, ...prev]);
      } else if (modalMode === "edit" && editingMapId) {
        const updated = await updateMapManagementItem(editingMapId, payload);
        setMapRows((prev) => prev.map((r) => (r.id === editingMapId ? updated : r)));
      }

      setIsModalOpen(false);
      if (isMapFocusMode) {
        setIsMapFocusMode(false);
      }
    } catch (err) {
      console.error("Failed to save map item:", err);
      setFormError(mm.saveError || "Lưu bản đồ thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <section className={`map-management-workspace${isMapFocusMode ? " map-management-workspace--focus" : ""}`}>
        {isLoading ? (
          <div className="map-management-workspace-loading">
            <MapLoadingScreen text={mm.loadingText || "Đang tải dữ liệu bản đồ bay..."} />
          </div>
        ) : isMapFocusMode ? (
          <>
            <MapViewer
              projects={filteredRows}
              selectedProject={selectedProject}
              hoveredProjectId={hoveredProjectId}
              mapStyle={mapStyle}
              statusById={statusById}
              showOperationalToolbar
            />
          </>
        ) : (
          <>
            <ProjectList
              projects={pagedRows}
              searchText={searchText}
              selectedProjectId={selectedProjectId}
              hoveredProjectId={hoveredProjectId}
              statusById={statusById}
              onSearchTextChange={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
              onSelectProject={handleSelectProject}
              onHoverProject={handleHoverProject}
              onClearHover={handleClearHover}
              onOpenCreateModal={openCreateModal}
              onOpenViewOrEditModal={openViewOrEditModal}
              onDelete={handleDelete}
              activeMenuRowId={activeMenuRowId}
              setActiveMenuRowId={setActiveMenuRowId}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              menuRef={menuRef}
              mm={mm}
            />

            <MapViewer
              projects={filteredRows}
              selectedProject={selectedProject}
              hoveredProjectId={hoveredProjectId}
              mapStyle={mapStyle}
              statusById={statusById}
            />
          </>
        )}

      </section>

      {isModalOpen && !isMapFocusMode && (
        <div className="map-management-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="map-management-modal" onClick={(event) => event.stopPropagation()}>
            <div className="map-management-modal-header">
              <h3>
                {modalMode === "create"
                  ? (mm.modalCreateTitle || "Thêm bản đồ bay")
                  : modalMode === "edit"
                    ? (mm.modalEditTitle || "Cập nhật bản đồ bay")
                    : (mm.modalViewTitle || "Chi tiết bản đồ bay")}
              </h3>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {draftCoordinates.length >= 2 && (
                  <button
                    type="button"
                    className="map-management-sim-btn"
                    onClick={() => { isSimulating ? stopSimulation() : startSimulation(); }}
                    title={isSimulating ? (mm.simStop || 'Dừng mô phỏng') : (mm.simStart || 'Mô phỏng')}
                  >
                    {isSimulating ? 'Dừng mô phỏng' : 'Mô phỏng'}
                  </button>
                )}
                <button
                  type="button"
                  className="map-management-close-btn"
                  onClick={() => setIsModalOpen(false)}
                  title={mm.closeButton || "Đóng"}
                  aria-label={mm.closeButton || "Đóng"}
                >
                  ✕
                </button>
              </div>
            </div>

            <form className="map-management-modal-form" onSubmit={handleModalSubmit}>
              <div className="map-management-form-grid">
                <label>
                  <span>{mm.fieldMapName || "Tên vùng"}</span>
                  <input
                    type="text"
                    value={formState.mapName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, mapName: event.target.value }))}
                    disabled={isReadOnlyModal}
                    placeholder={mm.fieldMapNamePlaceholder || "Nhập tên vùng"}
                  />
                </label>

                <label>
                  <span>{mm.fieldRegion || "Đội bay"}</span>
                  <select
                    value={formState.regionName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, regionName: event.target.value }))}
                    disabled={isReadOnlyModal}
                  >
                    {mapFormOptions.regions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>{mm.fieldAddress || "Địa chỉ"}</span>
                  <select
                    value={formState.address}
                    onChange={(event) => setFormState((prev) => ({ ...prev, address: event.target.value }))}
                    disabled={isReadOnlyModal}
                  >
                    {mapFormOptions.addresses.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>{mm.fieldOwner || "Chủ vùng"}</span>
                  <select
                    value={formState.ownerName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, ownerName: event.target.value }))}
                    disabled={isReadOnlyModal}
                  >
                    {mapFormOptions.owners.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="map-management-path-toolbar">
                <p>
                  {isReadOnlyModal
                    ? (mm.mapReadOnlyHint || "Đường bay đã lưu")
                    : (mm.mapEditHint || "Nhấp trên bản đồ để tạo đường bay")}
                </p>
                {!isReadOnlyModal && (
                  <div className="map-management-path-actions">
                    <button type="button" onClick={handleUndoPoint}>
                      {mm.undoButton || "Hoàn tác"}
                    </button>
                    <button type="button" onClick={handleClearPoints}>
                      {mm.clearButton || "Xóa đường"}
                    </button>
                  </div>
                )}
              </div>

              {!hasMapboxToken && (
                <div className="map-management-token-warning">
                  {mm.tokenWarning || "Chưa có Mapbox token, hệ thống đang dùng bản đồ fallback. Cấu hình VITE_MAPBOX_ACCESS_TOKEN hoặc MAPBOX_ACCESS_TOKEN để dùng bản đồ vệ tinh doanh nghiệp."}
                </div>
              )}

              <div ref={mapContainerRef} className="map-management-map-canvas" />

              <div className="map-management-coordinate-hint">
                {(mm.pointsCounter || "Số điểm hiện tại")}: {draftCoordinates.length}
              </div>

              {formError && <p className="map-management-form-error">{formError}</p>}

              <div className="map-management-modal-footer">
                <button type="button" className="ghost" onClick={() => setIsModalOpen(false)}>
                  {mm.cancelButton || "Hủy"}
                </button>
                <button type="submit" className="primary" disabled={isSaving}>
                  {isReadOnlyModal
                    ? (mm.closeButton || "Đóng")
                    : isSaving
                      ? (mm.savingButton || "Đang lưu...")
                      : modalMode === "create"
                        ? (mm.submitCreateButton || "Thêm bản đồ bay")
                        : (mm.submitEditButton || "Cập nhật bản đồ")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MapManagement;
