// import type { NextPage } from "next";
// import { useState, useEffect, ReactElement, ReactNode } from "react";
// import AdminLayout from "@/components/layout/adminlayout";
// import styles from "@/styles/admin/checkinout/checkin_out.module.scss";
// import { useSession } from "next-auth/react";
// import { IoLocationSharp } from "react-icons/io5";
// import { showAlert } from "@/utils/toastHelper";

// type NextPageWithLayout = NextPage & {
//   getLayout?: (page: ReactElement) => ReactNode;
// };
// type CheckInData = {
//   id: number;
//   staff_id: number;
//   check_in_time: string | null;
//   check_out_time: string | null;
//   location: string;
//   status: "CLOCKED_IN" | "CLOCKED_OUT";
// };

// const CheckInOutPage: NextPageWithLayout = () => {
//   const { data: session, status } = useSession();
//   const [currentTime, setCurrentTime] = useState(new Date());
//   const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
//   const [allStaffData, setAllStaffData] = useState<CheckInData[]>([]);
//   const [isClient, setIsClient] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const userId = session?.user?.id ? Number(session.user.id) : null;
//   const API_URL = "https://api.npoint.io/8cc269d800e64d0215ab";

//   useEffect(() => {
//     setIsClient(true);
//     fetch(API_URL)
//       .then((response) => response.text())
//       .then((text) => {
//         const data: CheckInData[] = text ? JSON.parse(text) : [];
//         setAllStaffData(data);
//         const userData = data.find((record) => record.staff_id === userId);
//         if (userData) {
//           setCheckInData(userData);
//         }
//       })
//       .catch((error) => console.error("Error fetching data:", error));
//   }, [userId]);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 1000);
//     return () => clearInterval(timer);
//   }, []);

//   const dateFormatter = new Intl.DateTimeFormat("en-US", {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//   });

//   const timeFormatter = new Intl.DateTimeFormat("en-US", {
//     hour: "numeric",
//     minute: "2-digit",
//     second: "2-digit",
//     hour12: true,
//   });

//   const clockInSubmit = async () => {
//     if (!checkInData) return;
//     setIsLoading(true);

//     const updatedStaffList = allStaffData.map((staff) => {
//       if (staff.staff_id === checkInData.staff_id) {
//         return {
//           ...staff,
//           status: "CLOCKED_IN" as const,
//           check_in_time: new Date().toISOString(),
//           check_out_time: null,
//         };
//       }
//       return staff;
//     });

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedStaffList),
//       });
//       if (!response.ok) throw new Error("Failed to update data on the server.");

//       setAllStaffData(updatedStaffList);
//       const updatedCurrentUser = updatedStaffList.find(
//         (s) => s.staff_id === checkInData.staff_id
//       );
//       if (updatedCurrentUser) setCheckInData(updatedCurrentUser);
//     } catch (err) {
//       console.error("Clock-in failed:", err);

//       showAlert("error", "Could Not Clock In!");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clockOutSubmit = async () => {
//     if (!checkInData) return;
//     setIsLoading(true);

//     const updatedStaffList = allStaffData.map((staff) => {
//       if (staff.staff_id === checkInData.staff_id) {
//         return {
//           ...staff,
//           status: "CLOCKED_OUT" as const,
//           check_out_time: new Date().toISOString(),
//         };
//       }
//       return staff;
//     });

//     try {
//       const response = await fetch(API_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updatedStaffList),
//       });
//       if (!response.ok) throw new Error("Failed to update data on the server.");

//       setAllStaffData(updatedStaffList);
//       const updatedCurrentUser = updatedStaffList.find(
//         (s) => s.staff_id === checkInData.staff_id
//       );
//       if (updatedCurrentUser) setCheckInData(updatedCurrentUser);
//     } catch (err) {
//       console.error("Clock-out failed:", err);

