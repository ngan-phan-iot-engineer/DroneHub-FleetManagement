/**
 * docks.js
 * Minimal dock entity model for Phase 1.
 */

/**
 * @typedef {Object} Dock
 * @property {string} id
 * @property {number[]} coord - [lng, lat]
 * @property {string} label
 */

const docks = new Map();

export function createDock({ id, coord, label }) {
  if (!id || !Array.isArray(coord)) throw new Error('dock requires id and coord');
  const d = { id, coord, label: label || `Dock ${id}` };
  docks.set(id, d);
  return d;
}

export function selectDockById(id) {
  return docks.get(id) || null;
}

export function listDocks() {
  return Array.from(docks.values());
}

export default {
  createDock,
  selectDockById,
  listDocks,
};
