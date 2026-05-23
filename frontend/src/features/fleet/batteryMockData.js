// batteryMockData.js
// Giả lập Service Data Layer cho tính năng Quản lý pin
// Tuân thủ Quy tắc 3: Tách bạch dữ liệu với UI, mô phỏng API

let mockBatteries = [
  {
    id: "123182938",
    email: "dotranphuongnam@gmail.com",
    batteryType: "300Wh",
    owner: "Nguyen Tran Nhat Long",
    chargeCount: 10,
    usageTime: "100h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182939",
    email: "dotranphuongnam@gmail.com",
    batteryType: "300Wh",
    owner: "Tran Van Nam",
    chargeCount: 5,
    usageTime: "25h",
    status: "inactive",
    imageUrl: ""
  },
  {
    id: "123182940",
    email: "levanbinh@gmail.com",
    batteryType: "300Wh",
    owner: "Le Van Binh",
    chargeCount: 12,
    usageTime: "120h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182941",
    email: "ngothanhloc@gmail.com",
    batteryType: "200Wh",
    owner: "Ngo Thanh Loc",
    chargeCount: 3,
    usageTime: "15h",
    status: "inactive",
    imageUrl: ""
  },
  {
    id: "123182942",
    email: "dotranphuongnam@gmail.com",
    batteryType: "200Wh",
    owner: "Đội A 101",
    chargeCount: 8,
    usageTime: "80h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182943",
    email: "admin@mismart.com",
    batteryType: "300Wh",
    owner: "Mismart Admin",
    chargeCount: 20,
    usageTime: "200h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182944",
    email: "doib202@mismart.com",
    batteryType: "300Wh",
    owner: "Đội B 202",
    chargeCount: 1,
    usageTime: "5h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182945",
    email: "khachhangvip@gmail.com",
    batteryType: "400Wh",
    owner: "Khách hàng V.I.P",
    chargeCount: 15,
    usageTime: "150h",
    status: "inactive",
    imageUrl: ""
  },
  {
    id: "123182946",
    email: "pilot1@gmail.com",
    batteryType: "300Wh",
    owner: "Phi công 1",
    chargeCount: 2,
    usageTime: "10h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182947",
    email: "pilot2@gmail.com",
    batteryType: "200Wh",
    owner: "Phi công 2",
    chargeCount: 7,
    usageTime: "70h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182948",
    email: "nguyenvana@gmail.com",
    batteryType: "300Wh",
    owner: "Nguyen Van A",
    chargeCount: 0,
    usageTime: "0h",
    status: "inactive",
    imageUrl: ""
  },
  {
    id: "123182949",
    email: "tranvanb@gmail.com",
    batteryType: "200Wh",
    owner: "Tran Van B",
    chargeCount: 30,
    usageTime: "300h",
    status: "inactive",
    imageUrl: ""
  },
  {
    id: "123182950",
    email: "levanc@gmail.com",
    batteryType: "400Wh",
    owner: "Le Van C",
    chargeCount: 11,
    usageTime: "110h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182951",
    email: "hoangvand@gmail.com",
    batteryType: "300Wh",
    owner: "Hoang Van D",
    chargeCount: 4,
    usageTime: "40h",
    status: "active",
    imageUrl: ""
  },
  {
    id: "123182952",
    email: "phamvane@gmail.com",
    batteryType: "300Wh",
    owner: "Pham Van E",
    chargeCount: 22,
    usageTime: "220h",
    status: "active",
    imageUrl: ""
  }
];

// Helper: Giả lập độ trễ mạng
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchBatteries = async () => {
  await delay(500); // 500ms delay
  return [...mockBatteries]; // Trả về bản sao để tránh tham chiếu trực tiếp
};

export const createBattery = async (batteryData) => {
  await delay(600);
  const newBattery = {
    ...batteryData,
    id: Date.now().toString(), // Mock ID
    chargeCount: batteryData.chargeCount || 0,
    usageTime: batteryData.usageTime || "0h",
    status: batteryData.status || "active",
  };
  // Thêm vào đầu danh sách
  mockBatteries = [newBattery, ...mockBatteries];
  return newBattery;
};

export const updateBattery = async (id, updatedData) => {
  await delay(600);
  const index = mockBatteries.findIndex(b => b.id === id);
  if (index === -1) throw new Error("Battery not found");
  
  mockBatteries[index] = { ...mockBatteries[index], ...updatedData };
  return mockBatteries[index];
};

export const deleteBattery = async (id) => {
  await delay(600);
  mockBatteries = mockBatteries.filter(b => b.id !== id);
  return true;
};
