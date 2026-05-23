/**
 * LeafletAdapter - Leaflet implementation of MapAdapter
 * 
 * This is the ONLY file allowed to import leaflet directly.
 * All UI components use MapAdapter interface instead of leaflet directly.
 * 
 * Purpose: Frontend development & testing without Mapbox token.
 * Not for production use - Mapbox remains the official map engine.
 */
import L from "leaflet";
import { MapAdapter } from "./MapAdapter";

// Import Leaflet CSS - CRITICAL for proper rendering
// Without this, map tiles, zoom controls, and attribution won't display correctly
import "leaflet/dist/leaflet.css";

const STATUS_COLORS = {
  ACTIVE: { fill: "#ffedd5", line: "#f97316", marker: "#f97316" },
  COMPLETED: { fill: "#dcfce7", line: "#10b981", marker: "#10b981" },
  PENDING: { fill: "#fff7ed", line: "#f59e0b", marker: "#f59e0b" },
  DEFAULT: { fill: "#e0e7ff", line: "#cbd5e1", marker: "#6b7280" },
};

const getStatusColors = (statusKey) => STATUS_COLORS[statusKey] || STATUS_COLORS.DEFAULT;

const ENTITY_COLORS = {
  mission_area: { fill: "#d1fae5", line: "#10b981", marker: "#10b981" },
  flight_path: { fill: "rgba(37, 99, 235, 0.10)", line: "#2563eb", marker: "#2563eb" },
  drone_position: { fill: "#e0f2fe", line: "#0ea5e9", marker: "#0ea5e9" },
  geofence: { fill: "rgba(239, 68, 68, 0.18)", line: "#ef4444", marker: "#ef4444" },
  delivery_route: { fill: "rgba(249, 115, 22, 0.10)", line: "#f97316", marker: "#f97316" },
  point_annotation: { fill: "#dbeafe", line: "#2563eb", marker: "#2563eb" },
  line_annotation: { fill: "rgba(16, 185, 129, 0.10)", line: "#10b981", marker: "#10b981" },
  area_annotation: { fill: "rgba(139, 92, 246, 0.16)", line: "#8b5cf6", marker: "#8b5cf6" },
  task_area: { fill: "rgba(245, 158, 11, 0.16)", line: "#f59e0b", marker: "#f59e0b" },
  restricted_zone: { fill: "rgba(239, 68, 68, 0.20)", line: "#ef4444", marker: "#ef4444" },
  waypoint_draft: { fill: "rgba(14, 165, 233, 0.14)", line: "#0ea5e9", marker: "#0ea5e9" },
  default: STATUS_COLORS.DEFAULT,
};

const getEntityColors = (entityClass) => ENTITY_COLORS[entityClass] || ENTITY_COLORS.default;

const DRONE_STATE_COLORS = {
  flying: "#00a6ff",
  rtl: "#f59e0b",
  landing: "#f97316",
  idle: "#64748b",
  offline: "#334155",
  warning_battery: "#ef4444",
};

const getDroneStateColor = (state) => DRONE_STATE_COLORS[state] || DRONE_STATE_COLORS.flying;

export class LeafletAdapter extends MapAdapter {
  constructor() {
    super();
    this.map = null;
    this.eventHandlers = new Map(); // Store event handlers for cleanup
    this.polygonLayerRegistry = new Map();
  }

