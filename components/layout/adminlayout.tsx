"use client";

import React from 'react';
import Nav from '../navigation/nav';
import TopNavBar from '../navigation/topnav';
import styles from '@/styles/admin/layouts/adminlayout.module.scss';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();

    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidenav}>
                <Nav />
            </aside>
            
            <div className={styles.mainWrapper}>

                <header className={styles.topnav}>
                   <TopNavBar /> 
                </header>
                
                {/* <main className={styles.content}>
                    {children}
                </main> */}
                <AnimatePresence mode='wait'>
                    <motion.main
                    key={pathname}
                    className={styles.content}
                    initial = {{opacity: 0,y:20}} //start animation transaction
                    animate= {{opacity: 1, y:0}}
                    exit = {{opacity: 0 , y: -20}} // end animation stransaction
                    transition = {{duration: 0.7}}
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminLayout;