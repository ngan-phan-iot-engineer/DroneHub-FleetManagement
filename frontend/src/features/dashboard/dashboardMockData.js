// Mock options for dashboard filters.
export const DATE_RANGE_OPTIONS = [
  "01/03/2022 - 21/03/2022",
  "22/03/2022 - 31/03/2022",
  "01/04/2022 - 15/04/2022",
];

export const DRONE_MODEL_OPTIONS = ["Tất cả", "MDVS20-020", "AGR-X5", "AGR-X7"];
export const TEAM_OPTIONS = ["Tất cả", "Đội A", "Đội B", "Đội C"];
export const PILOT_OPTIONS = ["Tất cả", "Trần Văn Giàu", "Nguyễn Thành Nam", "Lê Ngọc Vũ"];

// Toggle switch label to hide records with zero area.
export const HIDE_ZERO_AREA_LABEL = "Ẩn dữ liệu diện tích bay bằng 0";

// Toggle chips representing operation types.
export const FLIGHT_TYPE_OPTIONS = [
  "Bay phun thuốc",
  "Bay rải hạt",
  "Bay giám sát",
  "Bay mapping bản đồ",
];

// Filter options for Dashboard Report popup.
export const DASHBOARD_REPORT_FILTER_OPTIONS = {
  timeRanges: ["01/03/2022 - 21/03/2022"],
  drones: ["Tất cả", "Drone A", "Drone B"],
  companies: ["Tất cả", "Mismart"],
  teams: ["Tất cả", "Đội 1", "Đội 2"],
};

// Sidebar sections and navigation labels from the design direction.
export const SIDEBAR_NAV = [
  {
    section: "",
    items: [
      { label: "Dữ liệu bay", icon: "▣" },
      { label: "Quản lý máy bay", icon: "◌" },
      { label: "Quản lý bản đồ bay", icon: "◎" },
      { label: "Quản lý đội bay", icon: "✣" },
    ],
  },
  {
    section: "QUẢN TRỊ VIÊN",
    items: [
      { label: "Quản lý quản trị viên", icon: "✥" },
      {
        label: "Hệ thống quản lý drone",
        icon: "◍",
        children: ["Quản lý khách hàng", "Quản lý loại máy bay"],
      },
    ],
  },
];

