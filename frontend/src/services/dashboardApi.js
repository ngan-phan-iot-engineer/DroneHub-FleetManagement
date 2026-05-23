import {
    FLEET_MOCK_DATA,
    FLIGHT_ROWS,
    LOG_MOCK_DATA,
    LOG_WARNING_MOCK_DATA,
    FLIGHT_DETAIL_MOCK_DATA,
    FLIGHT_REPORT_MOCK_DATA,
    FLIGHT_ANALYSIS_MOCK_DATA,
    AI_PREDICT_MOCK_DATA,
    DASHBOARD_OVERVIEW_MOCK_DATA,
    DASHBOARD_REPORT_FILTER_OPTIONS,
} from '../features/dashboard/dashboardMockData';
import { apiClient } from '../utils/apiClient';
import {
    MAP_MANAGEMENT_MOCK_DATA,
    MAP_MANAGEMENT_FORM_OPTIONS,
} from '../features/dashboard/mapManagementMockData';
import {
    DRONE_LIST_MOCK_DATA,
    DRONE_DETAIL_MOCK_DATA,
    DRONE_MANAGEMENT_PAGE_SIZE,
    DRONE_HISTORY_TYPES,
} from '../features/fleet/droneManagementMockData';
import { DRONE_TYPE_MOCK_DATA } from '../features/fleet/droneTypeMockData';
import { USER_MOCK_DATA } from '../features/auth/userMockData';
import { CLIENT_MOCK_DATA } from '../features/fleet/clientMockData';

let mapManagementDb = JSON.parse(JSON.stringify(MAP_MANAGEMENT_MOCK_DATA));
let droneManagementDb = JSON.parse(JSON.stringify(DRONE_LIST_MOCK_DATA));
let droneDetailDb = JSON.parse(JSON.stringify(DRONE_DETAIL_MOCK_DATA));
let droneTypeDb = JSON.parse(JSON.stringify(DRONE_TYPE_MOCK_DATA));
let userDb = JSON.parse(JSON.stringify(USER_MOCK_DATA));
let clientDb = JSON.parse(JSON.stringify(CLIENT_MOCK_DATA));

const paginateRows = (rows, page = 1, pageSize = DRONE_MANAGEMENT_PAGE_SIZE) => {
    const normalizedPage = Math.max(1, Number(page) || 1);
    const normalizedPageSize = Math.max(1, Number(pageSize) || DRONE_MANAGEMENT_PAGE_SIZE);
    const totalItems = rows.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / normalizedPageSize));
    const boundedPage = Math.min(normalizedPage, totalPages);
    const start = (boundedPage - 1) * normalizedPageSize;

    return {
        rows: rows.slice(start, start + normalizedPageSize),
        pagination: {
            page: boundedPage,
            pageSize: normalizedPageSize,
            totalItems,
            totalPages,
        },
    };
};

const searchRows = (rows, keyword, keys) => {
    const normalizedKeyword = (keyword || '').trim().toLowerCase();
    if (!normalizedKeyword) {
        return rows;
    }

    return rows.filter((row) => {
        const searchableText = keys.map((key) => String(row[key] || '')).join(' ').toLowerCase();
        return searchableText.includes(normalizedKeyword);
    });
};

/**
 * -------------------------------------------------------------
 * FILE: apiClient.js (LỚP DỊCH VỤ - SERVICE LAYER)
 * -------------------------------------------------------------
 * Đóng vai trò làm "Bộ định tuyến" giao tiếp giữa Frontend (React UI) 
 * và thế giới thực (Backend APIs / WebSockets).
 * Tại Phase 1 (Demo tĩnh), ta dùng kỹ thuật Promise Delay để 
 * bắt chước y hệt độ trễ mạng thực tế khi bốc dữ liệu từ Server.
 */

export const fetchFleetData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Deep clone to ensure each group's `records` array has its own memory reference.
            // A shallow copy [...FLEET_MOCK_DATA] would share nested objects across groups,
            // causing a checkbox click in one group to bleed into another group with the same data.
            resolve(JSON.parse(JSON.stringify(FLEET_MOCK_DATA)));
        }, 1200);
    });
};

export const fetchTelemetryData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...FLIGHT_ROWS]);
        }, 1200);
    });
};

export const fetchLogData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...LOG_MOCK_DATA]);
        }, 1200);
    });
};
export const fetchWarningLogs = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...LOG_WARNING_MOCK_DATA]);
        }, 500); // Tốc độ trễ nhỏ hơn để UX dropdown nhanh chóng hơn
    });
};

export const fetchFlightDetails = async (flightId) => {
    // TƯƠNG LAI CÓ BACKEND: Thay thế bằng đoạn mã này
    // try {
    //     const res = await apiClient.get(`/logs/flight-details/${flightId}`);
    //     return res.data;
    // } catch (error) {
    //     console.error("Error fetching flight details:", error);
    //     throw error;
    // }
    
    return new Promise((resolve) => {
        setTimeout(() => {
            const detail = FLIGHT_DETAIL_MOCK_DATA[flightId] || FLIGHT_DETAIL_MOCK_DATA['default'];
            resolve({ ...detail, flightId: flightId || detail.flightId });
        }, 500); 
    });
};

