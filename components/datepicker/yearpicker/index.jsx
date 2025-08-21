"use client";
import { useState } from "react";
import styles from "../../../styles/admin/year/year.module.scss";

const YearSelector = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const PrevBtn = () => setYear((prev) => prev - 1);
  const NextBtn = () => {
    if (year < currentYear) {
      setYear((prev) => prev + 1);
    }
  };

  return (
    <div className={styles.datediv}>
      <button onClick={PrevBtn} className={styles.leftright}>
        ◀
      </button>
      <span className={styles.inputyear}>{year}</span>
      <button
        onClick={NextBtn}
        className={styles.leftright}
        disabled = {year >=currentYear}
      >
        ▶
      </button>
    </div>
  );
};
export default YearSelector;
