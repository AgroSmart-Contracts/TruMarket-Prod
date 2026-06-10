import React from "react";
import classNames from "classnames";
import { CircleNotch } from "@phosphor-icons/react";

interface LoadingProps {
  classOverrides?: string;
  /** Use inside buttons and compact UI; avoids page-sized min-height wrapper. */
  variant?: "page" | "inline";
}

const Loading: React.FC<LoadingProps> = ({ classOverrides, variant = "page" }) => {
  const spinner = (
    <CircleNotch
      weight="duotone"
      className={classNames(
        classOverrides,
        variant === "inline"
          ? "h-[1.125rem] w-[1.125rem] shrink-0 animate-spin fill-current"
          : "h-[50px] w-[50px] animate-spin fill-tm-black-80 text-gray-200 dark:text-gray-600",
      )}
      aria-hidden
    />
  );

  if (variant === "inline") {
    return (
      <span role="status" className="inline-flex shrink-0 items-center justify-center">
        {spinner}
        <span className="sr-only">Loading...</span>
      </span>
    );
  }

  return (
    <div
      role="status"
      className="flex min-h-[200px] w-full items-center justify-center py-10"
    >
      {spinner}
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