// Main table rows for dashboard demo and internal testing.
export const FLIGHT_ROWS = [
  {
    id: "FL-001",
    dateTime: "05/03/2022, 9:18:00",
    dateTimeEnd: "05/03/2022, 10:48:00",
    place: "Quốc lộ N2, Xã Thạnh Lợi, Huyện Bến Lức, Long An",
    farmer: "Trần Văn Nam",
    areaHa: 0.5,
    durationText: "1 giờ 30 phút",
    droneCode: "MDVS20-020",
    pilot1: "Trần Văn Giàu",
    pilot2: "Nguyễn Thành Nam",
    team: "Đội A",
    model: "MDVS20-020",
    type: "Bay phun thuốc",
    liters: 12,
    flights: 1,
  },
  {
    id: "FL-002",
    dateTime: "18/03/2022, 9:18:00",
    dateTimeEnd: "18/03/2022, 11:38:00",
    place: "Quốc lộ N2, Xã Thạnh Lợi, Huyện Bến Lức, Long An",
    farmer: "Trần Văn Nam",
    areaHa: 0.3,
    durationText: "2 giờ 20 phút",
    droneCode: "MDVS20-020",
    pilot1: "Trần Văn Giàu",
    pilot2: "Nguyễn Thành Nam",
    team: "Đội A",
    model: "MDVS20-020",
    type: "Bay rải hạt",
    liters: 8,
    flights: 1,
  },
  {
    id: "FL-003",
    dateTime: "26/03/2022, 9:18:00",
    dateTimeEnd: "26/03/2022, 12:28:00",
    place: "Quốc lộ N2, Xã Thạnh Lợi, Huyện Bến Lức, Long An",
    farmer: "Trần Văn Nam",
    areaHa: 2.8,
    durationText: "3 giờ 10 phút",
    droneCode: "MDVS20-020",
    pilot1: "Trần Văn Giàu",
    pilot2: "Nguyễn Thành Nam",
    team: "Đội B",
    model: "AGR-X5",
    type: "Bay phun thuốc",
    liters: 18,
    flights: 2,
  },
  {
    id: "FL-004",
    dateTime: "06/04/2022, 9:18:00",
    dateTimeEnd: "06/04/2022, 10:38:00",
    place: "Quốc lộ N2, Xã Thạnh Lợi, Huyện Bến Lức, Long An",
    farmer: "Trần Văn Nam",
    areaHa: 1.8,
    durationText: "1 giờ 20 phút",
    droneCode: "MDVS20-020",
    pilot1: "Trần Văn Giàu",
    pilot2: "Nguyễn Thành Nam",
    team: "Đội C",
    model: "AGR-X7",
    type: "Bay mapping bản đồ",
    liters: 14,
    flights: 1,
  },
  {
    id: "FL-005",
    dateTime: "10/04/2022, 14:10:00",
    dateTimeEnd: "10/04/2022, 14:40:00",
    place: "Xã Mỹ Hạnh Nam, Đức Hòa, Long An",
    farmer: "Lê Văn Bình",
    areaHa: 0,
    durationText: "0 giờ 30 phút",
    droneCode: "AGR-X7-011",
    pilot1: "Lê Ngọc Vũ",
    pilot2: "Nguyễn Thành Nam",
    team: "Đội C",
    model: "AGR-X7",
    type: "Bay giám sát",
    liters: 0,
    flights: 1,
  },
];

// Mock data for Fleet Management (Tab 4) - Grouped by Date (Nested Array scenario)
export const FLEET_MOCK_DATA = [
  {
    date: "15/03/2022",
    records: [
      {
        id: "r1", farmer: "A Đầu TCS", drone: "VS20-07", pilot: "Lâm Văn Chiến", address: "ĐT-TN-TCS",
        method: "Trả tiền mặt", area: 115, price: 16000, revenue: 1840000, collected: 1840000, debt: 0, isPaid: true,
      },
      {
        id: "r2", farmer: "Trần Văn Nam", drone: "VS20-07", pilot: "Ngô Thành Lộc", address: "ĐT-TN-TCS",
        method: "Trả tiền mặt", area: 87, price: 16000, revenue: 1392000, collected: 1392000, debt: 0, isPaid: true,
      },
      {
        id: "r3", farmer: "A Dư Tân Hồng", drone: "VS20-03-T", pilot: "Nguyễn Văn Tuấn Em", address: "ĐT-TN-TCS",
        method: "Trả tiền mặt", area: 98, price: 16000, revenue: 1568000, collected: 1568000, debt: 0, isPaid: true,
      },
      {
        id: "r4", farmer: "", drone: "", pilot: "", address: "",
        method: "Ghi nợ tháng", area: 50, price: 16000, revenue: 800000, collected: 0, debt: 800000, isPaid: false,
      },
    ],
  },
  {
    date: "15/03/2022",
    records: [
      {
        id: "r5", farmer: "A Đầu TCS", drone: "VS20-07", pilot: "Lâm Văn Chiến", address: "ĐT-TN-TCS",
        method: "Trả tiền mặt", area: 115, price: 16000, revenue: 1840000, collected: 1840000, debt: 0, isPaid: true,
      },
      {
        id: "r6", farmer: "Trần Văn Nam", drone: "VS20-07", pilot: "Ngô Thành Lộc", address: "ĐT-TN-TCS",
        method: "Trả tiền mặt", area: 87, price: 16000, revenue: 1392000, collected: 1392000, debt: 0, isPaid: true,
      },
      {
        id: "r7", farmer: "A Dư Tân Hồng", drone: "VS20-03-T", pilot: "Nguyễn Văn Tuấn Em", address: "ĐT-TN-TCS",
        method: "Trả tiền mặt", area: 98, price: 16000, revenue: 1568000, collected: 1568000, debt: 0, isPaid: true,
      }
    ],
  },
];

