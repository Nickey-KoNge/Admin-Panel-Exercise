import React, { useState, useRef, useEffect } from "react";
import { Controller, useFormContext, RegisterOptions } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import styles from "@/styles/admin/daypicker/daypicker.module.scss";

const formatSelectedDates = (value: Date | Date[] | undefined) => {
  if (!value) return "";
  if (Array.isArray(value)) {
    if (value.length === 0) return "";
    const validDates = value.filter(
      (d): d is Date => d instanceof Date && !isNaN(d.getTime())
    );
    const sortedDates = [...validDates].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    return sortedDates.map((date) => format(date, "MMM d")).join(", ");
  }

  if (value instanceof Date && !isNaN(value.getTime())) {
    return format(value, "MMM d");
  }

  return "";
};

type ConditionalDatePickerProps = {
  name: string;
  rules?: RegisterOptions;
  placeholder?: string;
  selectionMode: "single" | "multiple";
};

export function MultiDatePickerInput({
  name,
  rules,
  placeholder,
  selectionMode,
}: ConditionalDatePickerProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerRef]);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field }) => (
        <div className={styles.formGroup} style={{ position: "relative" }}>
          <input
            id={name}
            type="text"
            placeholder={placeholder}
            value={formatSelectedDates(field.value)}
            onFocus={() => setIsPickerOpen(true)}
            readOnly
            className={errors[name] ? styles.inputError : ""}
          />

          {isPickerOpen && (
            <div ref={pickerRef} className={styles.calendarColor}>
              <DayPicker
                mode={selectionMode}
                selected={field.value}
                onSelect={field.onChange}
                required={selectionMode === "multiple"}
                pagedNavigation
              />
            </div>
          )}
        </div>
      )}
    />
  );
}
