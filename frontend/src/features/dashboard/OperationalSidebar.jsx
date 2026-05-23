import { useState, useEffect } from 'react';
import MissionEditor from '../mission/MissionEditor';
import DeviceListPanel from './DeviceListPanel';
import RestrictedZonePanel from './RestrictedZonePanel';
import telemetryService from '../../services/telemetryService';
import vehiclesDomain from '../../domain/vehicles';
import './OperationalSidebar.css';

/**
 * OperationalSidebar
 * Contains mission editor, device list, and restricted zones management.
 * Integrated with MapLayerController for real-time map updates.
 */

export default function OperationalSidebar({ 
  controllerRef,
  selectedDeviceId = '',
  onSelectDevice,
  mapViewerRef 
}) {
  const [activeTab, setActiveTab] = useState('mission'); // mission|devices|zones
  const [waypoints, setWaypoints] = useState([]);
  const [devices, setDevices] = useState([]);
  const [restrictedZones, setRestrictedZones] = useState([]);

  // Initialize mock devices (can wire to telemetry later)
  const initializeDevices = () => {
    const mockDevices = [
      { id: 'v1', label: 'Phantom 4', type: 'Quadcopter', status: 'idle', batteryPercent: 85, geometry: { coordinates: [106.47, 10.62] } },
      { id: 'v2', label: 'Mavic 3', type: 'Foldable', status: 'in_flight', batteryPercent: 72, geometry: { coordinates: [106.48, 10.63] } },
      { id: 'dock1', label: 'Dock A', type: 'Dock', status: 'dock', batteryPercent: 100, geometry: { coordinates: [106.46, 10.61] } },
    ];
    setDevices(mockDevices);
  };

  useEffect(() => {
    initializeDevices();
  }, []);

  const handleWaypointsChange = (nextWaypoints) => {
    setWaypoints(nextWaypoints);
  };

  const handleRestrictedZonesChange = (nextZones) => {
    setRestrictedZones(nextZones);
  };

  return (
    <div className="operational-sidebar">
      <div className="operational-tabs">
        <button
          className={`operational-tab ${activeTab === 'mission' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('mission')}
        >
          Mission
        </button>
        <button
          className={`operational-tab ${activeTab === 'devices' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Devices
        </button>
        <button
          className={`operational-tab ${activeTab === 'zones' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('zones')}
        >
          Zones
        </button>
      </div>

      <div className="operational-content">
        {activeTab === 'mission' && (
          <MissionEditor
            onWaypointsChange={handleWaypointsChange}
            controllerRef={controllerRef}
          />
        )}

        {activeTab === 'devices' && (
          <DeviceListPanel
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onSelectDevice={onSelectDevice}
            controllerRef={controllerRef}
          />
        )}

        {activeTab === 'zones' && (
          <RestrictedZonePanel
            zones={restrictedZones}
            onZonesChange={handleRestrictedZonesChange}
            controllerRef={controllerRef}
          />
        )}
      </div>
    </div>
  );
}
