import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LOG_DRONE_TYPE_OPTIONS,
  LOG_MA_HIEU_OPTIONS,
  LOG_NHOM_LOI_OPTIONS,
} from "./dashboardMockData";
import { fetchLogData, fetchWarningLogs, fetchFlightDetails, fetchFlightReport, fetchFlightAnalysis, fetchAIPredictData } from "../../services/dashboardApi";
import CustomSelect from "./CustomSelect";
import ReactECharts from "echarts-for-react";
import "./LogManagement.css";

/* ============================================================
   HẰNG SỐ: STATUS_MAP
   Ánh xạ giá trị `status` → màu CSS và nhãn hiển thị
   ============================================================ */
const STATUS_MAP = {
  error:      { color: "#e53935", label: "Lỗi" },
  approved:   { color: "#64786a", label: "Đã được duyệt" },
  pending:    { color: "#ff9800", label: "Chưa tiếp nhận" },
  processing: { color: "#757575", label: "Đang xử lý" },
};

/* ============================================================
   SVG ICONS — Nội tuyến, không phụ thuộc thư viện bên ngoài
   ============================================================ */

const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.2"
       strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const IconExport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

/* ============================================================
   SUB-COMPONENT: NhomLoiCell
   ============================================================ */
const IconChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

function NhomLoiCell({ nhomLoi }) {
  if (nhomLoi.length === 0) {
    return <span className="log-no-error">Không lỗi</span>;
  }

  if (nhomLoi.length <= 2) {
    return <span className="log-nhom-loi-text">{nhomLoi.join(", ")}</span>;
  }

  // Nếu >= 3 lỗi thì hiển thị 2 lỗi đầu + ... kèm mũi tên, 
  // RENDER BONG BÓNG TOOLTIP THEO CSS HOVER
  return (
    <div className="log-nhom-loi-tooltip-wrapper">
      <div className="log-nhom-loi-trigger">
        <span className="log-nhom-loi-text">{nhomLoi[0]}, {nhomLoi[1]}, ...</span>
        <span className="log-chevron"><IconChevronDown /></span>
      </div>
      
      {/* Tooltip Bong bóng hiển thị đầy đủ */}
      <div className="log-tooltip-bubble">
        <div className="log-tooltip-content">
          {nhomLoi.join(", ")}
        </div>
        <div className="log-tooltip-arrow"></div>
      </div>
    </div>
  );
}

/* ============================================================
   LOADING SPINNER — Tái dụng styles từ FleetManagement.css
   ============================================================ */
