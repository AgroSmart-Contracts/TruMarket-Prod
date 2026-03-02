import React, { HTMLInputTypeAttribute, InputHTMLAttributes, useRef, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import classNames from "classnames";
import { FieldError, FieldErrors } from "react-hook-form";

import ValidationErrorMessage from "src/components/common/validation-error-message";

import AgreementDetailInput from "./agreement-detail-input";

interface AgreementDetailsListItemProps {
  inputName: string;
  defaultValue: string;
  isValueChanged: boolean;
  isNestedInputChanged?: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => void;
  title?: string;
  editable?: boolean;
  required?: boolean;
  inputType?: HTMLInputTypeAttribute;
  isSelectBox?: boolean;
  nestedInput?: boolean;
  register?: any;
  showPercentage?: boolean;
  errors?: FieldErrors;
  nestedInputDefaultValue?: string;
  nestedInputName?: string;
  selectBoxOptions?: {
    label: string;
    value: string;
  }[];
}

const AgreementDetailsListItem: React.FC<AgreementDetailsListItemProps> = ({
  inputName,
  defaultValue,
  handleChange,
  register,
  isValueChanged,
  title,
  required,
  showPercentage,
  selectBoxOptions,
  nestedInputDefaultValue,
  isNestedInputChanged,
  nestedInputName,
  errors,
  nestedInput = false,
  editable = true,
  inputType = "text",
  isSelectBox = false,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [enabledToEdit, setEnabledToEdit] = useState(false);
  const [focused, setFocused] = useState(false);

  const onFocus = () => setFocused(true);
  const onBlur = () => {
    setFocused(false);
    setEnabledToEdit(false);
  };

  return (
    <div className="flex w-full max-w-[450px] items-center justify-between">
      {title ? (
        <p className="w-1/2 text-[13px] font-normal leading-[1em] tracking-normal text-tm-black-80">{title}</p>
      ) : null}
      <div className="group relative w-1/2">
        {!isSelectBox ? (
          <div className="relative inline-block">
            {editable && !focused ? (
              <div
                className="absolute h-full w-full cursor-pointer bg-[#ffffff00]"
                onClick={() => {
                  setEnabledToEdit(true);
                  setFocused(true);
                  selectRef?.current?.focus();
                }}
              ></div>
            ) : null}
            <AgreementDetailInput
              handleChange={handleChange}
              inputName={inputName}
              inputType={inputType}
              isValueChanged={isValueChanged}
              editable={editable}
              focused={focused}
              enabledToEdit={enabledToEdit}
              onFocus={onFocus}
              onBlur={onBlur}
              required={required}
              defaultValue={defaultValue}
              register={register}
              showPercentage={showPercentage}
              errors={errors}
            />

            {editable ? (
              <div
                className={classNames(
                  "absolute -top-[2px] z-10 cursor-pointer  opacity-0 transition-all group-hover:opacity-100",
                  {
                    block: !enabledToEdit,
                    hidden: enabledToEdit,
                  },
                )}
                onClick={() => {
                  setEnabledToEdit(true);
                  setFocused(true);
                }}
                style={{ right: "-20px" }}
              >
                <EditIcon className="!h-[18px] !w-[18px]" />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="relative inline-block whitespace-nowrap">
            {editable && !focused ? (
              <div
                className="absolute h-full w-full cursor-pointer bg-[#ffffff00]"
                onClick={() => {
                  setEnabledToEdit(true);
                  setFocused(true);
                  selectRef?.current?.focus();
                }}
              ></div>
            ) : null}
            <select
              name={inputName}
              ref={selectRef}
              onChange={handleChange}
              disabled={!editable || !enabledToEdit}
              className={classNames(
                "notranslate -z-10 w-auto max-w-[100px] !bg-[#ff000000] px-[10px] py-[1.2px] text-[13px] font-medium  leading-[1em] tracking-normal text-tm-black-80 outline-none disabled:opacity-100",
                {
                  "mr-[2px] rounded-[4px] !bg-tm-yellow !py-[3.5px] ": isValueChanged && !focused,
                  "select-arrow rounded-[4px] border border-tm-gray-light !bg-tm-white": enabledToEdit && focused,
                  "disabled-select-arrow": !focused,
                },
              )}
              onFocus={onFocus}
              onBlur={onBlur}
            >
              <option value="undefined" hidden></option>
              {selectBoxOptions?.map((option, i) => (
                <option
                  value={option.value}
                  selected={option.value === defaultValue}
                  key={i}
                  className="leading-[1.2em]"
                >
                  {option.label}
                </option>
              ))}
            </select>
            {nestedInput ? (
              <AgreementDetailInput
                handleChange={handleChange}
                inputName={nestedInputName || ""}
                inputType={inputType}
                isValueChanged={isNestedInputChanged || false}
                editable={editable}
                focused={focused}
                enabledToEdit={enabledToEdit}
                onFocus={onFocus}
                onBlur={onBlur}
                register={register}
                errors={errors}
                required={required}
                defaultValue={nestedInputDefaultValue || ""}
              />
            ) : null}
            {editable ? (
              <div
                className={classNames(
                  "absolute -top-[2px] z-10 cursor-pointer  opacity-0 transition-all group-hover:opacity-100",
                  {
                    block: !enabledToEdit,
                    hidden: enabledToEdit,
                  },
                )}
                onClick={() => {
                  setEnabledToEdit(true);
                  setFocused(true);
                }}
                style={{ right: "-20px" }}
              >
                <EditIcon className="!h-[18px] !w-[18px]" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgreementDetailsListItem;
