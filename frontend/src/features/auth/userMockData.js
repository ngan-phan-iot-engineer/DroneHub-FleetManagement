/**
 * ============================================================
 * MOCK DATA: Administrator & User Profiles
 * ============================================================
 * Lớp Dữ liệu (Layer 3) chứa tĩnh thông tin người dùng 
 * trong hệ thống. Quản lý phân quyền RBAC và theo dõi 
 * đăng nhập.
 * ============================================================
 */
export const USER_MOCK_DATA = [
	{
		id: "USR-001",
		name: "David Nguyễn",
		email: "david.nguyen@mismart.ai",
		phone: "0987654321",
		role: "Super Admin",
		status: "Active",
		lastLogin: "2026-04-21 08:30"
	},
	{
		id: "USR-002",
		name: "Trần Viết Hải",
		email: "hai.tran@dronehub.vn",
		phone: "0912345678",
		role: "Fleet Manager",
		status: "Active",
		lastLogin: "2026-04-20 15:45"
	},
	{
		id: "USR-003",
		name: "Lê Cát Trọng",
		email: "trong.le.pilot@mismart.ai",
		phone: "0933215678",
		role: "Pilot",
		status: "Active",
		lastLogin: "2026-04-21 07:15"
	},
	{
		id: "USR-004",
		name: "Khách VIP 01",
		email: "client_vip01@gmail.com",
		phone: "0900000000",
		role: "Viewer",
		status: "Active",
		lastLogin: "2026-04-18 10:00"
	},
	{
		id: "USR-005",
		name: "Phạm Quốc Đạt",
		email: "dat.pham@mismart.ai",
		phone: "0345678912",
		role: "Pilot",
		status: "Inactive",
		lastLogin: "2026-03-12 09:20"
	}
];
