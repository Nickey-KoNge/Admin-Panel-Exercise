import type {NextPage} from 'next';
import { useState, useEffect, ReactElement, ReactNode} from 'react';
import AdminLayout from '@/components/layout/adminlayout';
import styles from '../../../styles/admin/leaverequest/leave_request.module.scss';

type NextPageWithLayout = NextPage & {
    getLayout?: (page: ReactElement) => ReactNode;
};

const LeaveRequestPage: NextPageWithLayout = () => {
    return (
        <>
            <h2 className={styles.a}>Hi Reach here!</h2>
        </>
    );
};
LeaveRequestPage.getLayout = function getLayout(page: ReactElement){
    return <AdminLayout>{page}</AdminLayout>;
};
export default LeaveRequestPage;