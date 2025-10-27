// pages/admin/attendance/index.tsx

import type { NextPage } from "next";
import { useState, ReactElement, ReactNode } from "react";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/attendance/attendance.module.scss";
import YearSelector from "@/components/datepicker/yearpicker";
import { useSession } from "next-auth/react";
import { fetcherWithToken } from "@/utils/fetcher";
import useSWR from "swr";

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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  

  const [currentPage, setCurrentPage] = useState(1);
  const itemspage = 5;


  const API_URL = "http://localhost:3000/admin/attendance";
  const {
    data: attendanceData,
    error,
    isLoading,
    mutate,
  } = useSWR<AttendanceList[]>(
    session?.accessToken
      ? [`${API_URL}?year=${selectedYear}`, session.accessToken]
      : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  function formatTime(timeString: string) {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  if (status === "loading" || isLoading) {
    return <p>Loading...</p>;
  }
  if (status === "unauthenticated") {
    return <p>Please log in to view attendance.</p>;
  }
  if (error) {
    return <p>Failed to load data. Please try again later.</p>;
  }

  const dataToPaginate = attendanceData || [];
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
            <h3 className={styles.historyTitle}>Attendance</h3>
            <div className={styles.dateFilter}>
              <YearSelector year={selectedYear} onYearChange={setSelectedYear} />
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
            {currentItems.length > 0 ? (
              currentItems.map((request) => (
                <tr key={request.id}>
                  <td>{request.staff_id}</td> 
                  <td>
                    {formatTime(request.check_in_time)} –{" "}
                    {formatTime(request.check_out_time)}
                  </td>
                  <td>1</td> 
                  <td>{request.location || "N/A"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No attendance data found for {selectedYear}.
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