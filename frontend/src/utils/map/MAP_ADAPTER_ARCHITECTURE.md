/**
 * MAP ADAPTER PATTERN - Architecture Documentation
 * 
 * This document explains the map abstraction layer design for WebGCS03.
 * ============================================================================
 * 
 * PURPOSE:
 * --------
 * - Decouple UI components from specific map engine implementations (Mapbox, Leaflet, etc.)
 * - Enable future replacement of map libraries without rewriting UI code
 * - Improve code maintainability and reduce coupling
 * - Simplify testing by allowing mock adapters
 * 
 * ============================================================================
 * 
 * ARCHITECTURE:
 * ============================================================================
 * 
 * MapAdapter (Abstract Base Class)
 *    │
 *    ├─ MapboxAdapter ✓ (Current Implementation - Production)
 *    ├─ LeafletAdapter ✓ (Development/Testing - No token required)
 *    └─ OpenLayersAdapter (Future)
 * 
 * UI Components (e.g., MapManagement.jsx)
 *    │
 *    └─ uses adapter methods (not direct mapboxgl or leaflet calls)
 * 
 * ============================================================================
 * 
 * CORE INTERFACES:
 * ============================================================================
 * 
 * 1. MapAdapter (src/utils/map/MapAdapter.js)
 *    - Abstract base class defining all required methods
 *    - Cannot be instantiated directly
 *    - Throws NotImplementedError for all methods
 * 
 * 2. MapboxAdapter (src/utils/map/MapboxAdapter.js)
 *    - ONLY file allowed to import mapboxgl
 *    - Implements MapAdapter interface
 *    - Wraps mapboxgl API calls
 *    - Handles token initialization (from ENV)
 *    - Manages event handler lifecycle
 *    - DEFAULT: Used in production and when env var not specified
 * 
 * 3. LeafletAdapter (src/utils/map/LeafletAdapter.js)
 *    - ONLY file allowed to import leaflet
 *    - Implements MapAdapter interface
 *    - Wraps Leaflet API calls
*    - No authentication required (uses an internal no-network development basemap for testing)
 *    - OPTIONAL: Used for frontend development/testing
 * 
 * 4. Factory Function (createMapAdapter)
 *    - Returns appropriate adapter instance based on ENV.mapEngine
 *    - Default: MapboxAdapter
 *    - Can be overridden: createMapAdapter('leaflet')
 * 
 * ============================================================================
 * 
 * ADAPTER METHODS:
 * ============================================================================
 * 
 * init(container, config)
 *   - Initialize map in DOM container
 *   - config: { center, zoom, style }
 *   - Must be called once before other methods
 * 
 * on(event, callback)
 *   - Register event listener
 *   - Supports: 'load', 'click', 'move', etc.
 * 
 * off(event, callback)
 *   - Unregister event listener
 *   - Necessary for cleanup
 * 
 * addSource(id, config)
 *   - Add data source (GeoJSON, tiles, etc.)
 *   - config: { type, data, ... }
 * 
 * addLayer(layerConfig)
 *   - Add visual layer (line, circle, fill, etc.)
 *   - layerConfig: { id, type, source, paint, ... }
 * 
 * getSource(id)
 *   - Retrieve source by ID
 *   - Returns source object with setData() method
 * 
 * fitBounds(bounds, options)
 *   - Animate map to fit geographic bounds
 *   - options: { padding, maxZoom, duration }
 * 
 * addControl(control, position)
 *   - Add UI control widget
 *   - position: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
 * 
 * getCanvas()
 *   - Get HTML canvas element
 *   - Useful for cursor styling
 * 
 * setFeatureState(target, state)
 *   - Update feature styling state (hover, selected)
 *   - target: { source, id }
 *   - state: { selected: true, hovered: false }
 * 
 * remove()
 *   - Destroy map and free resources
 *   - Call on component unmount
 * 
 * ============================================================================
 * 
 * USAGE IN COMPONENTS:
 * ============================================================================
 * 
 * // 1. Import adapter factory
 * import { createMapAdapter } from '../../utils/map';
 * 
 * // 2. Create adapter instance (typically in useRef)
 * const mapAdapterRef = useRef(null);
 * 
 * // 3. Initialize in useEffect
 * useEffect(() => {
 *   const adapter = createMapAdapter(); // Uses ENV.mapEngine (default: mapbox)
 *   mapAdapterRef.current = adapter;
 *   
 *   adapter.init(container, {
 *     center: [lng, lat],
 *     zoom: 13,
 *     style: mapStyle // Can be string or object
 *   });
 *   
 *   // Use adapter methods instead of mapboxgl or leaflet
 *   adapter.addControl(adapter.createNavigationControl(), 'top-right');
 *   adapter.on('load', () => { ... });
 *   
 *   // Cleanup
 *   return () => {
 *     adapter.remove();
 *   };
 * }, []);
 * 
 * // 4. Interact with adapter in handlers
 * const handleClick = () => {
 *   const source = mapAdapterRef.current.getSource('my-source');
 *   source.setData(newFeatures);
 * };
 * 
 * ============================================================================
 * 
 * MAPBOX-SPECIFIC UTILITIES:
 * ============================================================================
 * 
 * MapboxAdapter provides three utility methods for Mapbox-specific objects:
 * 
 * - createBounds(initialCoord) → mapboxgl.LngLatBounds
 * - createNavigationControl(options) → mapboxgl.NavigationControl
 * - createFullscreenControl() → mapboxgl.FullscreenControl
 * 
 * ============================================================================
 * 
 * LEAFLET-SPECIFIC UTILITIES:
 * ============================================================================
 * 
 * LeafletAdapter provides utility methods for Leaflet-specific objects:
 * 
 * - createBounds(initialCoord) → L.latLngBounds
 * - createNavigationControl(options) → L.Control.Zoom
 * - createFullscreenControl() → null (requires separate plugin)
 * 
 * NOTE: Leaflet uses [lat, lng] coordinates while Mapbox uses [lng, lat].
 *       Adapters handle conversion automatically.
 * 
 * ============================================================================
 * 
 * LEAFLET CSS - CRITICAL REQUIREMENT:
 * ============================================================================
 * 
 * IMPORTANT: LeafletAdapter MUST import its CSS stylesheet for proper rendering!
 * 
 * Location: src/utils/map/LeafletAdapter.js (line 13)
 * Import:   import "leaflet/dist/leaflet.css";
 * 
 * What breaks without this CSS:
 *   ✗ Zoom in/out buttons won't display
 *   ✗ Pan/navigation controls won't work
 *   ✗ Map attribution link won't display
 *   ✗ Tile grid will render but be invisible
 *   ✗ Overall map panel will be blank
 * 
 * This CSS is bundled by Vite automatically when imported.
 * DO NOT remove or rename this import line - it's critical for LeafletAdapter.
 * 
 * ============================================================================
 * 
 * ENVIRONMENT VARIABLES:
 * ============================================================================
 * 
 * VITE_MAP_ENGINE
 *   - Specify which map engine to use
 *   - Values: 'mapbox' (default) | 'leaflet'
 *   - Example: VITE_MAP_ENGINE=leaflet npm run dev
*   - Recommended local setting: use `.env.development` with `VITE_MAP_ENGINE=leaflet`
 * 
 * VITE_MAPBOX_ACCESS_TOKEN (Mapbox only)
 *   - Required for Mapbox (production)
 *   - Not needed for Leaflet (uses free OSM tiles)
*   - Not needed for Leaflet (LeafletAdapter uses a local development basemap with no external tile requests)
 * 
 * VITE_MAPBOX_STYLE_URL (Mapbox only)
 *   - Mapbox style URL
 *   - Default: mapbox://styles/mapbox/satellite-streets-v12
 * 
 * ============================================================================
 * 
 * PERFORMANCE BEST PRACTICES:
 * ============================================================================
 * 
 * 1. Map Instance Lifecycle
 *    - Create adapter in useRef (not state)
 *    - Initialize ONCE in useEffect
 *    - Store in mapAdapterRef.current
 *    - Do NOT create new map on every render
 * 
 * 2. Source Updates
 *    - Get source once: adapter.getSource(id)
 *    - Update source data: source.setData(newFeatures)
 *    - Do NOT recreate layers or sources
 * 
 * 3. Event Handling
 *    - Store callbacks in useRef for stable references
 *    - Always unregister in cleanup function
 *    - Prevents memory leaks and duplicate handlers
 * 
 * 4. Re-renders
 *    - Keep adapter reference in useRef
 *    - Don't recreate adapter on state changes
 *    - useRef persists across re-renders
 * 
 * ============================================================================
 * 
 * SWITCHING MAP ENGINES:
 * ============================================================================
 * 
 * For Development/Testing with Leaflet (no token needed):
 * 
 *   # Set environment variable
 *   export VITE_MAP_ENGINE=leaflet
 *   npm run dev
*
*   # Or persist it in .env.development for local UI testing
*   VITE_MAP_ENGINE=leaflet
 * 
 * For Production/Mapbox:
 * 
 *   export VITE_MAPBOX_ACCESS_TOKEN=your_token_here
 *   npm run build
 * 
 * For Docker (LeafletAdapter):
 * 
 *   docker run -e VITE_MAP_ENGINE=leaflet ...
 * 
 * ============================================================================
 * 
 * EXTENDING TO NEW ADAPTERS:
 * ============================================================================
 * 
 * To add a new map library (e.g., OpenLayers):
 * 
 * 1. Create OpenLayersAdapter extends MapAdapter
 *    src/utils/map/OpenLayersAdapter.js
 * 
 * 2. Implement all abstract methods:
 *    - init(), on(), off(), addSource(), addLayer()
 *    - getSource(), fitBounds(), addControl()
 *    - getCanvas(), remove(), setFeatureState()
 * 
 * 3. Map API differences in implementation:
 *    - mapboxgl.Map → new ol.Map()
 *    - mapboxgl.addSource() → ol.source.Vector
 *    - mapboxgl.LngLatBounds → ol.extent
 *    - etc.
 * 
 * 4. Update factory to support new engine:
 * 
 *    export function createMapAdapter(type = null) {
 *      let engine = type || ENV.mapEngine || "mapbox";
 *      
 *      if (engine === "leaflet") {
 *        return new LeafletAdapter();
 *      }
 *      if (engine === "openlayers") {
 *        return new OpenLayersAdapter();
 *      }
 *      
 *      return new MapboxAdapter();
 *    }
 * 
 * 5. Export new adapter from index.js
 * 
 * ============================================================================
 * 
 * CONSTRAINTS & RULES:
 * ============================================================================
 * 
 * ✗ DO NOT:
 *   - Import mapboxgl in UI components (use MapboxAdapter)
 *   - Import leaflet in UI components (use LeafletAdapter)
 *   - Create map instance directly outside adapter
 *   - Mix adapter and direct mapboxgl/leaflet calls
 *   - Call mapboxgl.accessToken outside MapboxAdapter
 * 
 * ✓ DO:
 *   - Use adapter methods for all map operations
 *   - Import adapter factory in components
 *   - Store adapter in useRef
 *   - Always call remove() in cleanup
 *   - Use createMapAdapter() for engine-agnostic code
 * 
 * ============================================================================
 * 
 * CURRENT STATUS:
 * ============================================================================
 * 
 * ✓ MapAdapter base class created
 * ✓ MapboxAdapter implementation complete (Production)
 * ✓ LeafletAdapter implementation complete (Development)
 * ✓ Factory pattern supports both engines
 * ✓ MapManagement.jsx refactored to use adapter
 * ✓ MapViewer.jsx refactored to use adapter
 * ⏳ OpenLayersAdapter (future implementation)
 * 
 * ============================================================================
 */
