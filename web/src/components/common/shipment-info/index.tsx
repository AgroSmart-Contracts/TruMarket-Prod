import classNames from "classnames";
import React from "react";
import Flag from "react-world-flags";
interface ShipmentInfoProps {
  title: string;
  value: string;
  showFlag?: boolean;
  subValue?: string;
  titleClassOverrides?: string;
  valueClassOverrides?: string;
  countryCode?: string;
}

const ShipmentInfo: React.FC<ShipmentInfoProps> = ({
  title,
  value,
  subValue,
  titleClassOverrides,
  valueClassOverrides,
  countryCode,
  showFlag = false,
}) => {
  return (
    <div className="flex  w-auto flex-col gap-[5px]">
      <p className={classNames("text-[13px] font-bold capitalize leading-[1em] text-tm-black-80", titleClassOverrides)}>
        {title}
      </p>
      <div className={classNames("flex items-center gap-[6px]", valueClassOverrides)}>
        {showFlag ? (
          <div className="w-[30px]  rounded-[4px]">
            <Flag code={countryCode} className="h-[20px] rounded-[4px]" />
          </div>
        ) : null}
        <span suppressHydrationWarning className="text-[13px] text-tm-black-80">
          {value}
        </span>
        <span suppressHydrationWarning className="text-[13px] text-tm-black-80 opacity-60">
          {subValue}
        </span>
      </div>
    </div>
  );
};

export default ShipmentInfo;
