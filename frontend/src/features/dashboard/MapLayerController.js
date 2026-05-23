/**
 * MapLayerController
 * Responsible for owning map layer data and applying updates from domain/telemetry.
 * Keeps layer separation and batches high-frequency updates.
 */

import {
  DOCKS_LAYER_ID,
  DOCKS_SOURCE_ID,
  DRONES_LAYER_ID,
  DRONES_SOURCE_ID,
  INTERACTION_DRAFT_LAYER_ID,
  INTERACTION_DRAFT_SOURCE_ID,
  GEOFENCES_LAYER_ID,
  GEOFENCES_SOURCE_ID,
  MISSION_AREA_LAYER_ID,
  MISSION_AREA_SOURCE_ID,
  RESTRICTED_ZONE_DRAFT_LAYER_ID,
  RESTRICTED_ZONE_DRAFT_OUTLINE_LAYER_ID,
  RESTRICTED_ZONE_DRAFT_SOURCE_ID,
  RESTRICTED_ZONE_FILL_LAYER_ID,
  RESTRICTED_ZONE_OUTLINE_LAYER_ID,
  RESTRICTED_ZONE_SOURCE_ID,
  ROUTE_LAYER_ID,
  ROUTE_SOURCE_ID,
  WAYPOINT_LABEL_LAYER_ID,
  WAYPOINT_LAYER_ID,
  WAYPOINT_SOURCE_ID,
} from "./mapLayerIds";

export default class MapLayerController {
  /**
   * @param {Object} adapter - Map adapter instance (implements addSource/addLayer/getSource etc.)
   */
  constructor(adapter) {
    this.adapter = adapter;
    this.pending = { drones: new Map() };
    this.waypointFeatures = [];
    this.routeFeatures = [];
    this.routeFeature = null;
    this.restrictedZoneFeatures = [];
    this.restrictedZoneDraftPoints = [];
    this.interactionDraftPoints = [];
    this.scheduled = false;
    this._initLayers();
  }

  _canUseAdapterMethod(methodName) {
    return !!this.adapter && typeof this.adapter[methodName] === 'function';
  }

  _addSourceSafely(sourceId, config) {
    if (!this._canUseAdapterMethod('addSource')) return;
    this.adapter.addSource(sourceId, config);
  }

  _addLayerSafely(layerConfig) {
    if (!this._canUseAdapterMethod('addLayer')) return;
    this.adapter.addLayer(layerConfig);
  }

  _getSourceSafely(sourceId) {
    if (!this._canUseAdapterMethod('getSource')) return null;
    return this.adapter.getSource(sourceId);
  }

