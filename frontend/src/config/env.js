const runtimeConfig =
  typeof window !== "undefined" && window.__APP_CONFIG__
    ? window.__APP_CONFIG__
    : {};

const apiBaseUrl = runtimeConfig.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;
const mapboxAccessToken = runtimeConfig.MAPBOX_ACCESS_TOKEN || import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
const mapboxStyleUrl = runtimeConfig.MAPBOX_STYLE_URL || import.meta.env.VITE_MAPBOX_STYLE_URL || "mapbox://styles/mapbox/satellite-streets-v12";
const mapEngine = runtimeConfig.MAP_ENGINE || import.meta.env.VITE_MAP_ENGINE || "mapbox";

if (!apiBaseUrl) {
  throw new Error("Missing API base URL. Set API_BASE_URL or VITE_API_BASE_URL.");
}

export const ENV = {
  apiBaseUrl,
  appName: runtimeConfig.APP_NAME || import.meta.env.VITE_APP_NAME || "WebGCS03",
  mapboxAccessToken,
  mapboxStyleUrl,
  mapEngine,
};
