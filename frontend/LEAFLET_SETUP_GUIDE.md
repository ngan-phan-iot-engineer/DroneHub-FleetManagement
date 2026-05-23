# Leaflet Setup & Troubleshooting Guide

This file is the concise onboarding + troubleshooting checklist for using the Leaflet adapter in development. For full architecture and adapter interface details, see [src/utils/map/MAP_ADAPTER_ARCHITECTURE.md](src/utils/map/MAP_ADAPTER_ARCHITECTURE.md).

## Quick Setup (copy/paste)

1. Install dependencies:

```bash
npm install
```

2. Ensure `.env.development` contains:

```
VITE_MAP_ENGINE=leaflet
```

3. Verify CSS import exists in `src/utils/map/LeafletAdapter.js`:

```javascript
import "leaflet/dist/leaflet.css";
```

4. Start dev server:

```bash
npm run dev
```

5. Open: `http://localhost:5173/app/dashboard` → Click "Quản lý bản đồ" and verify the map renders.

## Common Issues & Minimal Fixes

- Blank/white map panel
  - Check `import "leaflet/dist/leaflet.css"` in `LeafletAdapter.js`.
  - Verify `.map-management-map-shell` has width/height > 0.

- Zoom controls missing
  - Usually a missing CSS import. Hard refresh and check Network tab for `leaflet.css`.

- Map tiles not loading
  - Check Console for initialization errors.
  - Ensure adapter init received a valid container reference.

## Checklist

- [ ] `import "leaflet/dist/leaflet.css"` present
- [ ] `.env.development` has `VITE_MAP_ENGINE=leaflet`
- [ ] `npm install` completed
- [ ] `npm run dev` starts without adapter errors

## References

- Adapter architecture: `src/utils/map/MAP_ADAPTER_ARCHITECTURE.md`
- LeafletAdapter implementation: `src/utils/map/LeafletAdapter.js`