// ============================================================
// TAB 5: QUẢN LÝ FILE LOG — Mock Data & Dropdown Options
// ============================================================

export const LOG_DRONE_TYPE_OPTIONS = [
  "Tất cả", "MDVS20-020", "AGR-X5", "AGR-X7",
];

export const LOG_MA_HIEU_OPTIONS = [
  "Tất cả", "05", "18", "25", "32", "41", "92", "180",
];

export const LOG_NHOM_LOI_OPTIONS = [
  "Tất cả", "Không lỗi", "GPS", "Motor", "Rangfinder", "Connection", "GPU",
];

export const LOG_MOCK_DATA = [
  {
    id: "log-001",
    flightId: "MSVS20P001",
    drone: "MDVS20-020",
    maHieu: "05",
    tinh: "Vĩnh Long",
    doiBay: "MDV-01",
    phiCong: "Trần Văn Giàu",
    nhomLoi: [],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "approved",
  },
  {
    id: "log-002",
    flightId: "MSVS20P002",
    drone: "MDVS20-020",
    maHieu: "25",
    tinh: "Sóc Trăng",
    doiBay: "MDV-03",
    phiCong: "Trần Văn Giàu",
    nhomLoi: ["GPS", "Motor"],
    trachNhiem: "MiSmart",
    tinhTrang: "Bất thường",
    status: "pending",
  },
  {
    id: "log-003",
    flightId: "MSVS20P003",
    drone: "MDVS20-020",
    maHieu: "25",
    tinh: "Trà Vinh",
    doiBay: "MDV-02",
    phiCong: "Trần Văn Giàu",
    nhomLoi: ["GPS", "Motor", "Rangfinder", "Connection", "GPU"],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "approved",
  },
  {
    id: "log-004",
    flightId: "MSVS20P004",
    drone: "MDVS20-020",
    maHieu: "32",
    tinh: "Cần Thơ",
    doiBay: "MDV-04",
    phiCong: "Trần Văn Giàu",
    nhomLoi: ["GPS", "Motor"],
    trachNhiem: "Công ty A",
    tinhTrang: "Rơi",
    status: "error",
  },
  {
    id: "log-005",
    flightId: "MSVS20P005",
    drone: "MDVS20-020",
    maHieu: "18",
    tinh: "Cần Thơ",
    doiBay: "MDV-04",
    phiCong: "Trần Văn Giàu",
    nhomLoi: [],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "processing",
  },
  {
    id: "log-006",
    flightId: "MSVS20P006",
    drone: "MDVS20-020",
    maHieu: "41",
    tinh: "Cần Thơ",
    doiBay: "MDV-04",
    phiCong: "Trần Văn Giàu",
    nhomLoi: [],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "error",
  },
  {
    id: "log-007",
    flightId: "MSVS20P007",
    drone: "MDVS20-020",
    maHieu: "180",
    tinh: "Cần Thơ",
    doiBay: "MDV-04",
    phiCong: "Trần Văn Giàu",
    nhomLoi: ["GPS", "Motor"],
    trachNhiem: "Công ty A",
    tinhTrang: "Bất thường",
    status: "approved",
  },
  {
    id: "log-008",
    flightId: "MSVS20P008",
    drone: "MDVS20-020",
    maHieu: "92",
    tinh: "Cần Thơ",
    doiBay: "MDV-04",
    phiCong: "Nguyễn Thành Nam",
    nhomLoi: [],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "processing",
  },
  {
    id: "log-009",
    flightId: "MSVS20P009",
    drone: "AGR-X5",
    maHieu: "05",
    tinh: "Cần Thơ",
    doiBay: "MDV-04",
    phiCong: "Lê Ngọc Vũ",
    nhomLoi: [],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "approved",
  },
  {
    id: "log-010",
    flightId: "MSVS20P010",
    drone: "AGR-X7",
    maHieu: "05",
    tinh: "Hậu Giang",
    doiBay: "MDV-04",
    phiCong: "Trần Văn Giàu",
    nhomLoi: ["GPS", "Motor"],
    trachNhiem: "Công ty A",
    tinhTrang: "Bất thường",
    status: "processing",
  },
  {
    id: "log-011",
    flightId: "MSVS20P011",
    drone: "MDVS20-020",
    maHieu: "32",
    tinh: "An Giang",
    doiBay: "MDV-02",
    phiCong: "Nguyễn Thành Nam",
    nhomLoi: ["Connection"],
    trachNhiem: "MiSmart",
    tinhTrang: "Bất thường",
    status: "error",
  },
  {
    id: "log-012",
    flightId: "MSVS20P012",
    drone: "AGR-X5",
    maHieu: "18",
    tinh: "Kiên Giang",
    doiBay: "MDV-01",
    phiCong: "Lê Ngọc Vũ",
    nhomLoi: [],
    trachNhiem: "Không",
    tinhTrang: "Bình thường",
    status: "approved",
  },
];

