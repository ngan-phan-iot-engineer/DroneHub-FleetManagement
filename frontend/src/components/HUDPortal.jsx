import { createPortal } from "react-dom";

// HUDPortal portals children into a feature-scoped host owned by MapViewer.
// The host must live inside the dashboard map shell so the HUD stays local to
// the realtime map screen while still escaping the map engine stacking context.
export default function HUDPortal({ children, host }) {
  if (!host) return null;

  return createPortal(children, host);
}
