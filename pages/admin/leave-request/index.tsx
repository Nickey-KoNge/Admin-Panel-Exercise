//pages/admin/leave-request/index.tsx
"use client";

import type { NextPage } from "next";
import {
  useState,
  useEffect,
  ReactElement,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/leave-request/leave_request.module.scss";
import YearSelector from "@/components/datepicker/yearpicker";
import { useSession } from "next-auth/react";
import { showAlert } from "@/utils/toastHelper";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type LeaveRequest = {
  id: number;
  requestDate: string | string[] | null;
  type: string | null;
  staff_id: number;
  mode: string | null;
  noofday: number | null;
  reason: string | null;
  submittedon: string | null;
  status: string | null;
};

type DropdownProps = {
  isOpen: boolean;
  onToggle: () => void;
  onApprove: () => void;
  onReject: () => void;
};

const ActionDropdown = ({
  isOpen,
  onToggle,
  onApprove,
  onReject,
}: DropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onToggle();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);
  return (
    <div className={styles.dropdownMain} ref={dropdownRef}>
      <i
        className="fa-solid fa-ellipsis-vertical"
        style={{ cursor: "pointer" }}
        onClick={onToggle}
      ></i>
      {isOpen && (
        <ul className={styles.dropdownDesign}>
          <li
            className={styles.approve}
            onClick={() => {
              onApprove();
              onToggle();
            }}
          >
            Approve
          </li>
          <li
            className={styles.reject}
            onClick={() => {
              onReject();
              onToggle();
            }}
          >
            Reject
          </li>
        </ul>
      )}
    </div>
  );
};
const AdminLeaveRequestPage: NextPageWithLayout = () => {
  const { data: session, status } = useSession();
  const [allLeaverequestData, setAllLeaveRequestData] = useState<
    LeaveRequest[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const handleToggleDropdown = (requestId: number) => {
    setOpenDropdownId((prevId) => (prevId === requestId ? null : requestId));
  };
  // front end side page calculation
  const [currentPage, setCurrentPage] = useState(1);
  const itemspage = 5;

  const lastitem = currentPage * itemspage;
  const firstitem = lastitem - itemspage;
  const currentItems = allLeaverequestData.slice(firstitem, lastitem);

  const totalPages = Math.ceil(allLeaverequestData.length / itemspage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // front end side page calculation
  const API_URL = "https://api.npoint.io/32aaf1a75ec509b50c83";

  const fetchLeaveRequests = useCallback(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data: LeaveRequest[]) => {
        setAllLeaveRequestData(data);
      })
      .catch((error) => console.error("Error fetching leave requests:", error));
  }, [API_URL]);
  const updateStatus = async (
    id: number,
    newStatus: "Approved" | "Rejected"
  ) => {
    setIsLoading(true);
    const updatedStaffStatus = allLeaverequestData.map((staff) =>
      staff.id === id ? { ...staff, status: newStatus } : staff
    );

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStaffStatus),
      });
      setAllLeaveRequestData(updatedStaffStatus);
      showAlert("success", "Permissuib Changing successfuly!");
    } catch (err) {
      console.error(`${newStatus} Error!`, err);
      showAlert("error", `Could Not ${newStatus} !`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (allLeaverequestData.length > 0) {
      setFilteredRequests(allLeaverequestData);
    }
  }, [allLeaverequestData]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);
  return (
    <div className={styles.container}>
      <div className={styles.secondrow}>
        <div className={styles.information}>
          <div className={styles.tableHeader}>
            <h3 className={styles.historyTitle}>Leave Requests</h3>
            <div className={styles.dateFilter}>
              <YearSelector />
            </div>
          </div>
          <div className={styles.searchbox}>
            <span className={styles.searchicon}>🔍</span>
            <input type="text" placeholder="Name, Date, etc.,.." />
          </div>
        </div>

        <table className={styles.leaveTable}>
          <thead>
            <tr>
              <th>Dates Requested</th>
              <th>Type</th>
              <th>Mode</th>
              <th>No. of days</th>
              <th>Reason</th>
              <th>Submitted On</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((request) => (
              <tr key={request.id}>
                <td>{request.requestDate}</td>
                <td>{request.type}</td>
                <td>{request.mode}</td>
                <td>{request.noofday}</td>
                <td>{request.reason}</td>
                <td>{request.submittedon}</td>
                <td className={styles.Actionstatus}>
                  <span
                    className={`${styles.status} ${
                      styles[request.status?.toLowerCase() ?? ""]
                    }`}
                  >
                    {request.status}
                  </span>
                  <ActionDropdown
                    isOpen={openDropdownId === request.id}
                    onToggle={() => handleToggleDropdown(request.id)}
                    onApprove={() => updateStatus(request.id, "Approved")}
                    onReject={() => updateStatus(request.id, "Rejected")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? styles.activePage : ""}
            >
              {page}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
AdminLeaveRequestPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
export default AdminLeaveRequestPage;