  /**
   * Initialize Leaflet map
   */
  init(container, config = {}) {
    if (!container) {
      throw new Error("Container element is required");
    }

    // Clean up existing map if present (handles React StrictMode double render)
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Clear container to ensure clean state - handle all Leaflet properties
    if (container._leaflet_id !== undefined) {
      // Try to get existing Leaflet map and remove it
      try {
        const existingMap = container._leaflet_map;
        if (existingMap && typeof existingMap.remove === 'function') {
          existingMap.remove();
        }
      } catch (err) {
        console.debug("Could not clean existing Leaflet instance:", err);
      }
      
      // Clear Leaflet internal properties
      delete container._leaflet_id;
      delete container._leaflet_map;
    }
    container.innerHTML = "";

    try {
      const center = this._toLeafletLatLng(config.center || [106.4705, 10.6262]);

      // Create map instance
      this.map = L.map(container, {
        center,
        zoom: config.zoom !== undefined ? config.zoom : 13,
        zoomControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        tap: true,
      });

      // Use a colored OpenStreetMap basemap with labels (roads/places).
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(this.map);

      return this.map;
    } catch (error) {
      console.error("Failed to initialize Leaflet map:", error);
      throw error;
    }
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    // Map Mapbox events to Leaflet events
    const leafletEvent = this._mapEventName(event);
    this.map.on(leafletEvent, callback);
    this.eventHandlers.set(`${event}-${callback.name || Math.random()}`, { event: leafletEvent, callback });
  }

  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    const leafletEvent = this._mapEventName(event);
    this.map.off(leafletEvent, callback);
  }

  /**
   * Add a data source to the map (GeoJSON layer)
   */
  addSource(id, config) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    // In Leaflet, we store GeoJSON as a layer instead of source
    const geoJsonLayer = L.geoJSON(config.data || { type: "FeatureCollection", features: [] }, {
      onEachFeature: (feature, layer) => {
        // Attach feature properties for later reference
        layer.feature = feature;
      },
    });

    geoJsonLayer.addTo(this.map);

    // Store reference for later updates
    if (!this.map._geojsonSources) {
      this.map._geojsonSources = new Map();
    }
    this.map._geojsonSources.set(id, { geoJsonLayer, data: config.data });
  }

  /**
   * Add a visual layer (Leaflet layers are implicit through GeoJSON styling)
   */
  addLayer(layerConfig) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    // In Leaflet, styling is handled through GeoJSON feature properties
    // and L.geoJSON options (style callback)
    // This is a no-op in basic Leaflet implementation since styling
    // is controlled via feature properties and GeoJSON options
  }

  /**
   * Get a source by ID
   */
  getSource(id) {
    if (!this.map || !this.map._geojsonSources) {
      return null;
    }

    const sourceData = this.map._geojsonSources.get(id);
    if (!sourceData) {
      return null;
    }

    // Return object with setData method for compatibility
    return {
      setData: (newData) => {
        // Remove old layer
        this.map.removeLayer(sourceData.geoJsonLayer);
        // Create new GeoJSON layer with updated data
        const newGeoJsonLayer = L.geoJSON(newData, {
          style: (feature) => {
            const props = feature?.properties || {};
            const colors = getEntityColors(props.entityClass);
            const statusColors = getStatusColors(props.statusKey);
            const customColor = props.color || props.lineColor || props.fillColor || props.markerColor;

            if (props.entityClass === "drone_heading") {
              return {
                color: getDroneStateColor(props.visualState),
                weight: props.selected ? 4 : 2.8,
                opacity: 1,
              };
            }

            return {
              color: props.lineColor || customColor || colors.line || statusColors.line,
              weight: props.selected ? 4 : 2,
              opacity: 0.9,
              fillColor: props.fillColor || customColor || colors.fill || statusColors.fill,
              fillOpacity: props.selected ? 0.65 : 0.35,
            };
          },
          pointToLayer: (feature, latlng) => {
            // Render point features as circle markers using feature properties
            const props = feature?.properties || {};
            const colors = getEntityColors(props.entityClass);
            const statusColors = getStatusColors(props.statusKey);
            const customColor = props.color || props.markerColor || props.lineColor || props.fillColor;

            if (props.entityClass === "drone_position") {
              return L.marker(latlng, {
                icon: this._createDroneIcon(props),
                keyboard: false,
              });
            }

            return L.circleMarker(latlng, {
              radius: props.selected ? 8 : 6,
              color: customColor || colors.marker || statusColors.marker,
              fillColor: customColor || colors.marker || statusColors.marker,
              fillOpacity: 1,
              weight: 1,
            });
          },
          onEachFeature: (feature, layer) => {
            layer.feature = feature;
            // Store reference by id for quick lookup
            if (feature && feature.id) {
              if (!this.map._featureLayerIndex) this.map._featureLayerIndex = new Map();
              this.map._featureLayerIndex.set(String(feature.id), layer);
            }
          },
        });

        newGeoJsonLayer.addTo(this.map);
        sourceData.geoJsonLayer = newGeoJsonLayer;
        sourceData.data = newData;
      },
    };
  }

  /**
   * Animate map to fit geographic bounds
   */
  fitBounds(bounds, options = {}) {
    if (!this.map || !bounds) {
      return;
    }

    try {
      const normalizedPadding = Array.isArray(options.padding)
        ? options.padding
        : Number.isFinite(options.padding)
          ? [options.padding, options.padding]
          : [50, 50];

      console.log("[LeafletAdapter.fitBounds] input bounds:", bounds);
      console.log("[LeafletAdapter.fitBounds] map state:", {
        loaded: this.map._loaded,
        size: this.map._size,
        zoom: typeof this.map.getZoom === "function" ? this.map.getZoom() : null,
        center: typeof this.map.getCenter === "function" ? this.map.getCenter() : null,
      });

      // Accept Mapbox-style bounds ([lng,lat]) and convert to Leaflet [lat,lng]
      let leafletBounds = bounds;

      if (Array.isArray(bounds) && bounds.length === 2 && Array.isArray(bounds[0]) && Array.isArray(bounds[1])) {
        const sw = this._toLeafletLatLng(bounds[0]);
        const ne = this._toLeafletLatLng(bounds[1]);
        console.log("[LeafletAdapter.fitBounds] converted corners:", { sw, ne });
        
        // Validate bounds before creating L.latLngBounds
        if (!sw || !ne || !Array.isArray(sw) || !Array.isArray(ne) || 
            sw.length < 2 || ne.length < 2 ||
            !Number.isFinite(sw[0]) || !Number.isFinite(sw[1]) ||
            !Number.isFinite(ne[0]) || !Number.isFinite(ne[1])) {
          console.warn("fitBounds received invalid bounds:", bounds, "sw:", sw, "ne:", ne);
          return;
        }
        
        leafletBounds = L.latLngBounds(sw, ne);
        console.log("[LeafletAdapter.fitBounds] leafletBounds:", leafletBounds);
      }

      this.map.fitBounds(leafletBounds, {
        padding: normalizedPadding,
        maxZoom: options.maxZoom !== undefined ? options.maxZoom : 18,
        animate: options.duration !== undefined,
        duration: options.duration !== undefined ? (options.duration * 0.001) : undefined,
      });
      console.log("[LeafletAdapter.fitBounds] fitBounds called with options:", {
        padding: normalizedPadding,
        maxZoom: options.maxZoom !== undefined ? options.maxZoom : 18,
        animate: options.duration !== undefined,
        duration: options.duration !== undefined ? (options.duration * 0.001) : undefined,
      });
    } catch (error) {
      console.warn("fitBounds error:", error);
    }
  }

  /**
   * Set map center
   */
  setCenter(center) {
    if (!this.map || !center || center.length < 2) {
      return;
    }

    // Convert [lng, lat] to [lat, lng] for Leaflet
    this.map.setView(this._toLeafletLatLng(center));
  }

  /**
   * Fly to a location with animation
   */
  flyTo(options = {}) {
    if (!this.map) {
      return;
    }

    const center = options.center || [106.4705, 10.6262];
    const zoom = options.zoom !== undefined ? options.zoom : 13;

    // Convert [lng, lat] to [lat, lng] for Leaflet
    this.map.flyTo(this._toLeafletLatLng(center), zoom, {
      duration: options.duration !== undefined ? options.duration * 0.001 : 1, // Leaflet duration in seconds
    });
  }

  /**
   * Add polygon with fill, line, and label
   */
  addPolygon(id, config = {}) {
    if (!this.map) {
      return;
    }

    const coordinates = config.data?.coordinates || [];
    if (!coordinates.length) {
      return;
    }

    // Convert from [lng, lat] to [lat, lng] for Leaflet
    const leafletCoords = coordinates[0].map((coord) => [coord[1], coord[0]]);

    // Create polygon
    const polygon = L.polygon(leafletCoords, {
      color: "#3b82f6",
      weight: 2,
      opacity: 0.8,
      fillColor: "#93c5fd",
      fillOpacity: 0.3,
    }).addTo(this.map);

    // Add label marker at centroid
    if (config.data?.properties?.label) {
      const bounds = polygon.getBounds();
      const center = bounds.getCenter();
      L.marker(center, {
        icon: L.divIcon({
          className: "leaflet-polygon-label",
          html: `<div style="font-size:12px; color:#1e293b; font-weight:bold; background:#fff; padding:2px 4px; border-radius:3px; white-space:nowrap;">${config.data.properties.label}</div>`,
          iconSize: null,
          iconAnchor: null,
        }),
      }).addTo(this.map);
    }

    // Store registry
    this.polygonLayerRegistry.set(id, { polygon, leafletCoords });
  }

  /**
   * Update polygon data
   */
  updatePolygon(id, data) {
    if (!this.map) {
      return;
    }

    const registry = this.polygonLayerRegistry.get(id);
    if (!registry) {
      return;
    }

    // Remove old polygon
    this.map.removeLayer(registry.polygon);

    // Create new polygon
    if (data?.coordinates && data.coordinates.length) {
      const leafletCoords = data.coordinates[0].map((coord) => [coord[1], coord[0]]);
      const newPolygon = L.polygon(leafletCoords, {
        color: "#3b82f6",
        weight: 2,
        opacity: 0.8,
        fillColor: "#93c5fd",
        fillOpacity: 0.3,
      }).addTo(this.map);

      this.polygonLayerRegistry.set(id, { polygon: newPolygon, leafletCoords });
    }
  }

  /**
   * Remove polygon by ID
   */
  removeLayer(id) {
    if (!this.map) {
      return;
    }

    const registry = this.polygonLayerRegistry.get(id);
    if (registry && registry.polygon) {
      this.map.removeLayer(registry.polygon);
    }

    this.polygonLayerRegistry.delete(id);
  }

  /**
   * Add control widget
   */
  addControl(control, position = "topright") {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    // Map Mapbox positions to Leaflet positions
    const leafletPosition = this._mapPosition(position);

    // Handle Leaflet native controls
    if (control instanceof L.Control) {
      control.setPosition(leafletPosition);
      this.map.addControl(control);
    }
  }

  /**
   * Get canvas element (Leaflet doesn't have direct canvas access like Mapbox)
   */
  getCanvas() {
    if (!this.map) {
      return null;
    }

    // Return the map container as a fallback
    return this.map.getContainer();
  }

  /**
   * Set feature state for styling (simulated in Leaflet)
   */
  setFeatureState(target, state) {
    return;
  }

  /**
   * Notify map that container size has changed
   * Critical for proper rendering after resize or layout changes
   */
  invalidateSize() {
    if (!this.map) {
      return;
    }
    this.map.invalidateSize();
  }

  /**
   * Cleanup and destroy map
   */
  remove() {
    if (!this.map) {
      return;
    }

    // Clean up all event handlers
    this.eventHandlers.forEach(({ event, callback }) => {
      this.map.off(event, callback);
    });
    this.eventHandlers.clear();

    // Clean up polygon layers
    Array.from(this.polygonLayerRegistry.keys()).forEach((id) => {
      this.removeLayer(id);
    });
    this.polygonLayerRegistry.clear();

    // Destroy map
    this.map.remove();
    this.map = null;
  }

  /**
   * Leaflet-specific utilities
   */

  /**
   * Create bounds from coordinates
   */
  createBounds(initialCoord) {
    // Convert [lng, lat] to [lat, lng] for Leaflet and keep extend() compatible with Mapbox-style inputs
    const latLng = this._toLeafletLatLng(initialCoord);
    const bounds = L.latLngBounds([latLng], [latLng]);
    const originalExtend = bounds.extend.bind(bounds);

    bounds.extend = (value) => {
      if (Array.isArray(value) && value.length >= 2) {
        return originalExtend(this._toLeafletLatLng(value));
      }

      return originalExtend(value);
    };

    return bounds;
  }

  /**
   * Create Navigation Control (Leaflet built-in)
   */
  createNavigationControl(options = {}) {
    return new L.Control.Zoom({
      position: "topright",
      ...options,
    });
  }

  /**
   * Create Fullscreen Control (requires Leaflet.fullscreen plugin)
   */
  createFullscreenControl() {
    // Leaflet fullscreen requires separate plugin
    // Return null if not available
    return null;
  }

  /**
   * Helper: Map Mapbox event names to Leaflet event names
   */
  _mapEventName(event) {
    const eventMap = {
      load: "load",
      click: "click",
      move: "move",
      moveend: "moveend",
      zoomend: "zoomend",
    };
    return eventMap[event] || event;
  }

  /**
   * Helper: Map Mapbox position strings to Leaflet position strings
   */
  _mapPosition(position) {
    const positionMap = {
      "top-left": "topleft",
      "top-right": "topright",
      "bottom-left": "bottomleft",
      "bottom-right": "bottomright",
    };
    return positionMap[position] || "topright";
  }

  /**
   * Convert a Mapbox-style coordinate pair [lng, lat] to Leaflet order [lat, lng]
   */
  _toLeafletLatLng(coordinate) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) {
      return [10.6262, 106.4705];
    }

    return [coordinate[1], coordinate[0]];
  }

  _createDroneIcon(properties = {}) {
    const visualState = properties.visualState || "flying";
    const color = getDroneStateColor(visualState);
    const heading = Number.isFinite(properties.headingDegrees) ? properties.headingDegrees : 0;
    const isSelected = Boolean(properties.selected);
    const ringSize = isSelected ? 42 : 36;
    const coreSize = isSelected ? 20 : 18;

    const svg = `
      <div class="ops-drone-marker ops-drone-marker--${visualState}${isSelected ? " is-selected" : ""}" style="--drone-color:${color}; --drone-ring-size:${ringSize}px; --drone-core-size:${coreSize}px; --drone-heading:${heading}deg;">
        <span class="ops-drone-ring"></span>
        <span class="ops-drone-core"></span>
        <span class="ops-drone-heading"></span>
      </div>
    `;

    return L.divIcon({
      className: "ops-drone-div-icon",
      html: svg,
      iconSize: [ringSize, ringSize],
      iconAnchor: [ringSize / 2, ringSize / 2],
    });
  }
}
