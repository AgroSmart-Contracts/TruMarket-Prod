import React from "react";
import classNames from "classnames";
import { CircleNotch } from "@phosphor-icons/react";
interface LoadingProps {
  classOverrides?: string;
}

const Loading: React.FC<LoadingProps> = ({ classOverrides }) => {
  return (
    <div role="status">
      <div>
        <CircleNotch
          weight="duotone"
          className={classNames(
            classOverrides,
            "text-gray-200 dark:text-gray-600 h-[50px] w-[50px] animate-spin fill-tm-black-80",
          )}
        />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Loading;
