//components/navigation/topnav.tsx
"use client";
import Image from 'next/image';
import styles from '../../styles/admin/navigation/topnav.module.scss';
import { useState, useRef, useEffect } from 'react';
import {useSession, signIn, signOut} from 'next-auth/react';


const TopNavBar  = () => {
   const { data: session, status} = useSession();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLLIElement>(null);
   useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if(dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener('mousedown',handleClickOutside);
    return() => {
        document.removeEventListener('mousedown', handleClickOutside);
    }
   }, [dropdownRef]);
        return (
        <nav>
            <ul className={styles.topnavList}>
                {status === 'loading' && <li>Loading...</li>}

                {status === 'authenticated' && session && (
                    <>
                        <li>
                            <div className={styles.borderText}>
                                {session.user?.name || session.user?.email}
                            </div>
                        </li>
                        
                        <li className={styles.dropdownContainer} ref={dropdownRef}>
                            <div className={styles.imageBorder} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                                <Image
                                    src="/images/People.png"
                                    alt="Admin Avatar"
                                    width={40}
                                    height={40}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>

                            {isDropdownOpen && (
                                <div className={styles.dropdownMenu}>

                                    <div onClick={() => signOut()} className={styles.logoutButton}>
                                        Logout
                                    </div>
                                </div>
                            )}
                        </li>
                    </>
                )}

                {status === 'unauthenticated' && (
                    <li>
                        <button onClick={() => signIn()} className={styles.authButton}>
                            Login
                        </button>
                    </li>
                )}
            </ul>
        </nav>
    );
};
export default TopNavBar;