function LogLoadingScreen() {
  return (
    <div className="fleet-loading">
      <svg
        className="spinning-logo"
        width="64"
        height="64"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          className="spinning-hexagon"
          points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5"
        />
        <text
          x="50"
          y="57"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          mi
        </text>
      </svg>
      <p className="loading-text">Đang tải dữ liệu file log…</p>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENT: FlightDetailModal
   ============================================================ */
function FlightDetailModal({ flightId, onClose, onOpenReport, onOpenAnalysis }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchFlightDetails(flightId).then((res) => {
      if (active) {
        setData(res);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [flightId]);

  if (loading || !data) {
    return (
      <div className="flight-detail-overlay">
        <div className="flight-detail-modal" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  return (
    <div className="flight-detail-overlay" onClick={onClose}>
      <div className="flight-detail-modal" onClick={e => e.stopPropagation()}>
        <button className="flight-detail-close-btn" onClick={onClose} title="Đóng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="flight-detail-header">
          <div className="flight-detail-title">
            <h2>Thông tin chuyến bay</h2>
            <p>Trạng thái: {data.statusText}</p>
          </div>
          <div className="flight-detail-summary">
            <div className="label">Tình trạng:</div>
            <div className={data.tinhTrang === "Rơi" ? "val-red" : "val"}>{data.tinhTrang}</div>
            
            <div className="label">Ngày - giờ bay:</div>
            <div className="val">
              {data.startTime}<br />
              {data.endTime}
            </div>
            
            <div className="label">Mã chuyến bay:</div>
            <div className="val">{data.flightId}</div>
          </div>
        </div>

        <div className="flight-detail-box-wrap">
          <div className="flight-detail-box">
            <div className="flight-detail-box-title">Thông số chi tiết</div>
            {/* Flat 4-column grid: label1 | value1 | label2 | value2
                Each pair of spans maps to one visual row in the grid */}
            <div className="flight-detail-grid">
              <span className="label">Vibe lớn nhất:</span>
              <span className="val">{data.details.vibeMax}</span>
              <span className="label">Diện tích:</span>
              <span className="val">{data.details.area}</span>

              <span className="label">Phần trăm Pin thấp nhất:</span>
              <span className="val">{data.details.batteryMin}</span>
              <span className="label">Thời gian bay:</span>
              <span className="val">{data.details.flightTime}</span>

              <span className="label">Phần trăm Fuel level trung bình:</span>
              <span className="val">{data.details.fuelAvg}</span>
              <span className="label">Tốc độ bay lớn nhất:</span>
              <span className="val">{data.details.speedMax}</span>

              <span className="label">Góc lớn nhất:</span>
              <span className="val">{data.details.angleMax}</span>
              <span className="label">Độ cao lớn nhất:</span>
              <span className="val">{data.details.heightMax}</span>

              <span className="label">Độ lệch Cell Pin lớn nhất:</span>
              <span className="val">{data.details.cellDevMax}</span>
              <span className="label">Giá trị Accel lớn nhất:</span>
              <span className="val">{data.details.accelMax}</span>
            </div>
          </div>
          
          <div className="flight-detail-box-actions">
            <button className="flight-detail-btn" onClick={onOpenAnalysis}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              Kết quả phân tích và AI
            </button>
            <button className="flight-detail-btn" onClick={onOpenReport}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
              Báo cáo hiện trường
            </button>
            <button className="flight-detail-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              Kết quả từ file Log
            </button>
          </div>
        </div>

        <div className="flight-detail-conclusion">
          <label>*Kết luận chung</label>
          <textarea 
            className="flight-detail-textarea" 
            placeholder="Nhập kết luận..."
            defaultValue={data.conclusion}
          ></textarea>
        </div>

        <div className="flight-detail-footer">
          <button className="flight-detail-footer-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Tải Log File
          </button>
          <button className="flight-detail-footer-btn btn-light">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Tải Báo Cáo
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENT: ImageLightbox
   Xem ảnh phóng to khi click thumbnail, dẫy mũi tên ← → để chuyển
   ============================================================ */
function ImageLightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const total = images.length;

  // Navigate prev / next — wrap around
  const goPrev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + total) % total); };
  const goNext = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % total); };

  // Keyboard navigation: ArrowLeft / ArrowRight / Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  setIdx((i) => (i - 1 + total) % total);
      if (e.key === 'ArrowRight') setIdx((i) => (i + 1) % total);
      if (e.key === 'Escape')     onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [total, onClose]);

  return (
    // Click vào nền tối → đóng lightbox
    <div className="img-lightbox-overlay" onClick={onClose}>

      {/* Nút đóng góc trên phải */}
      <button className="img-lightbox-close" onClick={onClose} title="Đóng (Esc)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Mũi tên trái */}
      {total > 1 && (
        <button className="img-lightbox-arrow img-lightbox-arrow--left" onClick={goPrev} title="Ảnh trước (←)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Ảnh hiện tại — click vào ảnh không đóng overlay */}
      <img
        src={images[idx]}
        className="img-lightbox-img"
        alt={`Ảnh hiện trường ${idx + 1}`}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Mũi tên phải */}
      {total > 1 && (
        <button className="img-lightbox-arrow img-lightbox-arrow--right" onClick={goNext} title="Ảnh tiếp (→)">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Chỉ số ảnh: 1 / 3 */}
      <div className="img-lightbox-counter">{idx + 1} / {total}</div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENT: FlightReportModal
   Hiển thị khi click nút "Báo cáo hiện trường" trong FlightDetailModal
   ============================================================ */
function FlightReportModal({ flightId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  // All 4 text fields are user-editable — initialized from mock/API data
  const [pilotNote, setPilotNote]               = useState("");
  const [reporterNote, setReporterNote]         = useState("");
  const [repairSuggestion, setRepairSuggestion] = useState("");
  const [reporterSig, setReporterSig]           = useState("");
  // Lightbox: index of the image being previewed (null = closed)
  const [previewIndex, setPreviewIndex]         = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchFlightReport(flightId).then((res) => {
      if (active) {
        setData(res);
        // Pre-fill all editable fields from API/mock data
        setPilotNote(res.pilotNote || "");
        setReporterNote(res.reporterNote || "");
        setRepairSuggestion(res.repairSuggestion || "");
        setReporterSig(res.reporterSignature || "");
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [flightId]);

  if (loading || !data) {
    return (
      <div className="flight-detail-overlay" style={{ zIndex: 10000 }}>
        <div className="flight-report-modal" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
          <span style={{ color: "#64786a", fontSize: "15px" }}>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flight-detail-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
      <div className="flight-report-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Nút đóng ── */}
        <button className="flight-detail-close-btn" onClick={onClose} title="Đóng">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Header ── */}
        <div className="flight-report-header">
          <div className="flight-report-title">
            <h2>Báo cáo tình trạng chuyến bay</h2>
            <div className="flight-report-title-line" />
          </div>
          <div className="flight-report-meta">
            <span className="rpt-meta-label">Mã chuyến bay:</span>
            <span className="rpt-meta-val">{data.flightId}</span>
            <span className="rpt-meta-label">Cập nhật lúc:</span>
            <span className="rpt-meta-val">{data.updatedAt}</span>
          </div>
        </div>

        {/* ── Body: 2 cột ── */}
        <div className="flight-report-body">

          {/* Cột trái: thông tin + hình ảnh */}
          <div className="flight-report-left">
            <div className="flight-report-info-grid">
              <span className="rpt-label">Họ và tên người báo cáo :</span>
              <span className="rpt-val">{data.reporterName}</span>

              <span className="rpt-label">Bộ phận :</span>
              <span className="rpt-val">{data.department}</span>

              <span className="rpt-label">Mã Drone :</span>
              <span className="rpt-val">{data.droneCode}</span>

              <span className="rpt-label">Khu vực bay :</span>
              <span className="rpt-val">{data.area}</span>

              <span className="rpt-label">Thời gian xảy ra sự cố :</span>
              <span className="rpt-val">{data.incidentTime}</span>

              <span className="rpt-label">Phi công :</span>
              <span className="rpt-val">{data.pilot}</span>

              <span className="rpt-label">Đối tác :</span>
              <span className="rpt-val">{data.partner}</span>
            </div>

            {/* Hình ảnh hiện trường */}
            <div className="flight-report-images-section">
              <div className="rpt-section-label">• Hình ảnh hiện trường</div>
              <div className="flight-report-images">
                {data.images.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="flight-report-img-thumb"
                    alt={`Ảnh hiện trường ${i + 1}`}
                    onClick={() => setPreviewIndex(i)}
                    title="Nhấn để xem ảnh lớn"
                  />
                ))}
                <button className="flight-report-add-img" title="Thêm ảnh">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải: ghi chú từ phi công và người viết BC */}
          <div className="flight-report-right">
            <div className="flight-report-note-block">
              <div className="rpt-section-label">• Mô tả từ phi công</div>
              <textarea
                className="flight-report-note-textarea"
                value={pilotNote}
                onChange={(e) => setPilotNote(e.target.value)}
                placeholder="Nhập mô tả từ phi công..."
              />
            </div>
            <div className="flight-report-note-block">
              <div className="rpt-section-label">• Mô tả từ người viết báo cáo</div>
              <textarea
                className="flight-report-note-textarea"
                value={reporterNote}
                onChange={(e) => setReporterNote(e.target.value)}
                placeholder="Nhập mô tả từ người viết báo cáo..."
              />
            </div>
          </div>
        </div>

        {/* ── Khu vực nhập liệu phía dưới ── */}
        <div className="flight-report-bottom">
          <div className="flight-report-bottom-field">
            <label>*Đề xuất cách sửa chữa:</label>
            <textarea
              className="flight-report-edit-textarea"
              value={repairSuggestion}
              onChange={(e) => setRepairSuggestion(e.target.value)}
              placeholder="Nhập đề xuất..."
            />
          </div>
          <div className="flight-report-bottom-field">
            <label>*Người viết báo cáo:</label>
            <textarea
              className="flight-report-edit-textarea"
              value={reporterSig}
              onChange={(e) => setReporterSig(e.target.value)}
              placeholder="Nhập tên người viết..."
            />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flight-report-footer">
          <button className="flight-report-save-btn">Lưu Kết Quả</button>
        </div>
      </div>
    </div>

    {/* Image Lightbox — hiện khi click thumbnail, z-index cao hơn modal */}
    {previewIndex !== null && data?.images && (
      <ImageLightbox
        images={data.images}
        startIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    )}
    </>
  );
}

/* ============================================================
   SUB-COMPONENT: AIChartDetailModal
   Layout: Left dark telemetry chart (~78%) | Right white sidebar (~22%)
   Matches MISMART viewer: status bar → header → ECharts | checkbox list + badge button
   ============================================================ */
function AIChartDetailModal({ chartData, onClose, isError }) {
  // Local state for checkbox filters — mirrors chartData.filters initial values
  const [filterState, setFilterState] = useState(() => {
    const init = {};
    if (!chartData?.filters) return init;
    chartData.filters.forEach((fg, gi) => {
      if (fg.isCheckboxList) {
        init[`g${gi}`] = true;
        fg.items.forEach(item => { init[item.id] = !!item.checked; });
      } else {
        init[`g${gi}`] = fg.checked !== false;
      }
    });
    return init;
  });

  const toggle = (key) => setFilterState(prev => ({ ...prev, [key]: !prev[key] }));

  // Build ECharts option from 6-channel chartSeriesData
  const chartOptions = useMemo(() => {
    if (!chartData?.chartSeriesData) return null;
    const raw   = chartData.chartSeriesData;
    const times = raw.map(d => d.time);
    const interval = Math.max(1, Math.floor(raw.length / 5) - 1);

    // Detect 6-channel (ch1-ch6) vs legacy (motor_1/motor_2) format
    const hasNewKeys = raw[0]?.ch1 !== undefined;
    const seriesDef = hasNewKeys ? [
      { name: 'ATT Control', key: 'ch1', color: '#ffd51e' },
      { name: 'ATT Roll',    key: 'ch2', color: '#1a7fd4' },
      { name: 'ATT Ctrl',   key: 'ch3', color: '#e53935' },
      { name: 'CH 4',        key: 'ch4', color: '#43a047' },
      { name: 'CH 5',        key: 'ch5', color: '#ff9800' },
      { name: 'CH 6',        key: 'ch6', color: '#e040fb' },
    ] : [
      { name: 'Motor 1', key: 'motor_1', color: '#ffd51e' },
      { name: 'Motor 2', key: 'motor_2', color: '#43a047' },
    ];

    return {
      backgroundColor: '#0d0d0d',
      animation: false,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', label: { padding: [4, 8], fontSize: 10, backgroundColor: '#333' } },
        backgroundColor: 'rgba(248,248,248,0.96)',
        borderColor: '#ccc',
        borderWidth: 1,
        padding: [8, 12],
        textStyle: { color: '#222', fontSize: 11 },
        formatter(params) {
          let html = '<b style="font-size:11px">point info</b><br/>';
          params.slice(0, 6).forEach(p => {
            if (p.value == null) return;
            html += `<span style="color:${p.color}">▬</span> ${p.seriesName}: <b>${(+p.value).toFixed(3)}</b><br/>`;
          });
          return html;
        },
      },
      grid: { top: 14, bottom: 54, left: 55, right: 14, containLabel: false },
      dataZoom: [
        { type: 'inside', start: 0, end: 100 },
        {
          type: 'slider', height: 18, bottom: 4, left: 55, right: 14,
          borderColor: 'transparent',
          backgroundColor: 'rgba(255,255,255,0.03)',
          fillerColor: 'rgba(255,255,255,0.07)',
          handleStyle: { color: '#666' },
          dataBackground: { lineStyle: { color: '#555' }, areaStyle: { color: '#2a2a2a' } },
          textStyle: { color: '#666', fontSize: 9 },
        },
      ],
      xAxis: {
        type: 'category',
        data: times,
        name: 'Time (sec)',
        nameLocation: 'middle',
        nameGap: 33,
        nameTextStyle: { color: '#888', fontSize: 11 },
        axisLine: { lineStyle: { color: '#3a3a3a' } },
        axisTick: { lineStyle: { color: '#3a3a3a' }, length: 4 },
        axisLabel: { color: '#999', fontSize: 10, interval },
        splitLine: { lineStyle: { color: '#181818' } },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: true, lineStyle: { color: '#cc2200', width: 1.5 } },
        axisTick: { show: true, lineStyle: { color: '#cc2200' }, length: 4 },
        axisLabel: { color: '#cc2200', fontSize: 10 },
        splitLine: { lineStyle: { color: '#1c1c1c' } },
      },
      series: seriesDef.map(s => ({
        name: s.name,
        type: 'line',
        data: raw.map(d => d[s.key]),
        showSymbol: false,
        sampling: 'lttb',
        lineStyle: { width: 1, color: s.color },
        itemStyle: { color: s.color },
      })),
    };
  }, [chartData]);

  if (!chartData) return null;

  return (
    <div
      className="flight-detail-overlay ai-predict-modal-overlay"
      style={{ zIndex: 11000 }}
      onClick={onClose}
    >
      <div className="ai-predict-chart-modal" onClick={e => e.stopPropagation()}>

        {/* ── Close button top-right ── */}
        <button className="ai-chart-close-btn" onClick={onClose} title="Đóng">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="ai-chart-modal-content">

          {/* ════════ LEFT: dark telemetry chart ════════ */}
          <div className="ai-chart-main-panel">

            {/* Colored status indicator bars — mimic MISMART flight-phase bands */}
            <div className="ai-status-bar-row">
              <div className="ai-status-seg" style={{ flex: 1.8, background: '#f48fb1' }} />
              <div className="ai-status-seg" style={{ flex: 2.8, background: '#b71c1c' }} />
              <div className="ai-status-seg" style={{ flex: 0.5, background: '#e0e0e0' }} />
              <div className="ai-status-seg" style={{ flex: 1.6, background: '#00bcd4' }} />
              <div className="ai-status-seg" style={{ flex: 1.8, background: '#aed581' }} />
              <div className="ai-status-seg" style={{ flex: 0.7, background: '#b71c1c' }} />
              <div className="ai-status-seg" style={{ flex: 0.8, background: '#880e4f' }} />
            </div>

            {/* Series info header — Min / Max / Mean labels per channel */}
            <div className="ai-chart-header-labels">
              <span style={{ color: '#ffd51e' }}>ATT Control (deg)&nbsp; Min: -12.7&nbsp; Max: 11.74&nbsp; Mean: -0.72</span>
              <span style={{ color: '#70aee8' }}>ATT Roll (deg) 25Hz: -22.85&nbsp; Max: 11.16&nbsp; Mean: -4.74</span>
              <span style={{ color: '#ef9a9a' }}>ATT Ctrl PMT (deg)&nbsp; Min: -27.46&nbsp; Max: 19.85&nbsp; Mean: -1</span>
            </div>

            {/* Chart canvas — ECharts or image fallback */}
            <div className="ai-chart-dark-canvas">
              {chartData.chartSeriesData ? (
                <ReactECharts
                  option={chartOptions}
                  style={{ width: '100%', height: '100%' }}
                  opts={{ renderer: 'canvas' }}
                />
              ) : (
                <img
                  src={chartData.image}
                  alt={chartData.title}
                  className="ai-chart-img-fallback"
                />
              )}
            </div>

          </div>

          {/* ════════ RIGHT: control sidebar ════════ */}
          <div className="ai-chart-sidebar">

            {/* Checkbox filter list */}
            <div className="ai-chart-filters">
              {chartData.filters && chartData.filters.map((fg, gi) => (
                <div key={gi} className="ai-filter-group">
                  {fg.isCheckboxList ? (
                    /* Flat channel list: Tất cả + C1-C6 */
                    <>
                      <label className="ai-sidebar-check-item ai-filter-main-label">
                        <input
                          type="checkbox"
                          checked={!!filterState[`g${gi}`]}
                          onChange={() => toggle(`g${gi}`)}
                        />
                        <span>{fg.group}</span>
                      </label>
                      <div className="ai-sidebar-sublist">
                        {fg.items.map(item => (
                          <label key={item.id} className="ai-sidebar-check-item ai-filter-sub-label">
                            <input
                              type="checkbox"
                              checked={!!filterState[item.id]}
                              onChange={() => toggle(item.id)}
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* Grouped params: BARO → Param 1, Param 2 */
                    <>
                      <label className="ai-sidebar-check-item ai-filter-main-label">
                        <input
                          type="checkbox"
                          checked={!!filterState[`g${gi}`]}
                          onChange={() => toggle(`g${gi}`)}
                        />
                        <span>{fg.group}</span>
                      </label>
                      {fg.subParams?.length > 0 && (
                        <div className="ai-sidebar-sublist">
                          {fg.subParams.map((sp, si) => (
                            <label key={si} className="ai-sidebar-check-item ai-filter-sub-label">
                              <input type="checkbox" defaultChecked={false} />
                              <span>{sp}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Badge button + time span */}
            <div className="ai-chart-badge-area">
              <div className={`ai-chart-badge ${isError ? 'error' : 'success'}`}>
                {chartData.title}
              </div>
              {chartData.timeSpan && (
                <p className="ai-chart-time-span">• Thời gian lỗi: {chartData.timeSpan}</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENT: MiniChartSnapshot
   Nhận chartSeriesData → render ECharts ẩn → chụp snapshot
   → hiển thị làm thumbnail trên card.

   KIẾN TRÚC:
   - Hoàn toàn thuộc UI layer (LogManagement.jsx)
   - Không phụ thuộc URL ảnh bên ngoài hay mock data
   - Khi backend thay thế mock → chartSeriesData từ API thật
     → thumbnail tự động phản ánh dữ liệu thật ✅
   ============================================================ */
const MiniChartSnapshot = React.memo(function MiniChartSnapshot({ data }) {
  const chartRef  = useRef(null);
  const [snapshot, setSnapshot] = useState(null); // base64 PNG sau khi chụp

  // Build simplified ECharts option (no axes, no tooltip, no zoom)
  // Chỉ cần vẽ đường — đủ để làm thumbnail
  const miniOption = useMemo(() => {
    if (!data?.length) return null;
    const hasNewKeys = data[0]?.ch1 !== undefined;
    const seriesDef  = hasNewKeys ? [
      { key: 'ch1', color: '#ffd51e' },
      { key: 'ch2', color: '#1a7fd4' },
      { key: 'ch3', color: '#e53935' },
      { key: 'ch4', color: '#43a047' },
      { key: 'ch5', color: '#ff9800' },
      { key: 'ch6', color: '#e040fb' },
    ] : [
      { key: 'motor_1', color: '#ffd51e' },
      { key: 'motor_2', color: '#43a047' },
    ];

    return {
      backgroundColor: '#111111',
      animation: false,        // Tắt animation để snapshot nhanh
      grid: { top: 4, bottom: 4, left: 4, right: 4 },
      xAxis: { type: 'category', show: false, data: data.map(d => d.time) },
      yAxis: { type: 'value',    show: false },
      series: seriesDef.map(s => ({
        type: 'line',
        data: data.map(d => d[s.key]),
        showSymbol: false,
        sampling: 'lttb',             // Down-sample để render nhanh
        lineStyle: { width: 0.9, color: s.color },
        itemStyle: { color: s.color },
      })),
    };
  }, [data]);

  // Sau khi ECharts render xong → gọi getDataURL() chụp PNG base64
  useEffect(() => {
    if (!chartRef.current || !miniOption) return;
    const timer = setTimeout(() => {
      const instance = chartRef.current?.getEchartsInstance?.();
      if (!instance) return;
      const url = instance.getDataURL({
        type: 'png',
        pixelRatio: 1.5,   // Độ phân giải vừa đủ cho thumbnail
        backgroundColor: '#111111',
      });
      setSnapshot(url);    // Lưu base64 vào state → trigger re-render
    }, 120);               // 120ms: đủ để ECharts render xong canvas
    return () => clearTimeout(timer);
  }, [miniOption]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#111' }}>
      {/* Hidden ECharts renderer — chỉ dùng để chụp, ẩn sau khi snapshot xong */}
      <div style={{
        position: 'absolute', inset: 0,
        visibility: snapshot ? 'hidden' : 'visible',
        pointerEvents: 'none',
      }}>
        {miniOption && (
          <ReactECharts
            ref={chartRef}
            option={miniOption}
            style={{ width: '100%', height: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        )}
      </div>

      {/* Snapshot image — hiển thị sau khi chụp xong */}
      {snapshot && (
        <img
          src={snapshot}
          alt="chart thumbnail"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}

      {/* Skeleton loading khi chưa có data */}
      {!snapshot && !miniOption && (
        <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
      )}
    </div>
  );
});

/* ============================================================
   UI CONSTANTS — Tên cố định của 4 đồ thị telemetry tiêu chuẩn.
   Đây là UI text thuần túy, KHÔNG phải dữ liệu từ backend/API.
   Các tên này luôn cố định theo thiết kế, bất kể chuyến bay nào.
   ============================================================ */
const GENERAL_CHART_LABELS = {

  'gen-1': 'Đồ thị ATT',
  'gen-2': 'Đồ thị BATT',
  'gen-3': 'Đồ thị RCOUT',
  'gen-4': 'Đồ thị RCIN',
};

/* ============================================================
   SUB-COMPONENT: AIPredictTab
   ============================================================ */
function AIPredictTab({ data, onSelectChart, onClose }) {
  if (!data) return null;

  return (
    <div className="ai-predict-tab-container">
      {/* Thông tin chung: 4 đồ thị cố định (ATT / BATT / RCOUT / RCIN) */}
      <div className="ai-predict-section">
        <h3 className="ai-section-title">Thông tin chung</h3>
        <div className="ai-predict-grid">
          {data.generalInfo.map(chart => {
            // Resolve label từ UI constants — KHÔNG lấy từ chart.title
            const label = GENERAL_CHART_LABELS[chart.id] ?? chart.id;
            return (
              <div
                className="ai-chart-card general-card"
                key={chart.id}
                // Inject label vào object chart trước khi truyền sang modal
                onClick={() => onSelectChart({ ...chart, title: label }, false)}
              >
                <div className="ai-card-image-wrapper">
                  {/* Thumbnail: sinh ảnh động nếu có dữ liệu chuỗi thời gian */}
                  {chart.chartSeriesData ? (
                    <MiniChartSnapshot data={chart.chartSeriesData} />
                  ) : (
                    <div className="ai-chart-skeleton" style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '13px' }}>
                      Chưa có dữ liệu
                    </div>
                  )}
                  <div className="ai-card-hover-overlay">
                    <span className="ai-explore-text">Explore</span>
                  </div>
                </div>
                <div className="ai-card-footer general-footer">
                  {label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kết quả AI: Các lỗi được phát hiện — tên lỗi là DATA từ API */}
      <div className="ai-predict-section" style={{ marginTop: '24px' }}>
        <h3 className="ai-section-title">Kết quả phân tích chuyến bay (AI)</h3>
        <div className="ai-predict-grid">
          {data.aiErrors.map(chart => (
            <div
              className="ai-chart-card error-card"
              key={chart.id}
              onClick={() => onSelectChart(chart, true)}
            >
              <div className="ai-card-image-wrapper">
                {/* Thumbnail: snapshot đồ thị thật nếu AI error có series data */}
                {chart.chartSeriesData ? (
                  <MiniChartSnapshot data={chart.chartSeriesData} />
                ) : (
                  <div className="ai-chart-skeleton" style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '13px' }}>
                    Chưa có dữ liệu
                  </div>
                )}
                <div className="ai-card-hover-overlay">
                  <span className="ai-explore-text">Explore</span>
                </div>
              </div>
              <div className="ai-card-footer error-footer">
                <div className="ai-error-name">{chart.title}</div>
                <div className="ai-error-time">Thời gian lỗi: {chart.timeSpan}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-predict-bottom-action">
        <button className="btn-close-ai-tab" onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}

/* ============================================================
   SUB-COMPONENT: FlightAnalysisModal
   Bảng phân tích, báo cáo lỗi từ log kết hợp AI
   ============================================================ */
function FlightAnalysisModal({ flightId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewIndex, setPreviewIndex] = useState(null);       // sceneImages
  const [errorPreviewIndex, setErrorPreviewIndex] = useState(null); // errorImages
  const [activeModalTab, setActiveModalTab] = useState("analysis"); // "analysis" | "ai_predict"
  const [selectedChartToExplore, setSelectedChartToExplore] = useState({ chart: null, isError: false });

  const [aiPredictData, setAiPredictData] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      fetchFlightAnalysis(flightId),
      fetchAIPredictData(flightId)
    ]).then(([resAnalysis, resPredict]) => {
      if (active) {
        setData(resAnalysis);
        setAiPredictData(resPredict);
        setLoading(false);
      }
    });

    return () => { active = false; };
  }, [flightId]);

  if (loading || !data) {
    return (
      <div className="flight-detail-overlay" style={{ zIndex: 10000 }}>
        <div className="flight-analysis-modal" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
          <span style={{ color: "#64786a", fontSize: "15px" }}>Đang tải kết quả phân tích...</span>
        </div>
      </div>
    );
  }

  const handleStatusChange = (stt, newStatus) => {
    setData((prev) => {
      const newData = { ...prev };
      const newAnalysis = [...newData.analysisData];
      const rowIndex = newAnalysis.findIndex(r => r.stt === stt);
      if (rowIndex !== -1) {
        newAnalysis[rowIndex] = { ...newAnalysis[rowIndex], status: newStatus };
        newData.analysisData = newAnalysis;
      }
      return newData;
    });
  };

  const handleAnalysisDataChange = (stt, field, value) => {
    setData((prev) => {
      const newData = { ...prev };
      const newAnalysis = [...newData.analysisData];
      const rowIndex = newAnalysis.findIndex(r => r.stt === stt);
      if (rowIndex !== -1) {
        newAnalysis[rowIndex] = { ...newAnalysis[rowIndex], [field]: value };
        newData.analysisData = newAnalysis;
      }
      return newData;
    });
  };

  // Chia dữ liệu bảng thành mảng
  const rows = data.analysisData || [];

  return (
    <>
    <div className="flight-detail-overlay" style={{ zIndex: 10000 }} onClick={onClose}>
      
      {/* ── Tabs phía trên Modal (Tràn ra ngoài khối chính) ── */}
      <div className="flight-analysis-container" onClick={(e) => e.stopPropagation()}>
        <div className="flight-analysis-tabs">
          <button 
            className={`analysis-tab-btn ${activeModalTab === "analysis" ? "active" : ""}`}
            onClick={() => setActiveModalTab("analysis")}
          >
            Kết quả phân tích
          </button>
          <button 
            className={`analysis-tab-btn ${activeModalTab === "ai_predict" ? "active" : ""}`}
            onClick={() => setActiveModalTab("ai_predict")}
          >
            AI predict log error
          </button>
        </div>

        <div className="flight-analysis-modal">
          {/* Nút đóng */}
          <button className="flight-detail-close-btn" onClick={onClose} title="Đóng">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="flight-analysis-content-scroller">
            {activeModalTab === "analysis" ? (
              <>
            {/* ── Header ── */}
            <div className="flight-report-header" style={{ marginBottom: "28px", paddingRight: "40px" }}>
              <div className="flight-report-title">
                <h2 style={{ fontSize: "30px", marginBottom: "12px", color: "#586c5e" }}>Kết quả phân tích dữ liệu bay</h2>
                <div className="flight-report-title-line" style={{ width: "230px", height: "3px" }} />
              </div>
              <div className="flight-report-meta" style={{ gap: "8px 24px", fontSize: "15px" }}>
                <span className="rpt-meta-label">Mã chuyến bay:</span>
                <span className="rpt-meta-val">{data.flightId}</span>
                <span className="rpt-meta-label">Cập nhật lúc:</span>
                <span className="rpt-meta-val">{data.updatedAt}</span>
              </div>
            </div>

            {/* ── Layout Thông tin (2 cột giống ReportModal) ── */}
            <div className="flight-report-body" style={{ marginBottom: "20px" }}>
              <div className="flight-report-left">
                <div className="flight-report-info-grid">
                  <span className="rpt-label">Họ và tên người báo cáo :</span>
                  <span className="rpt-val">{data.reporterName}</span>

                  <span className="rpt-label">Bộ phận :</span>
                  <span className="rpt-val">{data.department}</span>

                  <span className="rpt-label">Mã Drone :</span>
                  <span className="rpt-val">{data.droneCode}</span>

                  <span className="rpt-label">Khu vực bay :</span>
                  <span className="rpt-val">{data.area}</span>

                  <span className="rpt-label">Thời gian xảy ra sự cố :</span>
                  <span className="rpt-val">{data.incidentTime}</span>

                  <span className="rpt-label">Phi công :</span>
                  <span className="rpt-val">{data.pilot}</span>

                  <span className="rpt-label">Đối tác :</span>
                  <span className="rpt-val">{data.partner}</span>
                </div>
              </div>

              <div className="flight-report-right">
                <div className="flight-report-images-section">
                  <div className="rpt-section-label">• Hình ảnh hiện trường</div>
                  <div className="flight-report-images">
                    {data.sceneImages?.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className="flight-report-img-thumb"
                        alt={`Ảnh hiện trường ${i + 1}`}
                        onClick={() => setPreviewIndex(i)}
                      />
                    ))}
                    <button className="flight-report-add-img"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Bảng kết quả phân tích ── */}
            <div className="rpt-section-label" style={{ marginBottom: "12px" }}>
              • Kết quả phân tích dữ liệu bay (hình ảnh kèm theo nếu có lỗi):
            </div>
            <div className="analysis-table-wrap">
              <table className="analysis-data-table">
                <thead>
                  <tr>
                    <th rowSpan="2" className="col-stt">STT</th>
                    <th rowSpan="2" className="col-group">Nhóm</th>
                    <th rowSpan="2" className="col-detail">Chi tiết</th>
                    <th colSpan="3" className="col-status-group">Tình trạng</th>
                    <th rowSpan="2" className="col-status-detail">Chi tiết</th>
                    <th rowSpan="2" className="col-solution">Cách xử lý (đề xuất)</th>
                  </tr>
                  <tr className="sub-header-row">
                    <th className="col-status-sub">Tốt</th>
                    <th className="col-status-sub">Theo dõi</th>
                    <th className="col-status-sub">Xấu</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    // Xử lý rowspan
                    let groupCell = null;
                    if (row.stt === 1) { // Bắt đầu nhóm Phần Cứng (14 ô)
                      groupCell = <td rowSpan={14} className="cell-group">Phần cứng</td>;
                    } else if (row.stt === 15) { // Bắt đầu nhóm Hành vi (2 ô)
                      groupCell = <td rowSpan={2} className="cell-group">Hành vi</td>;
                    }

                    return (
                      <tr key={row.stt}>
                        <td className="cell-stt">{row.stt}</td>
                        {groupCell}
                        <td className="cell-detail">{row.detail}</td>
                        <td className="cell-radio">
                          <input 
                            type="radio" 
                            name={`status-${row.stt}`}
                            checked={row.status === "Tốt"} 
                            onChange={() => handleStatusChange(row.stt, "Tốt")}
                          />
                        </td>
                        <td className="cell-radio">
                          <input 
                            type="radio" 
                            name={`status-${row.stt}`}
                            checked={row.status === "Theo dõi"} 
                            onChange={() => handleStatusChange(row.stt, "Theo dõi")}
                          />
                        </td>
                        <td className="cell-radio">
                          <input 
                            type="radio" 
                            name={`status-${row.stt}`}
                            checked={row.status === "Xấu"} 
                            onChange={() => handleStatusChange(row.stt, "Xấu")}
                          />
                        </td>
                        {!row.omitDetailAndSolution && (
                          <td className="cell-status-detail cell-input-container" rowSpan={row.statusDetailRowSpan || 1}>
                            <textarea
                              className="analysis-table-textarea"
                              value={row.statusDetail || ""}
                              onChange={(e) => handleAnalysisDataChange(row.stt, "statusDetail", e.target.value)}
                            />
                          </td>
                        )}
                        {!row.omitDetailAndSolution && (
                          <td className="cell-solution cell-input-container" rowSpan={row.solutionRowSpan || 1}>
                            <textarea
                              className="analysis-table-textarea"
                              value={row.solution || ""}
                              onChange={(e) => handleAnalysisDataChange(row.stt, "solution", e.target.value)}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}

                  {/* Hàng KẾT LUẬN */}
                  <tr className="analysis-conclusion-row">
                    <td colSpan={2} className="cell-conclusion-label">KẾT LUẬN</td>
                    <td className="cell-conclusion-reason bold-text cell-input-container">
                      <input 
                        type="text"
                        className="analysis-table-input bold-text"
                        value={data.conclusionReason || ""}
                        onChange={(e) => setData({ ...data, conclusionReason: e.target.value })}
                        placeholder="Nhập lý do..."
                      />
                    </td>
                    <td colSpan={5} className="cell-conclusion-detail bold-text cell-input-container">
                      <input 
                        type="text"
                        className="analysis-table-input bold-text"
                        value={data.conclusionDetail || ""}
                        onChange={(e) => setData({ ...data, conclusionDetail: e.target.value })}
                        placeholder="Nhập kết luận chi tiết..."
                      />
                    </td>
                  </tr>
                  {/* Hàng Phân tích chi tiết */}
                  <tr className="analysis-detail-row">
                    <td colSpan={2} className="cell-conclusion-label">Phân tích chi tiết</td>
                    <td colSpan={6} className="cell-detailed-text cell-input-container">
                      <textarea
                        className="detailed-analysis-textarea"
                        value={data.detailedAnalysis || ""}
                        onChange={(e) => setData({ ...data, detailedAnalysis: e.target.value })}
                        placeholder="Nhập phân tích chi tiết..."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── Hình ảnh liên quan đến lỗi ── */}
            <div className="analysis-error-images-section">
              <label>*Hình ảnh liên quan đến lỗi:</label>
              <div className="flight-report-images">
                {data.errorImages?.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    className="flight-report-img-thumb"
                    alt={`Ảnh lỗi ${i + 1}`}
                    onClick={() => setErrorPreviewIndex(i)}
                  />
                ))}
                <button className="flight-report-add-img"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg></button>
              </div>
            </div>

            {/* ── Footer Form ── */}
            <div className="analysis-bottom-fields">
              <div className="analysis-bottom-left">
                <label>*Đề xuất cách sửa chữa:</label>
                <textarea 
                  className="analysis-edit-textarea" 
                  defaultValue={data.repairSuggestion} 
                />
              </div>
              <div className="analysis-bottom-right">
                <div className="analysis-input-group">
                  <label>*Phân tích bởi:</label>
                  <input 
                    type="text" 
                    className="analysis-input" 
                    value={data.analyzedBy || ""} 
                    onChange={(e) => setData({ ...data, analyzedBy: e.target.value })}
                  />
                </div>
                <div className="analysis-input-group">
                  <label>*Xét duyệt bởi:</label>
                  <input type="text" className="analysis-input" defaultValue={data.approvedBy} />
                </div>
              </div>
            </div>
            
            {/* ── Footer Actions ── */}
            <div className="analysis-footer-actions">
              <button className="btn-save-store">Lưu trữ</button>
              <button className="btn-confirm">Xác nhận</button>
              <div className="analysis-report-radios">
                <label className="radio-label">
                  <input type="radio" name="rptType" defaultChecked={data.reportType === "Report"} /> Report
                </label>
                <label className="radio-label">
                  <input type="radio" name="rptType" defaultChecked={data.reportType === "Dữ liệu log"} /> Dữ liệu log
                </label>
              </div>
              <button className="btn-report-error">Báo lỗi</button>
            </div>
            </>
            ) : (
              <AIPredictTab 
                data={aiPredictData} 
                onSelectChart={(chart, isError) => setSelectedChartToExplore({ chart, isError })} 
                onClose={onClose} 
              />
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Lightbox cho báo lỗi AI */}
    <AIChartDetailModal 
      chartData={selectedChartToExplore.chart} 
      isError={selectedChartToExplore.isError} 
      onClose={() => setSelectedChartToExplore({ chart: null, isError: false })} 
    />

    {/* Lightbox cho sceneImages */}
    {previewIndex !== null && data?.sceneImages && (
      <ImageLightbox
        images={data.sceneImages}
        startIndex={previewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    )}

    {/* Lightbox cho errorImages */}
    {errorPreviewIndex !== null && data?.errorImages && (
      <ImageLightbox
        images={data.errorImages}
        startIndex={errorPreviewIndex}
        onClose={() => setErrorPreviewIndex(null)}
      />
    )}
    </>
  );
}

/* ============================================================
   COMPONENT CHÍNH: LogManagement
   ============================================================ */
export default function LogManagement() {
  /* ---------- States ---------- */
  const [allLogs, setAllLogs]                   = useState([]);
  const [warningLogs, setWarningLogs]           = useState([]);
  const [isLoading, setIsLoading]               = useState(true);
  const [searchFlightId, setSearchFlightId]     = useState("");
  const [filterDroneType, setFilterDroneType]   = useState("Tất cả");
  const [filterMaHieu, setFilterMaHieu]         = useState("Tất cả");
  const [filterNhomLoi, setFilterNhomLoi]       = useState("Tất cả");
  const [hideNormal, setHideNormal]             = useState(false);
  const [showOnlyError, setShowOnlyError]       = useState(false);
  const [exportActive, setExportActive]         = useState(false);
  const [showWarningDropdown, setShowWarningDropdown] = useState(false);
  const [selectedFlightId, setSelectedFlightId] = useState(null);
  const [reportFlightId, setReportFlightId]     = useState(null);
  const [analysisFlightId, setAnalysisFlightId] = useState(null);
  const warningDropdownRef = useRef(null);

  /* ---------- Click Outside Listener ---------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (warningDropdownRef.current && !warningDropdownRef.current.contains(event.target)) {
        setShowWarningDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- Load data khi mount ---------- */
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      // Gọi qua Service Layer để decouples hoàn toàn khởi data thật 
      const [data, warnData] = await Promise.all([
        fetchLogData(),
        fetchWarningLogs()
      ]);
      setAllLogs(data);
      setWarningLogs(warnData);
      setIsLoading(false);
    };
    load();
  }, []);

  /* ---------- Logic lọc (6 điều kiện) ---------- */
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // 1. Tìm kiếm Flight ID (không phân biệt hoa thường)
      if (
        searchFlightId &&
        !log.flightId.toLowerCase().includes(searchFlightId.toLowerCase())
      )
        return false;

      // 2. Loại máy bay
      if (filterDroneType !== "Tất cả" && log.drone !== filterDroneType)
        return false;

      // 3. Mã hiệu
      if (filterMaHieu !== "Tất cả" && log.maHieu !== filterMaHieu)
        return false;

      // 4. Nhóm lỗi
      if (filterNhomLoi !== "Tất cả") {
        if (filterNhomLoi === "Không lỗi" && log.nhomLoi.length > 0)
          return false;
        if (
          filterNhomLoi !== "Không lỗi" &&
          !log.nhomLoi.includes(filterNhomLoi)
        )
          return false;
      }

      // 5. Ẩn chuyến bay bình thường
      if (hideNormal && log.tinhTrang === "Bình thường") return false;

      // 6. Chỉ hiện chuyến bay có lỗi (icon ⚠️)
      if (showOnlyError && log.nhomLoi.length === 0) return false;

      return true;
    });
  }, [
    allLogs,
    searchFlightId,
    filterDroneType,
    filterMaHieu,
    filterNhomLoi,
    hideNormal,
    showOnlyError,
  ]);

  /* ---------- Handler: nút Export stub ---------- */
  const handleExport = () => {
    setExportActive((prev) => !prev);
    // TODO: thêm logic downloadCSV(filteredLogs) khi có backend
  };

  /* ======================================================
     RENDER
     ====================================================== */
  return (
    <div className="log-management">
      {isLoading ? (
        <LogLoadingScreen />
      ) : (
        <>
          {/* ─── ROW 1: BỘ LỌC ─── */}
          <div className="dashboard-filter-grid">

            {/* Filter 1: Tìm kiếm Flight ID */}
            <fieldset className="dashboard-filter">
              <legend className="dashboard-filter-label">Flight ID</legend>
              <div className="log-search-wrap">
                <input
                  type="text"
                  placeholder="Tìm kiếm mã chuyến bay"
                  value={searchFlightId}
                  onChange={(e) => setSearchFlightId(e.target.value)}
                />
                <span className="log-search-icon">
                  <IconSearch />
                </span>
              </div>
            </fieldset>

            {/* Filter 2: Loại máy bay */}
            <CustomSelect
              label="Loại máy bay"
              value={filterDroneType}
              options={LOG_DRONE_TYPE_OPTIONS}
              onChange={setFilterDroneType}
            />

            {/* Filter 3: Mã hiệu */}
            <CustomSelect
              label="Mã hiệu"
              value={filterMaHieu}
              options={LOG_MA_HIEU_OPTIONS}
              onChange={setFilterMaHieu}
            />

            {/* Filter 4: Nhóm lỗi */}
            <CustomSelect
              label="Nhóm lỗi"
              value={filterNhomLoi}
              options={LOG_NHOM_LOI_OPTIONS}
              onChange={setFilterNhomLoi}
            />
          </div>

          {/* ─── ROW 2: SUB-CONTROLS ─── */}
          <div className="log-sub-controls">
            {/* Checkbox ẩn bình thường */}
            <label className="dashboard-flight-type-item">
              <input
                type="checkbox"
                checked={hideNormal}
                onChange={(e) => setHideNormal(e.target.checked)}
              />
              <span>Ẩn các chuyến bay bình thường</span>
            </label>

            {/* Nhóm nút icon và thống kê */}
            <div className="log-action-group">
              {/* Badge thống kê động */}
              <div className="log-stats-badge">
                Số lượng: <span className="log-stats-badge-val">{filteredLogs.length}</span>
              </div>

              {/* Nút Export — Stub UI */}
              <button
                type="button"
                className={`log-action-btn ${exportActive ? "active" : ""}`}
                title="Xuất danh sách (CSV)"
                onClick={handleExport}
              >
                <IconExport />
              </button>

              {/* Warning button with dropdown trigger */}
              <div className="log-warning-wrap" ref={warningDropdownRef}>
                <button
                  type="button"
                  className={`log-action-btn log-action-btn--warn ${
                    showWarningDropdown ? "active" : ""
                  }`}
                  title="Xem danh sách cảnh báo"
                  onClick={() => setShowWarningDropdown((prev) => !prev)}
                >
                  <IconWarning />
                </button>
                
                {/* DROPDOWN MENU FOR WARNINGS */}
                {showWarningDropdown && (
                  <div className="log-warning-dropdown">
                    <button type="button" className="log-warning-update-btn">Cập nhật</button>
                    <div className="log-warning-list">
                      {warningLogs.map((warn) => (
                        <div key={warn.id} className="log-warning-item">
                          Mã chuyến bay: {warn.flightId}; Ngày - giờ bay: {warn.dateTime}; Tình trạng: <span className="text-red">{warn.tinhTrang}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─── ROW 3: BẢNG DỮ LIỆU ─── */}
          <div className="log-table-wrap">
            <table className="log-table">

              {/* THEAD — cố định, 10 cột */}
              <thead>
                <tr>
                  {/* Cột Status với legend tooltip khi hover */}
                  <th className="log-col-status">
                    <div className="log-status-header">
                      Status
                      <div className="log-legend-box">
                        {Object.entries(STATUS_MAP).map(([key, val]) => (
                          <div key={key} className="log-legend-row">
                            <span
                              className="log-status-dot"
                              style={{ backgroundColor: val.color }}
                            />
                            <span className="log-legend-label">{val.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </th>
                  <th>Flight ID</th>
                  <th>Drone</th>
                  <th className="text-center">Mã Hiệu</th>
                  <th>Tỉnh</th>
                  <th>Đội bay</th>
                  <th>Phi công</th>
                  <th>Nhóm lỗi</th>
                  <th>Trách nhiệm</th>
                  <th className="text-center">Tình trạng</th>
                </tr>
              </thead>

              {/* TBODY */}
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="log-empty">
                      Không có dữ liệu phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((row) => {
                    const statusInfo =
                      STATUS_MAP[row.status] || STATUS_MAP.normal;
                    return (
                      <tr key={row.id} onClick={() => setSelectedFlightId(row.flightId)} style={{ cursor: "pointer" }}>
                        {/* Status dot in button for dropdown */}
                        <td className="log-col-status">
                          <div className="log-status-cell">
                            <button 
                              type="button" 
                              className="log-status-btn"
                                title="Đổi trạng thái"
                              >
                                <div
                                  className="log-status-dot"
                                  style={{ backgroundColor: statusInfo.color }}
                                />
                              </button>
                              
                              {/* Hover Dropdown Menu */}
                              <div className="log-status-menu">
                                {Object.entries(STATUS_MAP).map(([key, val]) => (
                                  <button
                                    key={key}
                                    type="button"
                                    className="log-status-menu-item"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // TODO: Lọc xử lý API thay đổi trạng thái tại đây
                                    }}
                                  >
                                    <div 
                                      className="log-status-dot" 
                                      style={{ backgroundColor: val.color }}
                                    />
                                    <span>{val.label}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </td>

                          {/* Flight ID — monospace nổi bật */}
                          <td className="log-flightid">{row.flightId}</td>

                          {/* Drone */}
                          <td>{row.drone}</td>

                        {/* Mã Hiệu */}
                        <td className="text-center">{row.maHieu}</td>

                        {/* Tỉnh */}
                        <td>{row.tinh}</td>

                        {/* Đội bay */}
                        <td>{row.doiBay}</td>

                        {/* Phi công */}
                        <td>{row.phiCong}</td>

                        {/* Nhóm lỗi — expandable */}
                        <td>
                          <NhomLoiCell nhomLoi={row.nhomLoi} />
                        </td>

                        {/* Trách nhiệm */}
                        <td>{row.trachNhiem}</td>

                        {/* Tình trạng badge */}
                        <td className="text-center">
                          <span
                            className={
                              row.tinhTrang === "Rơi" ? "log-badge log-badge--error" :
                              row.tinhTrang === "Bất thường"
                                ? "log-badge log-badge--warn"
                                : "log-badge log-badge--normal"
                            }
                          >
                            {row.tinhTrang}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Flight Detail Modal */}
      {selectedFlightId && (
        <FlightDetailModal
          flightId={selectedFlightId}
          onClose={() => setSelectedFlightId(null)}
          onOpenReport={() => {
            const id = selectedFlightId;
            setSelectedFlightId(null);
            setReportFlightId(id);
          }}
          onOpenAnalysis={() => {
            const id = selectedFlightId;
            setSelectedFlightId(null);
            setAnalysisFlightId(id);
          }}
        />
      )}

      {/* Flight Report Modal — opens on top when "Báo cáo hiện trường" is clicked */}
      {reportFlightId && (
        <FlightReportModal
          flightId={reportFlightId}
          onClose={() => setReportFlightId(null)}
        />
      )}

      {/* Flight Analysis Modal — Kết quả phân tích và AI */}
      {analysisFlightId && (
        <FlightAnalysisModal
          flightId={analysisFlightId}
          onClose={() => setAnalysisFlightId(null)}
        />
      )}
    </div>
  );
}
