/**
 * ============================================================
 * FILE: FlightData.jsx  (COMPONENT ĐỘC LẬP - TAB DỮ LIỆU BAY)
 * ============================================================
 * Kiến trúc: Service-Layer Component Isolation
 *
 * Component này tự lo liệu hoàn toàn:
 *   1. Gọi API giả lập (fetchTelemetryData) để lấy dữ liệu.
 *   2. Hiển thị vòng xoay Logo Mismart khi đang chờ dữ liệu.
 *   3. Quản lý toàn bộ State nội bộ: Bộ lọc, Bảng danh sách, KPI Cards, Bản đồ.
 *
 * Khi có Backend thật: Chỉ cần sửa hàm fetchTelemetryData() trong apiClient.js.
 * Không cần chạm vào file này.
 * ============================================================
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	DATE_RANGE_OPTIONS,
	DRONE_MODEL_OPTIONS,
	FLIGHT_TYPE_OPTIONS,
	HIDE_ZERO_AREA_LABEL,
	PILOT_OPTIONS,
	TEAM_OPTIONS,
} from "./dashboardMockData";
// Import từ Lớp Dịch Vụ (Service Layer) — không nhúng data thô trực tiếp
import { fetchTelemetryData } from "../../services/dashboardApi";
import MapViewer from "./MapViewer";
import VideoStream from "./VideoStream";
import CustomDatePicker from "./CustomDatePicker";
import CustomSelect from "./CustomSelect";
import DashboardReportModal from "./DashboardReportModal";
import { format } from "date-fns";
import "./Telemetry.css"; // Tái dùng CSS đã có sẵn, không tạo CSS mới thừa thãi

// ============================================================
// ICON COMPONENTS (SVG nội tuyến — không dùng thư viện ngoài)
// ============================================================

const IconArea = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
		<polyline points="3,3 3,21 21,21" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="miter" fill="none" />
		<polygon points="6,18 10,10 14,14 19,6 19,18" fill="currentColor" />
	</svg>
);

const IconTime = () => (
	<svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ display: "block", marginRight: "-4px" }}>
		<path d="M18.36 5.64 A9 9 0 1 0 18.36 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
		<path d="M12 7 L12 12 L15.5 15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
		<path d="M17 10 L22 10 M18 14 L22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
	</svg>
);

const IconLiters = () => (
	<svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
		<defs>
			<mask id="drop-mask-fd">
				<rect width="24" height="24" fill="white" />
				<circle cx="20" cy="20" r="7" fill="black" />
			</mask>
		</defs>
		<path d="M12 2 C12 2 4 11 4 17 A8 8 0 0 0 20 17 C20 11 12 2 12 2 Z" fill="currentColor" mask="url(#drop-mask-fd)" />
		<path d="M15 19 L18 22 L22 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
	</svg>
);

const IconDroneKpi = () => (
	<svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}>
		<path d="M5 5 L19 19 M5 19 L19 5" stroke="currentColor" strokeWidth="2" fill="none" />
		<circle cx="4" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
		<circle cx="20" cy="4" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
		<circle cx="4" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
		<circle cx="20" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
		<circle cx="4" cy="4" r="1.5" fill="currentColor" />
		<circle cx="20" cy="4" r="1.5" fill="currentColor" />
		<circle cx="4" cy="20" r="1.5" fill="currentColor" />
		<circle cx="20" cy="20" r="1.5" fill="currentColor" />
		<path d="M12 8 A 4 4 0 0 0 16 12 A 4 4 0 0 0 12 16 A 4 4 0 0 0 8 12 A 4 4 0 0 0 12 8 Z" fill="currentColor" />
	</svg>
);

const IconMapGlobe = () => (
	<svg width="26" height="26" viewBox="0 0 24 24" fill="none" style={{ display: "block", margin: "0 auto" }}>
		<circle cx="12" cy="12" r="9.5" stroke="#64786A" strokeWidth="1.5" />
		<line x1="2.5" y1="12" x2="21.5" y2="12" stroke="#64786A" strokeWidth="1.5" />
		<line x1="12" y1="2.5" x2="12" y2="21.5" stroke="#64786A" strokeWidth="1.5" />
		<ellipse cx="12" cy="12" rx="4.8" ry="9.5" stroke="#64786A" strokeWidth="1.5" />
	</svg>
);

// ============================================================
// HÀM TIỆN ÍCH XỬ LÝ NGÀY GIỜ (Pure Functions — không có side effects)
// ============================================================

/** Chuyển chuỗi "dd/MM/yyyy" sang đối tượng Date */
function parseDdMmYyyy(dateText) {
	const [dayText, monthText, yearText] = dateText.split("/");
	return new Date(Number(yearText || 0), Number(monthText || 0) - 1, Number(dayText || 0));
}

