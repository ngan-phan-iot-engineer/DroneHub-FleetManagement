import { useEffect, useState } from "react";
import {
  fetchDroneManagementDetail,
  fetchDroneManagementHistory,
  fetchDroneManagementList,
} from "../../services/dashboardApi";
import DroneList from "./DroneList";
import DroneDetail from "./DroneDetail";
import "./DroneManagement.css";

const DEFAULT_PAGE_SIZE = 5;

const EMPTY_PAGINATION = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
};

function DroneManagement() {
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeDroneId, setActiveDroneId] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [historyType, setHistoryType] = useState("flight");
  const [historyKeyword, setHistoryKeyword] = useState("");
  const [historyRows, setHistoryRows] = useState([]);
  const [historyPagination, setHistoryPagination] = useState(EMPTY_PAGINATION);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const loadDroneList = async () => {
      setLoading(true);
      const listResponse = await fetchDroneManagementList({
        keyword,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setRows(listResponse.rows);
      setPagination(listResponse.pagination);
      setLoading(false);
    };

    if (!activeDroneId) {
      loadDroneList();
    }
  }, [keyword, pagination.page, pagination.pageSize, activeDroneId]);

  useEffect(() => {
    if (!activeDroneId) {
      return;
    }

    const loadDetail = async () => {
      setDetailLoading(true);
      const detailResponse = await fetchDroneManagementDetail(activeDroneId);
      setDetail(detailResponse);
      setDetailLoading(false);
    };

    loadDetail();
  }, [activeDroneId]);

  useEffect(() => {
    if (!activeDroneId) {
      return;
    }

    const loadHistory = async () => {
      setHistoryLoading(true);
      const historyResponse = await fetchDroneManagementHistory({
        droneId: activeDroneId,
        historyType,
        keyword: historyKeyword,
        page: historyPagination.page,
        pageSize: historyPagination.pageSize,
      });

      setHistoryRows(historyResponse.rows);
      setHistoryPagination(historyResponse.pagination);
      setHistoryLoading(false);
    };

    loadHistory();
  }, [activeDroneId, historyType, historyKeyword, historyPagination.page, historyPagination.pageSize]);

  const handleOpenDetail = (droneId) => {
    setActiveDroneId(droneId);
    setHistoryType("flight");
    setHistoryKeyword("");
    setHistoryPagination(EMPTY_PAGINATION);
  };

  const handleBackToList = () => {
    setActiveDroneId("");
    setDetail(null);
  };

  const handleKeywordChange = (nextKeyword) => {
    setKeyword(nextKeyword);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleHistoryKeywordChange = (nextKeyword) => {
    setHistoryKeyword(nextKeyword);
    setHistoryPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleHistoryTypeChange = (nextType) => {
    setHistoryType(nextType);
    setHistoryKeyword("");
    setHistoryPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="drone-management-root">
      {activeDroneId ? (
        <DroneDetail
          detail={detail}
          detailLoading={detailLoading}
          historyType={historyType}
          onHistoryTypeChange={handleHistoryTypeChange}
          historyRows={historyRows}
          historyLoading={historyLoading}
          historyKeyword={historyKeyword}
          onHistoryKeywordChange={handleHistoryKeywordChange}
          historyPagination={historyPagination}
          onPrevHistoryPage={() =>
            setHistoryPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
          }
          onNextHistoryPage={() =>
            setHistoryPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))
          }
          onBack={handleBackToList}
        />
      ) : (
        <>
          <header className="drone-management-page-header">
            <h1>Quản lý Drone</h1>
          </header>

          <DroneList
            rows={rows}
            loading={loading}
            keyword={keyword}
            onKeywordChange={handleKeywordChange}
            onOpenDetail={handleOpenDetail}
            pagination={pagination}
            onPrevPage={() =>
              setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
            }
            onNextPage={() =>
              setPagination((prev) => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))
            }
          />
        </>
      )}
    </div>
  );
}

export default DroneManagement;
