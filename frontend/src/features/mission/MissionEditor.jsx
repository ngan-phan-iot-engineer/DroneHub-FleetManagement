import { useState, useEffect, useRef } from 'react';
import './MissionEditor.css';

/**
 * MissionEditor
 * Simple mission waypoint editor.
 * Allows creating, editing, and deleting waypoints.
 * Integration with MapLayerController via callbacks.
 */

export default function MissionEditor({ 
  onWaypointsChange, 
  onMissionRouteUpdate,
  controllerRef 
}) {
  const [waypoints, setWaypoints] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const draggedIndexRef = useRef(-1);

  /**
   * Add a waypoint at a given coordinate
   * @param {number[]} coord - [lng, lat]
   * @param {number} altitude - meters (default 30)
   */
  const addWaypoint = (coord, altitude = 30) => {
    const newWaypoint = {
      waypointId: `wp-${Date.now()}`,
      coord,
      altitude,
      actionType: 'fly', // fly|hover|photo|land
    };
    const nextWaypoints = [...waypoints, newWaypoint];
    setWaypoints(nextWaypoints);
    if (onWaypointsChange) onWaypointsChange(nextWaypoints);
    updateRouteOnMap(nextWaypoints);
  };

  const removeWaypoint = (index) => {
    const nextWaypoints = waypoints.filter((_, i) => i !== index);
    setWaypoints(nextWaypoints);
    if (onWaypointsChange) onWaypointsChange(nextWaypoints);
    updateRouteOnMap(nextWaypoints);
  };

  const updateWaypoint = (index, partial) => {
    const nextWaypoints = waypoints.map((wp, i) => 
      i === index ? { ...wp, ...partial } : wp
    );
    setWaypoints(nextWaypoints);
    if (onWaypointsChange) onWaypointsChange(nextWaypoints);
    updateRouteOnMap(nextWaypoints);
  };

  const updateRouteOnMap = (wps) => {
    if (!controllerRef?.current) return;
    const controller = controllerRef.current;

    // Waypoint point features
    const waypointFeatures = wps.map((wp, i) => ({
      type: 'Feature',
      id: `wp-${wp.waypointId}`,
      properties: {
        waypointId: wp.waypointId,
        waypointIndex: i,
        altitude: wp.altitude,
        actionType: wp.actionType,
        name: `WP ${i + 1}`,
      },
      geometry: { type: 'Point', coordinates: wp.coord },
    }));

    // Route line connecting waypoints
    const routeFeature = wps.length > 1 ? {
      type: 'Feature',
      id: 'mission-route',
      properties: { name: 'Mission Route', entityClass: 'flight_path' },
      geometry: {
        type: 'LineString',
        coordinates: wps.map(wp => wp.coord),
      },
    } : null;

    controller.setWaypointFeatures(waypointFeatures);
    if (routeFeature && onMissionRouteUpdate) {
      onMissionRouteUpdate([routeFeature]);
      controller.setMissionRouteFeatures([routeFeature]);
    }
  };

  const clearWaypoints = () => {
    setWaypoints([]);
    setEditingIndex(-1);
    if (onWaypointsChange) onWaypointsChange([]);
    if (controllerRef?.current) {
      controllerRef.current.setWaypointFeatures([]);
      controllerRef.current.setMissionRouteFeatures([]);
    }
  };

  return (
    <div className="mission-editor-panel">
      <header className="mission-editor-header">
        <h3>Mission Waypoints</h3>
        <span className="mission-editor-count">{waypoints.length}</span>
      </header>

      <div className="mission-editor-toolbar">
        <button onClick={clearWaypoints} className="btn btn-secondary btn-sm">
          Clear All
        </button>
      </div>

      {waypoints.length === 0 ? (
        <p className="mission-editor-empty">
          Click on map to add waypoints or import existing route.
        </p>
      ) : (
        <ul className="mission-editor-list">
          {waypoints.map((wp, idx) => (
            <li
              key={wp.waypointId}
              className={`mission-editor-item ${editingIndex === idx ? 'is-editing' : ''}`}
              draggable
              onDragStart={() => { draggedIndexRef.current = idx; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndexRef.current === -1 || draggedIndexRef.current === idx) return;
                const draggedWp = waypoints[draggedIndexRef.current];
                const nextWps = waypoints.filter((_, i) => i !== draggedIndexRef.current);
                nextWps.splice(idx, 0, draggedWp);
                setWaypoints(nextWps);
                draggedIndexRef.current = -1;
              }}
            >
              <div className="mission-editor-item-content">
                <span className="mission-editor-item-number">{idx + 1}</span>
                <div className="mission-editor-item-details">
                  <p className="mission-editor-coord">
                    {wp.coord[0].toFixed(4)}, {wp.coord[1].toFixed(4)}
                  </p>
                  <input
                    type="number"
                    placeholder="Altitude (m)"
                    value={wp.altitude}
                    onChange={(e) => updateWaypoint(idx, { altitude: Number(e.target.value) })}
                    className="mission-editor-altitude"
                  />
                </div>
              </div>
              <button
                onClick={() => removeWaypoint(idx)}
                className="mission-editor-delete"
                title="Remove waypoint"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mission-editor-actions">
        <button className="btn btn-primary btn-block">
          Plan Route
        </button>
      </div>
    </div>
  );
}
