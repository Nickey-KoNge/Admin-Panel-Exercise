import type {NextPage} from 'next';
import { useState, useEffect, ReactElement, ReactNode} from 'react';
import AdminLayout from '@/components/layout/adminlayout';
import styles from '../../../styles/admin/leaverequest/leave_request.module.scss';
import YearSelector from "@/components/datepicker/yearpicker";
 import {useSession} from 'next-auth/react';

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode;
};
type LeaveRequest = {
    id: number;
    requestDate: string | null;
    type: number;
    staff_id: number;
    mode: string | null;
    noofday: number | null;
    reason : string | null;
    submittedon : string | null;
    status: string | null;

}

const LeaveRequestPage: NextPageWithLayout = () => {
       const { data: session, status} = useSession();
    const [year, setYear] = useState<Date | null>(new Date());
    const [isClient, setIsClient] = useState(false);
    const [allLeaverequestData, setAllLeaveRequestData] = useState<LeaveRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([]);  

    const API_URL = 'https://api.npoint.io/32aaf1a75ec509b50c83';

    useEffect ( () => {
        setIsClient(true);
        fetch (API_URL)
        .then(response => response.json())
        .then((data: LeaveRequest[]) => {
            setAllLeaveRequestData(data);
        }).catch(error => console.error("Error fetching leave requests:", error));
       
    }, []);

    useEffect ( () => {
        if(status === 'authenticated' && session?.user?.id && allLeaverequestData.length > 0) {
            const currentUserId = parseInt(session.user.id, 10);
            const userLeaveData = allLeaverequestData.filter(
                record => record.staff_id === currentUserId
            );
            setFilteredRequests(userLeaveData);
        }
    },[session, status, allLeaverequestData]);
    return (
        <div className={styles.container}>
            <div className={styles.firstrow}>
                <div className={styles.row1}>
                    <div className={styles.box}>
                        <p className={styles.bigtext}>
                            20
                        </p>
                        <p className={styles.smalltext}>
                            Leave(s) Allowed
                        </p>
                    </div>
                    <div className={styles.box}>
                        <p className={styles.bigtext}>
                            16.5
                        </p>
                        <p className={styles.smalltext}>
                            Available Leaves
                        </p>
                    </div>
                    <div className={styles.box}>
                        <p className={styles.bigtext}>
                            16.5
                        </p>
                        <p className={styles.smalltext}>
                            Leaves Taken
                        </p>
                    </div>
                    <div className={styles.renewtext}>
                        Renew at May, 25
                    </div>
                
                </div>
                <div>
                    <button className={styles.leavebutton}>Request Leave</button>
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
                       {
                        filteredRequests.map((request) => (
                            <tr key={request.id}>
                            <td>{request.requestDate}</td>
                            <td>{request.type}</td>
                            <td>{request.mode}</td>
                            <td>{request.noofday}</td>
                            <td>{request.reason}</td>
                            <td>{request.submittedon}</td>
                            <td>
                                <span className={`${styles.status} ${styles[request.status?.toLowerCase() ?? '']}`}>{request.status}</span>
                            
                            </td>
                        </tr>
                        ))}
                        
                      
                    </tbody>
                </table>
            </div>
          
        </div>
    );
};
LeaveRequestPage.getLayout = function getLayout(page: ReactElement){
    return <AdminLayout>{page}</AdminLayout>;
};
export default LeaveRequestPage;