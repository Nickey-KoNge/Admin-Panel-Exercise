// components/common/forms/registerrequestleave/index.tsx

import React, { useEffect, useMemo } from "react";
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
import useSWR from "swr";
import { fetcherWithToken } from "@/utils/fetcher";

type LeaveType = { id: number; name: string };
type ModeType = { id: number; name: string };
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
  editData?: any;
};

const RequestLeaveForm = ({
  onClose,
  onFormSubmit,
  editData,
}: RequestLeaveFormProps) => {
  const { data: session } = useSession();

  // --- API URLs ---
  const API_BASE_URL = "http://localhost:3000";
  const LeaveType_URL = `${API_BASE_URL}/type`;
  const Mode_URL = `${API_BASE_URL}/mode`;
  const LeaveRequest_URL = `${API_BASE_URL}/leaverequest`;

  const { data: leaveTypes, isLoading: areLeaveTypesLoading } = useSWR<
    LeaveType[]
  >(
    session?.accessToken ? [LeaveType_URL, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );
  const { data: modeTypes, isLoading: areModeTypesLoading } = useSWR<
    ModeType[]
  >(
    session?.accessToken ? [Mode_URL, session.accessToken] : null,
    ([url, token]) => fetcherWithToken(url, token as string)
  );

  const methods = useForm<FormInputs>();
  const {
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = methods;

  const watchedModeId = watch("modeId");
  const watchedDates = watch("requestDate");

  const FULL_DAY_ID = 1;
  const HALF_DAY_ID = 2;
  const MULTI_DAY_ID = 3;

  useEffect(() => {
    if (editData && leaveTypes && modeTypes) {
      reset({
        leaveTypeId: leaveTypes.find((lt) => lt.name === editData.type)?.id,
        modeId: modeTypes.find((mt) => mt.name === editData.mode)?.id,
        requestDate: Array.isArray(editData.requestDate)
          ? editData.requestDate.map((d: string) => new Date(d))
          : editData.requestDate
          ? [new Date(editData.requestDate)]
          : [],
        noofday: editData.noofday,
        reason: editData.reason,
      });
    }
  }, [editData, leaveTypes, modeTypes, reset]);

  useEffect(() => {
    setValue("requestDate", undefined);
  }, [watchedModeId, setValue]);

  useEffect(() => {
    if (watchedModeId === HALF_DAY_ID) {
      setValue("noofday", 0.5);
    } else if (watchedModeId === FULL_DAY_ID) {
      setValue("noofday", watchedDates ? 1 : 0);
    } else if (watchedModeId === MULTI_DAY_ID) {
      setValue(
        "noofday",
        Array.isArray(watchedDates) ? watchedDates.length : 0
      );
    } else {
      setValue("noofday", 0);
    }
  }, [watchedDates, watchedModeId, setValue]);

  const leaveTypeOptions = useMemo(
    () => leaveTypes?.map((lt) => ({ value: lt.id, label: lt.name })) || [],
    [leaveTypes]
  );
  const modeTypeOptions = useMemo(
    () => modeTypes?.map((mt) => ({ value: mt.id, label: mt.name })) || [],
    [modeTypes]
  );

  const onSubmit: SubmitHandler<FormInputs> = async (formData) => {
    if (!session?.user?.id || !session.accessToken) {
      showAlert("error", "Could not find user session.");
      return;
    }

    // const requestPayload = {
    //   requestDate: formData.requestDate,
    //   type: leaveTypes?.find((lt) => lt.id === formData.leaveTypeId)?.id || "",
    //   mode: modeTypes?.find((mt) => mt.id === formData.modeId)?.id || "",
    //   noofday: formData.noofday,
    //   reason: formData.reason,
    //   staff_id: Number(session.user.id),
    //   submittedon: new Date(),
    //   status: "Pending",
    // };
    let formattedDates: string[] = [];
    if (formData.requestDate) {
      const dates = Array.isArray(formData.requestDate)
        ? formData.requestDate
        : [formData.requestDate];
      // Convert each date to a full ISO 8601 string (e.g., "2025-09-17T12:00:00.000Z")
      formattedDates = dates.map((date) => date.toISOString());
    }
    const requestPayload = {
      // This now sends an array of strings, which the backend DTO expects
      requestDate: formattedDates,
      type: formData.leaveTypeId,
      mode: formData.modeId,
      // type:
      //   leaveTypes?.find((lt) => lt.id === formData.leaveTypeId)?.name || "",
      // mode: modeTypes?.find((mt) => mt.id === formData.modeId)?.name || "",
      noofday: formData.noofday,
      reason: formData.reason,
      staff_id: Number(session.user.id),
      submittedon: new Date().toISOString(), // Also send as ISO string
      status: "Pending",
    };
    try {
      let response;
      if (editData) {
        // --- UPDATE logic ---
        response = await fetch(`${LeaveRequest_URL}/${editData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(requestPayload),
        });
        showAlert("success", "Leave Request updated successfully!");
      } else {
        // --- CREATE logic ---
        response = await fetch(LeaveRequest_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(requestPayload),
        });
        showAlert("success", "Leave Request submitted successfully!");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed.");
      }

      onFormSubmit();
      onClose();
    } catch (err) {
      console.error("Failed to submit leave request:", err);
      showAlert(
        "error",
        err instanceof Error ? err.message : "Submission failed."
      );
    }

    // try {
    //   console.log("Data being sent to server:", formData.modeId);
    //   let response;
    //   if (editData) {
    //     response = await fetch(`${LeaveRequest_URL}/${editData.id}`, {
    //       method: "PUT",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${session.accessToken}`,
    //       },
    //       body: JSON.stringify(requestPayload),
    //     });
    //     showAlert("success", "Leave Request updated successfully!");
    //   } else {
    //     response = await fetch(LeaveRequest_URL, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${session.accessToken}`,
    //       },
    //       body: JSON.stringify(requestPayload),
    //     });
    //     showAlert("success", "Leave Request submitted successfully!");
    //   }

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || "Submission failed.");
    //   }

    //   onFormSubmit();
    //   onClose();
    // } catch (err) {
    //   console.error("Failed to submit leave request:", err);
    //   showAlert(
    //     "error",
    //     err instanceof Error ? err.message : "Submission failed."
    //   );
    // }
  };

  // --- Loading State ---
  if (areLeaveTypesLoading || areModeTypesLoading) {
    return <p>Loading form...</p>;
  }

  // --- Render JSX ---
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className={styles.form}>
        <h2>{editData ? "Edit Leave Request" : "Apply Leave"}</h2>

        <div className={styles.DropdownFormGroup}>
          <div className={styles.selectWrapper}>
            <label htmlFor="leaveTypeId">Leave Type</label>
            <Controller
              name="leaveTypeId"
              control={control}
              rules={{ required: "Please select a leave type" }}
              render={({ field }) => (
                <Select
                  value={leaveTypeOptions.find(
                    (opt) => opt.value === field.value
                  )}
                  onChange={(option) => field.onChange(option?.value)}
                  options={leaveTypeOptions}
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
                  value={modeTypeOptions.find(
                    (opt) => opt.value === field.value
                  )}
                  onChange={(option) => field.onChange(option?.value)}
                  options={modeTypeOptions}
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
            <label htmlFor="requestDate">Leave Date(s)</label>
            <MultiDatePickerInput
              name="requestDate"
              rules={{ required: "Date is required" }}
              placeholder="Select date(s)..."
              selectionMode={
                watchedModeId === MULTI_DAY_ID ? "multiple" : "single"
              }
            />

            {errors.requestDate && (
              <p className={styles.errorText}>{errors.requestDate.message}</p>
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
            {editData ? "Update" : "Submit"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

export default RequestLeaveForm;
