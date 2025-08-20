import React from 'react';
import Nav from '../navigation/nav';
import TopNavBar from '../navigation/topnav';
import styles from '../../styles/admin/layouts/adminlayout.module.scss';


const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles.layoutContainer}>
            <aside className={styles.sidenav}>
                <Nav />
            </aside>
            
            <div className={styles.mainWrapper}>

                <header className={styles.topnav}>
                   <TopNavBar /> 
                </header>
                
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;