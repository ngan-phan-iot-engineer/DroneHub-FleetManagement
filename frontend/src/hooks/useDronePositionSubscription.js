/**
 * useDronePositionSubscription - React Hook for Live Drone Telemetry
 * 
 * Subscribes to drone position updates from simulator.
 * Automatically starts/stops simulation on mount/unmount.
 * 
 * Usage:
 *   const { drones, isActive } = useDronePositionSubscription();
 */

import { useEffect, useState, useRef } from "react";
import { getDroneSimulator } from "../mock/telemetry/dronePositionSimulator";

export function useDronePositionSubscription() {
  const [drones, setDrones] = useState([]);
  const [isActive, setIsActive] = useState(false);
  const simulatorRef = useRef(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    simulatorRef.current = getDroneSimulator();

    // Subscribe to telemetry updates
    unsubscribeRef.current = simulatorRef.current.subscribe((update) => {
      setDrones(update.drones);
    });

    // Start simulation if not already running
    if (!simulatorRef.current.isRunning) {
      simulatorRef.current.start(1000); // Update every 1 second
      setIsActive(true);
    } else {
      setIsActive(true);
    }

    // Initial update
    const initialDrones = simulatorRef.current.getAllDrones();
    setDrones(initialDrones);

    return () => {
      // Clean up subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      // Note: Don't stop simulator here - let it persist across component mounts
      // Only stop in specific cleanup or on app unmount
    };
  }, []);

  return {
    drones,
    isActive,
    simulator: simulatorRef.current,
  };
}

/**
 * useDroneById - Get specific drone by ID with live updates
 */
export function useDroneById(droneId) {
  const { drones } = useDronePositionSubscription();
  const drone = drones.find((d) => d.id === droneId);
  return drone || null;
}

/**
 * useDroneByCode - Get specific drone by code with live updates
 */
export function useDroneByCode(droneCode) {
  const { drones } = useDronePositionSubscription();
  const drone = drones.find((d) => d.droneCode === droneCode);
  return drone || null;
}
