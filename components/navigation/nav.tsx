//components/navigation/nav.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import styles from "@/styles/admin/navigation/nav.module.scss";

const Nav = () => {
  const { data: session } = useSession();
  const router = useRouter();
  return (
    <div className={styles.sidenavContainer}>
      <ul className={styles.navList}>
        {session?.user?.role_id === 1 ? (
          <>
            <li>
              <Link
                href="/admin/attendance"
                className={
                  router.pathname === "/admin/attendance" ? styles.active : ""
                }
              >
                Attendance
              </Link>
            </li>
            <li>
              <Link
                href="/admin/leave-request"
                className={
                  router.pathname === "/admin/leave-request"
                    ? styles.active
                    : ""
                }
              >
                Leave Requests
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                href="/checkin-out"
                className={
                  router.pathname === "/checkin-out" ? styles.active : ""
                }
              >
                Check In/Out
              </Link>
            </li>
            <li>
              <Link
                href="/leaverequest"
                className={
                  router.pathname === "/leaverequest" ? styles.active : ""
                }
              >
                Leave Requests
              </Link>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};
export default Nav;
