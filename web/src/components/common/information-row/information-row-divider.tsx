import classNames from "classnames";
import React from "react";

interface InformationRowDividerProps {
  classOverrides?: string;
}

const InformationRowDivider: React.FC<InformationRowDividerProps> = ({ classOverrides }) => {
  return <div className={classNames("mx-[16px] h-[12px] w-[1px] bg-tm-black-20", classOverrides)}></div>;
};

export default InformationRowDivider;
