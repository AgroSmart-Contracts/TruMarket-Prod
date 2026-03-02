import classNames from "classnames";
import React, { HTMLInputTypeAttribute, useEffect } from "react";
import { FieldErrors } from "react-hook-form";

import ValidationErrorMessage from "src/components/common/validation-error-message";

interface AgreementDetailInputProps {
  inputName: string;
  defaultValue: string | undefined;
  isValueChanged: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
  title?: string;
  editable?: boolean;
  required?: boolean;
  focused?: boolean;
  inputType?: HTMLInputTypeAttribute;
  isSelectBox?: boolean;
  errors?: FieldErrors;
  onFocus: () => void;
  onBlur: () => void;
  register?: any;
  showPercentage?: boolean;
  enabledToEdit?: boolean;
  selectBoxOptions?: {
    label: string;
    value: string;
  }[];
}

const AgreementDetailInput: React.FC<AgreementDetailInputProps> = ({
  handleChange,
  onBlur,
  onFocus,
  errors,
  inputName,
  inputType,
  defaultValue,
  isValueChanged,
  focused,
  register,
  editable,
  enabledToEdit,
  showPercentage = false,
  required = false,
}) => {
  return (
    <>
      <input
        {...(register &&
          register(inputName, {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange(e),
            onBlur: () => onBlur(),
            onFocus: () => onFocus(),
            required: required ? "field is required!" : false,
          }))}
        name={inputName}
        type={inputType}
        autoComplete="off"
        size={defaultValue ? defaultValue.toString().length + 1 : undefined}
        disabled={!editable || !enabledToEdit}
        className={classNames(
          "notranslate w-auto !bg-[#ff000000] px-[10px] py-[2px] text-[13px] font-medium leading-[1em] tracking-normal  text-tm-black-80 outline-none",
          {
            "rounded-[4px] !bg-tm-yellow": isValueChanged && !focused,
            "rounded-[4px] border border-tm-gray-light !bg-tm-white": enabledToEdit && focused,
            "border-2 border-tm-red": errors?.[inputName],
          },
        )}
        value={defaultValue}
        defaultValue={defaultValue}
      />
      {showPercentage ? <span className="absolute right-[8px] top-[4px] text-[12px] font-medium">%</span> : null}
      {register ? (
        <ValidationErrorMessage className="absolute -right-[120px] top-[1px]" name={inputName} errors={errors} />
      ) : null}
    </>
  );
};

export default AgreementDetailInput;
