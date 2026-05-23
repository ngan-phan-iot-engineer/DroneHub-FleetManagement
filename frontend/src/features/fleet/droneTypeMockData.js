/**
 * ============================================================
 * MOCK DATA: Drone Type Profiles
 * ============================================================
 * Purpose: This file acts as the "Database Layer" for the Demo 
 * Phase (Layer 3 in the architecture). It contains static definitions 
 * of various drone models (DJI, Custom MAVLink builds) that the 
 * system supports. 
 * 
 * Each object defines the physical and software limits of a given 
 * drone frame, ensuring that any real drone mapped to this type 
 * inherits these safety thresholds.
 * ============================================================
 */
export const DRONE_TYPE_MOCK_DATA = [
    {
        id: "dt-1",
        avatar: "https://dji-official-fe.djicdn.com/cms/uploads/2237895bcdd0fd55df6bc1e2df8b1c43.png", // M350 RTK
        name: "DJI Matrice 350 RTK",
        manufacturer: "DJI",
        frameClass: "Quadcopter",
        wheelbase: "895 mm",
        maxFlightTime: "55 phút",
        maxSpeed: "23 m/s",
        maxPayload: "2.7 kg",
        maxWindResistance: "12 m/s",
        standardBattery: "TB65 Intelligent Dual Battery",
        batteryCount: "2 pin",
        supportedSensors: ["Zenmuse H30", "Zenmuse L2", "Zenmuse P1", "NightVision"],
        missionTypes: ["Mapping", "Inspection", "Search & Rescue"]
    },
    {
        id: "dt-2",
        avatar: "https://dji-official-fe.djicdn.com/cms/uploads/6e08c353f40dadaea9f10a69a4055f28.png", // M30T
        name: "DJI Matrice 30T",
        manufacturer: "DJI",
        frameClass: "Quadcopter",
        wheelbase: "660 mm",
        maxFlightTime: "41 phút",
        maxSpeed: "23 m/s",
        maxPayload: "Tích hợp sẵn",
        maxWindResistance: "15 m/s",
        standardBattery: "TB30 Intelligent Battery",
        batteryCount: "2 pin",
        supportedSensors: ["Wide", "Zoom", "Thermal", "Laser Rangefinder"],
        missionTypes: ["Inspection", "Search & Rescue", "Security"]
    },
    {
        id: "dt-3",
        avatar: "https://dji-official-fe.djicdn.com/cms/uploads/0fdffd0efbc6ba56febe22b51203b5db.png", // Mavic 3 Enterprise
        name: "Mavic 3 Enterprise",
        manufacturer: "DJI",
        frameClass: "Quadcopter",
        wheelbase: "380.1 mm",
        maxFlightTime: "45 phút",
        maxSpeed: "21 m/s",
        maxPayload: "Module rời (Loa, Đèn)",
        maxWindResistance: "12 m/s",
        standardBattery: "Mavic 3 Intelligent Flight Battery",
        batteryCount: "1 pin",
        supportedSensors: ["Wide", "Tele", "RTK Module"],
        missionTypes: ["Mapping", "Surveying"]
    },
    {
        id: "dt-4",
        avatar: "https://dummyimage.com/150x150/e2e8e4/64786a.png&text=Custom+VTOL", // Placeholder Custom
        name: "Custom VTOL 2m",
        manufacturer: "Custom Build (MAVLink)",
        frameClass: "VTOL (Fixed-wing)",
        wheelbase: "2000 mm (Wingspan)",
        maxFlightTime: "120 phút",
        maxSpeed: "28 m/s",
        maxPayload: "3.5 kg",
        maxWindResistance: "10 m/s",
        standardBattery: "6S LiPo 22000mAh",
        batteryCount: "2 pin",
        supportedSensors: ["Sony A7R IV", "MicaSense RedEdge"],
        missionTypes: ["Mapping", "Corridor Scan", "Agriculture"]
    },
    {
        id: "dt-5",
        avatar: "https://dummyimage.com/150x150/e2e8e4/64786a.png&text=Tarot+650", // Placeholder Custom
        name: "Tarot 650 Quad",
        manufacturer: "Custom Build (MAVLink)",
        frameClass: "Quadcopter",
        wheelbase: "650 mm",
        maxFlightTime: "35 phút",
        maxSpeed: "15 m/s",
        maxPayload: "1.5 kg",
        maxWindResistance: "8 m/s",
        standardBattery: "6S LiPo 10000mAh",
        batteryCount: "1 pin",
        supportedSensors: ["GoPro Hero", "Custom Gimbal"],
        missionTypes: ["Training", "Light Inspection"]
    }
];
