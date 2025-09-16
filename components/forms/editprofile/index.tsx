//components/common/forms/editprofile/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import styles from "@/styles/admin/staffeditmodel/editprofile.module.scss";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import { showAlert } from '@/utils/toastHelper';
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcherWithToken } from "@/utils/fetcher";
//type define
// type Role = {
//   id: number;
//   name: string;
// };
// type StaffData = {
//   id: number;
//   name: string | null;
//   email: string | null;
//   role_id: number | null;
//   status: string | null;
// };
// type FormInputs = {
//   name: string;
//   email: string;
//   role_id: number;
// };
// type EditProfileFormProps = {
//   user: {
//     id: number | string;
//     name?: string | null;
//     email?: string | null;
//     role_id?: number | null;
//   };
//   onClose: () => void;
// };
// //start
// const EditProfileForm = ({ user, onClose }: EditProfileFormProps) => {
//   const [allStaff, setAllStaff] = useState<StaffData[]>([]);
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [selectedOption, setSelectedOption] = useState(null);
//    const { data: session, status } = useSession();
//   //initallize useForm
//   const {
//     register,
//     handleSubmit,
//     control,
//     formState: { errors },
//   } = useForm<FormInputs>({
//     defaultValues: {
//       name: user?.name || "",
//       email: user?.email || "",
//       role_id: user?.role_id || undefined,
//     },
//   });
// //call npoint.io Json
//   const RoleAPI_URL = `http://localhost:3000/role`;
//   const Staff_URL = `http://localhost:3000/user/${session.user?.id}`;
// //get stall data
//   useEffect(() => {
//     fetch(Staff_URL)
//       .then((response) => response.json())
//       .then((data: StaffData[]) => setAllStaff(data))
//       .catch((error) => console.error("Error fetching staff data: ", error));
// //get role data
//     fetch(RoleAPI_URL)
//       .then((response) => response.json())
//       .then((data: Role[]) => {
//         setRoles(data);
//       })
//       .catch((error) => console.error("Error fetching roles: ", error));
//   }, []);
// //prepare data structure for Select 
//   const roleOptions = useMemo(
//     () => roles.map((role) => ({ value: role.id, label: role.name })),
//     [roles]
//   );
// //submit data 
//   const onSubmit: SubmitHandler<FormInputs> = async (data) => {
//     if (!allStaff.length) return;
//     const updateStaffdata = allStaff.map((staff) => {
//       if (staff.id === user.id) {
//         return {
//           ...staff,
//           name: data.name,
//           email: data.email,
//           role_id: Number(data.role_id),
//           status: "Update",
//         };
//       }
//       return staff;
//     });
//     try {
//       const response = await fetch(Staff_URL, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(updateStaffdata),
//       });
//       if (!response.ok) {
//         throw new Error("Failed to save profile on the server.");
//       }
     
//       showAlert('success', 'Profile Update successfully!');
      
//       onClose();
//     } catch (err) {
//       console.error("Update Failed!", err);
     
//       showAlert('error', 'Update Error');
//     }
//   };
//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
//       <h2>Edit Profile</h2>
//       <div className={styles.formGroup}>
//         <label htmlFor="name">Name</label>
//         <input
//           type="text"
//           id="name"
//           {...register("name", { required: "Name is Required!" })}
//         />
//         {errors.name && (
//           <p className={styles.errorText}>{errors.name.message}</p>
//         )}
//       </div>
//       <div className={styles.formGroup}>
//         <label htmlFor="email">Email</label>
//         <input
//           type="email"
//           id="email"
//           {...register("email", { required: "Email is Required!" })}
//         />
//         {errors.email && (
//           <p className={styles.errorText}>{errors.email.message}</p>
//         )}
//       </div>
//       <div className={styles.formGroup}>
//         <label htmlFor="role">Role</label>
//         {/* Controller is wrapper that acts as a bridge */}
//         <Controller
//           name="role_id"
//           control={control}
//           rules={{ required: "Please select a role" }}
//           render={({ field }) => (
//             <Select
//               value={roleOptions.find((option) => option.value === field.value)}
//               onChange={(option) => field.onChange(option?.value)}
//               options={roleOptions}
//               classNamePrefix="react-select"
//               placeholder="Choose a role..."
//             />
//           )}
//         />
//         {errors.role_id && (
//           <p className={styles.errorText}>{errors.role_id.message}</p>
//         )}
//       </div>

//       <button type="submit" className={styles.saveButton}>
//         Update Staff
//       </button>
//     </form>
//   );
// };
// export default EditProfileForm;


// --- Type definitions (no changes needed) ---
type Role = { id: number; name: string; };
type FormInputs = { name: string; email: string; role_id: number; };
type EditProfileFormProps = {
  user: { id: number | string; /* ... */ };
  onClose: () => void;
};

const EditProfileForm = ({ user, onClose }: EditProfileFormProps) => {
  const { data: session } = useSession();
  const API_BASE_URL = "http://localhost:3000";

  // 1. Fetch the specific user's data with useSWR
  const { data: userData, isLoading: isUserLoading } = useSWR(
    // Construct the key: only fetch if we have the token and user ID
    session?.accessToken && user?.id ? [`${API_BASE_URL}/user/${user.id}`, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  // 2. Fetch the list of roles with useSWR
  const { data: roles, isLoading: areRolesLoading } = useSWR<Role[]>(
    session?.accessToken ? [`${API_BASE_URL}/role`, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const {
    register,
    handleSubmit,
    control,
    reset, // Use reset to populate the form with async data
    formState: { errors },
  } = useForm<FormInputs>();

  // 3. Use an effect to populate the form once the user's data is loaded
  useEffect(() => {
    if (userData) {
      // The `reset` function updates all form fields at once
      reset({
        name: userData.name,
        email: userData.email,
        role_id: userData.role_id,
      });
    }
  }, [userData, reset]); // This effect runs when userData is available

  const roleOptions = useMemo(
    () => roles?.map((role) => ({ value: role.id, label: role.name })) || [],
    [roles]
  );

  // 4. Corrected and simplified onSubmit function
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: "PUT", // Use PUT or PATCH to update a resource
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        // Only send the updated data, not a whole list
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }
      showAlert('success', 'Profile updated successfully!');
      onClose(); // Close the modal on success
    } catch (err) {
      console.error("Update Failed!", err);
      showAlert('error', 'Update Error');
    }
  };

  // 5. Handle loading states from both hooks
  if (isUserLoading || areRolesLoading) {
    return <p>Loading form data...</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2>Edit Profile</h2>
      <div className={styles.formGroup}>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" {...register("name", { required: "Name is Required!" })} />
        {errors.name && <p className={styles.errorText}>{errors.name.message}</p>}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" {...register("email", { required: "Email is Required!" })} />
        {errors.email && <p className={styles.errorText}>{errors.email.message}</p>}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="role">Role</label>
        <Controller
          name="role_id"
          control={control}
          rules={{ required: "Please select a role" }}
          render={({ field }) => (
            <Select
              value={roleOptions.find((option) => option.value === field.value)}
              onChange={(option) => field.onChange(option?.value)}
              options={roleOptions}
              classNamePrefix="react-select"
              placeholder="Choose a role..."
              isLoading={areRolesLoading} // Bonus: show loading state on the select input
            />
          )}
        />
        {errors.role_id && <p className={styles.errorText}>{errors.role_id.message}</p>}
      </div>
      <button type="submit" className={styles.saveButton}>
        Update Staff
      </button>
    </form>
  );
};

export default EditProfileForm;
