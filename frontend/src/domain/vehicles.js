/**
 * vehicles.js
 * Domain model and helpers for Vehicle entities.
 *
 * English JSDoc comments only. Keep API minimal for Phase 1.
 */

/**
 * @typedef {Object} Vehicle
 * @property {string} id - Unique vehicle identifier
 * @property {string} label - Human-friendly name
 * @property {string} type - Vehicle type/model
 * @property {string} status - Current status (idle|assigned|in_flight|returning|charging)
 * @property {Object} meta - Additional metadata (battery, heading, speed)
 */

const vehicles = new Map();

/**
 * Create or upsert a vehicle entity
 * @param {Partial<Vehicle>} data
 * @returns {Vehicle}
 */
export function upsertVehicle(data) {
  if (!data || !data.id) throw new Error('vehicle requires id');
  const existing = vehicles.get(data.id) || {};
  const next = {
    id: data.id,
    label: data.label || existing.label || `Vehicle ${data.id}`,
    type: data.type || existing.type || 'generic',
    status: data.status || existing.status || 'idle',
    meta: { ...(existing.meta || {}), ...(data.meta || {}) },
  };
  vehicles.set(next.id, next);
  return next;
}

/**
 * Update status for a vehicle
 * @param {string} id
 * @param {string} status
 * @returns {Vehicle|null}
 */
export function updateVehicleStatus(id, status) {
  const v = vehicles.get(id);
  if (!v) return null;
  const next = { ...v, status };
  vehicles.set(id, next);
  return next;
}

/**
 * Select vehicle by id
 * @param {string} id
 * @returns {Vehicle|null}
 */
export function selectVehicleById(id) {
  return vehicles.get(id) || null;
}

/**
 * List all vehicles
 * @returns {Vehicle[]}
 */
export function listVehicles() {
  return Array.from(vehicles.values());
}

export default {
  upsertVehicle,
  updateVehicleStatus,
  selectVehicleById,
  listVehicles,
};