/** Tách chuỗi "dd/MM/yyyy - dd/MM/yyyy" thành 2 mốc ngày */
function parseRangeDates(rangeText) {
	const [fromText, toText] = rangeText.split("-").map((v) => v.trim());
	return { fromDate: parseDdMmYyyy(fromText), toDate: parseDdMmYyyy(toText) };
}

/** Trích xuất ngày bắt đầu từ dòng dữ liệu chuyến bay */
function getStartDateFromRow(row) {
	const [datePart] = row.dateTime.split(",");
	return parseDdMmYyyy(datePart.trim());
}

/** Cộng dồn tổng số phút bay rồi trả về chuỗi "X giờ Y phút" */
function formatTotalHours(rows) {
	const totalMinutes = rows.reduce((acc, row) => {
		const [h, m] = row.durationText.replace("giờ", "").replace("phút", "").trim().split(" ").filter(Boolean);
		return acc + Number(h || 0) * 60 + Number(m || 0);
	}, 0);
	return `${Math.floor(totalMinutes / 60)} giờ ${totalMinutes % 60} phút`;
}

// ============================================================
// COMPONENT CHÍNH: FlightData
// ============================================================

function FlightData() { const { t } = useTranslation(); const fd = t("flightData", { returnObjects: true }) || {}; 
	// ----- TRẠNG THÁI MẠNG (Network State) -----
	// Mảng tất cả chuyến bay — bắt đầu rỗng, chờ API trả về
	const [allRows, setAllRows] = useState([]);
	// Cờ báo hiệu đang chờ dữ liệu từ mạng (true = đang tải, false = đã có dữ liệu)
	const [isLoading, setIsLoading] = useState(true);

	// ----- VÒNG ĐỜI: Kích hoạt gọi API một lần khi Component xuất hiện trên màn hình -----
	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			// Gọi Lớp Dịch vụ — hiện trả về Mock Data sau 1.2s, sau này thay bằng API thật
			const data = await fetchTelemetryData();
			setAllRows(data);
			setIsLoading(false);
		};
		loadData();
	}, []); // [] nghĩa là chỉ chạy 1 lần duy nhất lúc khởi tạo

	// ----- TRẠNG THÁI BỘ LỌC (Filter State) -----
	const [dateRange, setDateRange] = useState(DATE_RANGE_OPTIONS[0]);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [triggerRect, setTriggerRect] = useState(null);
	const datePickerTriggerRef = useRef(null);
	const [droneModel, setDroneModel] = useState("Tất cả");
	const [team, setTeam] = useState("Tất cả");
	const [pilot, setPilot] = useState("Tất cả");
	const [selectedRowId, setSelectedRowId] = useState("");
	const [hideZeroArea, setHideZeroArea] = useState(true);
	const [enabledFlightTypes, setEnabledFlightTypes] = useState(
		() => new Set(["Bay phun thuốc", "Bay rải hạt", "Bay giám sát", "Bay mapping bản đồ"])
	);
	const [showDashboardModal, setShowDashboardModal] = useState(false);

	// ----- XỬ LÝ SỰ KIỆN DATEPICKER -----
	const handleDatePickerToggle = () => {
		if (!showDatePicker && datePickerTriggerRef.current) {
			setTriggerRect(datePickerTriggerRef.current.getBoundingClientRect());
		}
		setShowDatePicker(!showDatePicker);
	};

	const handleDateConfirm = (range) => {
                setDateRange(`${format(range.startDate, "dd/MM/yyyy")} - ${format(range.endDate, "dd/MM/yyyy")}`);
		setShowDatePicker(false);
	};

	// ----- XỬ LÝ CHECKBOX LOẠI CHUYẾN BAY -----
	function toggleFlightType(typeName) {
		setEnabledFlightTypes((prev) => {
			const next = new Set(prev);
			next.has(typeName) ? next.delete(typeName) : next.add(typeName);
			return next;
		});
	}

	// ----- DỮ LIỆU SUY DIỄN (Derived Data — tính toán lại mỗi khi bộ lọc thay đổi) -----

	/** Lọc danh sách chuyến bay theo tất cả tiêu chí đang được chọn */
	const filteredRows = useMemo(() => {
		const { fromDate, toDate } = parseRangeDates(dateRange);
		return allRows.filter((row) => {
			const rowDate = getStartDateFromRow(row);
			if (rowDate < fromDate || rowDate > toDate) return false;
			if (droneModel !== "Tất cả" && row.model !== droneModel) return false;
			if (team !== "Tất cả" && row.team !== team) return false;
			if (pilot !== "Tất cả" && row.pilot1 !== pilot && row.pilot2 !== pilot) return false;
			if (hideZeroArea && row.areaHa === 0) return false;
			if (enabledFlightTypes.size === 0) return false;
			if (!enabledFlightTypes.has(row.type)) return false;
			return true;
		});
	}, [allRows, dateRange, droneModel, team, pilot, hideZeroArea, enabledFlightTypes]);

	/** Tự động chọn dòng đầu tiên nếu dòng đang chọn bị ẩn bởi bộ lọc */
	useEffect(() => {
		const timeout = setTimeout(() => {
			if (filteredRows.length === 0) { setSelectedRowId(""); return; }
			if (!filteredRows.some((r) => r.id === selectedRowId)) {
				setSelectedRowId(filteredRows[0].id);
			}
		}, 0);
		return () => clearTimeout(timeout);
	}, [filteredRows, selectedRowId]);

	/** Dòng đang được chọn trong bảng (dùng để truyền sang Bản đồ & Camera) */
	const selectedRow = useMemo(
		() => filteredRows.find((r) => r.id === selectedRowId) || null,
		[filteredRows, selectedRowId]
	);

	/** Tính toán 4 thẻ KPI từ tập dữ liệu đã lọc */
	const kpiCards = useMemo(() => {
		const totalArea = filteredRows.reduce((acc, r) => acc + r.areaHa, 0);
		const totalLiters = filteredRows.reduce((acc, r) => acc + r.liters, 0);
		const totalFlights = filteredRows.reduce((acc, r) => acc + r.flights, 0);
		return [
			{ title: fd.totalArea, value: totalArea.toFixed(1), unit: fd.ha, icon: <IconArea /> },
			{
				title: fd.totalFlightHours,
				valueNode: (() => {
					const text = formatTotalHours(filteredRows);
					const match = text.match(/(\d+)\s*giờ\s*(\d+)\s*phút/);
					if (match) return <>{match[1]}<span className="dashboard-kpi-unit"> giờ </span>{match[2]}<span className="dashboard-kpi-unit"> phút</span></>;
					return text;
				})(),
				unit: "", icon: <IconTime />
			},
			{ title: fd.totalLiters, value: String(totalLiters), unit: fd.liters, icon: <IconLiters /> },
			{ title: fd.totalFlights, value: String(totalFlights), unit: fd.times, icon: <IconDroneKpi /> },
		];
	}, [filteredRows]);

	// ============================================================
	// GIAO DIỆN (JSX Render)
	// ============================================================
	return (
		<>
			{isLoading ? (
				/* === MÀNG HÌNH CHỜ PREMIUM (hiển thị trong 1.2s khi đang nạp dữ liệu) ===
				 * Tái dùng cùng một hệ thống CSS Spinner đã cài đặt trong FleetManagement.css.
				 * Vì CSS được import toàn cục qua Telemetry.css + FleetManagement.css,
				 * class .fleet-loading / .spinning-logo ăn khớp hoàn toàn ở đây.
				 */
				<div className="flight-data-loading">
					<svg width="80" height="80" viewBox="0 0 32 32" className="spinning-logo">
						<polygon points="13,0 32,7 32,25 13,32 0,16" className="spinning-hexagon" />
						<text x="18" y="16" textAnchor="middle" dominantBaseline="central"
							fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize="14" fill="#fff">mi</text>
					</svg>
					<p className="loading-text">{fd.loadingFlights}</p>
				</div>
			) : (
				/* === NỘI DUNG CHÍNH (sau khi dữ liệu sẵn sàng) === */
				<>
					{/* Hàng bộ lọc */}
					<div className="dashboard-filter-grid">
						<fieldset className="dashboard-filter" style={{ position: "relative" }}>
							<legend className="dashboard-filter-label">Khoảng thời gian</legend>
							<div
								ref={datePickerTriggerRef}
								className="dashboard-filter-control"
								style={{ cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
								onClick={handleDatePickerToggle}
							>
								<span>{dateRange}</span>
								<span style={{ fontSize: "10px", color: "#64786a" }}>▼</span>
							</div>
							{showDatePicker && (
								<CustomDatePicker
									triggerRect={triggerRect}
									initialStartDate={parseRangeDates(dateRange).fromDate}
									initialEndDate={parseRangeDates(dateRange).toDate}
									onConfirm={handleDateConfirm}
									onCancel={() => setShowDatePicker(false)}
								/>
							)}
						</fieldset>

						<CustomSelect label={fd.droneType} value={droneModel} options={DRONE_MODEL_OPTIONS} onChange={setDroneModel} formatOption={(val) => val === "Tất cả" ? fd.all : val} />
						<CustomSelect label={fd.team} value={team} options={TEAM_OPTIONS} onChange={setTeam} formatOption={(val) => val === "Tất cả" ? fd.all : val} />
						<CustomSelect label={fd.pilot} value={pilot} options={PILOT_OPTIONS} onChange={setPilot} formatOption={(val) => val === "Tất cả" ? fd.all : val} />
					</div>

					{/* Hàng Button Hệ Thống & Checkbox Loại Chuyến Bay */}
					<div className="dashboard-flight-type-row" style={{ alignItems: 'center' }}>
						<label className="dashboard-flight-type-item">
							<input type="checkbox" checked={hideZeroArea} onChange={(e) => setHideZeroArea(e.target.checked)} />
							<span>{fd.hideZeroArea}</span>
						</label>
						{FLIGHT_TYPE_OPTIONS.map((typeName) => (
							<label key={typeName} className="dashboard-flight-type-item">
								<input type="checkbox" checked={enabledFlightTypes.has(typeName)} onChange={() => toggleFlightType(typeName)} />
								<span>{typeName === "Bay phun thuốc" ? fd.flightTypes.spray : typeName === "Bay rải hạt" ? fd.flightTypes.seed : typeName === "Bay giám sát" ? fd.flightTypes.inspect : typeName === "Bay mapping bản đồ" ? fd.flightTypes.map : typeName}</span>
							</label>
						))}

						{/* NÚT DASHBOARD (Ghim về góc phải ngoài cùng cùng hàng với các bộ lọc) */}
						<button 
							style={{ marginLeft: 'auto', backgroundColor: '#4a5e53', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 14px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s', boxShadow: '0 2px 8px rgba(74, 94, 83, 0.25)' }}
							onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3a4e43'}
							onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4a5e53'}
							onClick={() => setShowDashboardModal(true)}
						>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-4"/></svg>
							Dashboard
						</button>
					</div>

					{/* 4 Thẻ Số liệu (KPI Cards) */}
					<div className="dashboard-kpi-grid">
						{kpiCards.map((card) => (
							<article key={card.title} className="dashboard-kpi-card">
								<header className="dashboard-kpi-head">
									<span>{card.title}</span>
									<span>{card.icon}</span>
								</header>
								<p className="dashboard-kpi-value">
									{card.valueNode
										? card.valueNode
										: <>{card.value}{card.unit && <span className="dashboard-kpi-unit"> {card.unit}</span>}</>
									}
								</p>
							</article>
						))}
					</div>

					{/* Bảng Dữ Liệu */}
					<div className="dashboard-table-wrap">
						<table className="dashboard-table">
							<thead>
								<tr>
									<th><input type="checkbox" className="dashboard-table-checkbox" /></th>
									<th>{fd.flightTable.dateTime}<br />{fd.flightTable.startEnd}</th>
									<th>{fd.flightTable.location}</th>
									<th>{fd.flightTable.farmer}</th>
									<th className="text-center">{fd.flightTable.sprayArea}</th>
									<th>{fd.flightTable.duration}</th>
									<th>{fd.flightTable.droneName}</th>
									<th>{fd.flightTable.pilot1}</th>
									<th>{fd.flightTable.pilot2}</th>
									<th className="text-center">{fd.flightTable.map}</th>
								</tr>
							</thead>
							<tbody>
								{filteredRows.length === 0 && (
									<tr><td colSpan={10} className="dashboard-empty">{fd.noDataFilter}</td></tr>
								)}
								{filteredRows.map((row) => (
									<tr key={row.id} className={selectedRowId === row.id ? "selected" : ""} onClick={() => setSelectedRowId(row.id)}>
										<td className="dashboard-checkbox-cell">
											<input type="checkbox" className="dashboard-table-checkbox" checked={selectedRowId === row.id} readOnly />
										</td>
										<td>{row.dateTime}<br />{row.dateTimeEnd}</td>
										<td>{row.place.split(",").slice(0, 2).join(",")},<br />{row.place.split(",").slice(2).join(",").trimStart()}</td>
										<td>{row.farmer}</td>
										<td className="text-center">{row.areaHa} ha</td>
										<td>{row.durationText}</td>
										<td>{row.droneCode}</td>
										<td>{row.pilot1}</td>
										<td>{row.pilot2}</td>
										<td className="dashboard-map-icon-cell text-center">
											<span className="dashboard-map-icon"><IconMapGlobe /></span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Bảng Bản Đồ + Camera */}
					<div className="dashboard-below-panels">
						<MapViewer selectedRow={selectedRow} />
						<VideoStream selectedRow={selectedRow} />
					</div>
				</>
			)}

			{/* Modal Báo cáo Dashboard Tổng Hợp */}
			{showDashboardModal && <DashboardReportModal onClose={() => setShowDashboardModal(false)} />}
		</>
	);
}

export default FlightData;
