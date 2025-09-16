//components/common/forms/editprofile/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import styles from "@/styles/admin/staffeditmodel/editprofile.module.scss";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import { showAlert } from '@/utils/toastHelper';
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { fetcherWithToken } from "@/utils/fetcher";

type Role = { id: number; name: string; };
type FormInputs = { name: string; email: string; role_id: number; };
type EditProfileFormProps = {
    user: {
    id: number | string;
    name?: string | null;
    email?: string | null;
    role_id?: number | null;
  };
  onClose: () => void;
};

const EditProfileForm = ({ user, onClose }: EditProfileFormProps) => {
  const { data: session } = useSession();
  const API_BASE_URL = "http://localhost:3000";

  const { data: userData, isLoading: isUserLoading } = useSWR(
   
    session?.accessToken && user?.id ? [`${API_BASE_URL}/user/${user.id}`, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const { data: roles, isLoading: areRolesLoading } = useSWR<Role[]>(
    session?.accessToken ? [`${API_BASE_URL}/role`, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const {
    register,
    handleSubmit,
    control,
    reset, 
    formState: { errors },
  } = useForm<FormInputs>();

  
  useEffect(() => {
    if (userData) {
      
      reset({
        name: userData.name,
        email: userData.email,
        role_id: userData.role_id,
      });
    }
  }, [userData, reset]); 
  const roleOptions = useMemo(
    () => roles?.map((role) => ({ value: role.id, label: role.name })) || [],
    [roles]
  );

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!session?.accessToken) return;

    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }
      showAlert('success', 'Profile updated successfully!');
      onClose(); 
    } catch (err) {
      console.error("Update Failed!", err);
      showAlert('error', 'Update Error');
    }
  };

  
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
              isLoading={areRolesLoading}
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
