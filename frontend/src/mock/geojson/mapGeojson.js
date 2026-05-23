import {
  DELIVERY_ROUTE_ENTITIES,
  DRONE_POSITION_ENTITIES,
  FLIGHT_PATH_ENTITIES,
  GEOFENCE_ENTITIES,
  MISSION_AREA_ENTITIES,
} from "../entities/mapEntities";

const buildFeature = (entity) => ({
  type: "Feature",
  id: entity.id,
  geometry: entity.geometry,
  properties: {
    id: entity.id,
    name: entity.displayName,
    entityClass: entity.entityClass,
    statusKey: entity.statusKey,
    regionName: entity.regionName,
    address: entity.address,
    ownerName: entity.ownerName,
    updatedAt: entity.updatedAt,
    selected: false,
  },
});

const buildFeatureCollection = (entities) => ({
  type: "FeatureCollection",
  features: entities.map(buildFeature),
});

export const MISSION_AREA_GEOJSON = buildFeatureCollection(MISSION_AREA_ENTITIES);
export const FLIGHT_PATH_GEOJSON = buildFeatureCollection(FLIGHT_PATH_ENTITIES);
export const DRONE_POSITION_GEOJSON = buildFeatureCollection(DRONE_POSITION_ENTITIES);
export const GEOFENCE_GEOJSON = buildFeatureCollection(GEOFENCE_ENTITIES);
export const DELIVERY_ROUTE_GEOJSON = buildFeatureCollection(DELIVERY_ROUTE_ENTITIES);

export const MAP_GEOJSON_BY_ENTITY = {
  missionArea: MISSION_AREA_GEOJSON,
  flightPath: FLIGHT_PATH_GEOJSON,
  dronePosition: DRONE_POSITION_GEOJSON,
  geofence: GEOFENCE_GEOJSON,
  deliveryRoute: DELIVERY_ROUTE_GEOJSON,
};
