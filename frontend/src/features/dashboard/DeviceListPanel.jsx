import { useState, useMemo } from 'react';
import '../dashboard/DeviceListPanel.css';

/**
 * DeviceListPanel
 * Display list of aircraft and dock devices.
 * Click device to focus on map; map selection updates panel.
 * Supports filtering by status.
 */

export default function DeviceListPanel({ 
  devices = [], 
  selectedDeviceId = '', 
  onSelectDevice,
  controllerRef 
}) {
  const [filterStatus, setFilterStatus] = useState('all'); // all|idle|in_flight|offline|dock

  const filteredDevices = useMemo(() => {
    if (filterStatus === 'all') return devices;
    return devices.filter((d) => {
      const status = String(d.status || 'idle').toLowerCase();
      return status.includes(filterStatus);
    });
  }, [devices, filterStatus]);

  const handleSelectDevice = (deviceId) => {
    if (onSelectDevice) onSelectDevice(deviceId);
    // Optional: auto-focus on map via controller if needed
    if (controllerRef?.current) {
      const device = devices.find((d) => d.id === deviceId);
      if (device && device.geometry?.coordinates) {
        // Controller can be extended with focusCoordinate or similar
      }
    }
  };

  const getDeviceStatus = (device) => {
    const status = String(device.status || 'idle').toLowerCase();
    if (status.includes('flight')) return 'in_flight';
    if (status.includes('offline')) return 'offline';
    if (status.includes('dock')) return 'dock';
    return 'idle';
  };

  const getStatusLabel = (status) => {
    const map = {
      in_flight: 'Flying',
      idle: 'Idle',
      offline: 'Offline',
      dock: 'Docked',
    };
    return map[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    return `device-status-badge device-status-${status}`;
  };

  return (
    <div className="device-list-panel">
      <header className="device-list-header">
        <h3>Devices</h3>
        <span className="device-list-count">{filteredDevices.length}</span>
      </header>

      <div className="device-list-filter">
        <button
          className={`device-filter-btn ${filterStatus === 'all' ? 'is-active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All
        </button>
        <button
          className={`device-filter-btn ${filterStatus === 'in_flight' ? 'is-active' : ''}`}
          onClick={() => setFilterStatus('in_flight')}
        >
          Flying
        </button>
        <button
          className={`device-filter-btn ${filterStatus === 'offline' ? 'is-active' : ''}`}
          onClick={() => setFilterStatus('offline')}
        >
          Offline
        </button>
      </div>

      {filteredDevices.length === 0 ? (
        <p className="device-list-empty">No devices found.</p>
      ) : (
        <ul className="device-list-items">
          {filteredDevices.map((device) => {
            const status = getDeviceStatus(device);
            const isSelected = device.id === selectedDeviceId;
            const battery = Math.round(device.batteryPercent || 0);
            return (
              <li
                key={device.id}
                className={`device-list-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelectDevice(device.id)}
              >
                <div className="device-list-item-header">
                  <span className="device-name">{device.label || device.id}</span>
                  <span className={getStatusBadgeClass(status)}>
                    {getStatusLabel(status)}
                  </span>
                </div>
                <div className="device-list-item-meta">
                  <span className="device-battery">🔋 {battery}%</span>
                  <span className="device-type">{device.type || 'Unknown'}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
