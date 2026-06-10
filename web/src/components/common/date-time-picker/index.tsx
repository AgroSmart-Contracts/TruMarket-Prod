import classNames from "classnames";
import React, { InputHTMLAttributes, ChangeEvent, FC } from "react";
import { FieldErrors } from "react-hook-form";

import ValidationErrorMessage from "../validation-error-message";

interface DateTimePickerProps extends InputHTMLAttributes<HTMLInputElement> {
  classOverrides?: string;
  register?: any;
  onChange?: (value: ChangeEvent<HTMLInputElement>) => void;
  errors?: FieldErrors;
  name: string;
  hasError?: boolean;
  messagePlacement?: "middle_right";
}

const DateTimePicker: FC<DateTimePickerProps> = ({
  classOverrides,
  errors,
  name,
  onChange,
  hasError,
  register,
  messagePlacement = "middle_right",
  ...rest
}) => {
  const errorMessagePlacement = {
    middle_right: "absolute -right-[100px] top-[5px]",
  };

  return (
    <div className="relative">
      <input
        {...rest}
        onChange={onChange ? (e) => onChange(e) : void 0}
        {...(register ? { ...register } : null)}
        name={name}
        type="date"
        className={classNames(
          classOverrides,
          " w-full  rounded-[4px] border px-[10px] py-[9px] text-[13px] font-bold leading-[1.2em] tracking-normal text-tm-black-80 outline-none",
          {
            "!border-2 border-tm-danger": hasError,
            "border-tm-black-20": !hasError,
          },
        )}
      />
      <ValidationErrorMessage className={errorMessagePlacement[messagePlacement]} errors={errors ?? {}} name={name} />
    </div>
  );
};

export default DateTimePicker;
