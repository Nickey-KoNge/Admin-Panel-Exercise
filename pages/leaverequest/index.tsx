//pages/admin/leaverequest/index.tsx
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
import useSWR from "swr";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/leaverequest/leave_request.module.scss";
import YearSelector from "@/components/datepicker/yearpicker";
import { useSession } from "next-auth/react";
import RequestLeaveForm from "@/components/forms/registerrequestleave/index";
import Modal from "react-modal";
import { showAlert } from "@/utils/toastHelper";
import { fetcherWithToken } from "@/utils/fetcher";
import { formatDatesForDisplay } from "@/utils/dateFormatter";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "30px",
    width: "90%",
    maxWidth: "550px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    zIndex: 1000,
  },
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
  onEdit: () => void;
  onDelete: () => void;
};
const ActionDropdown = ({
  isOpen,
  onToggle,
  onEdit,
  onDelete,
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
  }, [isOpen, onToggle, dropdownRef]);
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
            className={styles.editbtn}
            onClick={() => {
              onEdit();
              onToggle();
            }}
          >
            Edit
          </li>
          <li
            className={styles.deletebtn}
            onClick={() => {
              onDelete();
              onToggle();
            }}
          >
            Delete
          </li>
        </ul>
      )}
    </div>
  );
};
const LeaveRequestPage: NextPageWithLayout = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: session, status } = useSession();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editData, setEditData] = useState<LeaveRequest | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const API_URL = "http://localhost:3000/leaverequest";
  const {
    data: leaveRequests,
    error,
    isLoading,
    mutate,
  } = useSWR<LeaveRequest[]>(
    session?.accessToken
      ? [`${API_URL}?year=${selectedYear}`, session.accessToken]
      : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const handleToggleDropdown = (requestId: number) => {
    setOpenDropdownId((prevId) => (prevId === requestId ? null : requestId));
  };
  const onDelete = async (id: number) => {
    if (!session?.accessToken) return;

    if (confirm("Are you sure you want to delete this request?")) {
      try {
        await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        });
        showAlert("success", "Leave request deleted successfully!");

        mutate();
      } catch (err) {
        showAlert("error", "Failed to delete leave request.");
        console.error(err);
      }
    }
  };
  if (status === "loading" || isLoading) {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return <p>Please log in to view your leave requests.</p>;
  }
  if (error) {
    return <p>Failed to load data. Please try again later.</p>;
  }
  if (!leaveRequests) {
    return <p>No leave requests found.</p>;
  }

  const Total_Allowed = 20;
  const leavesTaken = leaveRequests
    .filter(
      (r) =>
        r.status?.toLowerCase() === "approved" &&
        (r.type?.name?.toLowerCase() === "paid leave" ||
          r.type?.name?.toLowerCase() === "maternity")
    )
    .reduce((sum, r) => sum + (r.noofday || 0), 0);
  const avaliableleave = Total_Allowed - leavesTaken;

  const itemspage = 5;
  const lastitem = currentPage * itemspage;
  const firstitem = lastitem - itemspage;
  const currentItems = leaveRequests.slice(firstitem, lastitem);
  const totalPages = Math.ceil(leaveRequests.length / itemspage);
  const handlePageChange = (page: number) => setCurrentPage(page);

  return (
    <div className={styles.container}>
      <div className={styles.firstrow}>
        <div className={styles.row1}>
          <div className={styles.box}>
            <p className={styles.bigtext}>{Total_Allowed}</p>
            <p className={styles.smalltext}>Leave(s) Allowed</p>
          </div>
          <div className={styles.box}>
            <p className={styles.bigtext}>{avaliableleave}</p>
            <p className={styles.smalltext}>Available Leaves</p>
          </div>
          <div className={styles.box}>
            <p className={styles.bigtext}>{leavesTaken}</p>
            <p className={styles.smalltext}>Leaves Taken</p>
          </div>
          <div className={styles.renewtext}>Renew at May, 25</div>
        </div>
        <div>
          <button
            className={styles.leavebutton}
            onClick={() => setIsRequestModalOpen(true)}
          >
            Request Leave
          </button>
        </div>
      </div>
      <div className={styles.secondrow}>
        <div className={styles.tableHeader}>
          <h3 className={styles.historyTitle}>Leave Request History</h3>
          <div className={styles.dateFilter}>
            <YearSelector year={selectedYear} onYearChange={setSelectedYear} />
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
                <td>{formatDatesForDisplay(request.requestDate)}</td>
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
                    onEdit={() => {
                      setEditData(request);
                      setIsRequestModalOpen(true);
                    }}
                    onDelete={() => onDelete(request.id)}
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
      <Modal
        isOpen={isRequestModalOpen}
        onRequestClose={() => setIsRequestModalOpen(false)}
        style={customModalStyles}
        contentLabel="Request Leave Form Modal"
      >
        <RequestLeaveForm
          onClose={() => {
            setIsRequestModalOpen(false);
            setEditData(null);
          }}
          onFormSubmit={mutate}
          editData={editData}
        />
      </Modal>
    </div>
  );
};
LeaveRequestPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
export default LeaveRequestPage;
