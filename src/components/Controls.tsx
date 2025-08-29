import classes from "./Controls.module.css";

export const Controls: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className={classes.controls}>{children}</div>;
};

export const ControlRow: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className={classes.row}>{children}</div>;
};