//       showAlert("error", "Could Not Clock Out!");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <main className={styles.checkInOutContainer}>
//       <div className={styles.infoWrapper}>
//         <p className={styles.date}>
//           {isClient
//             ? dateFormatter.format(currentTime)
//             : "Monday, August 18, 2025"}
//         </p>
//         <p className={styles.location}>
//           <IoLocationSharp />
//           <span>
//             {checkInData ? checkInData.location : "Loading location..."}
//           </span>
//         </p>
//         <h1 className={styles.clock}>
//           {isClient ? timeFormatter.format(currentTime) : "08:00:00 AM"}
//         </h1>
//         <div className={styles.buttonContainer}>
//           <button
//             onClick={clockInSubmit}
//             className={`${styles.btn} ${styles.clockInBtn}`}
//             disabled={isLoading || checkInData?.status === "CLOCKED_IN"}
//           >
//             {isLoading ? "Loading..." : "Clock In"}
//           </button>
//           <button
//             onClick={clockOutSubmit}
//             className={`${styles.btn} ${styles.clockOutBtn}`}
//             disabled={
//               isLoading || !checkInData || checkInData.status === "CLOCKED_OUT"
//             }
//           >
//             {isLoading ? "Loading..." : "Clock Out"}
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// };
// CheckInOutPage.getLayout = function getLayout(page: ReactElement) {
//   return <AdminLayout>{page}</AdminLayout>;
// };
// export default CheckInOutPage;

import type { NextPage } from "next";
import useSWR from "swr";
import { useState, useEffect, ReactElement, ReactNode } from "react";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/checkinout/checkin_out.module.scss";
import { useSession } from "next-auth/react";
import { IoLocationSharp } from "react-icons/io5";
import { showAlert } from "@/utils/toastHelper";
import { fetcherWithToken } from "@/utils/fetcher";

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
type CheckInData = {
  id: number;
  staff_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  location: string;
  status: "CLOCKED_IN" | "CLOCKED_OUT";
};

const API_URL = "http://localhost:3000/user/checkinout";

const CheckInOutPage: NextPageWithLayout = () => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const userId = session?.user?.id ? Number(session.user.id) : null;

  // useSWR instead of fetch
  const { data: allStaffData, mutate } = useSWR<CheckInData[]>(
    session ? [API_URL, session.user.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const checkInData =
    allStaffData?.find((record) => record.staff_id === userId) || null;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const updateStatus = async (status: "CLOCKED_IN" | "CLOCKED_OUT") => {
    if (!checkInData || !session) return;
    setIsLoading(true);

    const updatedStaffList = allStaffData?.map((staff) => {
      if (staff.staff_id === checkInData.staff_id) {
        return {
          ...staff,
          status,
          check_in_time:
            status === "CLOCKED_IN"
              ? new Date().toISOString()
              : staff.check_in_time,
          check_out_time:
            status === "CLOCKED_OUT"
              ? new Date().toISOString()
              : staff.check_out_time,
        };
      }
      return staff;
    });

    try {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify(updatedStaffList),
      });
      mutate(updatedStaffList, false); // update SWR cache without refetching
      showAlert(
        "success",
        `Successfully ${status === "CLOCKED_IN" ? "clocked in" : "clocked out"}`
      );
    } catch (err) {
      console.error(err);
      showAlert(
        "error",
        `Could not ${status === "CLOCKED_IN" ? "clock in" : "clock out"}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.checkInOutContainer}>
      <div className={styles.infoWrapper}>
        <p className={styles.date}>
          {isClient
            ? dateFormatter.format(currentTime)
            : "Monday, August 18, 2025"}
        </p>
        <p className={styles.location}>
          <IoLocationSharp />
          <span>
            {checkInData ? checkInData.location : "Loading location..."}
          </span>
        </p>
        <h1 className={styles.clock}>
          {isClient ? timeFormatter.format(currentTime) : "08:00:00 AM"}
        </h1>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => updateStatus("CLOCKED_IN")}
            className={`${styles.btn} ${styles.clockInBtn}`}
            disabled={isLoading || checkInData?.status === "CLOCKED_IN"}
          >
            {isLoading ? "Loading..." : "Clock In"}
          </button>
          <button
            onClick={() => updateStatus("CLOCKED_OUT")}
            className={`${styles.btn} ${styles.clockOutBtn}`}
            disabled={
              isLoading || !checkInData || checkInData.status === "CLOCKED_OUT"
            }
          >
            {isLoading ? "Loading..." : "Clock Out"}
          </button>
        </div>
      </div>
    </main>
  );
};

CheckInOutPage.getLayout = function getLayout(page: ReactElement) {
  return <AdminLayout>{page}</AdminLayout>;
};

export default CheckInOutPage;
