/**
 * MapAdapter - Abstract base class for map engine abstraction
 * 
 * This interface defines the contract for all map engine implementations.
 * Allows swapping between Mapbox, Leaflet, OpenLayers, etc. without changing UI code.
 * 
 * Future adapters (LeafletAdapter, OpenLayersAdapter, etc.) must implement all methods.
 */
export class MapAdapter {
  constructor() {
    if (new.target === MapAdapter) {
      throw new TypeError("MapAdapter is abstract and cannot be instantiated directly");
    }
  }

  /**
   * Initialize the map in the given container
   * @param {HTMLElement} container - DOM element to mount the map
   * @param {Object} config - Map configuration
   * @param {Array} config.center - [lng, lat] center point
   * @param {number} config.zoom - Initial zoom level
   * @param {string|Object} config.style - Map style URL or object
   * @returns {void}
   */
  init(container, config) {
    throw new Error("init() method must be implemented");
  }

  /**
   * Register an event listener
   * @param {string} event - Event name (e.g., 'click', 'load')
   * @param {Function} callback - Event handler
   * @returns {void}
   */
  on(event, callback) {
    throw new Error("on() method must be implemented");
  }

  /**
   * Unregister an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   * @returns {void}
   */
  off(event, callback) {
    throw new Error("off() method must be implemented");
  }

  /**
   * Add a data source to the map
   * @param {string} id - Source identifier
   * @param {Object} config - Source configuration (type, data, etc.)
   * @returns {void}
   */
  addSource(id, config) {
    throw new Error("addSource() method must be implemented");
  }

  /**
   * Add a visual layer to the map
   * @param {Object} layerConfig - Layer configuration (id, type, source, paint, etc.)
   * @returns {void}
   */
  addLayer(layerConfig) {
    throw new Error("addLayer() method must be implemented");
  }

  /**
   * Get a source by ID
   * @param {string} id - Source identifier
   * @returns {Object} Source object with methods like setData()
   */
  getSource(id) {
    throw new Error("getSource() method must be implemented");
  }

  /**
   * Animate map to fit geographic bounds
   * @param {Object} bounds - Bounds object with extend() method or LngLatBounds-compatible
   * @param {Object} options - Animation options (padding, maxZoom, etc.)
   * @returns {void}
   */
  fitBounds(bounds, options = {}) {
    throw new Error("fitBounds() method must be implemented");
  }

  /**
   * Animate map to a specific center point
   * @param {Array<number>} center - [lng, lat] center point
   * @returns {void}
   */
  setCenter(center) {
    throw new Error("setCenter() method must be implemented");
  }

  /**
   * Fly to a center point with animation
   * @param {Object} options - Fly-to options
   * @returns {void}
   */
  flyTo(options = {}) {
    throw new Error("flyTo() method must be implemented");
  }

  /**
   * Add a polygon dataset with fill, line, and label layers
   * @param {string} id - Base source/layer identifier
   * @param {Object} config - Polygon configuration
   * @returns {void}
   */
  addPolygon(id, config = {}) {
    throw new Error("addPolygon() method must be implemented");
  }

  /**
   * Update polygon dataset source
   * @param {string} id - Base source/layer identifier
   * @param {Object} data - GeoJSON feature collection
   * @returns {void}
   */
  updatePolygon(id, data) {
    throw new Error("updatePolygon() method must be implemented");
  }

  /**
   * Remove polygon layers and their source
   * @param {string} id - Base source/layer identifier
   * @returns {void}
   */
  removeLayer(id) {
    throw new Error("removeLayer() method must be implemented");
  }

  /**
   * Add a control widget to the map
   * @param {Object} control - Control instance
   * @param {string} position - Position string (e.g., 'top-right', 'top-left')
   * @returns {void}
   */
  addControl(control, position) {
    throw new Error("addControl() method must be implemented");
  }

  /**
   * Get the canvas DOM element
   * @returns {HTMLCanvasElement} Map canvas
   */
  getCanvas() {
    throw new Error("getCanvas() method must be implemented");
  }

  /**
   * Set feature state for interactive styling
   * @param {Object} target - Feature target { source, id } or { source, sourceLayer, id }
   * @param {Object} state - State object to set (e.g., { selected: true, hovered: false })
   * @returns {void}
   */
  setFeatureState(target, state) {
    throw new Error("setFeatureState() method must be implemented");
  }

  /**
   * Destroy the map and free resources
   * @returns {void}
   */
  remove() {
    throw new Error("remove() method must be implemented");
  }
}
