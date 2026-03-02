import React, { KeyboardEventHandler, useState } from "react";
import { Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import classNames from "classnames";

import { ValidationStates } from "src/interfaces/global";

import { SelectDropDownStyles } from "./styles";
import ValidationErrorMessage from "../validation-error-message";

interface ICreatableInputProps {
  isRequired?: boolean;
  id: string;
  control: any;
  rules?: any;
  inputHeight?: string;
  dropDownPositionL?: number;
  dropDownPositionT?: number;
  state: ValidationStates | string;
  placeHolder?: string;
  disableBorderRight?: boolean;
  messagePlacement?: "middle_right";
  errors?: any;
}

const components = {
  DropdownIndicator: null,
};

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string): Option => ({
  label,
  value: label,
});

export default function CreatableInput({
  isRequired = false,
  id,
  control,
  rules,
  inputHeight,
  dropDownPositionL,
  dropDownPositionT,
  state,
  disableBorderRight,
  errors,
  messagePlacement = "middle_right",
  placeHolder = "Enter values",
}: ICreatableInputProps) {
  const errorMessagePlacement = {
    middle_right: "absolute -right-[100px] top-[5px]",
  };

  const [inputValue, setInputValue] = useState("");

  const changeInputValue = (event: any, onChange: (options: Option[]) => void, value: Option[]) => {
    if (!inputValue) return;
    event.preventDefault();
    const inputValues = inputValue
      .split(/[, ]+/)
      .map((v) => v.trim())
      .filter((v) => v);
    const newOptions = inputValues.map(createOption);
    const options = [...value, ...newOptions];
    const uniqueOptions: any = Array.from(new Set(options.map((option) => option.value.toLowerCase()))).map((value) =>
      options.find((option) => option.value === value),
    );
    onChange(uniqueOptions);
    setInputValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent, onChange: (options: Option[]) => void, value: Option[]) => {
    if (!inputValue) return;
    switch (event.key) {
      case "Enter":
      case "Tab":
      case ",":
      case " ":
        changeInputValue(event, onChange, value);
    }
  };

  const handleBlur = (event: React.FocusEvent, onChange: (options: Option[]) => void, value: Option[]) => {
    changeInputValue(event, onChange, value);
  };

  return (
    <div className="relative w-full">
      <Controller
        name={id}
        control={control}
        rules={isRequired ? rules : {}}
        defaultValue={[]}
        render={({ field: { onChange, onBlur, value, ref } }) => (
          <CreatableSelect
            components={components}
            inputValue={inputValue}
            isClearable
            isMulti
            menuIsOpen={false}
            onChange={(newValue) => {
              onChange(newValue);
            }}
            onInputChange={(newValue) => setInputValue(newValue)}
            onBlur={(e) => {
              handleBlur(e, onChange, value);
              onBlur();
            }}
            onKeyDown={(e) => handleKeyDown(e, onChange, value)}
            placeholder={placeHolder}
            value={value}
            ref={ref}
            styles={SelectDropDownStyles(
              inputHeight,
              dropDownPositionL,
              dropDownPositionT,
              state,
              disableBorderRight,
              true,
            )}
          />
        )}
      />
      {isRequired ? (
        <ValidationErrorMessage className={errorMessagePlacement[messagePlacement]} errors={errors} name={id} />
      ) : null}
    </div>
  );
}
