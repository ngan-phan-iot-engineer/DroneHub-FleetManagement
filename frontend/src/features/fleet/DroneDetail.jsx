function DroneDetail({
	detail,
	detailLoading,
	historyType,
	onHistoryTypeChange,
	historyRows,
	historyLoading,
	historyKeyword,
	onHistoryKeywordChange,
	historyPagination,
	onPrevHistoryPage,
	onNextHistoryPage,
	onBack,
}) {
	const isMaintenance = historyType === "maintenance";

	return (
		<section className="drone-management-detail">
			<header className="drone-management-detail-breadcrumb">
				<span>Quản lý Drone</span>
				<span>/</span>
				<span>{detail?.breadcrumbLabel || "Thông tin chi tiết Drone"}</span>
			</header>

			<button type="button" className="drone-management-back-btn" onClick={onBack}>
				<span className="drone-management-back-icon" aria-hidden="true">
					<svg viewBox="0 0 48 48" focusable="false">
						<path d="M40 24H10" />
						<path d="M24 10L10 24L24 38" />
					</svg>
				</span>
				<span className="drone-management-back-label">
					Mã Drone : {detail?.droneCode || "..."}
				</span>
			</button>

			<div className="drone-management-detail-grid">
				<article className="drone-management-detail-left">
					<h3>Thông tin cơ bản</h3>
					<div className="drone-management-basic-card">
						{detailLoading ? (
							<p>Đang tải...</p>
						) : (
							<>
								<div><span>Loại:</span><strong>{detail?.basicInfo?.type}</strong></div>
								<div>
									<span>Trạng thái</span>
									<strong style={{ color: detail?.basicInfo?.statusColor || "#3EAA63" }}>
										{detail?.basicInfo?.statusText}
									</strong>
								</div>
								<div><span>Ngày - giờ sử dụng:</span><strong>{detail?.basicInfo?.usedAt}</strong></div>
								<div><span>Thời gian bay:</span><strong>{detail?.basicInfo?.flightTimeText}</strong></div>
							</>
						)}
					</div>

					<h3>{detail?.gpsSectionTitle || "Lịch sử GPS"}</h3>
					<div className="drone-management-gps-wrap">
						{detail?.gpsImageUrl ? (
							<img src={detail.gpsImageUrl} alt="Drone GPS history" />
						) : (
							<div className="drone-management-gps-fallback">GPS Preview</div>
						)}
					</div>
				</article>

				<article className="drone-management-detail-right">
					<header className="drone-management-history-head">
						<select value={historyType} onChange={(event) => onHistoryTypeChange(event.target.value)}>
							<option value="flight">Lịch sử bay</option>
							<option value="maintenance">Lịch sử bảo trì</option>
						</select>

						<div className="drone-management-search-wrap compact">
							<input
								type="text"
								value={historyKeyword}
								placeholder="input search text"
								onChange={(event) => onHistoryKeywordChange(event.target.value)}
							/>
							<span aria-hidden="true">⌕</span>
						</div>
					</header>

					<div className="drone-management-table-wrap">
						<table className="drone-management-table">
							<thead>
								{isMaintenance ? (
									<tr>
										<th>Kỹ sư bảo trì</th>
										<th>Mã lỗi</th>
										<th>Mô tả</th>
										<th>Thời gian bảo trì</th>
									</tr>
								) : (
									<tr>
										<th>Phi công</th>
										<th>Đội bay</th>
										<th>Thời lượng bay</th>
										<th>Thời gian bay</th>
									</tr>
								)}
							</thead>
							<tbody>
								{historyLoading ? (
									<tr>
										<td colSpan={4} className="drone-management-empty-cell">Đang tải dữ liệu lịch sử...</td>
									</tr>
								) : historyRows.length === 0 ? (
									<tr>
										<td colSpan={4} className="drone-management-empty-cell">Không có dữ liệu lịch sử.</td>
									</tr>
								) : (
									historyRows.map((row) => (
										<tr key={row.id}>
											{isMaintenance ? (
												<>
													<td>{row.maintenanceEngineer}</td>
													<td>{row.errorCode}</td>
													<td>{row.descriptionCode}</td>
													<td>{row.maintenanceAt}</td>
												</>
											) : (
												<>
													<td>{row.pilotName}</td>
													<td>{row.teamName}</td>
													<td>{row.flightDuration}</td>
													<td>{row.flightAt}</td>
												</>
											)}
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<footer className="drone-management-pagination-footer">
						<button
							type="button"
							className="drone-management-pagination-btn"
							onClick={onPrevHistoryPage}
							disabled={historyPagination.page <= 1}
							aria-label="Trang trước"
						>
							&lt;
						</button>
						<span className="drone-management-pagination-indicator">
							{historyPagination.page} / {historyPagination.totalPages}
						</span>
						<button
							type="button"
							className="drone-management-pagination-btn"
							onClick={onNextHistoryPage}
							disabled={historyPagination.page >= historyPagination.totalPages}
							aria-label="Trang sau"
						>
							&gt;
						</button>
					</footer>
				</article>
			</div>
		</section>
	);
}

export default DroneDetail;
