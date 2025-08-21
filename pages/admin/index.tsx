import type { NextPage } from 'next';
import { useState, useEffect, ReactElement, ReactNode } from 'react';
import AdminLayout from '@/components/layout/adminlayout';
import styles from '../../styles/admin/checkinout/checkin_out.module.scss';
import { IoLocationSharp } from 'react-icons/io5';


type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};
type CheckInData = {
    id: number;
    staff_id: number;
    check_in_time: string | null;
    check_out_time: string | null;
    location: string;
    status: 'CLOCKED_IN' | 'CLOCKED_OUT';
};

const CheckInOutPage: NextPageWithLayout = () => {
 
    const [currentTime, setCurrentTime] = useState(new Date());
    const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
    const [allStaffData, setAllStaffData] = useState<CheckInData[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
   
    
    const API_URL = 'https://api.npoint.io/8cc269d800e64d0215ab';

    useEffect(() => {
        setIsClient(true);
        fetch(API_URL)
            .then(response => response.text())
            .then(text => {
                const data: CheckInData[] = text ? JSON.parse(text) : [];
                setAllStaffData(data); 
                const userData = data.find(record => record.staff_id === 1);
                if (userData) {
                    setCheckInData(userData);
                }
            })
            .catch(error => console.error("Error fetching data:", error));
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const dateFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
    });
    
    const clockInSubmit = async () => {
        if (!checkInData) return;
        setIsLoading(true);

        const updatedStaffList = allStaffData.map(staff => {
            if (staff.staff_id === checkInData.staff_id) {
                return { 
                    ...staff, 
                    status: 'CLOCKED_IN' as const, 
                    check_in_time: new Date().toISOString(),
                    check_out_time: null
                };
            }
            return staff;
        });

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStaffList),
            });
            if (!response.ok) throw new Error('Failed to update data on the server.');
            
            setAllStaffData(updatedStaffList);
            const updatedCurrentUser = updatedStaffList.find(s => s.staff_id === checkInData.staff_id);
            if (updatedCurrentUser) setCheckInData(updatedCurrentUser);
        } catch (err) {
            console.error('Clock-in failed:', err);
            alert('Could not clock in.');
        } finally {
            setIsLoading(false);
        }
    };

    const clockOutSubmit = async () => {
        if (!checkInData) return;
        setIsLoading(true);

        const updatedStaffList = allStaffData.map(staff => {
            if (staff.staff_id === checkInData.staff_id) {
                return { 
                    ...staff, 
                    status: 'CLOCKED_OUT' as const, 
                    check_out_time: new Date().toISOString()
                };
            }
            return staff;
        });

        try {
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedStaffList),
            });
            if (!response.ok) throw new Error('Failed to update data on the server.');

            setAllStaffData(updatedStaffList);
            const updatedCurrentUser = updatedStaffList.find(s => s.staff_id === checkInData.staff_id);
            if (updatedCurrentUser) setCheckInData(updatedCurrentUser);
        } catch (err) {
            console.error('Clock-out failed:', err);
            alert('Could not clock out.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
    
            <main className={styles.checkInOutContainer}>
                <div className={styles.infoWrapper}>
                    <p className={styles.date}>
                        {isClient ? dateFormatter.format(currentTime) : 'Monday, August 18, 2025'}
                    </p>
                    <p className={styles.location}>
                        <IoLocationSharp />
                        <span>{checkInData ? checkInData.location : 'Loading location...'}</span>
                    </p>
                    <h1 className={styles.clock}>
                        {isClient ? timeFormatter.format(currentTime) : '08:00:00 AM'}
                    </h1>
                    <div className={styles.buttonContainer}>
                        <button 
                            onClick={clockInSubmit}
                            className={`${styles.btn} ${styles.clockInBtn}`}
                            disabled={isLoading || checkInData?.status === 'CLOCKED_IN'}
                        >
                            {isLoading ? 'Loading...' : 'Clock In'}
                        </button>
                        <button 
                         
                            onClick={clockOutSubmit}
                            className={`${styles.btn} ${styles.clockOutBtn}`}
                            disabled={isLoading || !checkInData || checkInData.status === 'CLOCKED_OUT'}
                        >
                            {isLoading ? 'Loading...' : 'Clock Out'}
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