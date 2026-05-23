import React, { useState, useEffect } from 'react';
// Import luồng mạng ảo (Service) thay thế Data thô
import { fetchFleetData } from '../../services/dashboardApi';
import './FleetManagement.css';

function FleetManagement() {
	// 1. STATE BẢNG DỮ LIỆU: Bắt đầu khai báo rỗng [] vì mạng chưa trả kết quả về
	const [fleetData, setFleetData] = useState([]);
	// 2. CỜ BÁO THỨC TẢI LÕI: Mặc định bật (true) cho vòng xoay Loading xuất hiện
	const [isLoading, setIsLoading] = useState(true);

	// 3. HOOK VÒNG ĐỜI RE-RENDER (Chỉ chạy 1 lần khi Bảng đâm chồi trên Giao diện Web)
	useEffect(() => {
		// Gọi hàm hàm async trung gian để rượt theo Lời hứa từ Server
		const loadDataFromAPI = async () => {
			// Bật Loading Spinner
			setIsLoading(true);
			// Hứng cục Data bị nghẽn ngầm (Await) 1.2s từ API Giả
			const data = await fetchFleetData();
			
			// Hốt được rổ Data rồi thì bỏ vào Biến nhớ (State) của Giao diện
			setFleetData(data);
			// Lập tức Gạt phích cắm: Tắt Bảng Loading, Nhả Cột HTML "Table" lộ sáng.
			setIsLoading(false);
		};
		// Ra lệnh gọi!
		loadDataFromAPI();
	}, []);

	// Hàm xử lý khi user bấm tick/bỏ tick Checkbox
	const handleTogglePaid = (groupIndex, recordIndex) => {
		const newData = [...fleetData];
		const newGroup = { ...newData[groupIndex] };
		const newRecords = [...newGroup.records];

		// Đổi trạng thái true/false
		newRecords[recordIndex] = {
			...newRecords[recordIndex],
			isPaid: !newRecords[recordIndex].isPaid
		};

		newGroup.records = newRecords;
		newData[groupIndex] = newGroup;
		setFleetData(newData);
	};

	// Tính toán Grand Total (Tổng cộng)
	const grandTotal = fleetData.reduce(
		(acc, group) => {
			group.records.forEach(r => {
				acc.area += (r.area || 0);
				// Giá phun lấy giá đại diện (thường cố định)
				acc.price = (r.price > 0) ? r.price : acc.price;
				acc.revenue += (r.revenue || 0);
				acc.collected += (r.collected || 0);
				acc.debt += (r.debt || 0);
			});
			return acc;
		},
		{ area: 0, price: 0, revenue: 0, collected: 0, debt: 0 }
	);

	return (
		<div className="fleet-management">
			{/* Khối Banner To */}
			<div className="fleet-banner">
				<h1>Thông tin đội bay</h1>
			</div>

			{isLoading ? (
				/* === MỘT KHI ĐANG LOADING === 
				 * Thay thế Cục Bảng bằng Hiệu ứng Logo Mismart Spinner Đỉnh Cao
				 */
				<div className="fleet-loading">
					<svg width="80" height="80" viewBox="0 0 32 32" className="spinning-logo">
						{/* Cấu trúc Lục giác "mi" Mismart */}
						<polygon points="13,0 32,7 32,25 13,32 0,16" className="spinning-hexagon" />
						<text x="18" y="16" textAnchor="middle" dominantBaseline="central" fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize="14" fill="#fff" className="spinning-text">mi</text>
					</svg>
					<p className="loading-text">Đang nhận luồng Dữ liệu Viễn trắc...</p>
				</div>
			) : (
				/* === MỘT KHI DỮ LIỆU LOAD XONG (Trạng thái Ngắt) === */
				/* Khối Bảng Thực Tế Mới Trồi Lên */
				<div className="fleet-table-wrap">
				<table className="fleet-table">
					<thead>
						{/* DÒNG THEAD 1: Cột thông thường và nhóm cột thông tin chuyến bay */}
						<tr>
							<th rowSpan="2" className="sortable-col">
								Ngày Thực hiện <span className="sort-icon">▼</span>
							</th>
							<th rowSpan="2" className="sortable-col">
								Tên nông dân <span className="sort-icon">▼</span>
							</th>
							<th rowSpan="2" className="sortable-col">
								Tên máy bay <span className="sort-icon">▼</span>
							</th>
							<th rowSpan="2" className="sortable-col">
								Tên phi công <span className="sort-icon">▼</span>
							</th>
							<th rowSpan="2" className="sortable-col">
								Địa chỉ đất <span className="sort-icon">▼</span>
							</th>
							<th rowSpan="2" className="sortable-col">
								Hình thức <span className="sort-icon">▼</span>
							</th>
							<th colSpan="6" className="group-col text-center">
								Thông tin chuyến bay
							</th>
						</tr>
						{/* DÒNG THEAD 2: Cột con của "Thông tin chuyến bay" */}
						<tr>
							<th className="sub-col">D.Tích TT</th>
							<th className="sub-col text-right">Giá phun</th>
							<th className="sub-col text-right">Doanh thu</th>
							<th className="sub-col text-right">Số tiền thu</th>
							<th className="sub-col text-right">Nợ còn lại</th>
							<th className="sub-col text-center">Đã TT</th>
						</tr>
					</thead>
					<tbody>
						{fleetData.map((group, groupIndex) => {
							// Tính tổng phụ (Subtotal) cho từng nhóm ngày
							const subtotal = group.records.reduce(
								(acc, r) => {
									acc.area += (r.area || 0);
									acc.price = (r.price > 0) ? r.price : acc.price;
									acc.revenue += (r.revenue || 0);
									acc.collected += (r.collected || 0);
									acc.debt += (r.debt || 0);
									return acc;
								},
								{ area: 0, price: 0, revenue: 0, collected: 0, debt: 0 }
							);

							return (
								<React.Fragment key={`group-${groupIndex}`}>
									{/* Lặp từng record trong nhóm, dùng rowSpan cho cột ngày ở record đầu tiên */}
									{group.records.map((r, rowIndex) => (
										<tr key={r.id}>
											{rowIndex === 0 && (
												<td rowSpan={group.records.length} className="cell-date">
													{group.date}
												</td>
											)}
											<td>{r.farmer}</td>
											<td>{r.drone}</td>
											<td>{r.pilot}</td>
											<td>{r.address}</td>
											<td>{r.method || ''}</td>
											<td className="text-right">{r.area || 0}</td>
											<td className="text-right">{(r.price || 0).toLocaleString('en-US')}</td>
											<td className="text-right">{(r.revenue || 0).toLocaleString('en-US')}</td>
											<td className="text-right">{(r.collected || 0).toLocaleString('en-US')}</td>
											<td className="text-right">{(r.debt || 0).toLocaleString('en-US')}</td>
											<td className="text-center">
												<div 
													className={`custom-checkbox ${r.isPaid ? 'checked' : ''}`}
													onClick={() => handleTogglePaid(groupIndex, rowIndex)}
												>
													{r.isPaid && <span className="fleet-checkmark">✔</span>}
												</div>
											</td>
										</tr>
									))}

									{/* Dòng Tổng Phụ (Subtotal) in ngay dưới nhóm */}
									<tr className="subtotal-row">
										{/* colspan=6 chiếm chỗ của Ngày, Nông dân, Máy bay, Phi công, Đất, Hình thức */}
										<td colSpan="6"></td>
										<td className="text-right">{subtotal.area}</td>
										<td className="text-right">{subtotal.price.toLocaleString('en-US')}</td>
										<td className="text-right">{subtotal.revenue.toLocaleString('en-US')}</td>
										<td className="text-right">{subtotal.collected.toLocaleString('en-US')}</td>
										<td className="text-right">{subtotal.debt.toLocaleString('en-US')}</td>
										<td className="text-center">
											<div className="custom-checkbox"></div>
										</td>
									</tr>
								</React.Fragment>
							);
						})}

						{/* DÒNG GRAND TOTAL (Tổng Kết Cuối Bảng) */}
						<tr className="grand-total-row">
							<td colSpan="6">GRAND TOTAL</td>
							<td className="text-right">{grandTotal.area}</td>
							<td className="text-right">{grandTotal.price.toLocaleString('en-US')}</td>
							<td className="text-right">{grandTotal.revenue.toLocaleString('en-US')}</td>
							<td className="text-right">{grandTotal.collected.toLocaleString('en-US')}</td>
							<td className="text-right">{grandTotal.debt.toLocaleString('en-US')}</td>
							<td className="text-center">
								<div className="custom-checkbox"></div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			)}
		</div>
	);
}

export default FleetManagement;
