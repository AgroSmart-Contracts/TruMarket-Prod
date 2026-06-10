import classNames from "classnames";
import React from "react";

interface BadgeProps {
  background?: string;
  classOverrides?: string;
}

const Badge: React.FC<BadgeProps> = ({ background, classOverrides }) => {
  return (
    <div
      className={classNames(
        classOverrides,
        "h-[12px] w-[12px] rounded-full",
        background ? background : "bg-tm-yellow",
      )}
    ></div>
  );
};

export default Badge;
