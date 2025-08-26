//components/common/forms/editprofile/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import styles from "../../../styles/admin/staffeditmodel/editprofile.module.scss";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
//type define
type Role = {
  id: number;
  name: string;
};
type StaffData = {
  id: number;
  name: string | null;
  email: string | null;
  role_id: number | null;
  status: string | null;
};
type FormInputs = {
  name: string;
  email: string;
  role_id: number;
};
type EditProfileFormProps = {
  user: {
    id: number | string;
    name?: string | null;
    email?: string | null;
    role_id?: number | null;
  };
  onClose: () => void;
};
//start
const EditProfileForm = ({ user, onClose }: EditProfileFormProps) => {
  const [allStaff, setAllStaff] = useState<StaffData[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedOption, setSelectedOption] = useState(null);
  //initallize useForm
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role_id: user?.role_id || undefined,
    },
  });
//call npoint.io Json
  const RoleAPI_URL = "https://api.npoint.io/419b4e41aa0f66ca483b";
  const Staff_URL = "https://api.npoint.io/6a59db5e14693c0bd32b";
//get stall data
  useEffect(() => {
    fetch(Staff_URL)
      .then((response) => response.json())
      .then((data: StaffData[]) => setAllStaff(data))
      .catch((error) => console.error("Error fetching staff data: ", error));
//get role data
    fetch(RoleAPI_URL)
      .then((response) => response.json())
      .then((data: Role[]) => {
        setRoles(data);
      })
      .catch((error) => console.error("Error fetching roles: ", error));
  }, []);
//prepare data structure for Select 
  const roleOptions = useMemo(
    () => roles.map((role) => ({ value: role.id, label: role.name })),
    [roles]
  );
//submit data 
  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    if (!allStaff.length) return;
    const updateStaffdata = allStaff.map((staff) => {
      if (staff.id === user.id) {
        return {
          ...staff,
          name: data.name,
          email: data.email,
          role_id: Number(data.role_id),
          status: "Update",
        };
      }
      return staff;
    });
    try {
      const response = await fetch(Staff_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateStaffdata),
      });
      if (!response.ok) {
        throw new Error("Failed to save profile on the server.");
      }

      alert("Profile saved successfully!");
      onClose(); // Close the modal
    } catch (err) {
      console.error("Update Failed!", err);
      alert("Update Error");
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2>Edit Profile</h2>
      <div className={styles.formGroup}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          id="name"
          {...register("name", { required: "Name is Required!" })}
        />
        {errors.name && (
          <p className={styles.errorText}>{errors.name.message}</p>
        )}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          {...register("email", { required: "Email is Required!" })}
        />
        {errors.email && (
          <p className={styles.errorText}>{errors.email.message}</p>
        )}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="role">Role</label>
        {/* Controller is wrapper that acts as a bridge */}
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
            />
          )}
        />
        {errors.role_id && (
          <p className={styles.errorText}>{errors.role_id.message}</p>
        )}
      </div>

      <button type="submit" className={styles.saveButton}>
        Update Staff
      </button>
    </form>
  );
};
export default EditProfileForm;
