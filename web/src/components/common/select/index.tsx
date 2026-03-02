import React from "react";
import { Controller, FieldErrors } from "react-hook-form";
import Select, { MenuPlacement } from "react-select";

import { IOptions, IRules, ValidationStates } from "../../../interfaces/global";
import ValidationErrorMessage from "../validation-error-message";
import { SelectDropDownStyles } from "./styles";

interface SelectProps {
  id: string;
  options: IOptions[];
  placeHolder?: string;
  inputHeight?: string;
  dropDownPositionL?: number;
  dropDownPositionT?: number;
  clearable?: boolean;
  rules?: IRules;
  isRequired?: boolean;
  menuPlacement?: MenuPlacement;
  control: any;
  errors?: FieldErrors;
  state: ValidationStates | string;
  value?: number | string;
  disableBorderRight?: boolean;
  messagePlacement?: "middle_right";
  showErrorMessage?: boolean;
}

const SelectDropDown: React.FC<SelectProps> = ({
  id,
  placeHolder = "Select",
  options,
  inputHeight,
  dropDownPositionL,
  dropDownPositionT,
  control,
  errors,
  rules,
  state,
  value,
  menuPlacement = "bottom",
  messagePlacement = "middle_right",
  isRequired = false,
  clearable = false,
  disableBorderRight = false,
  showErrorMessage = true,
}) => {
  const errorMessagePlacement = {
    middle_right: "absolute -right-[100px] top-[5px]",
  };
  return (
    <div className="relative w-full">
      <Controller
        name={id}
        control={control}
        defaultValue={options?.find((option) => option.value === value)}
        rules={isRequired ? rules : {}}
        render={({ field }) => (
          <Select
            {...field}
            options={options}
            defaultValue={options?.find((option) => option.value === value)}
            components={{
              IndicatorSeparator: () => null,
            }}
            placeholder={placeHolder}
            isClearable={clearable}
            menuPlacement={menuPlacement}
            // className={classNames("border-tm-black-80 outline-none", {
            //   " border-tm-danger": state === ValidationStates.ERROR,
            // })}
            styles={SelectDropDownStyles(inputHeight, dropDownPositionL, dropDownPositionT, state, disableBorderRight)}
          />
        )}
      />
      {isRequired && showErrorMessage ? (
        <ValidationErrorMessage className={errorMessagePlacement[messagePlacement]} errors={errors} name={id} />
      ) : null}
    </div>
  );
};

export default SelectDropDown;
