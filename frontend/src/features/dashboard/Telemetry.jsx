/**
 * ============================================================
 * FILE: Telemetry.jsx  (COMPONENT V? - SHELL LAYOUT)
 * ============================================================
 * Ki?n tr�c: Service-Layer Component Isolation
 *
 * ��y l� Component T? tinh g?n � ch? lo:
 *   1. Sidebar (Thanh di?u hu?ng b�n tr�i)
 *   2. Topbar (Thanh tr�n c�ng: email, avatar)
 *   3. �i?u ph?i render d�ng Tab b?ng bi?n activeNavItem
 *
 * M?i logic nghi?p v? (l?c, b?ng, KPI...) d� du?c
 * chuy?n sang Component ri�ng ph? tr�ch t?ng Tab.
 * ============================================================
 */

import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FlightData from "./FlightData";
import FleetManagement from "./FleetManagement";
import LogManagement from "./LogManagement";
import MapManagement from "./MapManagement";
import DroneManagement from "../fleet/DroneManagement";
import DroneTypeManagement from "../fleet/DroneTypeManagement";
import AdminManagement from "../auth/AdminManagement";
import ClientManagement from "../fleet/ClientManagement";
import BatteryManagement from "../fleet/BatteryManagement";
import { useTranslation } from "react-i18next";
import "./Telemetry.css";

const NAV_ITEMS = {
	FLIGHT_DATA: "flightData",
	DRONE_MANAGEMENT: "droneManagement",
	MAP_MANAGEMENT: "mapManagement",
	FLEET_MANAGEMENT_PRIMARY: "fleetManagementPrimary",
	FLEET_MANAGEMENT_ADMIN: "fleetManagementAdmin",
	DRONE_TYPE_MANAGEMENT: "droneTypeManagement",
	CLIENT_MANAGEMENT: "clientManagement",
	BATTERY_MANAGEMENT: "batteryManagement",
	ADMIN_MANAGEMENT: "adminManagement",
	LOG_MANAGEMENT: "logManagement",
};

// ============================================================
// ICON SIDEBAR (SVG n?i tuy?n)
// ============================================================

const IconNavData = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<polyline points="3 21 21 21" /><polyline points="3 21 3 3" />
		<polyline points="7 14 11 10 15 14 21 6" /><polyline points="17 6 21 6 21 10" />
	</svg>
);

const IconNavDrones = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M7 7 L17 17 M7 17 L17 7" />
		<circle cx="5" cy="5" r="2.5" />
		<circle cx="19" cy="5" r="2.5" />
		<circle cx="5" cy="19" r="2.5" />
		<circle cx="19" cy="19" r="2.5" />
		<path d="M10.5 10.5 Q 12 8.5 13.5 10.5 Q 15.5 12 13.5 13.5 Q 12 15.5 10.5 13.5 Q 8.5 12 10.5 10.5 Z" fill="currentColor" stroke="none" />
	</svg>
);

const IconNavMap = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
		<circle cx="12" cy="10" r="3" />
	</svg>
);

const IconNavSquad = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
		<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
	</svg>
);

const IconNavAdmin = () => (
	<svg width="18" height="18" viewBox="0 0 640 512" fill="currentColor">
		<path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H322.8c-3.1-8.8-3.7-18.4-1.4-27.8l15-60.1c2.8-11.3 8.6-21.5 16.8-29.7l40.3-40.3c-32.1-31-75.7-50.1-124.8-50.1H178.3zm435.5-68.3c-15.6-15.6-40.9-15.6-56.6 0l-29.4 29.4 71 71 29.4-29.4c15.6-15.6 15.6-40.9 0-56.6l-14.4-14.4zM375.9 417c-4.1 4.1-7 9.2-8.4 14.9l-15 60.1c-1.4 5.5 .2 11.2 4.2 15.2s9.7 5.6 15.2 4.2l60.1-15c5.6-1.4 10.8-4.3 14.9-8.4L576.1 358.7l-71-71L375.9 417zM464 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0z" />
	</svg>
);

const IconNavClient = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
		<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
	</svg>
);

const IconNavDroneType = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<path d="M12 6 A 3 3 0 0 0 12 12 A 3 3 0 0 0 12 6 Z" />
		<path d="M12 12 A 3 3 0 0 0 12 18 A 3 3 0 0 0 12 12 Z" />
		<path d="M6 12 A 3 3 0 0 0 12 12 A 3 3 0 0 0 6 12 Z" />
		<path d="M12 12 A 3 3 0 0 0 18 12 A 3 3 0 0 0 12 12 Z" />
	</svg>
);

const IconNavFileLog = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
		<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
	</svg>
);

const IconNavBattery = () => (
	<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
		<rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
		<line x1="22" y1="11" x2="22" y2="13" />
	</svg>
);

// ============================================================
// COMPONENT CH�NH: Telemetry (Shell Layout)
// ============================================================

