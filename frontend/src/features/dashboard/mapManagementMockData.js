import {
  DELIVERY_ROUTE_ENTITIES,
  DRONE_POSITION_ENTITIES,
  FLIGHT_PATH_ENTITIES,
  GEOFENCE_ENTITIES,
  MISSION_AREA_ENTITIES,
} from "../../mock/entities/mapEntities";

const mapEntities = [
  ...MISSION_AREA_ENTITIES,
  ...FLIGHT_PATH_ENTITIES,
  ...GEOFENCE_ENTITIES,
  ...DELIVERY_ROUTE_ENTITIES,
];

const collectUnique = (values) => [...new Set(values.filter(Boolean))].sort((left, right) => String(left).localeCompare(String(right), "vi"));

export const MAP_REGION_OPTIONS = collectUnique(mapEntities.map((entity) => entity.regionName));

export const MAP_ADDRESS_OPTIONS = collectUnique(mapEntities.map((entity) => entity.address));

export const MAP_OWNER_OPTIONS = collectUnique(mapEntities.map((entity) => entity.ownerName));

export const MAP_MANAGEMENT_FORM_OPTIONS = {
  regions: MAP_REGION_OPTIONS,
  addresses: MAP_ADDRESS_OPTIONS,
  owners: MAP_OWNER_OPTIONS,
};

const buildPathGeoJson = (entity) => ({
  type: "Feature",
  geometry: entity.geometry,
  properties: {
    name: entity.displayName,
    entityClass: entity.entityClass,
    statusKey: entity.statusKey,
  },
});

const buildMapRow = (entity) => ({
  id: entity.id,
  mapName: entity.displayName,
  regionName: entity.regionName,
  address: entity.address,
  ownerName: entity.ownerName,
  statusKey: entity.statusKey,
  entityClass: entity.entityClass,
  pathGeoJson: buildPathGeoJson(entity),
  updatedAt: entity.updatedAt,
});

export const MAP_MANAGEMENT_MOCK_DATA = [
  ...MISSION_AREA_ENTITIES.map(buildMapRow),
  ...FLIGHT_PATH_ENTITIES.map(buildMapRow),
  ...GEOFENCE_ENTITIES.map(buildMapRow),
  ...DELIVERY_ROUTE_ENTITIES.map(buildMapRow),
  ...DRONE_POSITION_ENTITIES.map(buildMapRow),
];
