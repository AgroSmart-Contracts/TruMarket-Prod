import classNames from "classnames";
import React, { useState } from "react";
import { FieldError } from "react-hook-form";

import { RadioBox } from "../radio";

interface RadioGroupProps {
  error?: FieldError;
  icon?: React.ReactNode;
  title: string;
  register?: any;
  setValue: any;
  value: string;
  registeredField?: string;
  selectedValue?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  error,
  icon,
  title,
  register,
  value,
  setValue,
  registeredField,
  selectedValue,
}) => {
  return (
    <div
      className={classNames("cursor-pointer rounded-[4px]  border px-[8px] py-[9px]", {
        "border-tm-black-20": !error,
        "border-tm-danger": error,
        "bg-tm-black-transparent-05": selectedValue === value,
      })}
      onClick={() => setValue?.(registeredField, value)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[7px]">
          {icon}
          <p className="text-[13px] font-normal leading-[1.2em] tracking-normal text-tm-black-80">{title}</p>
        </div>

        <RadioBox
          register={register}
          setChecked={() => void 0}
          id={value}
          radioBoxValue={value}
          radioBoxName={value}
          classes="h-[20px] w-[20px]"
          labelClasses="text-[13px]"
        />
      </div>
    </div>
  );
};

export default RadioGroup;