  _initLayers() {
    if (!this.adapter) return;
    try {
      // Add sources and layers conservatively; adapters implement methods per MAP_ADAPTER_ARCHITECTURE
      this._addSourceSafely(DRONES_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({ 
        id: DRONES_LAYER_ID, 
        type: 'circle', 
        source: DRONES_SOURCE_ID, 
        paint: {
          'circle-color': '#3b82f6',
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      this._addSourceSafely(MISSION_AREA_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({ id: MISSION_AREA_LAYER_ID, type: 'fill', source: MISSION_AREA_SOURCE_ID, paint: {} });

      this._addSourceSafely(ROUTE_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({ 
        id: ROUTE_LAYER_ID, 
        type: 'line', 
        source: ROUTE_SOURCE_ID, 
        paint: {
          'line-color': '#2563eb',
          'line-width': 3,
          'line-opacity': 0.8
        }
      });

      this._addSourceSafely(WAYPOINT_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({
        id: WAYPOINT_LAYER_ID,
        type: 'circle',
        source: WAYPOINT_SOURCE_ID,
        paint: {
          'circle-color': '#2563eb',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      this._addLayerSafely({
        id: WAYPOINT_LABEL_LAYER_ID,
        type: 'symbol',
        source: WAYPOINT_SOURCE_ID,
        layout: {
          'text-field': ['to-string', ['get', 'waypointIndex']],
          'text-size': 11,
          'text-offset': [0, 1.1],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#0f172a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      });

      this._addSourceSafely(RESTRICTED_ZONE_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({
        id: RESTRICTED_ZONE_FILL_LAYER_ID,
        type: 'fill',
        source: RESTRICTED_ZONE_SOURCE_ID,
        paint: {
          'fill-color': '#dc2626',
          'fill-opacity': 0.12,
        },
      });

      this._addSourceSafely(RESTRICTED_ZONE_DRAFT_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({
        id: RESTRICTED_ZONE_DRAFT_LAYER_ID,
        type: 'fill',
        source: RESTRICTED_ZONE_DRAFT_SOURCE_ID,
        paint: {
          'fill-color': '#f97316',
          'fill-opacity': 0.08,
        },
      });

      this._addLayerSafely({
        id: RESTRICTED_ZONE_DRAFT_OUTLINE_LAYER_ID,
        type: 'line',
        source: RESTRICTED_ZONE_DRAFT_SOURCE_ID,
        paint: {
          'line-color': '#f97316',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });

      this._addSourceSafely(DOCKS_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({ id: DOCKS_LAYER_ID, type: 'symbol', source: DOCKS_SOURCE_ID, layout: {} });

      this._addSourceSafely(GEOFENCES_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({ id: GEOFENCES_LAYER_ID, type: 'line', source: GEOFENCES_SOURCE_ID, paint: {} });

      this._addSourceSafely(INTERACTION_DRAFT_SOURCE_ID, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      this._addLayerSafely({
        id: INTERACTION_DRAFT_LAYER_ID,
        type: 'circle',
        source: INTERACTION_DRAFT_SOURCE_ID,
        paint: {
          'circle-radius': 7,
          'circle-color': '#0f766e',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.95,
        },
      });
    } catch (err) {
      // Adapter may not support addSource/addLayer in tests — swallow safely
      // Consumers should handle missing layers gracefully
      // eslint-disable-next-line no-console
      console.warn('MapLayerController init layers error', err);
    }
  }

  /**
   * Apply a telemetry frame. This queues the update and flushes on RAF to avoid full data churn.
   * @param {Object} frame - telemetry frame { vehicleId, ts, coord }
   */
  applyTelemetryFrame(frame) {
    if (!frame || !frame.vehicleId) return;
    this.pending.drones.set(frame.vehicleId, frame);
    this._scheduleFlush();
  }

  _scheduleFlush() {
    if (this.scheduled) return;
    this.scheduled = true;
    requestAnimationFrame(() => this._flush());
  }

  _flush() {
    this.scheduled = false;
    if (!this.adapter) return;
    // Build features from pending drones map
    const features = Array.from(this.pending.drones.values()).map((f) => ({
      type: 'Feature',
      id: f.vehicleId,
      properties: { ts: f.ts, meta: f.meta || {} },
      geometry: { type: 'Point', coordinates: f.coord },
    }));

    try {
      const src = this._getSourceSafely(DRONES_SOURCE_ID);
      if (src && typeof src.setData === 'function') {
        // Replace data atomically with current features snapshot.
        src.setData({ type: 'FeatureCollection', features });
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('MapLayerController flush error', err);
    }
  }

  /**
   * Replace mission area features
   * @param {Object[]} features
   */
  setMissionAreaFeatures(features) {
    try {
      const src = this._getSourceSafely(MISSION_AREA_SOURCE_ID);
      if (src && typeof src.setData === 'function') src.setData({ type: 'FeatureCollection', features });
    } catch (err) {
      console.warn('setMissionAreaFeatures error', err);
    }
  }

  /**
   * Replace route features
   * @param {Object[]} features
   */
  setRouteFeatures(features) {
    try {
      const src = this._getSourceSafely(ROUTE_SOURCE_ID);
      if (src && typeof src.setData === 'function') src.setData({ type: 'FeatureCollection', features });
    } catch (err) {
      console.warn('setRouteFeatures error', err);
    }
  }

  /**
   * Replace geofence features
   * @param {Object[]} features
   */
  setGeofenceFeatures(features) {
    try {
      const src = this._getSourceSafely(GEOFENCES_SOURCE_ID);
      if (src && typeof src.setData === 'function') src.setData({ type: 'FeatureCollection', features });
    } catch (err) {
      console.warn('setGeofenceFeatures error', err);
    }
  }

  /**
   * Replace dock features
   * @param {Object[]} features
   */
  setDockFeatures(features) {
    try {
      const src = this._getSourceSafely(DOCKS_SOURCE_ID);
      if (src && typeof src.setData === 'function') src.setData({ type: 'FeatureCollection', features });
    } catch (err) {
      console.warn('setDockFeatures error', err);
    }
  }

  /**
   * Set waypoint features (numbered point markers for mission route).
   * Each waypoint should have properties: { index, altitude, actionType }
   * @param {Object[]} features - GeoJSON Point features
   */
  setWaypointFeatures(features) {
    try {
      this.waypointFeatures = Array.isArray(features) ? features : [];
      const src = this._getSourceSafely(WAYPOINT_SOURCE_ID);
      if (!src) return;
      const waypointFeatures = this.waypointFeatures.map((f, i) => ({
        type: 'Feature',
        id: `wp-${f.properties?.waypointId || i}`,
        properties: { ...f.properties, waypointIndex: i, isWaypoint: true },
        geometry: f.geometry,
      }));
      src.setData({ type: 'FeatureCollection', features: waypointFeatures });
    } catch (err) {
      console.warn('setWaypointFeatures error', err);
    }
  }

  /**
   * Set waypoint route polyline (line connecting waypoints).
   * @param {Object[]} features - GeoJSON LineString features for the route
   */
  setWaypointRoute(features) {
    try {
      this.routeFeatures = Array.isArray(features) ? features : [];
      const src = this._getSourceSafely(ROUTE_SOURCE_ID);
      if (!src) return;
      src.setData({ type: 'FeatureCollection', features: this.routeFeatures });
    } catch (err) {
      console.warn('setWaypointRoute error', err);
    }
  }

  /**
   * Canonical interaction API: waypoint editing
   */
  addWaypointFeature(coord) {
    if (!Array.isArray(coord) || coord.length < 2) return;

    const nextWaypoint = {
      type: 'Feature',
      properties: {
        waypointId: `wp-${Date.now()}`,
        altitude: 30,
        actionType: 'hover',
      },
      geometry: { type: 'Point', coordinates: coord },
    };

    this.waypointFeatures = [...this.waypointFeatures, nextWaypoint];
    this.setWaypointFeatures(this.waypointFeatures);
    this.rebuildRouteFromWaypoints();
  }

  clearWaypointFeatures() {
    this.waypointFeatures = [];
    this.routeFeatures = [];
    this.setWaypointFeatures([]);
    this.setWaypointRoute([]);
  }

  rebuildRouteFromWaypoints() {
    if (this.waypointFeatures.length < 2) {
      this.routeFeature = null;
      this.setWaypointRoute([]);
      return;
    }

    this.routeFeature = {
      type: 'Feature',
      id: 'mission-route',
      properties: { isRoute: true },
      geometry: {
        type: 'LineString',
        coordinates: this.waypointFeatures.map((feature) => feature.geometry.coordinates),
      },
    };

    this.routeFeatures = [this.routeFeature];
    this.setWaypointRoute(this.routeFeatures);
  }

  _setFeatureCollection(sourceId, features) {
    try {
      const source = this._getSourceSafely(sourceId);
      if (source && typeof source.setData === 'function') {
        source.setData({ type: 'FeatureCollection', features });
      }
    } catch (err) {
      console.warn('source sync error', sourceId, err);
    }
  }

  _syncRestrictedZonePreviewLayers() {
    const outlineCoordinates = this.restrictedZoneDraftPoints.slice();
    const closedRing = outlineCoordinates.length >= 3
      ? [...outlineCoordinates, outlineCoordinates[0]]
      : outlineCoordinates;

    const outlineFeature = outlineCoordinates.length >= 2
      ? [{
          type: 'Feature',
          id: 'restricted-zone-preview-outline',
          properties: { isRestrictedZone: true, isDraft: true },
          geometry: {
            type: 'LineString',
            coordinates: outlineCoordinates,
          },
        }]
      : [];

    const fillFeature = outlineCoordinates.length >= 3
      ? [{
          type: 'Feature',
          id: 'restricted-zone-preview-fill',
          properties: { isRestrictedZone: true, isDraft: true },
          geometry: {
            type: 'Polygon',
            coordinates: [closedRing],
          },
        }]
      : [];

    this._setFeatureCollection(RESTRICTED_ZONE_DRAFT_OUTLINE_LAYER_ID, outlineFeature);
    this._setFeatureCollection(RESTRICTED_ZONE_DRAFT_SOURCE_ID, fillFeature);
  }

  setInteractionDraftFeatures(features) {
    try {
      const src = this._getSourceSafely(INTERACTION_DRAFT_SOURCE_ID);
      if (src && typeof src.setData === 'function') {
        src.setData({ type: 'FeatureCollection', features: Array.isArray(features) ? features : [] });
      }
    } catch (err) {
      console.warn('setInteractionDraftFeatures error', err);
    }
  }

  /**
   * Canonical interaction API: restricted zone drafting
   */
  addRestrictedZonePoint(coord) {
    if (!Array.isArray(coord) || coord.length < 2) return;

    this.restrictedZoneDraftPoints = [...this.restrictedZoneDraftPoints, coord];
    this._syncRestrictedZonePreviewLayers();
  }

  finalizeRestrictedZone() {
    if (this.restrictedZoneDraftPoints.length < 3) {
      return;
    }

    const closedRing = [...this.restrictedZoneDraftPoints, this.restrictedZoneDraftPoints[0]];
    const committedPolygon = [{
      type: 'Feature',
      id: `restricted-zone-${Date.now()}`,
      properties: { isRestrictedZone: true },
      geometry: {
        type: 'Polygon',
        coordinates: [closedRing],
      },
    }];

    this.restrictedZoneFeatures = committedPolygon;
    this._setFeatureCollection(RESTRICTED_ZONE_SOURCE_ID, committedPolygon);
    this._setFeatureCollection(RESTRICTED_ZONE_OUTLINE_LAYER_ID, [{
      type: 'Feature',
      id: `${committedPolygon[0].id}-outline`,
      properties: { isRestrictedZone: true },
      geometry: {
        type: 'LineString',
        coordinates: this.restrictedZoneDraftPoints,
      },
    }]);
    this.clearRestrictedZoneDraft();
  }

  clearRestrictedZoneDraft() {
    this.restrictedZoneDraftPoints = [];
    this._setFeatureCollection(RESTRICTED_ZONE_DRAFT_SOURCE_ID, []);
    this._setFeatureCollection(RESTRICTED_ZONE_DRAFT_OUTLINE_LAYER_ID, []);
  }

  clearInteractionDraft() {
    this.interactionDraftPoints = [];
    this.setInteractionDraftFeatures([]);
  }

  /**
   * Compatibility wrapper for legacy callers.
   * Prefer addWaypointFeature/clearWaypointFeatures/rebuildRouteFromWaypoints.
   * @param {Object[]} features - GeoJSON LineString features
   */
  setMissionRouteFeatures(features) {
    this.setWaypointRoute(features);
  }

  /**
   * Compatibility wrapper for legacy callers.
   * Prefer addRestrictedZonePoint/finalizeRestrictedZone/clearRestrictedZoneDraft.
   * @param {Object[]} features - GeoJSON Polygon features
   */
  setRestrictedZoneFeatures(features) {
    this.restrictedZoneFeatures = Array.isArray(features) ? features : [];
    this._setFeatureCollection(RESTRICTED_ZONE_SOURCE_ID, this.restrictedZoneFeatures);

    const outlineFeatures = this.restrictedZoneFeatures
      .map((feature, index) => ({
        type: 'Feature',
        id: `${feature.id || `restricted-zone-${index}`}-outline`,
        properties: { isRestrictedZone: true },
        geometry: {
          type: 'LineString',
          coordinates: feature.geometry?.coordinates?.[0] || [],
        },
      }));

    this._setFeatureCollection(RESTRICTED_ZONE_OUTLINE_LAYER_ID, outlineFeatures);
  }

  destroy() {
    const removableLayerIds = [
      WAYPOINT_LABEL_LAYER_ID,
      WAYPOINT_LAYER_ID,
      RESTRICTED_ZONE_DRAFT_OUTLINE_LAYER_ID,
      RESTRICTED_ZONE_DRAFT_LAYER_ID,
      INTERACTION_DRAFT_LAYER_ID,
      RESTRICTED_ZONE_OUTLINE_LAYER_ID,
      RESTRICTED_ZONE_FILL_LAYER_ID,
      GEOFENCES_LAYER_ID,
      DOCKS_LAYER_ID,
      ROUTE_LAYER_ID,
      MISSION_AREA_LAYER_ID,
      DRONES_LAYER_ID,
    ];

    const removableSourceIds = [
      WAYPOINT_SOURCE_ID,
      RESTRICTED_ZONE_DRAFT_SOURCE_ID,
      INTERACTION_DRAFT_SOURCE_ID,
      RESTRICTED_ZONE_SOURCE_ID,
      GEOFENCES_SOURCE_ID,
      DOCKS_SOURCE_ID,
      ROUTE_SOURCE_ID,
      MISSION_AREA_SOURCE_ID,
      DRONES_SOURCE_ID,
    ];

    removableLayerIds.forEach((layerId) => this._removeLayerSafely(layerId));
    removableSourceIds.forEach((sourceId) => this._removeSourceSafely(sourceId));

    this.pending.drones.clear();
    this.waypointFeatures = [];
    this.routeFeatures = [];
    this.routeFeature = null;
    this.restrictedZoneFeatures = [];
    this.restrictedZoneDraftPoints = [];
    this.interactionDraftPoints = [];
    this.scheduled = false;
  }
}
