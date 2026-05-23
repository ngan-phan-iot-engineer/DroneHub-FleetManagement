/**
 * Drone Position Simulator - Mock Telemetry Stream
 * 
 * Simulates real-time drone telemetry updates without actual WebSocket.
 * Used for frontend development when backend is not ready.
 * 
 * Design:
 * - Updates drone position every 1-2 seconds
 * - Simulates realistic motion along waypoint paths
 * - Battery drain, heading changes, altitude jitter
 * - Subscribers pattern for reactive updates
 */

import { DRONE_ACTIVE_FLEET, DRONE_MISSION_ASSIGNMENTS, DRONE_OPERATION_PRESETS } from "../entities/droneEntities";

class DronePositionSimulator {
  constructor() {
    this.drones = JSON.parse(JSON.stringify(DRONE_ACTIVE_FLEET)); // Deep clone
    this.missions = DRONE_MISSION_ASSIGNMENTS;
    this.subscribers = new Set();
    this.isRunning = false;
    this.simulationIntervalId = null;
    this.droneStates = new Map(); // Track per-drone state

    // Initialize per-drone state
    this.drones.forEach((drone) => {
      const mission = this.missions.find((m) => m.droneCode === drone.droneCode);
      this.droneStates.set(drone.id, {
        waypointIndex: mission?.currentWaypointIndex || 0,
        segmentProgress: 0,
        targetHeading: mission?.waypoints?.[mission.currentWaypointIndex + 1]
          ? this.calculateHeading(mission.waypoints[mission.currentWaypointIndex], mission.waypoints[mission.currentWaypointIndex + 1])
          : drone.headingDegrees,
        speed: drone.speedMetersPerSecond,
        batteryDecayRate: DRONE_OPERATION_PRESETS.batteryDrainRate,
      });
    });
  }

  calculateHeading(from, to) {
    const [lng1, lat1] = from;
    const [lng2, lat2] = to;
    const dLng = lng2 - lng1;
    const dLat = lat2 - lat1;
    let heading = Math.atan2(dLng, dLat) * (180 / Math.PI);
    if (heading < 0) heading += 360;
    return heading;
  }

