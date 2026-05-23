export function handleWaypointMapClick({
  controller,
  isMissionEditMode,
  clickCoordinate,
  setWaypoints,
}) {
  if (!isMissionEditMode || !Array.isArray(clickCoordinate)) {
    return false;
  }

  setWaypoints((previousWaypoints) => ([
    ...previousWaypoints,
    {
      waypointId: `wp-${Date.now()}`,
      coord: clickCoordinate,
      altitude: 30,
      actionType: "hover",
    },
  ]));

  controller?.addWaypointFeature(clickCoordinate);

  return true;
}

export function handleRestrictedZoneClick({
  controller,
  isRestrictedZoneEditMode,
  clickCoordinate,
  originalEvent,
}) {
  if (!isRestrictedZoneEditMode || !Array.isArray(clickCoordinate)) {
    return false;
  }

  // Ignore the second click of a double-click to avoid adding a duplicate draft point.
  if (originalEvent?.detail === 2) {
    return true;
  }

  controller?.addRestrictedZonePoint(clickCoordinate);
  return true;
}

export function handleRestrictedZoneFinalize({
  controller,
  isRestrictedZoneEditMode,
  event,
}) {
  if (!isRestrictedZoneEditMode) {
    return false;
  }

  if (event?.originalEvent?.preventDefault) {
    event.originalEvent.preventDefault();
  }

  controller?.finalizeRestrictedZone();
  return true;
}

export function handleEscapeKey({
  event,
  isRestrictedZoneEditMode,
  controller,
  setInteractionMode,
}) {
  if (event.key !== "Escape" || !isRestrictedZoneEditMode) {
    return false;
  }

  controller?.clearRestrictedZoneDraft();
  setInteractionMode("idle");
  return true;
}
