import classNames from "classnames";
import React from "react";

interface FieldTitleProps {
  children: React.ReactNode;
  classOverrides?: string;
}

const FieldTitle: React.FC<FieldTitleProps> = ({ children, classOverrides }) => {
  return (
    <p className={classNames("text-[13px] font-bold leading-[1.2em] tracking-normal text-tm-black-80", classOverrides)}>
      {children}
    </p>
  );
};

export default FieldTitle;
