//components/navigation/topnav.tsx
// "use client";
import Image from "next/image";
import styles from "@/styles/admin/navigation/topnav.module.scss";
import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import StaffEditModal from "../common/staffedit/index";
import EditProfileForm from "../forms/editprofile/index";

const TopNavBar = () => {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dropdownRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  const handleLogout = async () => {
    try {
    
      if (session?.accessToken) {
        await fetch('http://localhost:3000/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${session.accessToken}` }
        });
      }
    } catch (error) {
      console.error("Backend logout failed", error);
    } finally {
     
      signOut({ callbackUrl: 'http://localhost:3001/login' });
    }
  };
  return (
    <>
      <nav>
        <ul className={styles.topnavList}>
          {status === "loading" && <li>Loading...</li>}

          {status === "authenticated" && session && (
            <>
              <li>
                <div className={styles.borderText}>
                  {session.user?.name || session.user?.email}
                </div>
              </li>

              <li className={styles.dropdownContainer} ref={dropdownRef}>
                <div
                  className={styles.imageBorder}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <Image
                    src="/images/People.png"
                    alt="Admin Avatar"
                    width={40}
                    height={40}
                    style={{ cursor: "pointer" }}
                  />
                </div>

                {isDropdownOpen && (
                  <div className={styles.dropdownMenu}>
                    <div
                      onClick={() => {
                        setIsModalOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className={styles.logoutButton}
                    >
                      Edit
                    </div>
                     <div
                      onClick={handleLogout}
                      className={styles.logoutButton}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </li>
            </>
          )}

          {status === "unauthenticated" && (
            <li>
              <button onClick={() => signIn()} className={styles.authButton}>
                Login
              </button>
            </li>
          )}
        </ul>
      </nav>
       {session?.user && (
        <StaffEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
         
          <EditProfileForm 
            user={session.user} 
            onClose={() => setIsModalOpen(false)}
          />
        </StaffEditModal>
      )}
    </>
  );
};
export default TopNavBar;
