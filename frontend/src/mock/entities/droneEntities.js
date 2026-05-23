/**
 * Drone Entities - Active Fleet State
 * Represents live drone positions with telemetry state.
 * Updated by telemetry simulator to simulate real-time operations.
 */

const createPoint = (coordinates) => ({
  type: "Point",
  coordinates,
});

export const DRONE_ACTIVE_FLEET = [
  {
    id: "drone-mdvs20-020",
    droneCode: "MDVS20-020",
    droneModel: "MDVS20",
    displayName: "MDVS20-020 - Tổ 1",
    pilotName: "Trần Văn Giàu",
    teamName: "Đội A 101",
    missionId: "mission-ben-luc-01",
    missionStatus: "flying",
    regionName: "Đội A 101",
    address: "Bến Lức, Long An",
    statusKey: "ACTIVE",
    // Telemetry
    batteryPercent: 78,
    batteryVoltage: 22.4,
    altitudeMeters: 28,
    altitudeMaxMeters: 35,
    speedMetersPerSecond: 10.2,
    headingDegrees: 132,
    signalStrengthPercent: 91,
    gpsAccuracyMeters: 1.2,
    gimbalPitch: -45,
    recordingVideo: true,
    // Dynamic position (updated by simulator)
    geometry: createPoint([106.4738, 10.6267]),
    lastUpdated: "2026-05-11T12:00:00.000Z",
  },
  {
    id: "drone-agr-x7-011",
    droneCode: "AGR-X7-011",
    droneModel: "AGR-X7",
    displayName: "AGR-X7-011 - Tổ 2",
    pilotName: "Lê Ngọc Vũ",
    teamName: "Đội B 202",
    missionId: "mission-duc-hoa-01",
    missionStatus: "flying",
    regionName: "Đội B 202",
    address: "Đức Hòa, Long An",
    statusKey: "ACTIVE",
    // Telemetry
    batteryPercent: 65,
    batteryVoltage: 21.8,
    altitudeMeters: 42,
    altitudeMaxMeters: 50,
    speedMetersPerSecond: 12.5,
    headingDegrees: 45,
    signalStrengthPercent: 87,
    gpsAccuracyMeters: 0.8,
    gimbalPitch: -30,
    recordingVideo: true,
    // Dynamic position (updated by simulator)
    geometry: createPoint([106.3805, 10.8882]),
    lastUpdated: "2026-05-11T12:00:00.000Z",
  },
  {
    id: "drone-agr-x5-008",
    droneCode: "AGR-X5-008",
    droneModel: "AGR-X5",
    displayName: "AGR-X5-008 - Tổ 3",
    pilotName: "Nguyễn Thành Nam",
    teamName: "Đội C 303",
    missionId: "mission-dong-thap-01",
    missionStatus: "flying",
    regionName: "Đội C 303",
    address: "Cao Lãnh, Đồng Tháp",
    statusKey: "ACTIVE",
    // Telemetry
    batteryPercent: 52,
    batteryVoltage: 20.9,
    altitudeMeters: 55,
    altitudeMaxMeters: 60,
    speedMetersPerSecond: 8.7,
    headingDegrees: 270,
    signalStrengthPercent: 79,
    gpsAccuracyMeters: 1.5,
    gimbalPitch: -60,
    recordingVideo: false,
    // Dynamic position (updated by simulator)
    geometry: createPoint([105.6400, 10.4606]),
    lastUpdated: "2026-05-11T12:00:00.000Z",
  },
];

/**
 * Mission assignments for drones
 * Defines flight paths and operational parameters
 */
export const DRONE_MISSION_ASSIGNMENTS = [
  {
    missionId: "mission-ben-luc-01",
    droneCode: "MDVS20-020",
    missionName: "Phun thuốc Bến Lức 01",
    waypoints: [
      [106.4684, 10.6247],
      [106.4708, 10.6254],
      [106.4732, 10.6263],
      [106.4755, 10.6271],
      [106.4774, 10.6278],
    ],
    currentWaypointIndex: 2,
    estimatedCompletionMinutes: 12,
  },
  {
    missionId: "mission-duc-hoa-01",
    droneCode: "AGR-X7-011",
    missionName: "Giám sát Đức Hòa 01",
    waypoints: [
      [106.3768, 10.8856],
      [106.3810, 10.8875],
      [106.3850, 10.8890],
    ],
    currentWaypointIndex: 1,
    estimatedCompletionMinutes: 8,
  },
  {
    missionId: "mission-dong-thap-01",
    droneCode: "AGR-X5-008",
    missionName: "Rải hạt Đồng Tháp 01",
    waypoints: [
      [105.6371, 10.4593],
      [105.6400, 10.4606],
      [105.6435, 10.4620],
      [105.6466, 10.4634],
    ],
    currentWaypointIndex: 1,
    estimatedCompletionMinutes: 15,
  },
];

export const DRONE_OPERATION_PRESETS = {
  // Heading rotation rates (degrees/sec) - for realistic motion
  headingRotationRates: {
    slow: 5,
    normal: 10,
    fast: 20,
  },
  // Speed variations (m/s)
  speedVariations: {
    min: 0.5,
    max: 18,
  },
  // Battery drain per second (percent)
  batteryDrainRate: 0.15,
  // Altitude jitter (meters) for realism
  altitudeJitterMax: 2,
  // Signal degradation zones (if any)
  signalInterferenceZones: [],
};
