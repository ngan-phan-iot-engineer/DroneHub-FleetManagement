/**
 * telemetry.js
 * Minimal telemetry ring buffer, interpolation and helpers.
 * Designed to be pure and small for Phase 1.
 */

/**
 * @typedef {Object} TelemetryFrame
 * @property {string} vehicleId
 * @property {number} ts - epoch ms
 * @property {number[]} coord - [lng, lat]
 * @property {number} [altitude]
 * @property {Object} [meta]
 */

const buffers = new Map();
const DEFAULT_CAPACITY = 64;

function ensureBuffer(vehicleId, capacity = DEFAULT_CAPACITY) {
  if (!buffers.has(vehicleId)) buffers.set(vehicleId, []);
  return buffers.get(vehicleId);
}

/**
 * Push a telemetry frame into per-vehicle ring buffer.
 * @param {TelemetryFrame} frame
 */
export function pushFrame(frame) {
  if (!frame || !frame.vehicleId) return;
  const buf = ensureBuffer(frame.vehicleId);
  buf.push(frame);
  // keep sorted by ts and cap size
  buf.sort((a, b) => a.ts - b.ts);
  if (buf.length > DEFAULT_CAPACITY) buf.splice(0, buf.length - DEFAULT_CAPACITY);
}

/**
 * Get last N frames for vehicle
 * @param {string} vehicleId
 * @param {number} n
 */
export function getLastFrames(vehicleId, n = 10) {
  const buf = buffers.get(vehicleId) || [];
  return buf.slice(-n);
}

/**
 * Linear interpolate position for a vehicle at timestamp ts.
 * Returns null if no data available.
 * @param {string} vehicleId
 * @param {number} ts
 */
export function interpolatePosition(vehicleId, ts) {
  const buf = buffers.get(vehicleId);
  if (!buf || buf.length === 0) return null;
  // If before first or after last, return closest
  if (ts <= buf[0].ts) return buf[0];
  if (ts >= buf[buf.length - 1].ts) return buf[buf.length - 1];

  // find surrounding frames
  let left = null;
  let right = null;
  for (let i = 0; i < buf.length - 1; i++) {
    if (buf[i].ts <= ts && buf[i + 1].ts >= ts) {
      left = buf[i];
      right = buf[i + 1];
      break;
    }
  }
  if (!left || !right) return null;
  const t = (ts - left.ts) / (right.ts - left.ts || 1);
  const lng = left.coord[0] + (right.coord[0] - left.coord[0]) * t;
  const lat = left.coord[1] + (right.coord[1] - left.coord[1]) * t;
  return { vehicleId, ts, coord: [lng, lat], altitude: (left.altitude + right.altitude) / 2, meta: right.meta };
}

/**
 * Clear buffer for a vehicle (testing helper)
 * @param {string} vehicleId
 */
export function clearBuffer(vehicleId) {
  buffers.delete(vehicleId);
}

export default {
  pushFrame,
  getLastFrames,
  interpolatePosition,
  clearBuffer,
};
