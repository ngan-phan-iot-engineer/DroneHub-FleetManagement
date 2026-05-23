function DroneList({
	rows,
	loading,
	keyword,
	onKeywordChange,
	onOpenDetail,
	pagination,
	onPrevPage,
	onNextPage,
}) {
	return (
		<section className="drone-management-panel">
			<header className="drone-management-panel-header">
				<h2>Danh sách Drone</h2>
				<div className="drone-management-search-wrap">
					<input
						type="text"
						value={keyword}
						placeholder="input search text"
						onChange={(event) => onKeywordChange(event.target.value)}
					/>
					<span aria-hidden="true">⌕</span>
				</div>
			</header>

			<div className="drone-management-table-wrap">
				<table className="drone-management-table">
					<thead>
						<tr>
							<th>Mã Drone</th>
							<th>Loại máy bay</th>
							<th>Trạng thái</th>
							<th>Đội quản lý</th>
							<th>Lần cuối bay</th>
							<th>Thời lượng bay</th>
							<th>Lịch bảo trì</th>
							<th className="action-col" aria-label="Hành động" />
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={8} className="drone-management-empty-cell">
									Đang tải dữ liệu Drone...
								</td>
							</tr>
						) : rows.length === 0 ? (
							<tr>
								<td colSpan={8} className="drone-management-empty-cell">
									Không tìm thấy dữ liệu phù hợp.
								</td>
							</tr>
						) : (
							rows.map((row) => (
								<tr key={row.id}>
									<td>{row.droneCode}</td>
									<td>{row.droneType}</td>
									<td>
										<span className="drone-management-status">
											<span className="status-dot" style={{ backgroundColor: row.status.color }} aria-hidden="true" />
											{row.status.label}
										</span>
									</td>
									<td>{row.teamName}</td>
									<td>{row.lastFlightAt}</td>
									<td>{row.flightDuration}</td>
									<td>{row.maintenanceAt}</td>
									<td className="action-col">
										<button
											type="button"
											className="drone-management-action-btn"
											onClick={() => onOpenDetail(row.id)}
											aria-label={`Xem chi tiết ${row.droneCode}`}
											title="Xem chi tiết"
										>
											...
										</button>
									</td>
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
					onClick={onPrevPage}
					disabled={pagination.page <= 1}
					aria-label="Trang trước"
				>
					&lt;
				</button>
				<span className="drone-management-pagination-indicator">
					{pagination.page} / {pagination.totalPages}
				</span>
				<button
					type="button"
					className="drone-management-pagination-btn"
					onClick={onNextPage}
					disabled={pagination.page >= pagination.totalPages}
					aria-label="Trang sau"
				>
					&gt;
				</button>
			</footer>
		</section>
	);
}

export default DroneList;
