import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { fetchBatteries, createBattery, updateBattery, deleteBattery } from './batteryMockData';
import './BatteryManagement.css';

const DEFAULT_FORM_DATA = {
  email: "",
  serialNumber: "",
  owner: "",
  imageUrl: "",
  status: "active"
};

const PAGE_SIZE = 5;

function BatteryLoadingScreen({ text }) {
  return (
    <div className="battery-management-loading">
      <svg width="80" height="80" viewBox="0 0 32 32" className="spinning-logo">
        <polygon points="13,0 32,7 32,25 13,32 0,16" className="spinning-hexagon" />
        <text x="18" y="16" textAnchor="middle" dominantBaseline="central" fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize="14" fill="#fff">mi</text>
      </svg>
      <p className="loading-text">{text}</p>
    </div>
  );
}

const BatterySelect = ({ value, onChange, options, disabled, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [triggerRect, setTriggerRect] = useState(null);
  const triggerRef = useRef(null);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const dropdownStyle = triggerRect
    ? {
        top: triggerRect.bottom + 4,
        left: triggerRect.left,
        width: triggerRect.width,
        position: 'fixed',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.13)',
        zIndex: 9999,
        border: '1px solid #d2ded7',
        overflow: 'hidden',
      }
    : {};

  const displayLabel = options.find(o => o.value === value)?.label || placeholder || 'Chọn...';

  return (
    <>
      <div
        ref={triggerRef}
        className={`battery-custom-select ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
      >
        <span className={!value ? 'placeholder' : ''}>{displayLabel}</span>
        <span className={`arrow ${isOpen ? 'expanded' : ''}`}>▼</span>
      </div>
      {isOpen && !disabled && ReactDOM.createPortal(
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
            onClick={() => setIsOpen(false)}
          />
          <div style={dropdownStyle}>
            {options.map((opt) => (
              <div
                key={opt.value}
                className={`battery-select-option ${value === opt.value ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

function BatteryManagement() {
  const [mapRows, setMapRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuRowId, setActiveMenuRowId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingMapId, setEditingMapId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [formState, setFormState] = useState(DEFAULT_FORM_DATA);
  const [isDragActive, setIsDragActive] = useState(false);

  const menuRef = useRef(null);

  const isReadOnlyModal = modalMode === "view";

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchBatteries();
      setMapRows(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    const closeMenuIfOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuRowId("");
      }
    };
    document.addEventListener("mousedown", closeMenuIfOutside);
    return () => {
      document.removeEventListener("mousedown", closeMenuIfOutside);
    };
  }, []);

  useEffect(() => {
    if (!isModalOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isModalOpen]);

  const filteredRows = useMemo(() => {
    const normalizedKeyword = searchText.trim().toLowerCase();
    if (!normalizedKeyword) return mapRows;
    return mapRows.filter((row) => {
      const searchableText = `${row.id} ${row.owner} ${row.email}`.toLowerCase();
      return searchableText.includes(normalizedKeyword);
    });
  }, [mapRows, searchText]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  const resetModalState = () => {
    setFormError("");
    setIsSaving(false);
    setEditingMapId("");
    setFormState(DEFAULT_FORM_DATA);
  };

  const openCreateModal = () => {
    resetModalState();
    setModalMode("create");
    setIsModalOpen(true);
  };

  const openViewOrEditModal = (row, mode) => {
    setFormError("");
    setModalMode(mode);
    setEditingMapId(row.id);
    setFormState({
      email: row.email || "",
      serialNumber: row.id || "",
      owner: row.owner || "",
      imageUrl: row.imageUrl || "",
      status: row.status || "active"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (rowId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa pin này?");
    if (!confirmed) return;
    await deleteBattery(rowId);
    setMapRows((prev) => prev.filter((item) => item.id !== rowId));
    setActiveMenuRowId("");
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormState({ ...formState, imageUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalSubmit = async (event) => {
    event.preventDefault();

    if (isReadOnlyModal) {
      setIsModalOpen(false);
      return;
    }

    if (!formState.email.trim()) {
      setFormError("Vui lòng nhập Email.");
      return;
    }

    if (!formState.serialNumber.trim()) {
      setFormError("Vui lòng nhập Mã pin / Serial.");
      return;
    }

    setFormError("");
    setIsSaving(true);

    const payload = {
      id: formState.serialNumber.trim(),
      email: formState.email.trim(),
      owner: formState.owner,
      imageUrl: formState.imageUrl,
      status: formState.status
    };

    try {
      if (modalMode === "create") {
        const created = await createBattery(payload);
        setMapRows((prev) => [created, ...prev]);
      } else if (modalMode === "edit") {
        const updated = await updateBattery(editingMapId, payload);
        setMapRows((prev) => prev.map((row) => (row.id === editingMapId ? updated : row)));
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError("Đã xảy ra lỗi khi lưu dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="battery-management-page">
      <div className="battery-management-header">
        <h1>Quản lý pin</h1>
        <button type="button" className="battery-management-primary-btn" onClick={openCreateModal}>
          + Thêm pin
        </button>
      </div>

      <section className="battery-management-table-card">
        <header className="battery-management-table-toolbar">
          <h2>Danh sách pin</h2>
          <div className="battery-management-search-wrap">
            <input
              type="text"
              placeholder="Nhập mã pin, email hoặc chủ sở hữu"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value);
                setCurrentPage(1);
              }}
            />
            <span aria-hidden="true">⌕</span>
          </div>
        </header>

        {isLoading ? (
          <BatteryLoadingScreen text="Đang tải dữ liệu pin..." />
        ) : (
          <>
            <div className="battery-management-table-wrap" ref={menuRef}>
              <table className="battery-management-table">
                <thead>
                  <tr>
                    <th>Mã Pin</th>
                    <th>Chủ sở hữu</th>
                    <th>Số lần sạc</th>
                    <th>Thời gian sử dụng</th>
                    <th>Trạng thái</th>
                    <th className="action-col" />
                  </tr>
                </thead>
                <tbody>
                  {pagedRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="battery-management-empty-cell">
                        Không tìm thấy dữ liệu phù hợp.
                      </td>
                    </tr>
                  ) : (
                    pagedRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.owner || row.email}</td>
                        <td>{row.chargeCount !== undefined ? row.chargeCount : 0}</td>
                        <td>{row.usageTime || '0h'}</td>
                        <td>
                          <span className={`status-badge ${row.status === 'active' ? 'active' : 'inactive'}`}>
                            {row.status === 'active' ? 'Đang hoạt động' : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="action-col">
                          <div className="battery-management-action-wrap">
                            <button
                              type="button"
                              className="battery-management-action-btn"
                              onClick={() => setActiveMenuRowId((prev) => (prev === row.id ? "" : row.id))}
                            >
                              ...
                            </button>
                            {activeMenuRowId === row.id && (
                              <div className="battery-management-row-menu">
                                <button type="button" onClick={() => openViewOrEditModal(row, "view")}>Xem</button>
                                <button type="button" onClick={() => openViewOrEditModal(row, "edit")}>Sửa</button>
                                <button type="button" className="danger" onClick={() => handleDelete(row.id)}>Xóa</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <footer className="battery-management-pagination-footer">
              <button
                type="button"
                className="battery-management-pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span className="battery-management-pagination-indicator">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                className="battery-management-pagination-btn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </footer>
          </>
        )}
      </section>

      {isModalOpen && (
        <div className="battery-management-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="battery-management-modal" onClick={(event) => event.stopPropagation()}>
            <div className="battery-management-modal-header">
              <h3>
                {modalMode === "create"
                  ? "Thêm pin"
                  : modalMode === "edit"
                    ? "Cập nhật pin"
                    : "Chi tiết pin"}
              </h3>
              <button
                type="button"
                className="battery-management-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form className="battery-management-modal-form" onSubmit={handleModalSubmit}>
              <div className="battery-management-modal-body">
                <div className="battery-management-form-grid">
                  <label>
                    <span>Email *</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                      disabled={isReadOnlyModal}
                      placeholder="Nhập email"
                      required
                    />
                  </label>

                  <label>
                    <span>Mã pin / Serial *</span>
                    <input
                      type="text"
                      value={formState.serialNumber}
                      onChange={(event) => setFormState((prev) => ({ ...prev, serialNumber: event.target.value }))}
                      disabled={isReadOnlyModal}
                      placeholder="Nhập mã pin"
                      required
                    />
                  </label>

                  <label>
                    <span>Chủ sở hữu</span>
                    <BatterySelect
                      value={formState.owner}
                      onChange={(val) => setFormState((prev) => ({ ...prev, owner: val }))}
                      disabled={isReadOnlyModal}
                      placeholder="Chọn chủ sở hữu"
                      options={[
                        { value: 'Đội A 101', label: 'Đội A 101' },
                        { value: 'Đội B 202', label: 'Đội B 202' },
                        { value: 'Khách hàng V.I.P', label: 'Khách hàng V.I.P' }
                      ]}
                    />
                  </label>

                  {(modalMode === "edit" || isReadOnlyModal) && (
                    <label>
                      <span>Trạng thái</span>
                      <BatterySelect
                        value={formState.status}
                        onChange={(val) => setFormState((prev) => ({ ...prev, status: val }))}
                        disabled={isReadOnlyModal}
                        options={[
                          { value: 'active', label: 'Đang hoạt động' },
                          { value: 'inactive', label: 'Đã hủy' }
                        ]}
                      />
                    </label>
                  )}
                </div>

                <div style={{ marginTop: '14px' }}>
                  <span style={{ color: '#5d7267', fontSize: '13px', fontWeight: '600' }}>Hình ảnh pin</span>
                  {!formState.imageUrl ? (
                    !isReadOnlyModal && (
                      <div 
                        className={`battery-upload-zone ${isDragActive ? 'drag-active' : ''}`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
                        onDragLeave={() => setIsDragActive(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragActive(false);
                          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                            handleImageChange(e.dataTransfer.files[0]);
                          }
                        }}
                        onClick={() => document.getElementById('bt-img-upload').click()}
                      >
                        <input 
                          id="bt-img-upload" 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleImageChange(e.target.files[0]);
                            }
                          }} 
                        />
                        <div style={{ fontSize: '24px', lineHeight: 1 }}>+</div>
                        <div style={{ fontSize: '13px', marginTop: '4px' }}>Tải ảnh lên</div>
                      </div>
                    )
                  ) : (
                    <div className="battery-upload-zone has-image">
                      <img src={formState.imageUrl} alt="Battery" />
                      {!isReadOnlyModal && (
                        <button type="button" className="remove-img-btn" onClick={() => setFormState({...formState, imageUrl: ""})}>Xóa ảnh</button>
                      )}
                    </div>
                  )}
                </div>

                {formError && <p className="battery-management-form-error">{formError}</p>}
              </div>

              <div className="battery-management-modal-footer">
                <button type="button" className="ghost" onClick={() => setIsModalOpen(false)}>
                  {isReadOnlyModal ? "Đóng" : "Hủy"}
                </button>
                {!isReadOnlyModal && (
                  <button type="submit" className="primary" disabled={isSaving}>
                    {isSaving
                      ? "Đang lưu..."
                      : modalMode === "create"
                        ? "Thêm pin"
                        : "Cập nhật pin"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BatteryManagement;