export const LOG_WARNING_MOCK_DATA = Array.from({ length: 9 }).map((_, i) => ({
  id: `warn-${i}`,
  flightId: "Fx00090dxxdxe99008",
  dateTime: "3/4/2022, 9:18:00 - 3/4/2022, 10:48:00",
  tinhTrang: "Rơi"
}));

export const FLIGHT_DETAIL_MOCK_DATA = {
  default: {
    statusText: "Đã được duyệt",
    tinhTrang: "Rơi",
    startTime: "3/4/2022, 9:18:00",
    endTime: "3/4/2022, 10:48:00",
    flightId: "Fx00090dxxdxe99008",
    details: {
      vibeMax: "X: 30 m/s^2, Y: 30 m/s^2, Z: 30 m/s^2",
      batteryMin: "20%",
      fuelAvg: "50%",
      angleMax: "Roll: 20 deg, Pitch: 20 deg",
      cellDevMax: "0.5V",
      area: "1 ha",
      flightTime: "4 phút 27 giây",
      speedMax: "10 m/s",
      heightMax: "10m",
      accelMax: "X: 5 m/s^2, Y: 5 m/s^2, Z: 5 m/s^2"
    },
    conclusion: ""
  }
};

// ============================================================
// FLIGHT REPORT MOCK DATA — Báo cáo tình trạng chuyến bay
// ============================================================
export const FLIGHT_REPORT_MOCK_DATA = {
  default: {
    flightId: "Fx00090dxxdxe99008",
    updatedAt: "23/08/2022, 14:22:18",
    reporterName: "Trần Văn Thanh Hùng",
    department: "Bay Test drone",
    droneCode: "DMVS20-20",
    area: "Long An",
    incidentTime: "23/08/2022, 14h21p22s",
    pilot: "Ngô Kỳ Nam",
    partner: "MiSmart",
    pilotNote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac viverra lectus. Morbi volutpat felis non urna pharetra, id lobortis justo rhoncus. Pellentesque sed vehicula turpis, non scelerisque ante. Ut sit amet dolor sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa",
    reporterNote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac viverra lectus. Morbi volutpat felis non urna pharetra, id lobortis justo rhoncus. Pellentesque sed vehicula turpis, non scelerisque ante. Ut sit amet dolor sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa",
    images: [
      "https://picsum.photos/seed/greenpaddy/1200/800",
      "https://picsum.photos/seed/aerialrice/1200/800",
      "https://picsum.photos/seed/farmfield3/1200/800",
    ],
    repairSuggestion: "",
    reporterSignature: "",
  },
};

