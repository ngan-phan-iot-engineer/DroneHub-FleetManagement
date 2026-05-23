import { useState } from 'react';
import '../dashboard/RestrictedZonePanel.css';

/**
 * RestrictedZonePanel
 * Manage restricted (no-fly) zones.
 * Create, edit, enable/disable, delete zones.
 */

export default function RestrictedZonePanel({ 
  zones = [], 
  onZonesChange,
  controllerRef 
}) {
  const [editingId, setEditingId] = useState('');
  const [newZoneName, setNewZoneName] = useState('');

  const addZone = () => {
    if (!newZoneName.trim()) return;
    const zone = {
      id: `zone-${Date.now()}`,
      name: newZoneName,
      enabled: true,
      polygon: [], // user would draw on map
      created: new Date().toISOString(),
    };
    const nextZones = [...zones, zone];
    setZones(nextZones);
    setNewZoneName('');
  };

  const setZones = (nextZones) => {
    if (onZonesChange) onZonesChange(nextZones);
    updateZonesOnMap(nextZones);
  };

  const removeZone = (id) => {
    const nextZones = zones.filter((z) => z.id !== id);
    setZones(nextZones);
  };

  const toggleZoneEnabled = (id) => {
    const nextZones = zones.map((z) => 
      z.id === id ? { ...z, enabled: !z.enabled } : z
    );
    setZones(nextZones);
  };

  const updateZonesOnMap = (zonesList) => {
    if (!controllerRef?.current) return;
    const controller = controllerRef.current;
    const features = zonesList
      .filter((z) => z.enabled && Array.isArray(z.polygon) && z.polygon.length > 2)
      .map((z) => ({
        type: 'Feature',
        id: z.id,
        properties: { name: z.name, entityClass: 'restricted_zone', enabled: z.enabled },
        geometry: { type: 'Polygon', coordinates: [z.polygon] },
      }));
    controller.setRestrictedZoneFeatures(features);
  };

  return (
    <div className="restricted-zone-panel">
      <header className="restricted-zone-header">
        <h3>Restricted Zones</h3>
        <span className="restricted-zone-count">{zones.filter((z) => z.enabled).length}</span>
      </header>

      <div className="restricted-zone-input">
        <input
          type="text"
          placeholder="Zone name..."
          value={newZoneName}
          onChange={(e) => setNewZoneName(e.target.value)}
          onKeyPress={(e) => { if (e.key === 'Enter') addZone(); }}
          className="restricted-zone-input-field"
        />
        <button onClick={addZone} className="btn btn-secondary btn-sm">
          Add Zone
        </button>
      </div>

      {zones.length === 0 ? (
        <p className="restricted-zone-empty">
          No restricted zones. Draw on map to create one.
        </p>
      ) : (
        <ul className="restricted-zone-list">
          {zones.map((zone) => (
            <li key={zone.id} className={`restricted-zone-item ${zone.enabled ? 'is-enabled' : 'is-disabled'}`}>
              <div className="restricted-zone-item-content">
                <label className="restricted-zone-toggle">
                  <input
                    type="checkbox"
                    checked={zone.enabled}
                    onChange={() => toggleZoneEnabled(zone.id)}
                  />
                  <span className="restricted-zone-name">{zone.name}</span>
                </label>
              </div>
              <button
                onClick={() => removeZone(zone.id)}
                className="restricted-zone-delete"
                title="Delete zone"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
