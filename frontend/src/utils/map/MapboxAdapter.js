/**
 * MapboxAdapter - Mapbox GL implementation of MapAdapter
 * 
 * This is the ONLY file allowed to import mapbox-gl directly.
 * All UI components use MapAdapter interface instead of mapboxgl directly.
 */
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapAdapter } from "./MapAdapter";
import { ENV } from "../../config/env";

export class MapboxAdapter extends MapAdapter {
  constructor() {
    super();
    this.map = null;
    this.eventHandlers = new Map(); // Store event handlers for cleanup
    this.polygonLayerRegistry = new Map();
  }

  /**
   * Initialize Mapbox GL map
   */
  init(container, config = {}) {
    if (!container) {
      throw new Error("Container element is required");
    }

    // Set Mapbox access token if available
    if (ENV.mapboxAccessToken) {
      mapboxgl.accessToken = ENV.mapboxAccessToken;
    }

    // Create map instance
    this.map = new mapboxgl.Map({
      container,
      style: config.style || "mapbox://styles/mapbox/streets-v12",
      center: config.center || [0, 0],
      zoom: config.zoom !== undefined ? config.zoom : 13,
    });

    return this.map;
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    // Store handler for cleanup
    const key = `${event}_${callback.toString().slice(0, 20)}`;
    this.eventHandlers.set(key, { event, callback });

    this.map.on(event, callback);
  }

  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (!this.map) {
      return;
    }

    const key = `${event}_${callback.toString().slice(0, 20)}`;
    this.eventHandlers.delete(key);

