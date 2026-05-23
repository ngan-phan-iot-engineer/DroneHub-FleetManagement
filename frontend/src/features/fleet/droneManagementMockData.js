export const DRONE_MANAGEMENT_PAGE_SIZE = 5;

const DRONE_STATUS_MAP = {
  FLYING: { label: "Đã bay", color: "#4CAF50" },
  WARNING: { label: "Có vấn đề", color: "#D5A100" },
  IDLE: { label: "Chưa bay", color: "#E14B4B" },
  PENDING: { label: "Chờ thanh toán", color: "#6B67D8" },
  CANCELED: { label: "Đã hủy", color: "#9E9E9E" },
};

const STATUS_KEYS = Object.keys(DRONE_STATUS_MAP);

const formatDateTime = (dayOffset, minuteOffset) => {
  const baseDate = new Date("2024-10-06T08:30:00Z");
  baseDate.setUTCDate(baseDate.getUTCDate() + dayOffset);
  baseDate.setUTCMinutes(baseDate.getUTCMinutes() + minuteOffset);

  const yyyy = baseDate.getUTCFullYear();
  const mm = String(baseDate.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(baseDate.getUTCDate()).padStart(2, "0");
  const hh = String(baseDate.getUTCHours()).padStart(2, "0");
  const mi = String(baseDate.getUTCMinutes()).padStart(2, "0");
  const ss = String(baseDate.getUTCSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
};

const listDurations = ["8,5 phút", "11,5 phút", "20 phút", "2 giờ 25 giây", "N/a"];

export const DRONE_LIST_MOCK_DATA = Array.from({ length: 100 }).map((_, index) => {
  const statusKey = STATUS_KEYS[index % STATUS_KEYS.length];
  const status = DRONE_STATUS_MAP[statusKey];
  const droneNumber = String(index + 1).padStart(3, "0");

  return {
    id: `drone-${droneNumber}`,
    droneCode: `S50Pro-${droneNumber}`,
    droneType: "S50Pro",
    status: {
      key: statusKey,
      label: status.label,
      color: status.color,
    },
    teamName: `Saty${(index % 8) + 1}`,
    lastFlightAt: formatDateTime(index % 11, (index % 6) * 10),
    flightDuration: listDurations[index % listDurations.length],
    maintenanceAt: formatDateTime(index % 9, (index % 5) * 8),
  };
});

const createFlightHistoryRow = (index) => ({
  id: `flight-history-${index + 1}`,
  pilotName: `Nguyễn Văn ${String.fromCharCode(65 + (index % 6))}`,
  teamName: "S50Pro",
  flightDuration: listDurations[index % listDurations.length],
  flightAt: formatDateTime(index % 16, (index % 9) * 7),
});

const createMaintenanceHistoryRow = (index) => ({
  id: `maintenance-history-${index + 1}`,
  maintenanceEngineer: `Nguyễn Văn ${String.fromCharCode(65 + (index % 6))}`,
  errorCode: `Fx${String(index % 100).padStart(4, "0")}90dxxdxe99${String(index % 10)}`,
  descriptionCode: "008",
  maintenanceAt: formatDateTime(index % 14, (index % 7) * 11),
});

const buildDetail = (droneItem, index) => ({
  droneId: droneItem.id,
  droneCode: droneItem.droneCode,
  breadcrumbLabel: "Thông tin chi tiết Drone",
  basicInfo: {
    type: droneItem.droneType,
    statusText: index % 5 === 0 ? "Có vấn đề" : "Hoạt động bình thường",
    statusColor: index % 5 === 0 ? "#D5A100" : "#3EAA63",
    usedAt: formatDateTime(index % 10, (index % 4) * 13),
    flightTimeText: index % 2 === 0 ? "2 giờ 25 giây" : "1 giờ 10 phút",
  },
  gpsSectionTitle: "Lịch sử GPS",
  gpsImageUrl: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=1200&q=80",
  flightHistory: Array.from({ length: 100 }).map((_, i) => createFlightHistoryRow(i)),
  maintenanceHistory: Array.from({ length: 100 }).map((_, i) => createMaintenanceHistoryRow(i)),
});

export const DRONE_DETAIL_MOCK_DATA = DRONE_LIST_MOCK_DATA.reduce((acc, item, index) => {
  acc[item.id] = buildDetail(item, index);
  return acc;
}, {});

export const DRONE_HISTORY_TYPES = {
  FLIGHT: "flight",
  MAINTENANCE: "maintenance",
};
