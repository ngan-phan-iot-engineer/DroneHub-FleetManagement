/**
 * TelemetryPanel - Real-time Drone Telemetry Display
 * 
 * Shows live telemetry data for selected drone:
 * - Battery, Signal, Altitude, Speed, Heading
 * - Mission status and waypoint progress
 * - Pilot info and team assignment
 */

import { useMemo } from "react";
import "./TelemetryPanel.css";

const formatValue = (value, unit, precision = 1) => {
  if (value === null || value === undefined) return "—";
  return `${typeof value === "number" ? value.toFixed(precision) : value}${unit}`;
};

const getBatteryStatus = (batteryPercent) => {
  if (batteryPercent >= 75) return "excellent";
  if (batteryPercent >= 50) return "good";
  if (batteryPercent >= 25) return "warning";
  return "critical";
};

const getSignalStatus = (signal) => {
  if (signal >= 80) return "excellent";
  if (signal >= 60) return "good";
  if (signal >= 40) return "warning";
  return "critical";
};

export function TelemetryPanel({ drone, mission }) {
  const batteryStatus = useMemo(() => getBatteryStatus(drone?.batteryPercent || 0), [drone?.batteryPercent]);
  const signalStatus = useMemo(() => getSignalStatus(drone?.signalStrengthPercent || 0), [drone?.signalStrengthPercent]);

  if (!drone) {
    return (
      <div className="telemetry-panel telemetry-panel--empty">
        <div className="telemetry-panel-content">
          <p className="telemetry-panel-empty-text">Chọn drone để xem telemetry</p>
        </div>
      </div>
    );
  }

  const waypointProgress = mission
    ? `${mission.currentWaypointIndex + 1} / ${mission.waypoints.length}`
    : "—";

  return (
    <div className="telemetry-panel">
      <div className="telemetry-panel-content">
        {/* Header: Drone Info */}
        <div className="telemetry-header">
          <h3 className="telemetry-drone-code">{drone.droneCode}</h3>
          <div className="telemetry-pilot-team">
            <span className="telemetry-label">Phi công:</span>
            <span className="telemetry-value">{drone.pilotName}</span>
          </div>
          <div className="telemetry-pilot-team">
            <span className="telemetry-label">Đội:</span>
            <span className="telemetry-value">{drone.teamName}</span>
          </div>
          <div className="telemetry-status-badge">
            <span className={`badge-pill badge-${drone.missionStatus}`}>{drone.missionStatus.toUpperCase()}</span>
          </div>
        </div>

        {/* Mission Status */}
        {mission && (
          <div className="telemetry-section telemetry-mission">
            <div className="telemetry-section-title">Nhiệm vụ</div>
            <div className="telemetry-field">
              <span className="telemetry-label">Tên:</span>
              <span className="telemetry-value">{mission.missionName}</span>
            </div>
            <div className="telemetry-field">
              <span className="telemetry-label">Waypoint:</span>
              <span className="telemetry-value">{waypointProgress}</span>
            </div>
            <div className="telemetry-field">
              <span className="telemetry-label">Hoàn thành dự kiến:</span>
              <span className="telemetry-value">{mission.estimatedCompletionMinutes}m</span>
            </div>
          </div>
        )}

        {/* Critical Telemetry */}
        <div className="telemetry-section telemetry-critical">
          <div className="telemetry-section-title">Tình trạng</div>

          <div className={`telemetry-metric telemetry-metric--${batteryStatus}`}>
            <div className="metric-label">Pin</div>
            <div className="metric-value">{formatValue(drone.batteryPercent, "%", 0)}</div>
            <div className="metric-bar">
              <div className={`metric-bar-fill metric-bar-${batteryStatus}`} style={{ width: `${drone.batteryPercent}%` }} />
            </div>
          </div>

          <div className={`telemetry-metric telemetry-metric--${signalStatus}`}>
            <div className="metric-label">Tín hiệu</div>
            <div className="metric-value">{formatValue(drone.signalStrengthPercent, "%", 0)}</div>
            <div className="metric-bar">
              <div className={`metric-bar-fill metric-bar-${signalStatus}`} style={{ width: `${drone.signalStrengthPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Flight Telemetry */}
        <div className="telemetry-section telemetry-flight">
          <div className="telemetry-section-title">Hành trình</div>

          <div className="telemetry-grid">
            <div className="telemetry-field">
              <span className="telemetry-label">Độ cao</span>
              <span className="telemetry-value">{formatValue(drone.altitudeMeters, "m", 1)}</span>
            </div>
            <div className="telemetry-field">
              <span className="telemetry-label">Vận tốc</span>
              <span className="telemetry-value">{formatValue(drone.speedMetersPerSecond, "m/s", 1)}</span>
            </div>
            <div className="telemetry-field">
              <span className="telemetry-label">Hướng</span>
              <span className="telemetry-value">{formatValue(drone.headingDegrees, "°", 0)}</span>
            </div>
            <div className="telemetry-field">
              <span className="telemetry-label">GPS</span>
              <span className="telemetry-value">±{formatValue(drone.gpsAccuracyMeters, "m", 1)}</span>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="telemetry-section telemetry-additional">
          <div className="telemetry-grid">
            <div className="telemetry-field">
              <span className="telemetry-label">Gimbal</span>
              <span className="telemetry-value">{formatValue(drone.gimbalPitch, "°", 0)}</span>
            </div>
            <div className="telemetry-field">
              <span className="telemetry-label">Video</span>
              <span className={`telemetry-value ${drone.recordingVideo ? "recording" : ""}`}>
                {drone.recordingVideo ? "REC" : "OFF"}
              </span>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="telemetry-footer">
          <small>{new Date(drone.lastUpdated).toLocaleTimeString("vi-VN")}</small>
        </div>
      </div>
    </div>
  );
}

export default TelemetryPanel;
