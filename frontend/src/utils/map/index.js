/**
 * Map utilities export
 * 
 * Centralized export for map adapter system.
 * This is the single import point for map-related utilities.
 * 
 * IMPORTANT: To use LeafletAdapter, run: npm install
 * This will install the leaflet package required by LeafletAdapter.
 */
import { ENV } from "../../config/env";
import { MapboxAdapter } from "./MapboxAdapter";

export { MapAdapter } from "./MapAdapter";
export { MapboxAdapter } from "./MapboxAdapter";

// LeafletAdapter is dynamically loaded only when required.
// This allows the app to work with Mapbox even if leaflet is not installed.

/**
 * Factory function to create map adapter instance
 * 
 * Supports two map engines:
 * - 'mapbox' (default, always available) - Production engine
 * - 'leaflet' (requires npm install) - Development/testing engine
 * 
 * @param {string} type - Map engine type: 'mapbox' | 'leaflet'
 *                        If not specified, reads from VITE_MAP_ENGINE env var.
 *                        Default: 'mapbox'
 * @returns {MapAdapter} Map adapter instance
 * @throws {Error} If leaflet is requested but leaflet package is not installed
 */
export async function createMapAdapterAsync(type = null) {
  // Determine engine type: explicit param > env var > default (mapbox)
  let engine = type || ENV.mapEngine || "mapbox";

  if (engine === "leaflet") {
    try {
      const { LeafletAdapter } = await import("./LeafletAdapter.js");
      return new LeafletAdapter();
    } catch (error) {
      throw new Error(
        "Leaflet adapter requested but leaflet package is not installed. " +
        "Run 'npm install' to install dependencies. Error: " + error.message
      );
    }
  }

  // Default to Mapbox
  return new MapboxAdapter();
}

/**
 * Synchronous factory function for backward compatibility
 * Uses Mapbox by default; Leaflet support requires async version
 */
export function createMapAdapter(type = null) {
  // Determine engine type: explicit param > env var > default (mapbox)
  let engine = type || ENV.mapEngine || "mapbox";

  if (engine === "leaflet") {
    console.warn(
      "Leaflet adapter requested but synchronous loading not available. " +
      "Use createMapAdapterAsync() or ensure leaflet is installed via npm install. " +
      "Falling back to Mapbox for now."
    );
  }

  // Default to Mapbox
  return new MapboxAdapter();
}

