/**
 * ============================================================
 * MOCK DATA: Client & CRM Profiles
 * ============================================================
 * Lớp Dữ liệu (Layer 3) chứa tĩnh thông tin khách hàng, đối tác 
 * và tích lũy thống kê diện tích / số chuyến bay đã thực hiện.
 * ============================================================
 */
export const CLIENT_MOCK_DATA = [
	{
		id: "CLI-001",
		companyName: "Nông trang Trà Sư",
		contactName: "Chú Ba Rẫy",
		phone: "0911222333",
		email: "baray@gmail.com",
        taxId: "0101234567",
		address: "Tịnh Biên, An Giang",
		stats: {
			totalFlights: 12,
			totalAreaHa: 45.5,
			totalFlightHours: 3.2
		},
		linkedViewerAccountId: "USR-004", // Client log in with this Viewer account
		status: "Active"
	},
	{
		id: "CLI-002",
		companyName: "Tập đoàn Xây dựng Hòa Bình",
		contactName: "Trần Văn B",
		phone: "0901231231",
		email: "info@hoabinh.vn",
        taxId: "0300123123",
		address: "Quận 3, TP. Hồ Chí Minh",
		stats: {
			totalFlights: 5,
			totalAreaHa: 10.0,
			totalFlightHours: 1.5
		},
		linkedViewerAccountId: "", // Not linked yet
		status: "Active"
	},
    {
		id: "CLI-003",
		companyName: "HTX Nông nghiệp Cờ Đỏ",
		contactName: "Lê Thị C",
		phone: "0934555666",
		email: "htx.codo@cantho.gov.vn",
        taxId: "1801234567",
		address: "Cờ Đỏ, Cần Thơ",
		stats: {
			totalFlights: 40,
			totalAreaHa: 150.0,
			totalFlightHours: 18.0
		},
		linkedViewerAccountId: "",
		status: "Active"
	}
];
