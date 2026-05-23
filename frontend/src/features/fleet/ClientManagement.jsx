import React, { useState, useEffect, useMemo } from 'react';
import { fetchClients, createClient, updateClient, deleteClient } from '../../services/dashboardApi';
import './ClientManagement.css';

const DEFAULT_FORM_DATA = {
	companyName: "",
	contactName: "",
	phone: "",
	email: "",
	taxId: "",
	address: "",
	linkedViewerAccountId: "",
	status: "Active"
};

function ClientManagement() {
	const [clients, setClients] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	
	const [isProcessing, setIsProcessing] = useState(false);
	const [toastMsg, setToastMsg] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	
	// Mode quản lý Form/Detail
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isDetailOpen, setIsDetailOpen] = useState(false);
	const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
	const [editTargetId, setEditTargetId] = useState(null);
	const [detailTarget, setDetailTarget] = useState(null); // Lưu object khách hàng đang xem

	const loadData = async () => {
		setIsLoading(true);
		try {
			const data = await fetchClients();
			setClients(data || []);
		} catch (error) {
			console.error("Lỗi tải data client", error);
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

	const handleOpenCreateForm = () => {
		setEditTargetId(null);
		setFormData(DEFAULT_FORM_DATA);
		setIsFormOpen(true);
		setIsDetailOpen(false);
	};

	const handleOpenEditForm = (client) => {
		setEditTargetId(client.id);
		setFormData({
			companyName: client.companyName,
			contactName: client.contactName,
			phone: client.phone,
			email: client.email,
			taxId: client.taxId,
			address: client.address,
			linkedViewerAccountId: client.linkedViewerAccountId,
			status: client.status
		});
		setIsFormOpen(true);
		setIsDetailOpen(false);
	};

	const handleOpenDetail = (client) => {
		setDetailTarget(client);
		setIsDetailOpen(true);
		setIsFormOpen(false);
	};

	const handleDelete = async (client) => {
		if (client.stats.totalFlights > 0) {
			alert(`Không thể xoá vĩnh viễn khách hàng [${client.companyName}] vì họ đã có lịch sử bay (${client.stats.totalFlights} chuyến). Vui lòng chọn "Sửa" và Gỡ trạng thái (Inactive) thay thế.`);
			return;
		}

		if (window.confirm(`Bạn có chắc muốn xóa khách hàng ${client.companyName} không? Hành động này không thể hoàn tác.`)) {
			setIsProcessing(true);
			try {
				await deleteClient(client.id);
				showToast("Đã xóa khách hàng thành công!");
				loadData();
			} catch (err) {
				showToast("Xóa thất bại!");
			} finally {
				setIsProcessing(false);
			}
		}
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();
		setIsProcessing(true);

		try {
			if (editTargetId) {
				await updateClient(editTargetId, formData);
				showToast("Cập nhật thành công!");
				// Cập nhật lại màn hình detail nếu đang mở đè
				if (detailTarget && detailTarget.id === editTargetId) {
					setDetailTarget({ ...detailTarget, ...formData });
				}
			} else {
				await createClient(formData);
				showToast("Đã thêm khách hàng/đối tác mới!");
			}
			setIsFormOpen(false);
			loadData();
		} catch (err) {
			showToast("Có lỗi xảy ra, vui lòng thử lại.");
		} finally {
			setIsProcessing(false);
		}
	};

	// Lọc tìm kiếm
	const filteredClients = useMemo(() => {
		if (!searchTerm) return clients;
		const s = searchTerm.toLowerCase();
		return clients.filter(c => 
			c.companyName.toLowerCase().includes(s) || 
			c.taxId?.toLowerCase().includes(s) ||
			c.email.toLowerCase().includes(s)
		);
	}, [clients, searchTerm]);

	return (
		<div className="client-management">
			{/* Banner */}
			<div className="cm-banner">
				<div className="cm-banner-info">
					<h1>Quản lý Khách hàng & Đối Tác</h1>
					<p>Hồ sơ đối tác, liên kết tài khoản Viewer và thống kê dữ liệu bay quy đổi.</p>
				</div>
				<button className="btn-add-client" onClick={handleOpenCreateForm}>+ Thêm Đối tác</button>
			</div>

			{/* Main Content Area */}
			{isLoading ? (
				<div className="cm-loading-wrapper">
					<p>Đang tải dữ liệu hồ sơ...</p>
				</div>
			) : (
				<div className="cm-table-card">
					<div className="cm-toolbar">
						<input 
							type="text" 
							className="cm-search-input" 
							placeholder="Tìm kiếm theo Tên công ty, Email, hoặc Mã Số Thuế..." 
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="cm-table-wrapper">
						<table className="cm-table">
							<thead>
								<tr>
									<th>Tổ chức / Doanh nghiệp</th>
									<th>Liên hệ</th>
									<th>Mã số Thuế</th>
									<th>Tổng Chuyến</th>
									<th>Diện tích (Ha)</th>
									<th>Portal/Viewer</th>
									<th>Thao tác</th>
								</tr>
							</thead>
							<tbody>
								{filteredClients.length === 0 ? (
									<tr>
										<td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#888'}}>
											Chưa có dữ liệu khách hàng.
										</td>
									</tr>
								) : (
									filteredClients.map(c => (
										<tr key={c.id}>
											<td>
												<div className="company-cell">
													<div className="company-logo-placeholder">
														{c.companyName.substring(0, 1).toUpperCase()}
													</div>
													<div className="company-info">
														<span className="company-name">{c.companyName}</span>
														<span className="company-tax">{c.address}</span>
													</div>
												</div>
											</td>
											<td>
												<div style={{fontSize: '13px', fontWeight: 600, color: '#4b5a50'}}>{c.contactName}</div>
												<div style={{fontSize: '12px', color: '#888'}}>{c.phone}</div>
											</td>
											<td>{c.taxId || 'N/A'}</td>
											<td><span className="stat-badge">{c.stats.totalFlights}</span></td>
											<td><span className={`stat-badge ${c.stats.totalAreaHa > 0 ? 'highlight' : ''}`}>{c.stats.totalAreaHa}</span></td>
											<td>
												{c.linkedViewerAccountId ? (
													<span style={{color: '#388e3c', fontSize: '12px', fontWeight: 'bold'}}>Đã liên kết (Portal)</span>
												) : (
													<span style={{color: '#999', fontSize: '12px'}}>Chưa kết nối</span>
												)}
											</td>
											<td>
												<div className="action-buttons">
													<button className="btn-icon" onClick={() => handleOpenDetail(c)} title="Xem chi tiết">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
													</button>
													<button className="btn-icon" onClick={() => handleOpenEditForm(c)} title="Chỉnh sửa">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
													</button>
													<button className="btn-icon danger" onClick={() => handleDelete(c)} title="Xoá">
														<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
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
				<div className="cm-modal-overlay" onMouseDown={(e) => { if(e.target === e.currentTarget) setIsFormOpen(false); }}>
					<form className="cm-form-modal" onSubmit={handleFormSubmit} onMouseDown={(e) => e.stopPropagation()}>
						<div className="cm-modal-header">
							<h2>{editTargetId ? "Cập nhật Hồ sơ Khách hàng" : "Hồ sơ mới"}</h2>
							<button type="button" className="cm-close-btn" onClick={() => setIsFormOpen(false)} disabled={isProcessing}>&times;</button>
						</div>
						
						<div className="cm-modal-body">
							<div className="cm-form-row">
								<label>Tên Doanh nghiệp / Tổ chức *</label>
								<input required type="text" className="cm-form-input" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
							</div>
							
							<div className="cm-form-row" style={{display: 'flex', gap: '12px'}}>
								<div style={{flex: 1}}>
									<label>Người liên hệ</label>
									<input type="text" className="cm-form-input" value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
								</div>
								<div style={{flex: 1}}>
									<label>SĐT liên hệ</label>
									<input type="text" className="cm-form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
								</div>
							</div>

							<div className="cm-form-row" style={{display: 'flex', gap: '12px'}}>
								<div style={{flex: 1}}>
									<label>Email *</label>
									<input required type="email" className="cm-form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
								</div>
								<div style={{flex: 1}}>
									<label>Mã số Thuế (Tax ID)</label>
									<input type="text" className="cm-form-input" value={formData.taxId} onChange={e => setFormData({...formData, taxId: e.target.value})} />
								</div>
							</div>

							<div className="cm-form-row">
								<label>Địa chỉ công ty / Hóa đơn</label>
								<textarea className="cm-form-textarea" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
							</div>

							<div className="cm-form-row" style={{background: '#f9fbf9', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8e4'}}>
								<label style={{color: '#1976d2'}}>Liên kết Cổng thông tin (Client Portal)</label>
								<p style={{fontSize: '12px', color: '#666', marginTop: 0, marginBottom: '12px'}}>Nhập ID tài khoản Viewer để khách hàng có thể đăng nhập xem dữ liệu bay của họ.</p>
								<input type="text" className="cm-form-input" placeholder="VD: USR-004..." value={formData.linkedViewerAccountId} onChange={e => setFormData({...formData, linkedViewerAccountId: e.target.value})} />
							</div>
						</div>

						<div className="cm-modal-actions">
							<button type="button" className="cm-btn cm-btn-cancel" onClick={() => setIsFormOpen(false)} disabled={isProcessing}>Hủy bỏ</button>
							<button type="submit" className="cm-btn cm-btn-primary" disabled={isProcessing}>
								{isProcessing ? "Đang xử lý..." : "Lưu hồ sơ"}
							</button>
						</div>
					</form>
				</div>
			)}

			{/* ==================================================== */}
			{/* MODAL: XEM CHI TIẾT CRM (DRAWER LỚN) */}
			{/* ==================================================== */}
			{isDetailOpen && detailTarget && (
				<div className="cm-modal-overlay" onMouseDown={(e) => { if(e.target === e.currentTarget) setIsDetailOpen(false); }}>
					<div className="cm-detail-modal" onMouseDown={(e) => e.stopPropagation()}>
						<div className="cm-modal-header">
							<h2>Hồ sơ & Dữ liệu Khách hàng</h2>
							<button type="button" className="cm-close-btn" onClick={() => setIsDetailOpen(false)}>&times;</button>
						</div>
						<div className="cm-detail-body">
							
							<div className="cm-profile-card">
								<div className="cm-profile-avatar">
									{detailTarget.companyName.substring(0, 1).toUpperCase()}
								</div>
								<div className="cm-profile-info">
									<h3>{detailTarget.companyName}</h3>
									<p>📍 {detailTarget.address}</p>
									<p>✉️ {detailTarget.email} | 📞 {detailTarget.phone}</p>
									<p>MST: {detailTarget.taxId || 'Chưa cập nhật'}</p>
								</div>
								<div>
									<button className="cm-btn cm-btn-cancel" onClick={() => handleOpenEditForm(detailTarget)}>Chỉnh sửa</button>
								</div>
							</div>

							<h4 style={{marginTop: 0, marginBottom: '16px', color: '#4b5a50', borderBottom: '1px solid #e2e8e4', paddingBottom: '8px'}}>Tổng quan Vận hành Nền tảng</h4>
							
							<div className="cm-stats-grid">
								<div className="cm-stat-box">
									<h4>TỔNG CHUYẾN BAY</h4>
									<div>
										<span className="str-val">{detailTarget.stats.totalFlights}</span>
										<span className="str-unit">chuyến</span>
									</div>
								</div>
								<div className="cm-stat-box">
									<h4>DIỆN TÍCH PHUN/RẢI</h4>
									<div>
										<span className="str-val">{detailTarget.stats.totalAreaHa}</span>
										<span className="str-unit">hecta</span>
									</div>
								</div>
								<div className="cm-stat-box">
									<h4>GIỜ BAY TÍCH LŨY</h4>
									<div>
										<span className="str-val">{detailTarget.stats.totalFlightHours}</span>
										<span className="str-unit">giờ</span>
									</div>
								</div>
							</div>

							<div style={{background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)'}}>
								<h4 style={{margin: '0 0 12px 0', color: '#2e7d32'}}>🔑 Thông tin Cổng Client Portal</h4>
								{detailTarget.linkedViewerAccountId ? (
									<>
										<p style={{fontSize: '14px', margin: '0 0 8px 0'}}>Khách hàng này ĐÃ ĐƯỢC CẤP QUYỀN đăng nhập theo dõi Cổng thông tin 3D/Report.</p>
										<p style={{fontSize: '14px', margin: '0', color: '#666'}}>ID Liên kết với Admin System: <strong>{detailTarget.linkedViewerAccountId}</strong></p>
									</>
								) : (
									<p style={{fontSize: '14px', margin: 0, color: '#888'}}>Khách hàng này hiện chưa được liên kết với một tài khoản (Viewer) nào. Hãy chỉnh sửa hồ sơ và gắn ID truy cập cho họ.</p>
								)}
							</div>

						</div>
					</div>
				</div>
			)}

			{/* ==================================================== */}
			{/* TOAST THÔNG BÁO */}
			{/* ==================================================== */}
			<div className={`am-toast ${toastMsg ? 'active' : ''}`} style={{position: 'fixed', bottom: toastMsg ? '30px' : '-40px', left: '50%', transform: 'translateX(-50%)', background: '#388e3c', color: '#fff', padding: '12px 24px', borderRadius: '20px', zIndex: 10000, transition: 'bottom 0.3s'}}>
				{toastMsg}
			</div>

		</div>
	);
}

export default ClientManagement;