  calculateDistance(from, to) {
    const [lng1, lat1] = from;
    const [lng2, lat2] = to;
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  moveAlongPath(drone, mission, deltaSeconds) {
    if (!mission) return;

    const state = this.droneStates.get(drone.id);
    const waypoints = mission.waypoints;
    const currentWaypoint = waypoints[state.waypointIndex];
    const nextWaypoint = waypoints[state.waypointIndex + 1];

    if (!currentWaypoint || !nextWaypoint) {
      // Mission complete or invalid
      return;
    }

    // Move towards next waypoint
    const distance = this.calculateDistance(currentWaypoint, nextWaypoint);
    if (distance <= 0) {
      state.waypointIndex = Math.min(state.waypointIndex + 1, waypoints.length - 1);
      state.segmentProgress = 0;
      return;
    }

    const progressStep = (state.speed * deltaSeconds) / distance;
    state.segmentProgress += progressStep;

    while (state.segmentProgress >= 1 && state.waypointIndex < waypoints.length - 1) {
      state.segmentProgress -= 1;
      state.waypointIndex += 1;

      if (state.waypointIndex >= waypoints.length - 1) {
        drone.geometry.coordinates = [...waypoints[waypoints.length - 1]];
        drone.missionStatus = "idle";
        drone.speedMetersPerSecond = 0;
        drone.altitudeMeters = Math.max(0, drone.altitudeMeters - 8);
        drone.lastUpdated = new Date().toISOString();
        return;
      }

      state.targetHeading = this.calculateHeading(
        waypoints[state.waypointIndex],
        waypoints[state.waypointIndex + 1]
      );
    }

    const segmentStart = waypoints[state.waypointIndex];
    const segmentEnd = waypoints[state.waypointIndex + 1] || segmentStart;
    const [lng1, lat1] = segmentStart;
    const [lng2, lat2] = segmentEnd;
    const newLng = lng1 + (lng2 - lng1) * state.segmentProgress;
    const newLat = lat1 + (lat2 - lat1) * state.segmentProgress;

    drone.geometry.coordinates = [newLng, newLat];
    drone.lastUpdated = new Date().toISOString();
  }

  updateHeading(drone, deltaSeconds) {
    const state = this.droneStates.get(drone.id);
    const headingDiff = state.targetHeading - drone.headingDegrees;

    // Smooth heading transition (max 20 deg/sec)
    const rotationRate = Math.min(
      Math.abs(headingDiff) / deltaSeconds,
      DRONE_OPERATION_PRESETS.headingRotationRates.normal
    );

    if (Math.abs(headingDiff) > 0.1) {
      const direction = headingDiff > 0 ? 1 : -1;
      drone.headingDegrees += direction * rotationRate * deltaSeconds;
      drone.headingDegrees = (drone.headingDegrees + 360) % 360;
    }
  }

  updateTelemetry(drone, deltaSeconds) {
    // Battery drain
    drone.batteryPercent = Math.max(
      0,
      drone.batteryPercent - (DRONE_OPERATION_PRESETS.batteryDrainRate * deltaSeconds)
    );
    drone.batteryVoltage = 22.4 * (drone.batteryPercent / 100);

    // Altitude jitter
    const jitter = (Math.random() - 0.5) * 2 * DRONE_OPERATION_PRESETS.altitudeJitterMax;
    drone.altitudeMeters = Math.max(5, drone.altitudeMeters + jitter);

    // Speed variation
    const state = this.droneStates.get(drone.id);
    const speedJitter = (Math.random() - 0.5) * 2;
    state.speed = Math.max(
      DRONE_OPERATION_PRESETS.speedVariations.min,
      Math.min(DRONE_OPERATION_PRESETS.speedVariations.max, state.speed + speedJitter)
    );
    drone.speedMetersPerSecond = state.speed;

    // Signal strength variation
    drone.signalStrengthPercent = Math.max(
      40,
      Math.min(100, drone.signalStrengthPercent + (Math.random() - 0.5) * 10)
    );

    // Mission status check
    if (drone.batteryPercent < 15) {
      drone.missionStatus = "rtl"; // Return to Land
    } else if (drone.batteryPercent < 5) {
      drone.missionStatus = "landing";
    }
  }

  tick(deltaSeconds = 1) {
    this.drones.forEach((drone) => {
      const mission = this.missions.find((m) => m.droneCode === drone.droneCode);

      if (drone.missionStatus === "flying") {
        this.moveAlongPath(drone, mission, deltaSeconds);
        this.updateHeading(drone, deltaSeconds);
      }

      this.updateTelemetry(drone, deltaSeconds);
    });

    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach((callback) => {
      try {
        callback({
          drones: this.drones,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Error in telemetry subscriber:", error);
      }
    });
  }

  start(updateIntervalMs = 1000) {
    if (this.isRunning) return;

    this.isRunning = true;
    const lastTickTime = { value: Date.now() };

    this.simulationIntervalId = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = (now - lastTickTime.value) / 1000;
      lastTickTime.value = now;

      this.tick(deltaSeconds);
    }, updateIntervalMs);
  }

  stop() {
    if (this.simulationIntervalId) {
      clearInterval(this.simulationIntervalId);
      this.simulationIntervalId = null;
    }
    this.isRunning = false;
  }

  getDroneById(droneId) {
    return this.drones.find((d) => d.id === droneId);
  }

  getAllDrones() {
    return JSON.parse(JSON.stringify(this.drones)); // Return deep copy
  }
}

// Singleton instance
let simulatorInstance = null;

export function getDroneSimulator() {
  if (!simulatorInstance) {
    simulatorInstance = new DronePositionSimulator();
  }
  return simulatorInstance;
}

export function resetDroneSimulator() {
  if (simulatorInstance) {
    simulatorInstance.stop();
  }
  simulatorInstance = new DronePositionSimulator();
  return simulatorInstance;
}
