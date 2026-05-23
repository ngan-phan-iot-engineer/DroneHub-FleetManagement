function VideoStream({ selectedRow }) {
	return (
		<section className="dashboard-panel" aria-label="Video stream panel">
			<h3>Video Stream (Mock)</h3>
			{selectedRow ? (
				<>
					<p>Drone: {selectedRow.droneCode}</p>
					<p>
						Phi công: {selectedRow.pilot1} / {selectedRow.pilot2}
					</p>
					<p>
						Khung giờ: {selectedRow.dateTime} - {selectedRow.dateTimeEnd}
					</p>
				</>
			) : (
				<p>Không có video demo tương ứng vì chưa có chuyến bay nào được chọn.</p>
			)}
		</section>
	);
}

export default VideoStream;