// ============================================================
// FLIGHT ANALYSIS MOCK DATA — Kết quả phân tích dữ liệu bay
// ============================================================
export const FLIGHT_ANALYSIS_MOCK_DATA = {
  default: {
    flightId: "Fx00090dxxdxe99008",
    updatedAt: "23/08/2022, 14:22:18",
    reporterName: "Trần Văn Thanh Hùng",
    department: "Bay Test drone",
    droneCode: "DMVS20-20",
    area: "Long An",
    incidentTime: "23/08/2022, 14h21p22s",
    pilot: "Ngô Kỳ Nam",
    partner: "MiSmart",
    pilotNote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac viverra lectus. Morbi volutpat felis non urna pharetra, id lobortis justo rhoncus. Pellentesque sed vehicula turpis, non scelerisque ante. Ut sit amet dolor sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa",
    reporterNote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ac viverra lectus. Morbi volutpat felis non urna pharetra, id lobortis justo rhoncus. Pellentesque sed vehicula turpis, non scelerisque ante. Ut sit amet dolor sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa sapien. Sed sed purus in diam semper finibus ut ac erat. Maecenas commodo sa",
    sceneImages: [
      "https://picsum.photos/seed/greenpaddy/1200/800",
      "https://picsum.photos/seed/aerialrice/1200/800",
      "https://picsum.photos/seed/farmfield3/1200/800",
    ],
    analysisData: [
      { stt: 1, group: "Phần cứng", detail: "GPS", status: "Theo dõi", statusDetail: "Tín hiệu GPS không tốt", solution: "Kiểm tra cần GPS" },
      { stt: 2, group: "Phần cứng", detail: "Rangefinder", status: "Xấu", statusDetail: "", solution: "" },
      { stt: 3, group: "Phần cứng", detail: "Fuel level", status: "Xấu", statusDetail: "", solution: "" },
      { stt: 4, group: "Phần cứng", detail: "Baro", status: "Theo dõi", statusDetail: "", solution: "" },
      { stt: 5, group: "Phần cứng", detail: "IMU", status: "Xấu", statusDetail: "", solution: "" },
      { stt: 6, group: "Phần cứng", detail: "1", status: "Theo dõi", statusDetail: "Mất tín hiệu motor 6", statusDetailRowSpan: 6, solution: "Kiểm tra động cơ", solutionRowSpan: 6 },
      { stt: 7, group: "Phần cứng", detail: "2", status: "Xấu", omitDetailAndSolution: true },
      { stt: 8, group: "Phần cứng", detail: "3", status: "Tốt", omitDetailAndSolution: true },
      { stt: 9, group: "Phần cứng", detail: "4", status: "Tốt", omitDetailAndSolution: true },
      { stt: 10, group: "Phần cứng", detail: "5", status: "Theo dõi", omitDetailAndSolution: true },
      { stt: 11, group: "Phần cứng", detail: "6", status: "Xấu", omitDetailAndSolution: true },
      { stt: 12, group: "Phần cứng", detail: "Pin", status: "Theo dõi", statusDetail: "", solution: "" },
      { stt: 13, group: "Phần cứng", detail: "Radio", status: "Xấu", statusDetail: "", solution: "" },
      { stt: 14, group: "Phần cứng", detail: "Độ rung", status: "Tốt", statusDetail: "Vibe Z cao", solution: "Kiểm tra cần dây FC, damping, frame." },
      { stt: 15, group: "Hành vi", detail: "Tường trình đúng", status: "Tốt", statusDetail: "", solution: "" },
      { stt: 16, group: "Hành vi", detail: "Điều khiển", status: "Xấu", statusDetail: "", solution: "" },
    ],
    conclusionReason: "Do MiSmart",
    conclusionDetail: "Mất motor 6, máy chao lắc, phi công Disarm, rớt máy",
    detailedAnalysis: "Mất Motor 6:\n• 15h32p03s: Góc Roll, Pitch bắt đầu phân kỳ ở độ cao 3.4m.\n• 15h32h04s: Tín hiệu motor 6 tăng lên bất thường, tín hiệu motor 5 giảm xuống (RCou 6 max: 1873, RCou 5min: 1221).\n• 15h32p06s: máy bắt đầu chao lắc.\n• 15h32p12s: phi công disarm, máy rớt ở độ cao 2m\n• 15h32p14s: ghi nhận máy chạm đất",
    errorImages: [
      "https://picsum.photos/seed/err1/1200/800",
      "https://picsum.photos/seed/err2/1200/800",
      "https://picsum.photos/seed/err3/1200/800",
    ],
    repairSuggestion: "",
    analyzedBy: "",
    approvedBy: "",
    reportType: "Report"
  }
};

