import React, { useState, useEffect } from 'react';
import { fetchDroneTypes, createDroneType, updateDroneType, deleteDroneType } from '../../services/dashboardApi';
import './DroneTypeManagement.css';

const DEFAULT_FORM_DATA = {
	avatar: "", name: "", manufacturer: "DJI",
	frameClass: "Quadcopter", wheelbase: "",
	maxSpeed: "", maxWindResistance: "", maxFlightTime: "", maxPayload: "",
	standardBattery: "", batteryCount: 1,
	supportedSensors: "", missionTypes: ""
};

/**
 * ============================================================
 * COMPONENT: DroneTypeManagement
 * ============================================================
 * Handles CRUD operations for Drone Profiles.
 * Follows 3-Layer Mock Data Architecture.
 * ============================================================
 */
function DroneTypeManagement() {
	// --- Lớp 1: Khai báo State Quản lý Giao diện ---
	const [droneTypes, setDroneTypes] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	// State cho Form Modal (Tạo Mới / Chỉnh Sửa)
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
	const [editTargetId, setEditTargetId] = useState(null); // Null = Chế độ Tạo mới, Có giá trị = Chế độ Sửa

	// State cho Delete Dialog Xóa
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [deleteTargetId, setDeleteTargetId] = useState(null);

	// Thao tác mạng đang chạy (Chống User bấm double)
	const [isProcessing, setIsProcessing] = useState(false);

	// Toaster thông báo
	const [toastMsg, setToastMsg] = useState("");

	// State cho Drag & Drop Upload
	const [isDragActive, setIsDragActive] = useState(false);

	const handleImageChange = (file) => {
		if (file && file.type.startsWith("image/")) {
			const reader = new FileReader();
			reader.onload = (e) => {
				setFormData({ ...formData, avatar: e.target.result });
			};
			reader.readAsDataURL(file);
		} else {
			showToast("Vui lòng chọn file ảnh hợp lệ.");
		}
	};

	// --- Lifecycle Load Dữ Liệu Lần Đầu ---
	const loadData = async () => {
		setIsLoading(true);
		const data = await fetchDroneTypes();
		setDroneTypes(data);
		setIsLoading(false);
	};

	useEffect(() => {
		loadData();
	}, []);

	// --- Tiện ích hiển thị Thông báo (Toast) ---
	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(""), 3000);
	};

	// ==========================================
	// CHỨC NĂNG 1: TẠO MỚI & CHỈNH SỬA (Form)
	// ==========================================
	const handleOpenCreateForm = () => {
		setEditTargetId(null);
		setFormData(DEFAULT_FORM_DATA);
		setIsFormOpen(true);
	};

	const handleOpenEditForm = (dt) => {
		setEditTargetId(dt.id);
		// Pre-fill dữ liệu từ thẻ Card vào Form
		setFormData({
			...dt,
			supportedSensors: Array.isArray(dt.supportedSensors) ? dt.supportedSensors.join(", ") : dt.supportedSensors,
			missionTypes: Array.isArray(dt.missionTypes) ? dt.missionTypes.join(", ") : dt.missionTypes
		});
		setIsFormOpen(true);
	};

	const handleCloseForm = () => {
		if (isProcessing) return; // Đang lưu thì không cho đóng
		setIsFormOpen(false);
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setIsProcessing(true);

		// Format các trường Array (Dấu phẩy phân cách -> Mảng) để lưu Data đúng chuẩn
		const payload = {
			...formData,
			supportedSensors: formData.supportedSensors.split(",").map(s => s.trim()).filter(s => s),
			missionTypes: formData.missionTypes.split(",").map(m => m.trim()).filter(m => m)
		};

		try {
			if (editTargetId) {
				// Gọi API Sửa
				await updateDroneType(editTargetId, payload);
				showToast("Đã cập nhật cấu hình thành công!");
			} else {
				// Gọi API Tạo Mới
				await createDroneType(payload);
				showToast("Đã tạo Loại Drone mới thành công!");
			}
			setIsFormOpen(false);
			await loadData(); // Load lại lưới Grid
		} catch (error) {
			console.error(error);
			showToast("Có lỗi xảy ra khi lưu dữ liệu.");
		} finally {
			setIsProcessing(false);
		}
	};

	// ==========================================
	// CHỨC NĂNG 2: XÓA CẤU HÌNH (Delete)
	// ==========================================
	const handleOpenDelete = (id) => {
		setDeleteTargetId(id);
		setIsDeleteOpen(true);
	};

	const handleCloseDelete = () => {
		if (isProcessing) return;
		setIsDeleteOpen(false);
		setDeleteTargetId(null);
	};

	const submitDelete = async () => {
		setIsProcessing(true);
		try {
			await deleteDroneType(deleteTargetId);
			showToast("Đã xóa Loại Drone hoàn tất.");
			setIsDeleteOpen(false);
			setDeleteTargetId(null);
			await loadData();
		} catch (error) {
			console.error(error);
			showToast("Lỗi khi xóa dữ liệu.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<div className="drone-type-management">
			<div className="drone-type-banner">
				<h1>Thiết lập Loại Drone</h1>
				<p>Quản lý các cấu hình tiêu chuẩn và giới hạn an toàn cho từng loại máy bay.</p>
			</div>

			{/* Toast Notification */}
			{toastMsg && (
				<div className="dt-toast active">
					{toastMsg}
				</div>
			)}

			{isLoading ? (
				<div className="drone-type-loading">
					<svg width="80" height="80" viewBox="0 0 32 32" className="spinning-logo">
						<polygon points="13,0 32,7 32,25 13,32 0,16" className="spinning-hexagon" />
						<text x="18" y="16" textAnchor="middle" dominantBaseline="central" fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize="14" fill="#fff" className="spinning-text">mi</text>
					</svg>
					<p>Đang tải dữ liệu cấu hình...</p>
				</div>
			) : (
				<div className="drone-type-grid">
					{droneTypes.map((dt) => (
						<div key={dt.id} className="drone-type-card">
							<div className="dt-card-header">
								<div className="dt-avatar-wrapper">
									<img 
										src={dt.avatar || 'https://placehold.co/60x60/e2e8e4/64786a?text=VTOL'} 
										alt={dt.name} 
										className="dt-avatar"
										onError={(e) => {
											e.target.onerror = null; 
											e.target.src = `https://placehold.co/60x60/e2e8e4/64786a?text=${encodeURIComponent(dt.name.substring(0,3).toUpperCase())}`;
										}} 
									/>
								</div>
								<div className="dt-title-group">
									<h2>{dt.name}</h2>
									<span className="dt-manufacturer-badge">{dt.manufacturer}</span>
								</div>
							</div>

							<div className="dt-card-body">
								<div className="dt-section">
									<h3><i className="icon-frame"></i> Cấu hình Khí động học</h3>
									<div className="dt-info-grid">
										<div className="dt-info-item">
											<span className="dt-label">Loại khung</span>
											<span className="dt-value">{dt.frameClass}</span>
										</div>
										<div className="dt-info-item">
											<span className="dt-label">Kích thước</span>
											<span className="dt-value">{dt.wheelbase}</span>
										</div>
									</div>
								</div>

								<div className="dt-section">
									<h3><i className="icon-performance"></i> Giới hạn Hiệu năng</h3>
									<div className="dt-info-grid">
										<div className="dt-info-item highlight-red">
											<span className="dt-label">Vận tốc Max</span>
											<span className="dt-value">{dt.maxSpeed}</span>
										</div>
										<div className="dt-info-item highlight-blue">
											<span className="dt-label">Kháng gió Max</span>
											<span className="dt-value">{dt.maxWindResistance}</span>
										</div>
										<div className="dt-info-item highlight-green">
											<span className="dt-label">Bay tối đa</span>
											<span className="dt-value">{dt.maxFlightTime}</span>
										</div>
										<div className="dt-info-item">
											<span className="dt-label">Tải trọng Max</span>
											<span className="dt-value">{dt.maxPayload}</span>
										</div>
									</div>
								</div>

								<div className="dt-section">
									<h3><i className="icon-battery"></i> Năng lượng</h3>
									<div className="dt-info-grid">
										<div className="dt-info-item">
											<span className="dt-label">Pin chuẩn</span>
											<span className="dt-value">{dt.standardBattery}</span>
										</div>
										<div className="dt-info-item">
											<span className="dt-label">Số lượng pin</span>
											<span className="dt-value">{dt.batteryCount}</span>
										</div>
									</div>
								</div>

								<div className="dt-section">
									<h3><i className="icon-mission"></i> Khả năng Nhiệm vụ</h3>
									<div className="dt-tags-container">
										<span className="dt-tag-label">Camera/Cảm biến:</span>
										<div className="dt-tags">
											{(Array.isArray(dt.supportedSensors) ? dt.supportedSensors : []).map(sensor => (
												<span key={sensor} className="dt-tag dt-tag-sensor">{sensor}</span>
											))}
										</div>
									</div>
									<div className="dt-tags-container">
										<span className="dt-tag-label">Ứng dụng:</span>
										<div className="dt-tags">
											{(Array.isArray(dt.missionTypes) ? dt.missionTypes : []).map(mission => (
												<span key={mission} className="dt-tag dt-tag-mission">{mission}</span>
											))}
										</div>
									</div>
								</div>
							</div>

							<div className="dt-card-footer">
								<button className="dt-btn-edit" onClick={() => handleOpenEditForm(dt)}>Chỉnh sửa</button>
								<button className="dt-btn-delete" onClick={() => handleOpenDelete(dt.id)}>Xóa</button>
							</div>
						</div>
					))}
					
					{/* Add New Profile Card */}
					<div className="drone-type-card dt-add-card" onClick={handleOpenCreateForm}>
						<div className="dt-add-content">
							<div className="dt-add-icon">+</div>
							<h3>Tạo Loại Drone mới</h3>
							<p>Định nghĩa một cấu hình khung máy bay hoặc giao thức mới cho hệ thống dự án MAVLink</p>
						</div>
					</div>
				</div>
			)}

			{/* ==================================================== */}
			{/* MODAL 1: FORM TẠO/SỬA */}
			{/* Dùng Drawer (Cạnh phải) cho Sửa, Modal (Trung tâm) cho Tạo mới */}
			{/* ==================================================== */}
			{isFormOpen && (
				<div className={`dt-modal-overlay ${!editTargetId ? 'center' : ''}`}>
					<div className={`dt-form-modal ${!editTargetId ? 'center-pop' : ''}`}>
						<div className="dt-modal-header">
							<h2>{editTargetId ? "Cập nhật Loại Drone" : "Tạo Loại Drone Mới"}</h2>
							<button className="close-btn" onClick={handleCloseForm} disabled={isProcessing}>&times;</button>
						</div>
						
						<form onSubmit={handleFormSubmit} className="dt-modal-body">
							<div className="dt-form-group-title">1. Định danh chung</div>
							<div className="dt-form-row">
								<div className="dt-form-field full-width">
									<label>Tên Hệ thống / Model *</label>
									<input required type="text" placeholder="DJI Matrice 300 RTK..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
								</div>
							</div>
							<div className="dt-form-row">
								<div className="dt-form-field">
									<label>Hãng sản xuất *</label>
									<select value={formData.manufacturer} onChange={e => setFormData({...formData, manufacturer: e.target.value})}>
										<option value="DJI">DJI</option>
										<option value="Autel">Autel</option>
										<option value="Skydio">Skydio</option>
										<option value="Custom Build">Custom Build (MAVLink)</option>
									</select>
								</div>
								<div className="dt-form-field">
									<label>Ảnh đại diện (Avatar)</label>
									{!formData.avatar ? (
										<div 
											className={`dt-file-upload-zone ${isDragActive ? 'drag-active' : ''}`}
											onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
											onDragLeave={() => setIsDragActive(false)}
											onDrop={(e) => {
												e.preventDefault();
												setIsDragActive(false);
												if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
													handleImageChange(e.dataTransfer.files[0]);
												}
											}}
											onClick={() => document.getElementById('dt-avatar-upload').click()}
										>
											<input 
												id="dt-avatar-upload" 
												type="file" 
												accept="image/*" 
												style={{ display: 'none' }} 
												onChange={(e) => {
													if (e.target.files && e.target.files.length > 0) {
														handleImageChange(e.target.files[0]);
													}
												}} 
											/>
											<div className="upload-icon">
												<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#64786A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
													<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
													<polyline points="17 8 12 3 7 8"></polyline>
													<line x1="12" y1="3" x2="12" y2="15"></line>
												</svg>
											</div>
											<span>Kéo thả ảnh vào đây<br/>hoặc <b>bấm để tải lên</b></span>
										</div>
									) : (
										<div className="dt-file-preview-zone">
											<img src={formData.avatar} alt="Preview" className="dt-preview-img" />
											<button type="button" className="btn-remove-img" onClick={() => setFormData({...formData, avatar: ''})}>Xóa ảnh</button>
										</div>
									)}
								</div>
							</div>

							<div className="dt-form-group-title">2. Cấu hình Khí động học</div>
							<div className="dt-form-row">
								<div className="dt-form-field">
									<label>Loại Khung (Frame) *</label>
									<select value={formData.frameClass} onChange={e => setFormData({...formData, frameClass: e.target.value})}>
										<option value="Quadcopter">Quadcopter</option>
										<option value="Hexacopter">Hexacopter</option>
										<option value="Octocopter">Octocopter</option>
										<option value="Fixed-wing">Fixed-wing</option>
										<option value="VTOL">VTOL</option>
									</select>
								</div>
								<div className="dt-form-field">
									<label>Kích thước / Sải cánh</label>
									<input type="text" placeholder="VD: 500 mm" value={formData.wheelbase} onChange={e => setFormData({...formData, wheelbase: e.target.value})} />
								</div>
							</div>

							<div className="dt-form-group-title">3. Giới hạn Hiệu năng</div>
							<div className="dt-form-row">
								<div className="dt-form-field">
									<label>Vận tốc Max</label>
									<input type="text" placeholder="VD: 20 m/s" value={formData.maxSpeed} onChange={e => setFormData({...formData, maxSpeed: e.target.value})} />
								</div>
								<div className="dt-form-field">
									<label>Kháng gió tối đa</label>
									<input type="text" placeholder="VD: 15 m/s" value={formData.maxWindResistance} onChange={e => setFormData({...formData, maxWindResistance: e.target.value})} />
								</div>
							</div>
							<div className="dt-form-row">
								<div className="dt-form-field">
									<label>Tải trọng thao tác</label>
									<input type="text" placeholder="VD: 2.5 kg" value={formData.maxPayload} onChange={e => setFormData({...formData, maxPayload: e.target.value})} />
								</div>
								<div className="dt-form-field">
									<label>Thời gian bay lý thuyết</label>
									<input type="text" placeholder="VD: 45 phút" value={formData.maxFlightTime} onChange={e => setFormData({...formData, maxFlightTime: e.target.value})} />
								</div>
							</div>

							<div className="dt-form-group-title">4. Năng lượng & Ứng dụng</div>
							<div className="dt-form-row">
								<div className="dt-form-field">
									<label>Model Pin tiêu chuẩn</label>
									<input type="text" placeholder="VD: TB65" value={formData.standardBattery} onChange={e => setFormData({...formData, standardBattery: e.target.value})} />
								</div>
								<div className="dt-form-field">
									<label>Số lượng Pin khi bay</label>
									<input type="number" min="1" value={formData.batteryCount} onChange={e => setFormData({...formData, batteryCount: e.target.value})} />
								</div>
							</div>
							<div className="dt-form-row">
								<div className="dt-form-field full-width">
									<label>Cảm biến được hỗ trợ (Cách nhau dấu phẩy)</label>
									<input type="text" placeholder="RGB, Thermal, LiDAR..." value={formData.supportedSensors} onChange={e => setFormData({...formData, supportedSensors: e.target.value})} />
								</div>
							</div>
							<div className="dt-form-row">
								<div className="dt-form-field full-width">
									<label>Loại Nhiệm vụ phù hợp (Cách nhau dấu phẩy)</label>
									<input type="text" placeholder="Mapping, Inspection..." value={formData.missionTypes} onChange={e => setFormData({...formData, missionTypes: e.target.value})} />
								</div>
							</div>

							<div className="dt-modal-actions">
								<button type="button" className="btn-cancel" onClick={handleCloseForm} disabled={isProcessing}>Hủy bỏ</button>
								<button type="submit" className="btn-primary" disabled={isProcessing}>
									{isProcessing ? "Đang lưu..." : (editTargetId ? "Cập nhật" : "Tạo cấu hình")}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* ==================================================== */}
			{/* MODAL 2: CONFIRM DELETE DIALOG (Cảnh báo chống xóa nhầm) */}
			{/* ==================================================== */}
			{isDeleteOpen && (
				<div className="dt-modal-overlay center">
					<div className="dt-dialog-modal">
						<div className="dt-dialog-icon">⚠️</div>
						<h3>Cảnh báo Xóa</h3>
						<p>Khung máy bay và các giới hạn tham số của <strong>Loại thiết bị này</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.</p>
						<p className="dt-warning-text">Hành động này không thể hoàn tác.</p>
						
						<div className="dt-dialog-actions">
							<button className="btn-cancel" onClick={handleCloseDelete} disabled={isProcessing}>Hủy bỏ</button>
							<button className="btn-danger" onClick={submitDelete} disabled={isProcessing}>
								{isProcessing ? "Đang xử lý..." : "Đồng ý Xóa"}
							</button>
						</div>
					</div>
				</div>
			)}

		</div>
	);
}

export default DroneTypeManagement;
