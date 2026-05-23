import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import CustomSelect from './CustomSelect';
import {
    fetchDashboardOverview,
    fetchDashboardReportFilterOptions,
} from '../../services/dashboardApi';
import './DashboardReportModal.css';

// Component hoạt ảnh nhảy số (CountUp)
const CountUpValue = ({ value }) => {
    const [displayVal, setDisplayVal] = useState(0);

    useEffect(() => {
        let start = 0;
        const duration = 1000; 
        const startTime = performance.now();

        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Easing function (easeOutExpo)
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setDisplayVal(Math.floor(easeProgress * value));

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                setDisplayVal(value);
            }
        };

        requestAnimationFrame(step);
    }, [value]);

    return <>{displayVal}</>;
};

// ==========================================
// COMPONENT CHÍNH
// ==========================================
const DashboardReportModal = ({ onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [filterOptions, setFilterOptions] = useState({
        timeRanges: [],
        drones: [],
        companies: [],
        teams: [],
    });

    // Filter states (UI state)
    const [timeRange, setTimeRange] = useState('');
    const [drone, setDrone] = useState('');
    const [company, setCompany] = useState('');
    const [team, setTeam] = useState('');

    useEffect(() => {
        let isMounted = true;

        // Lắng nghe phím Esc để đóng
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);

        const normalizeSelectedValue = (currentValue, options) => {
            if (!Array.isArray(options) || options.length === 0) return '';
            if (currentValue && options.includes(currentValue)) return currentValue;
            return options[0];
        };

        const loadDashboardPopupData = async () => {
            const [overviewResponse, filterOptionsResponse] = await Promise.all([
                fetchDashboardOverview(),
                fetchDashboardReportFilterOptions(),
            ]);

            if (!isMounted) return;

            setData(overviewResponse);
            setFilterOptions(filterOptionsResponse);
            setTimeRange((prev) => normalizeSelectedValue(prev, filterOptionsResponse.timeRanges));
            setDrone((prev) => normalizeSelectedValue(prev, filterOptionsResponse.drones));
            setCompany((prev) => normalizeSelectedValue(prev, filterOptionsResponse.companies));
            setTeam((prev) => normalizeSelectedValue(prev, filterOptionsResponse.teams));
            setLoading(false);
        };

        loadDashboardPopupData();

        return () => {
            isMounted = false;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    if (loading) {
        return (
            <div className="dashboard-report-overlay">
                <div className="dashboard-report-modal" style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f8f6' }}>
                    <div className="flight-data-loading" style={{ background: 'transparent', boxShadow: 'none' }}>
                        <svg width="80" height="80" viewBox="0 0 32 32" className="spinning-logo">
                            <polygon points="13,0 32,7 32,25 13,32 0,16" className="spinning-hexagon" />
                            <text x="18" y="16" textAnchor="middle" dominantBaseline="central" fontFamily="Montserrat, sans-serif" fontWeight="bold" fontSize="14" fill="#fff">mi</text>
                        </svg>
                        <p className="loading-text" style={{ color: '#64786A', marginTop: '16px', fontWeight: '500', fontSize: '15px' }}>Đang tải dữ liệu...</p>
                    </div>
                </div>
            </div>
        );
    }

    // --- CẤU HÌNH ECHARTS ---
    const stackedBarOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        legend: { show: false }, // Legend được hiển thị qua màu thẻ ở trên
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.stackedBarData.categories,
            axisLabel: { color: '#6a746e', fontSize: 11 },
            axisLine: { lineStyle: { color: '#d2ded7' } }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#e5e9e6' } },
            axisLabel: { color: '#6a746e' }
        },
        series: [
            {
                name: 'Bình Thường',
                type: 'bar',
                stack: 'total',
                barWidth: '45%',
                itemStyle: { color: '#64786A' },
                data: data.stackedBarData.series.normal
            },
            {
                name: 'Cảnh Báo',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#FF9800' },
                data: data.stackedBarData.series.warning
            },
            {
                name: 'Rơi',
                type: 'bar',
                stack: 'total',
                itemStyle: { color: '#E53935' },
                data: data.stackedBarData.series.crash
            }
        ]
    };

    const donutOption = {
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center', icon: 'circle', textStyle: { color: '#6a746e' } },
        series: [
            {
                name: 'Tình trạng bay',
                type: 'pie',
                radius: ['45%', '75%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'inside',
                    formatter: '{d}%',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 'bold'
                },
                data: data.pieData
            }
        ]
    };

    const errorBarOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '8%', containLabel: true },
        xAxis: {
            type: 'category',
            data: data.errorBarData.categories,
            axisLabel: { color: '#6a746e', interval: 0, fontSize: 11 },
            axisLine: { lineStyle: { color: '#d2ded7' } }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#e5e9e6' } },
            axisLabel: { color: '#6a746e' }
        },
        series: [
            {
                name: 'Số lượng lỗi',
                type: 'bar',
                barWidth: '55%',
                itemStyle: { 
                    color: '#E53935',
                    borderRadius: [4, 4, 0, 0] // Bo góc nhẹ cho cột
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#E53935',
                    fontWeight: 'bold'
                },
                data: data.errorBarData.values
            }
        ]
    };

    return (
        <div className="dashboard-report-overlay" onClick={onClose}>
            <div className="dashboard-report-modal" onClick={e => e.stopPropagation()}>
                <button className="dashboard-report-close-btn" onClick={onClose}>✕</button>
                <h2 className="dashboard-report-title">DASHBOARD</h2>

                <div className="dashboard-report-content">
                    {/* BỘ LỌC */}
                    <div className="dashboard-report-filters">
                        <CustomSelect label="Khoảng thời gian" value={timeRange} options={filterOptions.timeRanges} onChange={setTimeRange} />
                        <CustomSelect label="Drone" value={drone} options={filterOptions.drones} onChange={setDrone} />
                        <CustomSelect label="Công ty" value={company} options={filterOptions.companies} onChange={setCompany} />
                        <CustomSelect label="Đội bay" value={team} options={filterOptions.teams} onChange={setTeam} />
                    </div>

                    {/* KPI CARDS */}
                    <div className="dashboard-report-kpi-grid">
                        <div className="dr-kpi-card kpi-main">
                            <div className="dr-kpi-title">Tổng số chuyến bay</div>
                            <div className="dr-kpi-value"><CountUpValue value={data.kpi.totalFlights} /></div>
                        </div>
                        <div className="dr-kpi-card kpi-normal">
                            <div className="dr-kpi-title">Số chuyến bay bình thường</div>
                            <div className="dr-kpi-value"><CountUpValue value={data.kpi.normalFlights} /></div>
                        </div>
                        <div className="dr-kpi-card kpi-warning">
                            <div className="dr-kpi-title">Số chuyến bay cảnh báo</div>
                            <div className="dr-kpi-value"><CountUpValue value={data.kpi.warningFlights} /></div>
                        </div>
                        <div className="dr-kpi-card kpi-danger">
                            <div className="dr-kpi-title">Số chuyến bay rơi</div>
                            <div className="dr-kpi-value"><CountUpValue value={data.kpi.crashFlights} /></div>
                        </div>
                    </div>

                    {/* BIỂU ĐỒ STACKED BAR CHÍNH */}
                    <div className="dr-chart-card">
                        <div className="dr-chart-title">
                            Thống kê trạng thái chuyến bay
                            <span className="dr-chart-title-sub">tất cả các đội</span>
                        </div>
                        <ReactECharts option={stackedBarOption} style={{ height: '320px' }} />
                    </div>

                    {/* 2 BIỂU ĐỒ CON BÊN DƯỚI */}
                    <div className="dr-chart-row-2">
                        <div className="dr-chart-card">
                            <div className="dr-chart-title">Thống kê tình trạng bay</div>
                            <ReactECharts option={donutOption} style={{ height: '280px' }} />
                        </div>
                        <div className="dr-chart-card">
                            <div className="dr-chart-title">Thống kê số lượng lỗi</div>
                            <ReactECharts option={errorBarOption} style={{ height: '280px' }} />
                        </div>
                    </div>

                    {/* NÚT IN DASHBOARD */}
                    <div className="dr-footer-actions">
                        <button className="dr-btn-print" onClick={() => alert("Tính năng In Dashboard đang phát triển!")}>
                            In Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardReportModal;