function Telemetry() {
	// Bi?n di?u ph?i Tab dang hi?n th?
	const [activeNavItem, setActiveNavItem] = useState(NAV_ITEMS.FLIGHT_DATA);
	const { t } = useTranslation();
	const text = t("dashboard", { returnObjects: true }) || {};
	// Tr?ng th�i co/gi�n Sidebar
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	// Tr?ng th�i m?/d�ng menu con "{text.adminSystem}"
	const [expandedAdminSystem, setExpandedAdminSystem] = useState(true);

	// T�ch h?p logic menu th? xu?ng tr�n avatar d? {text.logout}
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const profileMenuRef = useRef(null);
	const navigate = useNavigate();

	const handleLogout = () => {
		// G?i API {text.logout}, x�a token, vv... n?u c�
		navigate("/login", { replace: true });
	};

	// X? l� d�ng menu profile khi click ra ngo�i
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
				setShowProfileMenu(false);
			}
		};

		if (showProfileMenu) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showProfileMenu]);

	return (
		<section className="dashboard-page">
			<div className="dashboard-layout">

				{/* ====== SIDEBAR �I?U HU?NG ====== */}
				<aside className={`dashboard-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
					{/* Kh?i Logo + T�n thuong hi?u */}
					<div className="dashboard-brand-bar">
						<div className="dashboard-brand-top">
							<div className="dashboard-brand-top-left">
								<span className="dashboard-mini-logo" aria-hidden="true">
									<svg width="32" height="32" viewBox="0 0 32 32">
										<polygon points="13,0 32,7 32,25 13,32 0,16" fill="#fff" />
										<text x="18" y="16" textAnchor="middle" dominantBaseline="central"
											fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize="14" fill="#64786a">mi</text>
									</svg>
								</span>
								<span className="dashboard-brand-mismart">MISMART</span>
							</div>
							<span
								className="dashboard-brand-menu"
								aria-hidden="true"
								onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
								title={text.toggleSidebar}
							>
								&#9776;
							</span>
						</div>
						<div className="dashboard-brand-title">DRONE HUB</div>
						<div className="dashboard-brand-sub">Smart AI ODM service</div>
						<div className="dashboard-drone-badge" aria-hidden="true">
							<svg width="40" height="40" viewBox="0 0 40 40">
								<path d="M10,10 L30,30 M10,30 L30,10" stroke="#f6f9f7" strokeWidth="5" strokeLinecap="round" />
								<circle cx="9" cy="9" r="5" fill="none" stroke="#f6f9f7" strokeWidth="3.5" />
								<circle cx="31" cy="9" r="5" fill="none" stroke="#f6f9f7" strokeWidth="3.5" />
								<circle cx="9" cy="31" r="5" fill="none" stroke="#f6f9f7" strokeWidth="3.5" />
								<circle cx="31" cy="31" r="5" fill="none" stroke="#f6f9f7" strokeWidth="3.5" />
								<rect x="16" y="16" width="8" height="8" fill="#8bc34a" rx="1" />
							</svg>
						</div>
					</div>

					{/* C�c n�t di?u hu?ng */}
					<div className="dashboard-sidebar-nav">
						<section>
							<button
								type="button"
								className={`dashboard-nav-item ${activeNavItem === NAV_ITEMS.FLIGHT_DATA ? "active" : ""}`}
								onClick={() => setActiveNavItem(NAV_ITEMS.FLIGHT_DATA)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavData /></span>
								<span>{text.flightData}</span>
							</button>
							<button
								type="button"
								className={`dashboard-nav-item ${activeNavItem === NAV_ITEMS.DRONE_MANAGEMENT ? "active" : ""}`}
								onClick={() => setActiveNavItem(NAV_ITEMS.DRONE_MANAGEMENT)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavDrones /></span>
								<span>{text.manageDrones}</span>
							</button>
							<button
								type="button"
								className={`dashboard-nav-item ${activeNavItem === NAV_ITEMS.MAP_MANAGEMENT ? "active" : ""}`}
								onClick={() => setActiveNavItem(NAV_ITEMS.MAP_MANAGEMENT)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavMap /></span>
								<span>{text.manageMap}</span>
							</button>
							<button
								type="button"
								className={`dashboard-nav-item ${activeNavItem === NAV_ITEMS.FLEET_MANAGEMENT_PRIMARY ? "active" : ""}`}
								onClick={() => setActiveNavItem(NAV_ITEMS.FLEET_MANAGEMENT_PRIMARY)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavSquad /></span>
								<span>{text.fleetManagement}</span>
							</button>
						</section>

						<section>
							<p className="dashboard-nav-section-title">{text.adminSectionTitle}</p>
							<button
								type="button"
								className={`dashboard-nav-item ${activeNavItem === NAV_ITEMS.ADMIN_MANAGEMENT ? "active" : ""}`}
								onClick={() => setActiveNavItem(NAV_ITEMS.ADMIN_MANAGEMENT)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavAdmin /></span>
								<span>{text.adminManagement}</span>
							</button>
							<button
								type="button"
								className="dashboard-nav-item"
								onClick={() => setExpandedAdminSystem(!expandedAdminSystem)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavDrones /></span>
								<span style={{ flexGrow: 1, textAlign: "left", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
									{text.adminSystem}
								</span>
								<span className={`dashboard-nav-arrow ${expandedAdminSystem ? "expanded" : ""}`} aria-hidden="true">▼</span>
							</button>
							<div className={`dashboard-nav-submenu ${expandedAdminSystem ? "expanded" : ""}`}>
								<button
									type="button"
									className={`dashboard-nav-item sub-item ${activeNavItem === NAV_ITEMS.FLEET_MANAGEMENT_ADMIN ? "active" : ""}`}
									onClick={() => setActiveNavItem(NAV_ITEMS.FLEET_MANAGEMENT_ADMIN)}
								>
									<span className="dashboard-nav-icon" aria-hidden="true"><IconNavClient /></span>
									<span>{text.fleetManagement}</span>
								</button>
								<button
									type="button"
									className={`dashboard-nav-item sub-item ${activeNavItem === NAV_ITEMS.DRONE_TYPE_MANAGEMENT ? "active" : ""}`}
									onClick={() => setActiveNavItem(NAV_ITEMS.DRONE_TYPE_MANAGEMENT)}
								>
									<span className="dashboard-nav-icon" aria-hidden="true"><IconNavDroneType /></span>
									<span>{text.droneTypes}</span>
								</button>
								<button
									type="button"
									className={`dashboard-nav-item sub-item ${activeNavItem === NAV_ITEMS.CLIENT_MANAGEMENT ? "active" : ""}`}
									onClick={() => setActiveNavItem(NAV_ITEMS.CLIENT_MANAGEMENT)}
								>
									<span className="dashboard-nav-icon" aria-hidden="true"><IconNavClient /></span>
									<span>{text.clientManagement}</span>
								</button>
								<button
									type="button"
									className={`dashboard-nav-item sub-item ${activeNavItem === NAV_ITEMS.BATTERY_MANAGEMENT ? "active" : ""}`}
									onClick={() => setActiveNavItem(NAV_ITEMS.BATTERY_MANAGEMENT)}
								>
									<span className="dashboard-nav-icon" aria-hidden="true"><IconNavBattery /></span>
									<span>{text.manageBatteries}</span>
								</button>
							</div>

							{/* N�t t�ch bi?t: Qu?n l� file log */}
							<button
								type="button"
								className={`dashboard-nav-item ${activeNavItem === NAV_ITEMS.LOG_MANAGEMENT ? "active" : ""}`}
								onClick={() => setActiveNavItem(NAV_ITEMS.LOG_MANAGEMENT)}
							>
								<span className="dashboard-nav-icon" aria-hidden="true"><IconNavFileLog /></span>
								<span>{text.logManagement}</span>
							</button>
						</section>
					</div>
				</aside>

				{/* ====== KHU V?C N?I DUNG CH�NH ====== */}
				<div className="dashboard-main">
					{/* Topbar: Email + Avatar */}
					<header className="dashboard-topbar">
						<div className="dashboard-user-info">
							<span className="dashboard-user-email">demowebodm.mismart@gmail.com</span>
							<span className="dashboard-user-role">Admin</span>
						</div>
						<div
							ref={profileMenuRef}
							className="dashboard-topbar-profile"
							onClick={() => setShowProfileMenu(!showProfileMenu)}
						>
							<div className="dashboard-topbar-avatar">
								{/* Placeholder avatar or image */}
							</div>

							{showProfileMenu && (
								<div className="dashboard-profile-menu">
									<div className="dashboard-profile-menu-triangle"></div>
									<button
										className="dashboard-profile-menu-item logout-btn"
										onClick={handleLogout}
									>
										{text.logout}
									</button>
								</div>
							)}
						</div>
					</header>

					{/* V�ng n?i dung � render d�ng Component theo Tab dang active (�� refactor key) */}
					<div className="dashboard-content">
						{activeNavItem === NAV_ITEMS.FLIGHT_DATA && <FlightData />}
						{activeNavItem === NAV_ITEMS.DRONE_MANAGEMENT && <DroneManagement />}
						{activeNavItem === NAV_ITEMS.MAP_MANAGEMENT && <MapManagement />}
						{(activeNavItem === NAV_ITEMS.FLEET_MANAGEMENT_PRIMARY || activeNavItem === NAV_ITEMS.FLEET_MANAGEMENT_ADMIN) && (
							<FleetManagement key={activeNavItem} />
						)}
						{activeNavItem === NAV_ITEMS.DRONE_TYPE_MANAGEMENT && <DroneTypeManagement />}
						{activeNavItem === NAV_ITEMS.CLIENT_MANAGEMENT && <ClientManagement />}
						{activeNavItem === NAV_ITEMS.BATTERY_MANAGEMENT && <BatteryManagement />}
						{activeNavItem === NAV_ITEMS.ADMIN_MANAGEMENT && <AdminManagement />}
						{activeNavItem === NAV_ITEMS.LOG_MANAGEMENT && <LogManagement />}
					</div>
				</div>

			</div>
		</section>
	);
}

export default Telemetry;


