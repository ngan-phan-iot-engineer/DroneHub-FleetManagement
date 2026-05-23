/**
 * telemetryService.js
 * Simple pub/sub telemetry service with mock streaming support.
 * API:
 *  - subscribe(vehicleId, handler)
 *  - unsubscribe(vehicleId, handler)
 *  - publish(frame)
 *  - startMock(intervalMs)
 *  - stopMock()
 */

const subscribers = new Map(); // vehicleId -> Set<handler>
let mockTimer = null;

export function subscribe(vehicleId, handler) {
  if (!vehicleId || typeof handler !== 'function') return () => {};
  const set = subscribers.get(vehicleId) || new Set();
  set.add(handler);
  subscribers.set(vehicleId, set);
  return () => unsubscribe(vehicleId, handler);
}

export function unsubscribe(vehicleId, handler) {
  const set = subscribers.get(vehicleId);
  if (!set) return;
  set.delete(handler);
  if (set.size === 0) subscribers.delete(vehicleId);
}

export function publish(frame) {
  if (!frame || !frame.vehicleId) return;
  const set = subscribers.get(frame.vehicleId);
  if (set) {
    set.forEach((h) => {
      try { h(frame); } catch (err) { console.warn('telemetry handler error', err); }
    });
  }
  // wildcard subscribers (vehicleId === '*')
  const all = subscribers.get('*');
  if (all) {
    all.forEach((h) => { try { h(frame); } catch (err) { console.warn('telemetry handler error', err); } });
  }
}

/**
 * Dev helper: start mock telemetry for a small fleet.
 * Emits frames to wildcard subscribers ('*') and per-vehicle subscribers.
 */
export function startMock({ vehicleIds = ['v1', 'v2'], intervalMs = 500 } = {}) {
  stopMock();
  let t = 0;
  mockTimer = setInterval(() => {
    t += intervalMs;
    const now = Date.now();
    vehicleIds.forEach((id, i) => {
      const speed = Math.abs(Math.sin(now / 5000 + i) * 15);
      const frame = {
        vehicleId: id,
        ts: now,
        droneCode: `DRONE-${id.toUpperCase()}`,
        coord: [100 + i * 0.001 + Math.sin(now / 10000 + i) * 0.0005, 13.0 + i * 0.001 + Math.cos(now / 10000 + i) * 0.0005],
        altitudeMeters: 50 + Math.abs(Math.sin(now / 8000 + i) * 30),
        speedMetersPerSecond: speed,
        batteryPercent: Math.max(10, 100 - (t / 60000) % 90),
        signalStrengthPercent: Math.max(40, 100 - Math.abs(Math.sin(now / 3000 + i) * 30)),
        headingDegrees: (now / 100 + i * 120) % 360,
        gpsAccuracyMeters: 2 + Math.abs(Math.sin(now / 4000 + i) * 3),
        recordingVideo: i % 2 === 0,
        meta: { speed },
      };
      publish(frame);
    });
  }, intervalMs);
}

export function stopMock() {
  if (mockTimer) {
    clearInterval(mockTimer);
    mockTimer = null;
  }
}

export default {
  subscribe,
  unsubscribe,
  publish,
  startMock,
  stopMock,
};