// ============================================================
// AI PREDICT MOCK DATA - Ket qua AI suy luan
// ============================================================

// Helper — generate 6-channel telemetry data matching MISMART ATT chart visual
// Simulates: ATT Control, ATT Roll, ATT Ctrl PMT, and 3 motor signals (ch4-ch6)
const _generateMotorTimeSeries = () => {
  const data    = [];
  const startSec = 8 * 3600 + 18 * 60; // 08:18:00
  const totalSec = 720;                  // 12-minute flight window
  const points   = 350;

  for (let i = 0; i < points; i++) {
    const sec = startSec + Math.round((i / points) * totalSec);
    const hh  = String(Math.floor(sec / 3600)).padStart(2, '0');
    const mm  = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const ss  = String(sec % 60).padStart(2, '0');

    const t      = i / points;                               // normalized 0..1
    const isFail = t > 0.50;                                 // failure phase after midpoint
    const noise  = (s) => (Math.random() - 0.5) * 2 * s;
    const sin    = (f, a, p = 0) => Math.sin(t * Math.PI * 2 * f + p) * a;

    data.push({
      time: `${hh}:${mm}:${ss}`,
      // ch1 — ATT Control (gold/yellow): slight rise then chaotic spikes
      ch1: +(sin(1.2, 5, 0.3) + noise(2.5) + (isFail ? sin(8, 10) + noise(5) : 0)).toFixed(3),
      // ch2 — ATT Roll (blue): large oscillation, dramatic in failure zone
      ch2: +(sin(1.8, 8, 0.7) + noise(3)   + (isFail ? sin(6, 14) + noise(8) : 0)).toFixed(3),
      // ch3 — ATT Ctrl PMT (red): irregular, high-frequency in failure
      ch3: +(sin(2.5, 4, 1.2) + noise(3.5) + (isFail ? sin(10, 16) + noise(6) : 0)).toFixed(3),
      // ch4 — Motor signal (green): near-zero with random sparse spikes
      ch4: +(noise(1.5) + (Math.random() < (isFail ? 0.15 : 0.03) ? noise(14) : 0)).toFixed(3),
      // ch5 — Slow drift signal (orange): gentle sine + mild noise
      ch5: +(sin(0.5, 2.5) + noise(1.2) + (isFail ? noise(4) : 0)).toFixed(3),
      // ch6 — Vibration/motor (magenta): white noise + high-freq spike in failure
      ch6: +(noise(2) + (isFail ? noise(8) + sin(15, 6) : 0)).toFixed(3),
    });
  }
  return data;
};