    this.map.off(event, callback);
  }

  /**
   * Add data source (GeoJSON, raster tiles, etc.)
   */
  addSource(id, config) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    this.map.addSource(id, config);
  }

  /**
   * Add visual layer (line, circle, fill, etc.)
   */
  addLayer(layerConfig) {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    this.map.addLayer(layerConfig);
  }

  /**
   * Get source by ID
   */
  getSource(id) {
    if (!this.map) {
      return null;
    }

    return this.map.getSource(id);
  }

  /**
   * Fit map bounds with animation
   */
  fitBounds(bounds, options = {}) {
    if (!this.map || !bounds) {
      return;
    }

    this.map.fitBounds(bounds, {
      padding: options.padding || 0,
      maxZoom: options.maxZoom !== undefined ? options.maxZoom : 15,
      duration: options.duration || 1000,
      ...options,
    });
  }

  /**
   * Move map center without changing zoom.
   */
  setCenter(center) {
    if (!this.map || !Array.isArray(center)) {
      return;
    }

    this.map.setCenter(center);
  }

  /**
   * Fly to a location with animation.
   */
  flyTo(options = {}) {
    if (!this.map) {
      return;
    }

    this.map.flyTo(options);
  }

  /**
   * Add a polygon source with fill, outline, and label layers.
   */
  addPolygon(id, config = {}) {
    if (!this.map || !id) {
      return;
    }

    const sourceId = config.sourceId || `${id}-source`;
    const fillLayerId = config.fillLayerId || `${id}-fill`;
    const lineLayerId = config.lineLayerId || `${id}-line`;
    const labelLayerId = config.labelLayerId || `${id}-label`;
    const sourceData = config.data || { type: "FeatureCollection", features: [] };

    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, {
        type: "geojson",
        data: sourceData,
      });
    }

    if (!this.map.getLayer(fillLayerId)) {
      this.map.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceId,
        filter: ["==", ["get", "featureType"], "polygon"],
        paint: {
          "fill-color": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            "#2f6f4e",
            ["boolean", ["get", "isHovered"], false],
            "#6b8e77",
            ["match", ["get", "statusKey"], "complete", "#9cb5a6", "active", "#6c8f72", "pending", "#c5a15b", "#91a6a0"],
          ],
          "fill-opacity": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            0.44,
            ["boolean", ["get", "isHovered"], false],
            0.3,
            0.16,
          ],
        },
      });
    }

    if (!this.map.getLayer(lineLayerId)) {
      this.map.addLayer({
        id: lineLayerId,
        type: "line",
        source: sourceId,
        filter: ["==", ["get", "featureType"], "polygon"],
        paint: {
          "line-color": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            "#244f39",
            ["boolean", ["get", "isHovered"], false],
            "#4d6b57",
            "#7b9086",
          ],
          "line-width": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            3,
            ["boolean", ["get", "isHovered"], false],
            2.5,
            1.7,
          ],
        },
      });
    }

    if (!this.map.getLayer(labelLayerId)) {
      this.map.addLayer({
        id: labelLayerId,
        type: "symbol",
        source: sourceId,
        filter: ["==", ["get", "featureType"], "label"],
        layout: {
          "text-field": ["get", "label"],
          "text-size": 12,
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-anchor": "center",
          "text-offset": [0, 0],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": [
            "case",
            ["boolean", ["get", "isSelected"], false],
            "#173021",
            ["boolean", ["get", "isHovered"], false],
            "#23402f",
            "#40544a",
          ],
          "text-halo-color": "#f5f8f6",
          "text-halo-width": 1.2,
        },
      });
    }

    this.polygonLayerRegistry.set(id, {
      sourceId,
      fillLayerId,
      lineLayerId,
      labelLayerId,
    });
  }

  /**
   * Update polygon source data.
   */
  updatePolygon(id, data) {
    if (!this.map || !id) {
      return;
    }

    const registry = this.polygonLayerRegistry.get(id);
    const sourceId = registry?.sourceId || `${id}-source`;
    const source = this.map.getSource(sourceId);

    if (source && typeof source.setData === "function") {
      source.setData(data);
    }
  }

  /**
   * Remove polygon layers and source created by addPolygon.
   */
  removeLayer(id) {
    if (!this.map || !id) {
      return;
    }

    const registry = this.polygonLayerRegistry.get(id);
    const layerIds = [registry?.labelLayerId, registry?.lineLayerId, registry?.fillLayerId].filter(Boolean);

    layerIds.forEach((layerId) => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });

    if (registry?.sourceId && this.map.getSource(registry.sourceId)) {
      this.map.removeSource(registry.sourceId);
    }

    this.polygonLayerRegistry.delete(id);
  }

  /**
   * Add control widget
   */
  addControl(control, position = "top-right") {
    if (!this.map) {
      console.warn("Map not initialized. Call init() first.");
      return;
    }

    this.map.addControl(control, position);
  }

  /**
   * Get canvas element
   */
  getCanvas() {
    if (!this.map) {
      return null;
    }

    return this.map.getCanvas();
  }

  /**
   * Set feature state for interactive styling (e.g., hover, selected)
   * Allows paint properties to use feature-state expressions
   */
  setFeatureState(target, state) {
    if (!this.map || !target || !state) {
      console.warn("Map not initialized or invalid target/state");
      return;
    }

    // Map expects { source: "id", id: featureId } or { source, sourceLayer, id }
    this.map.setFeatureState(target, state);
  }

  /**
   * Notify map that container size has changed
   * No-op for Mapbox (Mapbox handles resize automatically)
   * Kept for adapter interface compatibility with Leaflet
   */
  invalidateSize() {
    // Mapbox automatically detects container resizing
    // No explicit invalidateSize needed
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

    Array.from(this.polygonLayerRegistry.keys()).forEach((id) => {
      this.removeLayer(id);
    });
    this.polygonLayerRegistry.clear();

    // Destroy map
    this.map.remove();
    this.map = null;
  }

  /**
   * Mapbox-specific utilities (optional, can be extended)
   */

  /**
   * Create LngLatBounds for fitting multiple coordinates
   * @param {Array} initialCoord - [lng, lat] starting coordinate
   * @returns {mapboxgl.LngLatBounds}
   */
  createBounds(initialCoord) {
    return new mapboxgl.LngLatBounds(initialCoord, initialCoord);
  }

  /**
   * Create Navigation Control
   */
  createNavigationControl(options = {}) {
    return new mapboxgl.NavigationControl(options);
  }

  /**
   * Create Fullscreen Control
   */
  createFullscreenControl() {
    return new mapboxgl.FullscreenControl();
  }
}

/**
 * Factory function to create adapter instance
 */
export function createMapAdapter() {
  return new MapboxAdapter();
}
