import classNames from "classnames";
import React, { ButtonHTMLAttributes, ReactNode, FC } from "react";

import Loading from "../loading";

export enum ButtonVariants {
  // Legacy variants (backward compatibility)
  FILLED_DARK = "filled_dark",
  FILLED_WHITE = "filled_white",
  FILLED_GRAY = "filled_gray",
  FILLED_GREEN = "filled_green",
  FILLED_BLUE = "filled_blue",
  FILLED_RED = "filled_red",
  FILLED_YELLOW = "filled_yellow",
  FILLED_DANGER = "filled_danger",

  // New modern variants
  PRIMARY = "primary",
  SECONDARY = "secondary",
  ACCENT = "accent",
  DANGER = "danger",
  OUTLINE = "outline",
  GHOST = "ghost",
}

export enum ButtonSizes {
  SM = "sm",
  MD = "md",
  LG = "lg",
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  classOverrides?: string;
  variant?: ButtonVariants;
  size?: ButtonSizes;
  loading?: boolean;
  innerClassOverrides?: string;
  icon?: React.ReactNode;
}

const Button: FC<ButtonProps> = ({
  loading,
  classOverrides,
  innerClassOverrides,
  children,
  variant = ButtonVariants.PRIMARY,
  size = ButtonSizes.MD,
  icon,
  ...rest
}) => {
  const buttonVariants = {
    // Legacy variants
    filled_dark: "bg-tm-black-80 text-tm-white hover:bg-opacity-90",
    filled_white: "bg-tm-white font-bold text-tm-black-80 hover:bg-opacity-90",
    filled_gray: "bg-tm-black-20 hover:bg-opacity-90",
    filled_green: "bg-tm-green text-tm-white hover:bg-opacity-90",
    filled_blue: "bg-tm-blue-secondary text-tm-white hover:bg-opacity-90",
    filled_red: "bg-tm-red text-tm-white hover:bg-opacity-90",
    filled_yellow: "bg-tm-yellow text-tm-white hover:bg-opacity-90",
    filled_danger: "bg-tm-danger text-tm-white hover:bg-opacity-90",

    // New modern variants with enhanced styling
    primary: "bg-tm-primary text-tm-white border-2 border-tm-primary hover:border-tm-primary-dark hover:shadow-tm-primary-lg hover:-translate-y-0.5",
    secondary: "bg-tm-white text-tm-primary border-2 border-tm-primary hover:bg-tm-primary hover:text-tm-white hover:shadow-tm-primary-lg hover:-translate-y-0.5",
    accent: "bg-tm-accent text-tm-white border-2 border-tm-accent shadow-[0_4px_14px_0_rgba(242,160,7,0.25)] hover:bg-tm-accent-dark hover:border-tm-accent-dark hover:shadow-[0_8px_25px_0_rgba(242,160,7,0.35)] hover:-translate-y-0.5",
    danger: "bg-tm-danger text-tm-white border-2 border-tm-danger hover:bg-tm-danger-dark hover:border-tm-danger-dark hover:-translate-y-0.5",
    outline: "bg-transparent text-tm-text border-2 border-[#D1D5DB] hover:bg-[#F9FAFB] hover:border-[#9CA3AF]",
    ghost: "bg-transparent text-tm-primary hover:bg-tm-primary-transparent",
  };

  const sizeVariants = {
    sm: "px-4 py-2 text-sm rounded-tm-sm",
    md: "px-5 py-2.5 text-sm rounded-tm-md",
    lg: "px-7 py-3.5 text-base rounded-tm-lg",
  };

  const variantScheme = buttonVariants[variant];
  const sizeScheme = sizeVariants[size];

  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 ease-out disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 "
        + variantScheme,
        sizeScheme,
        classOverrides,
      )}
      {...rest}
    >
      <div className={classNames("relative flex items-center justify-center gap-2", innerClassOverrides)}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
        {loading ? <Loading classOverrides="!h-[18px] !text-[10px] !w-[18px] !fill-current" /> : null}
      </div>
    </button>
  );
};

export default Button;
