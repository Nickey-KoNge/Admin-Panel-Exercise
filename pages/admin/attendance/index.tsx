//pages/admin/attendance/index.tsx
"use client";

import type { NextPage } from "next";
import {
  useState,
  useEffect,
  ReactElement,
  ReactNode,
} from "react";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/attendance/attendance.module.scss";
import YearSelector from "@/components/datepicker/yearpicker";
import { useSession } from "next-auth/react";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
type AttendanceList = {
  id: number;
  staff_id: number;
  location: string | null;
  status: string;
  check_in_time: string;
  check_out_time: string;
};

const AttendancePage: NextPageWithLayout = () => {
  const { data: session, status } = useSession();

  const [allattendancerequestdata, setAllAttendanceRequestData] = useState<
    AttendanceList[]
  >([]);
    // front end side page calculation
  const [currentPage, setCurrentPage] = useState(1);
  const itemspage = 5;

  const lastitem = currentPage * itemspage;
  const firstitem = lastitem - itemspage;
  const currentItems = allattendancerequestdata.slice(firstitem, lastitem);

  const totalPages = Math.ceil(allattendancerequestdata.length / itemspage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  // front end side page calculation

  const API_URL = "https://api.npoint.io/8cc269d800e64d0215ab";

  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data: AttendanceList[]) => {
        setAllAttendanceRequestData(data);
       
      })
      .catch((error) =>
        console.error("Error fetching Attendance Leave requests:", error)
      
    );
  }, []);
  function formatTime(timeString: string) {
    if (!timeString) return "";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <div className={styles.container}>
     
      <div className={styles.secondrow}>
        <div className={styles.information}>
          <div className={styles.tableHeader}>
            <h3 className={styles.historyTitle}>Attendance</h3>
            <div className={styles.dateFilter}>
              <YearSelector />
            </div>
          </div>
          <div className={styles.searchbox}>
            <span className={styles.searchicon}>🔍</span>
            <input type="text" placeholder="Name, etc.,.." />
          </div>
        </div>

        <table className={styles.leaveTable}>
          <thead>
            <tr>
              <th>Staff</th>
              <th>Check-in & Out</th>
              <th>Overtime</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((request) => (
              <tr key={request.id}>
                <td>{request.staff_id}</td>
                <td>
                  {formatTime(request.check_in_time)} – {" "}
                  {formatTime(request.check_out_time)}
                </td>
                <td>1</td>
                <td>{request.location}</td>
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
AttendancePage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};
export default AttendancePage;
