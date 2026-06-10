import classNames from "classnames";
import React, { ButtonHTMLAttributes, FC, ReactNode } from "react";

interface CancelBackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  classOverrides?: string;
}

const CancelBackButton: FC<CancelBackButtonProps> = ({
  children,
  classOverrides,
  type = "button",
  ...rest
}) => (
  <button
    type={type}
    className={classNames(
      "cancel-back-button rounded-xl border border-solid border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700",
      "hover:border-[#E5E7EB] hover:bg-slate-50 hover:filter-none",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "md:w-auto",
      classOverrides,
    )}
    {...rest}
  >
    {children}
  </button>
);

export default CancelBackButton;
