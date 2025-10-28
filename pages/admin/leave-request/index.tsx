//pages/admin/leave-request/index.tsx
// "use client";
import type { NextPage } from "next";
import { useState, useEffect, ReactElement, ReactNode, useRef } from "react";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/leave-request/leave_request.module.scss";
import YearSelector from "@/components/datepicker/yearpicker";
import { useSession } from "next-auth/react";
import { showAlert } from "@/utils/toastHelper";
import useSWR from "swr";
import { fetcherWithToken } from "@/utils/fetcher";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type LeaveTypeObject = {
  id: number;
  name: string;
};

type LeaveRequest = {
  id: number;
  requestDate: string | string[] | null;
  type: LeaveTypeObject | null;
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isUpdating, setIsUpdating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  const itemspage = 5;

  const handleToggleDropdown = (requestId: number) => {
    setOpenDropdownId((prevId) => (prevId === requestId ? null : requestId));
  };

  const API_URL = "http://localhost:3000/admin/leaverequest";

  const {
    data: leaveRequests,
    error,
    isLoading: isDataLoading,
    mutate,
  } = useSWR<LeaveRequest[]>(
    session?.accessToken
      ? [
          `${API_URL}?year=${selectedYear}&search=${debouncedSearch}`,
          session.accessToken,
        ]
      : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const updateStatus = async (
    id: number,
    newStatus: "Approved" | "Rejected"
  ) => {
    if (!session?.accessToken) {
      showAlert("error", "Authentication error.");
      return;
    }
    setIsUpdating(true);
    try {
      const response = await fetch(`${API_URL}/status/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      showAlert("success", "Status updated successfully!");
      mutate(); // Tell SWR to refetch the data
    } catch (err) {
      console.error(`${newStatus} Error!`, err);
      showAlert("error", `Could not ${newStatus} the request!`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || isDataLoading) {
    return <p>Loading...</p>;
  }
  if (status === "unauthenticated") {
    return <p>Please log in to view leave requests.</p>;
  }
  if (error) {
    return <p>Failed to load data. Please try again later.</p>;
  }

  const dataToPaginate = leaveRequests || [];
  const lastitem = currentPage * itemspage;
  const firstitem = lastitem - itemspage;
  const currentItems = dataToPaginate.slice(firstitem, lastitem);
  const totalPages = Math.ceil(dataToPaginate.length / itemspage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className={styles.container}>
      <div className={styles.secondrow}>
        <div className={styles.information}>
          <div className={styles.tableHeader}>
            <h3 className={styles.historyTitle}>Leave Requests</h3>
            <div className={styles.dateFilter}>
              <YearSelector
                year={selectedYear}
                onYearChange={setSelectedYear}
              />
            </div>
          </div>
          <div className={styles.searchbox}>
            <span className={styles.searchicon}>🔍</span>
            <input
              type="text"
              placeholder="Name, Date, etc.,.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className={styles.leaveTable}>
          <thead>
            <tr>
              <th>Staff ID</th> 
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
          
            {currentItems.length > 0 ? (
              currentItems.map((request) => (
                <tr key={request.id}>
                  <td>{request.staff_id}</td>
                  <td>{request.requestDate}</td>
                  <td>{request.type?.name}</td> 
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
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  
                  {debouncedSearch
                    ? "No results found for your search."
                    : `No leave requests found for ${selectedYear}.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? styles.activePage : ""}
              disabled={isUpdating}
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
