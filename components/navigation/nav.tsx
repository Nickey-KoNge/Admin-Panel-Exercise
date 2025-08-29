//components/navigation/nav.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '@/styles/admin/navigation/nav.module.scss';

const Nav = () => {
    const router = useRouter();
    return(
        <div className={styles.sidenavContainer}>
            <ul className={styles.navList}>
                <li>
                    <Link href="/" className={router.pathname === '/' ? styles.active : ""}>Check In/Out</Link>
                </li>
                <li>
                    <Link href="/leaverequest" className={router.pathname === 'leaverequest'? styles.active : ""}>Leave Requests</Link>
                </li>
            </ul>
        </div>
    );

};
export default Nav;