export const AI_PREDICT_MOCK_DATA = {
  default: {
    generalInfo: [
      { id: "gen-1", chartSeriesData: _generateMotorTimeSeries(), filters: [{ group: "BARO", checked: true, subParams: ["Param 1", "Param 2"] }, { group: "Range Finder", checked: true, subParams: ["Param 1"] }] },
      { id: "gen-2", chartSeriesData: _generateMotorTimeSeries(), filters: [{ group: "Motor", checked: false, subParams: ["Param 1", "Param 2"] }] },
      { id: "gen-3", chartSeriesData: _generateMotorTimeSeries(), filters: [] },
      { id: "gen-4", chartSeriesData: _generateMotorTimeSeries(), filters: [] }
    ],
    aiErrors: [
      { id: "err-1", title: "GPS",          timeSpan: "120s - 200s",    chartSeriesData: _generateMotorTimeSeries(), filters: [] },
      { id: "err-2", title: "Radio",        timeSpan: "120s - 200s",    chartSeriesData: _generateMotorTimeSeries(), filters: [] },
      { id: "err-3", title: "Pin",          timeSpan: "1200s - 2500s",  chartSeriesData: _generateMotorTimeSeries(), filters: [] },
      { id: "err-4", title: "Fuel Level",   timeSpan: "3000s - 8000s",  chartSeriesData: _generateMotorTimeSeries(), filters: [] },
      { id: "err-5", title: "BARO",         timeSpan: "1200s - 2500s",  chartSeriesData: _generateMotorTimeSeries(), filters: [{ group: "BARO", checked: true, subParams: ["Param 1","Param 2"] }, { group: "Range Finder", checked: true, subParams: ["Param 1"] }] },
      { id: "err-6", title: "Range Finder", timeSpan: "3000s - 8000s",  chartSeriesData: _generateMotorTimeSeries(), filters: [{ group: "BARO", checked: true, subParams: ["Param 1","Param 2"] }, { group: "Range Finder", checked: true, subParams: ["Param 1"] }] },
      {
        id: "err-7",
        title: "Motor ERROR",
        timeSpan: "120s – 200s",

        filters: [
          { group: "Tất cả", isCheckboxList: true, items: [
            { id: "c1", label: "C1", checked: false },
            { id: "c2", label: "C2", checked: true  },
            { id: "c3", label: "C3", checked: false },
            { id: "c4", label: "C4", checked: false },
            { id: "c5", label: "C5", checked: false },
            { id: "c6", label: "C6", checked: false }
          ]}
        ],
        syncStatus:           { currentStep: 3, isPowerLost: true },
        eventMarkers:         [{ timePercent: "75%", label: "Sudden Power Loss" }],
        aiCrosscheckWarning:  "Canh bao: Du lieu bay co tinh bieu kien on dinh. Co the ban dang chon nham dinh danh chuyen bay bi nan!",
        chartSeriesData:      _generateMotorTimeSeries()
      }
    ]
  }
};

// ==========================================
// MOCK DATA VÀO LUỒNG DASHBOARD REPORT MODAL
// ==========================================
export const DASHBOARD_OVERVIEW_MOCK_DATA = {
  kpi: {
    totalFlights: 247,
    normalFlights: 218,
    warningFlights: 22,
    crashFlights: 7,
  },
  // Stacked Bar Chart: Trạng thái chuyến bay tất cả các đội
  stackedBarData: {
    categories: ['Đội 1', 'Đội 2', 'Đội 3', 'Đội 4', 'Đội 5', 'Đội 6', 'Đội 7', 'Đội 8', 'Đội 9', 'Đội 10', 'Đội 11', 'Đội 12', 'Đội 13', 'Đội 14'],
    series: {
      normal: [58, 48, 45, 87, 51, 45, 20, 48, 27, 87, 28, 49, 52, 72],
      warning: [20, 3, 41, 12, 12, 2, 8, 0, 32, 25, 11, 8, 5, 5],
      crash: [21, 20, 24, 13, 22, 13, 7, 27, 16, 11, 10, 30, 14, 8],
    }
  },
  // Donut Chart: Tỉ lệ tình trạng
  pieData: [
    { value: 60, name: 'Bình Thường', itemStyle: { color: '#64786A' } },
    { value: 20, name: 'Cảnh Báo', itemStyle: { color: '#FF9800' } },
    { value: 10, name: 'Rơi', itemStyle: { color: '#E53935' } }
  ],
  // Bar Chart: Thống kê số lượng lỗi
  errorBarData: {
    categories: ['GPS', 'Baro', 'IMU', 'Motor 1', 'Motor 2', 'Motor 3', 'Motor 4', 'Motor 5'],
    values: [25, 5, 17, 27, 21, 9, 19, 12]
  }
};
