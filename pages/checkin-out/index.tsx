import type { NextPage } from "next";
import useSWR from "swr";
import { useState, useEffect, ReactElement, ReactNode } from "react";
import AdminLayout from "@/components/layout/adminlayout";
import styles from "@/styles/admin/checkinout/checkin_out.module.scss";
import { useSession } from "next-auth/react";
import { IoLocationSharp } from "react-icons/io5";
import { showAlert } from "@/utils/toastHelper";
import { fetcherWithToken } from "@/utils/fetcher";

const API_URL_STATUS = "http://localhost:3000/attendance/status";
const API_URL_CLOCK_IN = "http://localhost:3000/attendance/clock-in";
const API_URL_CLOCK_OUT = "http://localhost:3000/attendance/clock-out";

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

const getCurrentLocation = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser."));
    }
    const onSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'User-Agent': 'AdminProject/1.0 (contact@example.com)' }
        });
        const data = await response.json();
        if (data && data.display_name) {
          resolve(data.display_name);
        } else {
          reject(new Error("Could not determine address from coordinates."));
        }
      } catch (error) {
        reject(new Error("Failed to contact the location service."));
      }
    };
    const onError = (error: GeolocationPositionError) => {
      let msg = "An unknown error occurred.";
      if (error.code === error.PERMISSION_DENIED) msg = "You denied the request for Geolocation.";
      reject(new Error(msg));
    };
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  });
};

const CheckInOutPage: NextPageWithLayout = () => {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: checkInData, mutate } = useSWR<CheckInData | null>(
    session?.accessToken ? [API_URL_STATUS, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateFormatter = new Intl.DateTimeFormat("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });

  const handleClockIn = async () => {
    if (!session) return;
      console.log("Token being sent from frontend:", session.accessToken);

    setIsLoading(true);
    try {
      const currentLocation = await getCurrentLocation(); 
      const response = await fetch(API_URL_CLOCK_IN, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ location: currentLocation }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to clock in.");
      }
      mutate();
      showAlert("success", "Successfully clocked in");
    } catch (err) {
      console.error(err);
      showAlert("error", err instanceof Error ? err.message : "Could not clock in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!session || !checkInData) return;
    setIsLoading(true);
    try {
      await fetch(API_URL_CLOCK_OUT, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      mutate();
      showAlert("success", "Successfully clocked out");
    } catch (err) {
      console.error(err);
      showAlert("error", "Could not clock out");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.checkInOutContainer}>
      <div className={styles.infoWrapper}>
        <p className={styles.date}>{isClient ? dateFormatter.format(currentTime) : "Loading date..."}</p>
        <p className={styles.location}>
          <IoLocationSharp />
          <span>{checkInData ? checkInData.location : "Loading location..."}</span>
        </p>
        <h1 className={styles.clock}>{isClient ? timeFormatter.format(currentTime) : "Loading clock..."}</h1>
        <div className={styles.buttonContainer}>
          <button onClick={handleClockIn} className={`${styles.btn} ${styles.clockInBtn}`} disabled={isLoading || checkInData?.status === "CLOCKED_IN"}>
            {isLoading ? "Loading..." : "Clock In"}
          </button>
          <button onClick={handleClockOut} className={`${styles.btn} ${styles.clockOutBtn}`} disabled={isLoading || !checkInData || checkInData.status === "CLOCKED_OUT"}>
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