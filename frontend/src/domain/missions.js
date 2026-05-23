/**
 * missions.js
 * Minimal Mission domain model for Phase 1.
 *
 * Responsibilities:
 * - mission entity schema
 * - basic CRUD-ish helpers and selectors
 * - minimal validation helper
 */

/**
 * @typedef {Object} Waypoint
 * @property {number[]} coord - [lng, lat]
 * @property {number} altitude - meters
 */

/**
 * @typedef {Object} Mission
 * @property {string} id
 * @property {string} name
 * @property {string} status - planned|assigned|active|completed|aborted
 * @property {Array<Waypoint>} waypoints
 * @property {Object} meta
 */

const missions = new Map();

export function createMission(payload) {
  if (!payload || !payload.id) throw new Error('mission requires id');
  const base = {
    id: payload.id,
    name: payload.name || `Mission ${payload.id}`,
    status: payload.status || 'planned',
    waypoints: Array.isArray(payload.waypoints) ? payload.waypoints : [],
    meta: payload.meta || {},
  };
  missions.set(base.id, base);
  return base;
}

export function updateMission(id, patch) {
  const m = missions.get(id);
  if (!m) return null;
  const next = { ...m, ...patch };
  missions.set(id, next);
  return next;
}

export function selectMissionById(id) {
  return missions.get(id) || null;
}

export function listMissions() {
  return Array.from(missions.values());
}

/**
 * Basic validation: ensure waypoints are proper coordinate arrays
 * @param {Mission} mission
 * @returns {boolean}
 */
export function validateMission(mission) {
  if (!mission || !Array.isArray(mission.waypoints)) return false;
  return mission.waypoints.every((wp) => Array.isArray(wp.coord) && wp.coord.length >= 2);
}

export default {
  createMission,
  updateMission,
  selectMissionById,
  listMissions,
  validateMission,
};
