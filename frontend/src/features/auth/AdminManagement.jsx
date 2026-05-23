import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers, createUser, updateUser, toggleUserStatus } from '../../services/dashboardApi';
import './AdminManagement.css';

const DEFAULT_FORM_DATA = {
	name: "",
	email: "",
	phone: "",
	role: "Pilot",
	status: "Active"
};

function AdminManagement() {
	const [users, setUsers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	
	// Khóa thao tác
	const [isProcessing, setIsProcessing] = useState(false);
	const [toastMsg, setToastMsg] = useState("");

	// Tìm kiếm / Lọc
	const [searchTerm, setSearchTerm] = useState("");
	
	// Form State
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
	const [editTargetId, setEditTargetId] = useState(null);

	const loadData = async () => {
		setIsLoading(true);
		try {
			const data = await fetchUsers();
			setUsers(data || []);
		} catch (error) {
			console.error("Lỗi tải users", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const showToast = (msg) => {
		setToastMsg(msg);
		setTimeout(() => setToastMsg(""), 3000);
	};

	// Mở form Khởi tạo
	const handleOpenCreateForm = () => {
		setEditTargetId(null);
		setFormData(DEFAULT_FORM_DATA);
		setIsFormOpen(true);
	};

	// Mở form Chỉnh sửa
	const handleOpenEditForm = (user) => {
		setEditTargetId(user.id);
		setFormData({
			name: user.name,
			email: user.email,
			phone: user.phone,
			role: user.role,
			status: user.status
		});
		setIsFormOpen(true);
	};

	// Xử lý Thay đổi Trạng thái Trực tiếp (Khóa/Mở Khóa)
	const handleToggleStatus = async (user) => {
		if (isProcessing) return;
		// Hỏi xác nhận trước khi khóa tài khoản
		if (user.status === "Active") {
			const confirmLock = window.confirm(`Bạn có chắc muốn KHÓA tài khoản của ${user.name} không? Người này sẽ không thể đăng nhập vào GCS.`);
			if (!confirmLock) return;
		}
		
		setIsProcessing(true);
		try {
			await toggleUserStatus(user.id, user.status);
			showToast(user.status === "Active" ? `Đã khóa tài khoản ${user.name}` : `Đã mở khóa tài khoản ${user.name}`);
			loadData();
		} catch (error) {
			console.error(error);
			showToast("Có lỗi xảy ra khi đổi trạng thái!");
		} finally {
			setIsProcessing(false);
		}
	};

	// Lưu Form
	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setIsProcessing(true);

		try {
			if (editTargetId) {
				await updateUser(editTargetId, formData);
				showToast("Đã cập nhật Quản trị viên thành công!");
			} else {
				await createUser(formData);
				showToast("Đã tạo Quản trị viên mới!");
			}
			setIsFormOpen(false);
			loadData();
		} catch (err) {
			showToast("Có lỗi xảy ra, vui lòng thử lại.");
		} finally {
			setIsProcessing(false);
		}
	};

	// Tìm kiếm (Lọc dữ liệu trên danh sách)
	const filteredUsers = useMemo(() => {
		if (!searchTerm) return users;
		const s = searchTerm.toLowerCase();
		return users.filter(u => 
			u.name.toLowerCase().includes(s) || 
			u.email.toLowerCase().includes(s)
		);
	}, [users, searchTerm]);

	// Format Role để lấy class màu
	const getRoleClass = (role) => {
		switch (role) {
			case 'Super Admin': return 'role-super';
			case 'Fleet Manager': return 'role-fleet';
			case 'Pilot': return 'role-pilot';
			case 'Viewer': return 'role-viewer';
			default: return 'role-viewer';
		}
	};

	return (
		<div className="admin-management">
			{/* Banner */}
			<div className="am-banner">
				<div className="am-banner-info">
					<h1>Quản lý Cấp phép & Quản trị viên</h1>
					<p>Điều hướng người dùng và kiểm soát quyền truy cập hệ thống (RBAC).</p>
				</div>
				<button className="btn-add-admin" onClick={handleOpenCreateForm}>+ Thêm Quản trị viên</button>
			</div>

			{/* Main Content Area */}
			{isLoading ? (
				<div className="am-loading-wrapper">
					<p>Đang tải danh sách người dùng...</p>
				</div>
			) : (
				<div className="am-table-card">
					<div className="am-toolbar">
						<input 
							type="text" 
							className="am-search-input" 
							placeholder="Tìm kiếm theo Tên hoặc Email..." 
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						{/* Chỗ này có thể chèn Dropdown lọc Role ở tương quan */}
					</div>

					<div className="am-table-wrapper">
						<table className="am-table">
							<thead>
								<tr>
									<th>Hồ sơ Quản trị viên</th>
									<th>Quyền hạn (Role)</th>
									<th>Số điện thoại</th>
									<th>Đăng nhập cuối</th>
									<th>Trạng thái</th>
									<th>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{filteredUsers.length === 0 ? (
									<tr>
										<td colSpan="6" style={{textAlign: 'center', padding: '30px', color: '#888'}}>
											Không tìm thấy Quản trị viên nào phù hợp.
										</td>
									</tr>
								) : (
									filteredUsers.map(user => (
										<tr key={user.id}>
											<td>
												<div className="user-cell">
													{/* Trích xuất 2 chữ cái đầu làm Avatar */}
													<div className="user-avatar">
														{user.name.substring(0, 2).toUpperCase()}
													</div>
													<div className="user-info">
														<span className="user-name">{user.name}</span>
														<span className="user-email">{user.email}</span>
													</div>
												</div>
											</td>
											<td>
												<span className={`role-badge ${getRoleClass(user.role)}`}>
													{user.role}
												</span>
											</td>
											<td>{user.phone || 'N/A'}</td>
											<td>{user.lastLogin}</td>
											<td>
												<span className={`status-badge ${user.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
													{user.status === 'Active' ? 'Hoạt động' : 'Đã khóa'}
												</span>
											</td>
											<td>
												<div className="action-buttons">
													<button className="btn-icon" onClick={() => handleOpenEditForm(user)} title="Chỉnh sửa hồ sơ">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
													</button>
													<button 
														className={`btn-icon ${user.status === 'Active' ? 'danger' : ''}`} 
														onClick={() => handleToggleStatus(user)} 
														title={user.status === 'Active' ? "Khóa tài khoản" : "Mở khóa"}
													>
														{user.status === 'Active' ? (
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
														) : (
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
														)}
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* ==================================================== */}
			{/* MODAL: FORM TẠO/SỬA (DRAWER TỪ PHẢI SANG) */}
			{/* ==================================================== */}
			{isFormOpen && (
				<div className="am-modal-overlay" onMouseDown={(e) => { if(e.target === e.currentTarget) setIsFormOpen(false); }}>
					<form className="am-form-modal" onSubmit={handleFormSubmit} onMouseDown={(e) => e.stopPropagation()}>
						<div className="am-modal-header">
							<h2>{editTargetId ? "Cập nhật Quản trị viên" : "Tạo Tài khoản mới"}</h2>
							<button type="button" className="am-close-btn" onClick={() => setIsFormOpen(false)} disabled={isProcessing}>&times;</button>
						</div>
						
						<div className="am-modal-body">
							<div className="am-form-row">
								<label>Họ và Tên *</label>
								<input required type="text" className="am-form-input" placeholder="Nhập họ và tên..." value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
							</div>
							
							<div className="am-form-row">
								<label>Email đăng nhập *</label>
								<input required type="email" className="am-form-input" placeholder="email@mismart.ai" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
							</div>
							
							<div className="am-form-row">
								<label>Số điện thoại</label>
								<input type="text" className="am-form-input" placeholder="0987..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
							</div>

							<div className="am-form-row">
								<label>Vai trò / Quyền hạn (Role) *</label>
								<select className="am-form-select" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
									<option value="Super Admin">Trưởng nền tảng (Super Admin)</option>
									<option value="Fleet Manager">Quản lý Đội bay (Fleet Manager)</option>
									<option value="Pilot">Phi công (Pilot/Operator)</option>
									<option value="Viewer">Khách hàng (Viewer)</option>
								</select>
							</div>

							<div className="am-form-row">
								<label>Trạng thái</label>
								<select className="am-form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
									<option value="Active">Cho phép Đăng nhập (Active)</option>
									<option value="Inactive">Tạm khóa (Inactive)</option>
								</select>
							</div>
						</div>

						<div className="am-modal-actions">
							<button type="button" className="am-btn am-btn-cancel" onClick={() => setIsFormOpen(false)} disabled={isProcessing}>Hủy bỏ</button>
							<button type="submit" className="am-btn am-btn-primary" disabled={isProcessing}>
								{isProcessing ? "Đang xử lý..." : "Lưu thay đổi"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* ==================================================== */}
			{/* TOAST THÔNG BÁO */}
			{/* ==================================================== */}
			<div className={`am-toast ${toastMsg ? 'active' : ''}`}>
				{toastMsg}
			</div>

		</div>
	);
}

export default AdminManagement;
