# AGENTS.md - WebGCS03 Contributor Guide

## Project Context
- Project name: Dronehub Web-GCS
- Goal: Build a robust, modular, and reusable Ground Control Station frontend for DroneEngage telemetry and video streams.
- Architecture style: Feature-driven structure under src/features (auth, dashboard, fleet, mission, media).
- Delivery requirement: Keep implementation deploy-ready across Local -> Docker -> Registry -> AWS EC2 with no code rewrites.

## Tech Stack
- React 19 + Vite 8 (ES6+, JSX)
- React Router DOM, Framer Motion, Mapbox GL
- Axios for HTTP client
- CSS Flexbox with standard CSS and CSS modules
- Docker multi-stage build + Nginx runtime

## Working Language
- Chat responses to users: Vietnamese
- Source code comments: English only, explicit and beginner-friendly

## Coding Rules
1. Keep components small, modular, and reusable.
2. Use modern React patterns with functional components and hooks.
3. Prefer async/await for asynchronous operations.
4. Build screens incrementally from static structure to dynamic binding.
5. Preserve existing project visual language unless a task explicitly asks for redesign.

## API and Environment Rules
1. Never hardcode API endpoints in frontend code.
2. Always resolve API base URL from shared environment config.
3. All network requests must use shared Axios client in src/utils/apiClient.js.
4. Use Vite environment variables for build-time values (VITE_*).
5. Respect runtime override via window.__APP_CONFIG__ from public/env-config.js and Docker entrypoint injection.

## Map Engine Configuration (short)
- `VITE_MAP_ENGINE`: choose `'mapbox'` (default) or `'leaflet'` (dev).
- Recommended local setting: set `VITE_MAP_ENGINE=leaflet` in `.env.development` for UI testing.

## Map Adapter - High-level Rules
- Use the adapter factory from `src/utils/map` in UI components; do not import map libraries directly.
- Create adapter in `useRef` and initialize once in `useEffect`.
- Always call `adapter.remove()` in component cleanup.
- Adapter selection is controlled by `VITE_MAP_ENGINE` environment variable.

## Key Files to Respect
- .github/copilot-instructions.md
- src/config/env.js
- src/utils/apiClient.js
- public/env-config.js
- docker/40-env-config.sh
- docker/nginx.conf
- docker-compose.yml
- Dockerfile

## Deployment Compatibility (short)
- Local development reads `VITE_API_BASE_URL`.
- Docker runtime injects `API_BASE_URL` and `APP_NAME` into `public/env-config.js`.
- Nginx SPA fallback must continue working for client-side routes.

## Known Risk and Direction
- Prefer `src/utils/apiClient.js` as the single HTTP client; avoid adding new network logic elsewhere.

## Where to Find Architecture Details
For map adapter architecture, adapter methods, and engine-specific details see: [src/utils/map/MAP_ADAPTER_ARCHITECTURE.md](src/utils/map/MAP_ADAPTER_ARCHITECTURE.md)

## PR and Change Guidance
1. Keep changes minimal and scoped to user request.
2. Avoid unrelated refactors during feature implementation.
3. Validate by running the app and checking build status when relevant.
4. If introducing new environment variables, update .env.example accordingly.
5. For local map testing, prefer `.env.development` with `VITE_MAP_ENGINE=leaflet` instead of changing production defaults.