export const fetchFlightReport = async (flightId) => {
    // FUTURE BACKEND: Replace with:
    // try {
    //     const res = await apiClient.get(`/logs/flight-report/${flightId}`);
    //     return res.data;
    // } catch (error) {
    //     console.error("Error fetching flight report:", error);
    //     throw error;
    // }

    return new Promise((resolve) => {
        setTimeout(() => {
            const report = FLIGHT_REPORT_MOCK_DATA[flightId] || FLIGHT_REPORT_MOCK_DATA['default'];
            resolve({ ...report, flightId: flightId || report.flightId });
        }, 500);
    });
};

export const fetchFlightAnalysis = async (flightId) => {
    // FUTURE BACKEND: Replace with:
    // try {
    //     const res = await apiClient.get(`/logs/flight-analysis/${flightId}`);
    //     return res.data;
    // } catch (error) {
    //     console.error("Error fetching flight analysis:", error);
    //     throw error;
    // }

    return new Promise((resolve) => {
        setTimeout(() => {
            const analysis = FLIGHT_ANALYSIS_MOCK_DATA[flightId] || FLIGHT_ANALYSIS_MOCK_DATA['default'];
            resolve({ ...analysis, flightId: flightId || analysis.flightId });
        }, 500);
    });
};

export const fetchAIPredictData = async (flightId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Import is normally handled at the top, I will add it dynamically or at the top if needed.
            // Oh wait, AI_PREDICT_MOCK_DATA is imported? I need to make sure log it here.
            resolve(AI_PREDICT_MOCK_DATA['default']);
        }, 500);
    });
};

export const fetchDashboardOverview = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(DASHBOARD_OVERVIEW_MOCK_DATA);
        }, 800);
    });
};

export const fetchDashboardReportFilterOptions = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(DASHBOARD_REPORT_FILTER_OPTIONS)));
        }, 400);
    });
};

export const fetchMapManagementData = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(mapManagementDb)));
        }, 900);
    });
};

export const fetchMapManagementFormOptions = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(MAP_MANAGEMENT_FORM_OPTIONS)));
        }, 350);
    });
};

export const createMapManagementItem = async (payload) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const createdItem = {
                id: `map-${Date.now()}`,
                ...payload,
                updatedAt: new Date().toISOString(),
            };
            mapManagementDb = [createdItem, ...mapManagementDb];
            resolve(JSON.parse(JSON.stringify(createdItem)));
        }, 700);
    });
};

export const updateMapManagementItem = async (itemId, payload) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const targetIndex = mapManagementDb.findIndex((item) => item.id === itemId);
            if (targetIndex < 0) {
                reject(new Error('Map item not found'));
                return;
            }

            const updatedItem = {
                ...mapManagementDb[targetIndex],
                ...payload,
                id: itemId,
                updatedAt: new Date().toISOString(),
            };
            mapManagementDb[targetIndex] = updatedItem;
            resolve(JSON.parse(JSON.stringify(updatedItem)));
        }, 700);
    });
};

export const deleteMapManagementItem = async (itemId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const previousSize = mapManagementDb.length;
            mapManagementDb = mapManagementDb.filter((item) => item.id !== itemId);
            if (mapManagementDb.length === previousSize) {
                reject(new Error('Map item not found'));
                return;
            }
            resolve({ success: true });
        }, 500);
    });
};

export const fetchDroneManagementList = async (params = {}) => {
    const {
        keyword = '',
        page = 1,
        pageSize = DRONE_MANAGEMENT_PAGE_SIZE,
    } = params;

    return new Promise((resolve) => {
        setTimeout(() => {
            const filteredRows = searchRows(droneManagementDb, keyword, [
                'droneCode',
                'droneType',
                'teamName',
                'lastFlightAt',
                'flightDuration',
                'maintenanceAt',
            ]);

            const paged = paginateRows(filteredRows, page, pageSize);
            resolve({
                rows: JSON.parse(JSON.stringify(paged.rows)),
                pagination: paged.pagination,
            });
        }, 550);
    });
};

export const fetchDroneManagementDetail = async (droneId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const detail = droneDetailDb[droneId];
            if (!detail) {
                reject(new Error('Drone detail not found'));
                return;
            }
            resolve(JSON.parse(JSON.stringify(detail)));
        }, 450);
    });
};

