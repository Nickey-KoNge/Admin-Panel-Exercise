//components/common/forms/registerrequestleave/index.tsx
import React, { useEffect, useState, useMemo } from "react";
import styles from "@/styles/admin/leaverequest/leave_request_form.module.scss";
import {
  useForm,
  SubmitHandler,
  Controller,
  FormProvider,
} from "react-hook-form";
import Select from "react-select";
import { useSession } from "next-auth/react";
import { showAlert } from "@/utils/toastHelper";
import { MultiDatePickerInput } from "@/components/datepicker/daypicker";
import { format } from 'date-fns';
// define type
type LeaveType = {
  id: number;
  name: string;
};
type ModeType = {
  id: number;
  name: string;
};
type FormInputs = {
  leaveTypeId: number;
  modeId: number;
  requestDate: Date[] | Date | undefined;
  noofday: number;
  reason: string;
};

type RequestLeaveFormProps = {
  onClose: () => void;
  onFormSubmit: () => void;
};

const RequestLeaveForm = ({ onClose, onFormSubmit }: RequestLeaveFormProps) => {
  const { data: session } = useSession();
  const [leavetype, setLeavetype] = useState<LeaveType[]>([]);
  const [modetype, setModeType] = useState<ModeType[]>([]);

  const methods = useForm<FormInputs>({
    defaultValues: {
      requestDate: undefined,
    },
  });
  const {
    formState: { errors }, watch, setValue
  } = methods;

  const watchedModeId = watch("modeId");
  const watchedDates = watch("requestDate");

   const FULL_DAY_ID = 1;
  const HALF_DAY_ID = 2;
  const MULTI_DAY_ID = 3;
  // API URLs
  const LeaveType_URL = "https://api.npoint.io/3068003acecbbbd7052f";
  const Mode_URL = "https://api.npoint.io/1dac2598d983ed068add";
  const LeaveRequest_URL = "https://api.npoint.io/32aaf1a75ec509b50c83";

  useEffect(() => {
    fetch(LeaveType_URL)
      .then((res) => res.json())
      .then(setLeavetype);
    fetch(Mode_URL)
      .then((res) => res.json())
      .then(setModeType);
  }, []);
  useEffect(() => {
    setValue("requestDate", undefined, { shouldValidate: true });
  }, [watchedModeId, setValue]);

  useEffect(() => {
    if (watchedModeId === HALF_DAY_ID) {
      setValue("noofday", 0.5);
    } else if (watchedModeId === FULL_DAY_ID) {
      setValue("noofday", watchedDates ? 1 : 0);
    } else if (watchedModeId === MULTI_DAY_ID) {
      setValue("noofday", Array.isArray(watchedDates) ? watchedDates.length : 0);
    } else {
      setValue("noofday", 0);
    }
  }, [watchedDates, watchedModeId, setValue]);

  const leaveType = useMemo(
    () => leavetype.map((lt) => ({ value: lt.id, label: lt.name })),
    [leavetype]
  );
  const modeType = useMemo(
    () => modetype.map((mt) => ({ value: mt.id, label: mt.name })),
    [modetype]
  );

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    if (!session?.user?.id) {
      showAlert("error", "Could not find user session. Please log in again.");
      return;
    }
     let formattedDates: string[] = [];
    if (Array.isArray(formData.requestDate)) {

      formattedDates = formData.requestDate.map((date) => format(date, "MMM d"));
    } else if (formData.requestDate) {
      formattedDates = [format(formData.requestDate, "MMM d")];
    }
    try {
       const response = await fetch(LeaveRequest_URL);
      const allRequests: any[] = await response.json();
      const newLeaveRequest = {
        id: Date.now(),
        staff_id: parseInt(session.user.id, 10),
        requestDate: formattedDates, 
        type: leavetype.find((lt) => lt.id === formData.leaveTypeId)?.name || "",
        mode: modetype.find((mt) => mt.id === formData.modeId)?.name || "",
        noofday: formData.noofday,
        reason: formData.reason,
        submittedon: new Date().toISOString().split("T")[0],
        status: "Pending",
      };

      const updatedRequests = [...allRequests, newLeaveRequest];

      await fetch(LeaveRequest_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedRequests),
      });

      onFormSubmit();
      showAlert("success", "Successful Save Data!");
      onClose();
    } catch (err) {
      console.error("Failed to submit leave request:", err);
      showAlert("error", "Submission failed. Please try again.");
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <h2>Apply Leave</h2>

        <div className={styles.DropdownFormGroup}>
          <div className={styles.selectWrapper}>
            <label htmlFor="leaveTypeId">Leave Type</label>
            <Controller
              name="leaveTypeId"
              control={methods.control}
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
              control={methods.control}
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
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="noofday">Leave Date(s)</label>
            <MultiDatePickerInput
              name="requestDate"
              rules={{ required: "Date is required" }}
              placeholder="Select date(s)..."
              selectionMode={watchedModeId === MULTI_DAY_ID ? "multiple" : "single"}
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
            {...methods.register("reason", { required: "Reason is required" })}
          />
          {errors.reason && (
            <p className={styles.errorText}>{errors.reason.message}</p>
          )}
        </div>

        <div className={styles.buttonRow}>
          <button
            type="button"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" className={styles.saveButton}>
            Submit
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default RequestLeaveForm;
