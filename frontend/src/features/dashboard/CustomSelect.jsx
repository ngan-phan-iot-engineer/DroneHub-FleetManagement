import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './CustomSelect.css';

/**
 * CustomSelect - Một dropdown tùy chỉnh thay thế <select> bản địa.
 * Dùng ReactDOM.createPortal để popup không bị clip bởi overflow,
 * và có mũi tên xoay giống sidebar "Hệ thống quản lý drone".
 */
function CustomSelect({ label, value, onChange, options, formatOption = (v) => v }) {
	const [isOpen, setIsOpen] = useState(false);
	const [triggerRect, setTriggerRect] = useState(null);
	const triggerRef = useRef(null);

	const handleToggle = () => {
		if (!isOpen && triggerRef.current) {
			// Lấy tọa độ nút bấm để định vị dropdown cố định so với viewport
			setTriggerRect(triggerRef.current.getBoundingClientRect());
		}
		setIsOpen((prev) => !prev);
	};

	const handleSelect = (option) => {
		onChange(option);
		setIsOpen(false);
	};

	// Tính vị trí fixed dựa trên tọa độ của trigger
	const dropdownStyle = triggerRect
		? {
			top: triggerRect.bottom + 4,
			left: triggerRect.left,
			width: triggerRect.width,
		}
		: {};

	const dropdownPortal = isOpen
		? ReactDOM.createPortal(
			<>
				{/* Backdrop vô hình - click ra ngoài thì đóng */}
				<div
					style={{ position: 'fixed', inset: 0, zIndex: 998 }}
					onClick={() => setIsOpen(false)}
				/>
				{/* Danh sách lựa chọn */}
				<div className="custom-select-dropdown" style={dropdownStyle}>
					{options.map((option) => (
						<div
							key={option}
							className={`custom-select-option ${value === option ? 'selected' : ''}`}
							onClick={() => handleSelect(option)}
						>
							{option}
						</div>
					))}
				</div>
			</>,
			document.body
		)
		: null;

	return (
		<fieldset className="dashboard-filter">
			<legend className="dashboard-filter-label">{label}</legend>
			{/* Nút trigger - hiển thị giá trị hiện tại + mũi tên xoay */}
			<div
				ref={triggerRef}
				className="dashboard-filter-control custom-select-trigger"
				onClick={handleToggle}
			>
				<span>{formatOption(value)}</span>
				<span className={`custom-select-arrow ${isOpen ? 'expanded' : ''}`}>▼</span>
			</div>
			{dropdownPortal}
		</fieldset>
	);
}

export default CustomSelect;