export const fetchDroneManagementHistory = async (params = {}) => {
    const {
        droneId,
        historyType = DRONE_HISTORY_TYPES.FLIGHT,
        keyword = '',
        page = 1,
        pageSize = DRONE_MANAGEMENT_PAGE_SIZE,
    } = params;

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const detail = droneDetailDb[droneId];
            if (!detail) {
                reject(new Error('Drone detail not found'));
                return;
            }

            const sourceRows = historyType === DRONE_HISTORY_TYPES.MAINTENANCE
                ? detail.maintenanceHistory
                : detail.flightHistory;

            const searchableKeys = historyType === DRONE_HISTORY_TYPES.MAINTENANCE
                ? ['maintenanceEngineer', 'errorCode', 'descriptionCode', 'maintenanceAt']
                : ['pilotName', 'teamName', 'flightDuration', 'flightAt'];

            const filteredRows = searchRows(sourceRows, keyword, searchableKeys);
            const paged = paginateRows(filteredRows, page, pageSize);

            resolve({
                rows: JSON.parse(JSON.stringify(paged.rows)),
                pagination: paged.pagination,
            });
        }, 500);
    });
};

/**
 * Fetches the supported Drone Types (Profiles) from the database wrapper.
 * This simulates network latency to test loading UI states, returning 
 * a deep copy of the mock data to prevent accidental state mutation.
 * 
 * @returns {Promise<Array>} A promise that resolves with an array of drone types.
 */
export const fetchDroneTypes = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(droneTypeDb)));
        }, 600); // Simulate 600ms network delay
    });
};

export const createDroneType = async (payload) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newItem = {
                id: `dt-${Date.now()}`,
                ...payload,
            };
            droneTypeDb.push(newItem);
            resolve(JSON.parse(JSON.stringify(newItem)));
        }, 600);
    });
};

export const updateDroneType = async (id, payload) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = droneTypeDb.findIndex(dt => dt.id === id);
            if (index < 0) {
                reject(new Error("Drone Type not found"));
                return;
            }
            const updatedItem = {
                ...droneTypeDb[index],
                ...payload,
                id, // retain original ID
            };
            droneTypeDb[index] = updatedItem;
            resolve(JSON.parse(JSON.stringify(updatedItem)));
        }, 500);
    });
};

export const deleteDroneType = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const previousLength = droneTypeDb.length;
            droneTypeDb = droneTypeDb.filter(dt => dt.id !== id);
            if (droneTypeDb.length === previousLength) {
                reject(new Error("Drone Type not found"));
                return;
            }
            resolve({ success: true });
        }, 500);
    });
};

/* =========================================================
   USER MANAGEMENT API (Role-Based Access Control)
   ========================================================= */

export const fetchUsers = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(userDb)));
        }, 400);
    });
};

export const createUser = async (payload) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser = {
                ...payload,
                id: `USR-${Date.now()}`,
                lastLogin: "Chưa đăng nhập",
                status: payload.status !== undefined ? payload.status : "Active"
            };
            // Add to front of list
            userDb.unshift(newUser);
            resolve(JSON.parse(JSON.stringify(newUser)));
        }, 500);
    });
};

export const updateUser = async (id, payload) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = userDb.findIndex(u => u.id === id);
            if (index === -1) {
                reject(new Error("User not found"));
                return;
            }
            const updatedUser = {
                ...userDb[index],
                ...payload,
                id, // retain original ID
            };
            userDb[index] = updatedUser;
            resolve(JSON.parse(JSON.stringify(updatedUser)));
        }, 500);
    });
};

export const toggleUserStatus = async (id, currentStatus) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = userDb.findIndex(u => u.id === id);
            if (index === -1) {
                reject(new Error("User not found"));
                return;
            }
            userDb[index].status = currentStatus === "Active" ? "Inactive" : "Active";
            resolve(JSON.parse(JSON.stringify(userDb[index])));
        }, 400);
    });
};

export const deleteUser = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const previousLength = userDb.length;
            userDb = userDb.filter(u => u.id !== id);
            if (userDb.length === previousLength) {
                reject(new Error("User not found"));
                return;
            }
            resolve({ success: true });
        }, 600);
    });
};

/* =========================================================
   CLIENT / CRM MANAGEMENT API
   ========================================================= */

export const fetchClients = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(clientDb)));
        }, 400);
    });
};

export const createClient = async (payload) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newClient = {
                ...payload,
                id: `CLI-${Date.now()}`,
                stats: { totalFlights: 0, totalAreaHa: 0, totalFlightHours: 0 },
                status: payload.status !== undefined ? payload.status : "Active"
            };
            // Add to front of list
            clientDb.unshift(newClient);
            resolve(JSON.parse(JSON.stringify(newClient)));
        }, 500);
    });
};

export const updateClient = async (id, payload) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = clientDb.findIndex(c => c.id === id);
            if (index === -1) {
                reject(new Error("Client not found"));
                return;
            }
            const updatedClient = {
                ...clientDb[index],
                ...payload,
                id, // retain original ID
                stats: clientDb[index].stats // keep existing stats
            };
            clientDb[index] = updatedClient;
            resolve(JSON.parse(JSON.stringify(updatedClient)));
        }, 500);
    });
};

export const deleteClient = async (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const previousLength = clientDb.length;
            clientDb = clientDb.filter(c => c.id !== id);
            if (clientDb.length === previousLength) {
                reject(new Error("Client not found"));
                return;
            }
            resolve({ success: true });
        }, 600);
    });
};
