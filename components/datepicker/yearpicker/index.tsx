"use client";
import styles from "../../../styles/admin/year/year.module.scss";

type YearSelectorProps = {
  year: number;
  onYearChange: (newYear: number) => void;
};

const YearSelector = ({ year, onYearChange }: YearSelectorProps) => {
  const currentYear = new Date().getFullYear();

  const PrevBtn = () => onYearChange(year - 1);
  const NextBtn = () => {
    if (year < currentYear) {
      onYearChange(year + 1);
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
        disabled={year >= currentYear}
      >
        ▶
      </button>
    </div>
  );
};
export default YearSelector;
