//components/common/forms/registerrequestleave/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import styles from "../../../styles/admin/leaverequest/leave_request_form.module.scss";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Select from "react-select";
import { useSession } from "next-auth/react";
import { showAlert } from '@/utils/toastHelper';
//type Define
type LeaveType = {
  id: number;
  name: string;
};
type ModeType = {
  id: number;
  name: string;
};
type LeaveRequest = {
  id: number;
  requestDate: Date | null;
  type: number;
  staff_id: number;
  mode: number;
  noofday: number;
  reason: string | null;
  submittedon: Date | null;
  status: string | null;
};
type FormInputs = {
  leaveTypeId: number;
  modeId: number;
  requestDate: Date;
  noofday: number;
  reason: string;
};
type RequestLeaveFormProps = {
  onClose: () => void;
  onFormSubmit: () => void;
};
const RequestLeaveForm = ({ onClose, onFormSubmit }: RequestLeaveFormProps) => {
  // const [modalIsOpen, setModalIsOpen] = useState(false);

  //   const openModal = () => setModalIsOpen(true);
  //   const closeModal = () => setModalIsOpen(false);
  const { data: session } = useSession();
  const [leavetype, setLeavetype] = useState<LeaveType[]>([]);
  const [modetype, setModeType] = useState<ModeType[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormInputs>();

  const LeaveType_URL = "https://api.npoint.io/3068003acecbbbd7052f";
  const Mode_URL = "https://api.npoint.io/1dac2598d983ed068add";
  const LeaveRequest_URL = "https://api.npoint.io/32aaf1a75ec509b50c83";
  //get data for dropdownlist
  useEffect(() => {
    fetch(LeaveType_URL)
      .then((res) => res.json())
      .then(setLeavetype);
    fetch(Mode_URL)
      .then((res) => res.json())
      .then(setModeType);
  }, []);

  const leaveType = useMemo(
    () =>
      leavetype.map((leavetype) => ({
        value: leavetype.id,
        label: leavetype.name,
      })),
    [leavetype]
  );
  const modeType = useMemo(
    () =>
      modetype.map((modetype) => ({
        value: modetype.id,
        label: modetype.name,
      })),
    [modetype]
  );
  //submit data
  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    if (!session?.user?.id) {
      alert("Could not find user session. Please log in again.");
      return;
    }
    try {
      const response = await fetch(LeaveRequest_URL);
      const allRequests: LeaveRequest[] = await response.json();
      const newLeaveRequest = {
        id: Date.now(),
        staff_id: parseInt(session.user.id, 10),
        requestDate: formData.requestDate,
        type:
          leaveType.find((opt) => opt.value === formData.leaveTypeId)?.label ||
          "",
        mode:
          modeType.find((opt) => opt.value === formData.modeId)?.label || "",
        noofday: formData.noofday,
        reason: formData.reason,
        submittedon: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
        status: "Pending",
      };
      const updatedRequests = [...allRequests, newLeaveRequest];
      await fetch(LeaveRequest_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRequests),
      });
      onFormSubmit();
      showAlert('success', 'Successful Save Data!');
      onClose();
    } catch (err) {
      console.error("Failed to submit leave request:", err);
      
      showAlert('error', 'Submission failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2>Apply Leave</h2>
      <div className={styles.selectWrapper}>
        <label htmlFor="leaveTypeId"> Leave Type </label>
        <Controller
          name="leaveTypeId"
          control={control}
          rules={{ required: "Please select a leave type" }}
          render={({ field }) => (
            <Select
              value={leaveType.find((opt) => opt.value === field.value)}
              onChange={(option) => field.onChange(option?.value)}
              options={leaveType}
              placeholder="Select..."
            />
          )}
        />
        {errors.leaveTypeId && (
          <p className={styles.errorText}>{errors.leaveTypeId.message}</p>
        )}
      </div>
      <div className={styles.selectWrapper}>
        <label htmlFor="modeId">Mode</label>
        <Controller
          name="modeId"
          control={control}
          rules={{ required: "Please select a mode" }}
          render={({ field }) => (
            <Select
              value={modeType.find((opt) => opt.value === field.value)}
              onChange={(option) => field.onChange(option?.value)}
              options={modeType}
              placeholder="Select..."
            />
          )}
        />
        {errors.modeId && (
          <p className={styles.errorText}>{errors.modeId.message}</p>
        )}
      </div>
      <div className={styles.row}>
        <div className={styles.formGroup}>
          <label htmlFor="requestDate">Date(s)</label>
          <input
            type="text"
            placeholder="e.g., Aug 25 or Aug 25-27"
            {...register("requestDate", { required: "Date is required" })}
          />
          {errors.requestDate && (
            <p className={styles.errorText}>{errors.requestDate.message}</p>
          )}
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="noofday">No. of Days</label>
          <input
            type="number"
            step="0.5"
            {...register("noofday", {
              required: "Number of days is required",
              valueAsNumber: true,
            })}
          />
          {errors.noofday && (
            <p className={styles.errorText}>{errors.noofday.message}</p>
          )}
        </div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="reason">Reason</label>
        <textarea
          rows={4}
          {...register("reason", { required: "Reason is required" })}
        />
        {errors.reason && (
          <p className={styles.errorText}>{errors.reason.message}</p>
        )}
      </div>
      <div className={styles.buttonRow}>
        <button type="button" onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={styles.saveButton}>
          Submit
        </button>
      </div>
    </form>
  );
};
export default RequestLeaveForm;
