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
import AdminLayout from "@/components/layout/adminlayout";
import styles from "../../../styles/admin/leaverequest/leave_request.module.scss";
import YearSelector from "@/components/datepicker/yearpicker";
import { useSession } from "next-auth/react";
import RequestLeaveForm from "@/components/forms/registerrequestleave/index";
import Modal from "react-modal";
import {showAlert} from '@/utils/toastHelper';

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
type LeaveRequest = {
  id: number;
  requestDate: string | string[] |null;
  type: number;
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
  const { data: session, status } = useSession();
  const [year, setYear] = useState<Date | null>(new Date());
  const [isClient, setIsClient] = useState(false);
  const [allLeaverequestData, setAllLeaveRequestData] = useState<
    LeaveRequest[]
  >([]);
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const [editData, setEditData] = useState<LeaveRequest | null > (null);
  const API_URL = "https://api.npoint.io/32aaf1a75ec509b50c83";
  const [deleteData, setDeleteData] = useState<number | null>(null);
  const handleToggleDropdown = (requestId: number) => {
    setOpenDropdownId((prevId) => (prevId === requestId ? null : requestId));
  };
// const onDelete = async (id: number) => {
//   if (confirm("Are you sure you want to delete this request?")) {
//     try{
//       const updatedData = allLeaverequestData.filter(
//         (request) => request.id !== id
//       );
//       const response = await fetch(`https://api.npoint.io/32aaf1a75ec509b50c83/0/${id}`, {
//         method: "PUT",
//         headers:{
//           "Content-Type" : "application/json",
//         },
//         body: JSON.stringify(updatedData),
//       });
//       if(!response.ok) throw new Error("Failed to update API");
//       setAllLeaveRequestData(updatedData);
//       showAlert('success', "Leave Request deleted from server!");

//     }catch(error){
//       console.error("Delete failed:" ,error);
//       showAlert("error","Could not Delete Request!" );
//     }
    
//   }
// };
const onDelete = (id: number) => {
  if (confirm("Are you sure you want to delete this request?")) {
    setAllLeaveRequestData((prev) =>
      prev.filter((request) => request.id !== id)
    );

    setFilteredRequests((prev) =>
      prev.filter((request) => request.id !== id)
    );

    showAlert("success", "Leave request removed from table!");
  }
};

  const fetchLeaveRequests = useCallback(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data: LeaveRequest[]) => {
        setAllLeaveRequestData(data);
      })
      .catch((error) => console.error("Error fetching leave requests:", error));
  }, [API_URL]);

  useEffect(() => {
    setIsClient(true);
    fetch(API_URL)
      .then((response) => response.json())
      .then((data: LeaveRequest[]) => {
        setAllLeaveRequestData(data);
      })
      .catch((error) => console.error("Error fetching leave requests:", error));
  }, []);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.id &&
      allLeaverequestData.length > 0
    ) {
      const currentUserId = parseInt(session.user.id, 10);
      const userLeaveData = allLeaverequestData.filter(
        (record) => record.staff_id === currentUserId
      );
      setFilteredRequests(userLeaveData);
    }
  }, [session, status, allLeaverequestData]);
  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);
  return (
    <div className={styles.container}>
      <div className={styles.firstrow}>
        <div className={styles.row1}>
          <div className={styles.box}>
            <p className={styles.bigtext}>20</p>
            <p className={styles.smalltext}>Leave(s) Allowed</p>
          </div>
          <div className={styles.box}>
            <p className={styles.bigtext}>16.5</p>
            <p className={styles.smalltext}>Available Leaves</p>
          </div>
          <div className={styles.box}>
            <p className={styles.bigtext}>16.5</p>
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
            <YearSelector />
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
            {filteredRequests.map((request) => (
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
                    onEdit={() => {setEditData(request);
                      setIsRequestModalOpen(true)
                    }}
                    onDelete={() => onDelete(request.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={isRequestModalOpen}
        onRequestClose={() => setIsRequestModalOpen(false)}
        style={customModalStyles}
        contentLabel="Request Leave Form Modal"
      >
        <RequestLeaveForm
          onClose={() => {setIsRequestModalOpen(false);
            setEditData(null);

          }}
          onFormSubmit={fetchLeaveRequests}
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
