/**
 * geofences.js
 * Minimal geofence model and helpers.
 * Includes a simple point-in-polygon utility.
 */

/**
 * @typedef {Object} Geofence
 * @property {string} id
 * @property {string} name
 * @property {Array<number[]>} polygon - array of [lng, lat]
 * @property {string} type - allow|deny
 */

const geofences = new Map();

export function createGeofence({ id, name, polygon, type = 'deny' }) {
  if (!id || !Array.isArray(polygon)) throw new Error('geofence requires id and polygon');
  const g = { id, name: name || `Geofence ${id}`, polygon, type };
  geofences.set(id, g);
  return g;
}

export function selectGeofenceById(id) {
  return geofences.get(id) || null;
}

export function listGeofences() {
  return Array.from(geofences.values());
}

/**
 * Ray-casting algorithm for point-in-polygon
 * @param {number[]} point - [lng, lat]
 * @param {Array<number[]>} vs - polygon vertices [[lng,lat], ...]
 * @returns {boolean}
 */
export function pointInPolygon(point, vs) {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0], yi = vs[i][1];
    const xj = vs[j][0], yj = vs[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export default {
  createGeofence,
  selectGeofenceById,
  listGeofences,
  pointInPolygon,
};
