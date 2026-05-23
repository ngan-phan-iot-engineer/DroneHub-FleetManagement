import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { DateRange } from 'react-date-range';
import { 
	subDays, 
	startOfWeek, 
	endOfWeek, 
	subWeeks, 
	startOfMonth, 
	endOfMonth, 
	subMonths, 
	startOfYear, 
	endOfYear, 
	subYears
} from 'date-fns';
import { vi } from 'date-fns/locale';

// Base styles for react-date-range
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import './CustomDatePicker.css';

const PRESETS = [
	{ label: 'Hôm qua', getRange: () => ({ startDate: subDays(new Date(), 1), endDate: subDays(new Date(), 1) }) },
	{ label: 'Tuần này', getRange: () => ({ startDate: startOfWeek(new Date(), { weekStartsOn: 1 }), endDate: endOfWeek(new Date(), { weekStartsOn: 1 }) }) },
	{ label: 'Tuần trước', getRange: () => {
		const startLastWk = startOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
		const endLastWk = endOfWeek(subWeeks(new Date(), 1), { weekStartsOn: 1 });
		return { startDate: startLastWk, endDate: endLastWk };
	}},
	{ label: 'Tháng này', getRange: () => ({ startDate: startOfMonth(new Date()), endDate: endOfMonth(new Date()) }) },
	{ label: 'Tháng trước', getRange: () => {
		const startLastMo = startOfMonth(subMonths(new Date(), 1));
		const endLastMo = endOfMonth(subMonths(new Date(), 1));
		return { startDate: startLastMo, endDate: endLastMo };
	}},
	{ label: 'Năm này', getRange: () => ({ startDate: startOfYear(new Date()), endDate: endOfYear(new Date()) }) },
	{ label: 'Năm trước', getRange: () => {
		const startLastYr = startOfYear(subYears(new Date(), 1));
		const endLastYr = endOfYear(subYears(new Date(), 1));
		return { startDate: startLastYr, endDate: endLastYr };
	}},
	{ label: 'Tùy chỉnh', isCustom: true }
];

function CustomDatePicker({ initialStartDate, initialEndDate, onConfirm, onCancel, triggerRect }) {
	const [activePreset, setActivePreset] = useState('Tùy chỉnh');
	const [range, setRange] = useState({
		startDate: initialStartDate || new Date(),
		endDate: initialEndDate || new Date(),
		key: 'selection'
	});

	const handlePresetClick = (preset) => {
		setActivePreset(preset.label);
		if (!preset.isCustom) {
			const { startDate, endDate } = preset.getRange();
			setRange({ startDate, endDate, key: 'selection' });
		}
	};

	const handleSelectEvent = (item) => {
		setRange(item.selection);
		setActivePreset('Tùy chỉnh');
	};

	// Tính vị trí fixed dựa trên bounding rect của trigger button
	const popoverStyle = triggerRect ? {
		top: triggerRect.bottom + 8,
		left: triggerRect.left,
	} : {};

	const popover = (
		<>
			{/* Backdrop vô hình toàn màn hình để click outside đóng popup */}
			<div
				style={{ position: 'fixed', inset: 0, zIndex: 998 }}
				onClick={onCancel}
			/>
			{/* Popup thực sự - position fixed nên không bị cuộn mất */}
			<div className="custom-datepicker-popover" style={popoverStyle}>
				<div className="custom-datepicker-layout">
					{/* CỘT TRÁI - Menu */}
					<div className="custom-datepicker-sidebar">
						{PRESETS.map((preset) => (
							<button
								key={preset.label}
								className={`custom-datepicker-preset ${activePreset === preset.label ? 'active' : ''}`}
								onClick={() => handlePresetClick(preset)}
							>
								{preset.label}
							</button>
						))}
					</div>

					{/* CỘT PHẢI - Lịch & Nút bấm */}
					<div className="custom-datepicker-main">
						<div className="custom-datepicker-calendars">
							<DateRange
								locale={vi}
								ranges={[range]}
								onChange={handleSelectEvent}
								months={2}
								direction="horizontal"
								showDateDisplay={false}
								showMonthAndYearPickers={false}
								rangeColors={['#64786a']}
								color="#64786a"
							/>
						</div>

						{/* Actions Footer */}
						<div className="custom-datepicker-actions">
							<button className="custom-datepicker-btn btn-cancel" onClick={onCancel}>Hủy bỏ</button>
							<button className="custom-datepicker-btn btn-confirm" onClick={() => onConfirm(range)}>Xác nhận</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);

	// Dùng Portal để render ra ngoài cây DOM, gắn thẳng vào body
	return ReactDOM.createPortal(popover, document.body);
}

export default CustomDatePicker;
