import classes from "./Controls.module.css";

export const Controls: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className={classes.controls}>{children}</div>;
};

export const ControlRow: React.FC<{
  children?: React.ReactNode;
  label?: string;
}> = ({ children, label }) => {
  return (
    <div className={classes.row}>
      {label && <label className={classes.row_label}>{label}</label>}
      <div className={classes.row_content}>{children}</div>
    </div>
  );
};

export function ControlDropdown<T extends string>({
  options,
  value,
  onChange,
}: {
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <select
      className={classes.control_dropdown}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
