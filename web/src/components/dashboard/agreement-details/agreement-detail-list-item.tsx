import React, { HTMLInputTypeAttribute, InputHTMLAttributes, useRef, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import classNames from "classnames";
import { FieldError, FieldErrors } from "react-hook-form";

import ValidationErrorMessage from "src/components/common/validation-error-message";

import AgreementDetailInput from "./agreement-detail-input";
import AgreementDetailReadOnlyRow from "./agreement-detail-read-only-row";

interface AgreementDetailsListItemProps {
  readOnly?: boolean;
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
  readOnly = false,
}) => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [enabledToEdit, setEnabledToEdit] = useState(false);
  const [focused, setFocused] = useState(false);

  const onFocus = () => setFocused(true);
  const onBlur = () => {
    setFocused(false);
    setEnabledToEdit(false);
  };

  const selectDisplayLabel =
    selectBoxOptions?.find((option) => option.value === defaultValue)?.label ?? defaultValue;

  const showSelectAsText = isSelectBox && (!editable || !enabledToEdit);

  const formatLabel = (label?: string) => (label ? label.replace(/:+$/, "").trim() : undefined);

  if (readOnly) {
    let displayValue: React.ReactNode = defaultValue;

    if (isSelectBox && nestedInput) {
      const parts = [selectDisplayLabel, nestedInputDefaultValue].filter(Boolean);
      displayValue = parts.length ? parts.join(" · ") : undefined;
    } else if (isSelectBox) {
      displayValue = selectDisplayLabel;
    } else if (showPercentage) {
      displayValue =
        defaultValue !== undefined && defaultValue !== "" ? `${defaultValue}%` : undefined;
    } else if (inputType === "date" && defaultValue) {
      const parsed = new Date(defaultValue);
      displayValue = Number.isNaN(parsed.getTime())
        ? defaultValue
        : parsed.toLocaleDateString(undefined, {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
    }

    return <AgreementDetailReadOnlyRow label={formatLabel(title)} value={displayValue} />;
  }

  return (
    <div className="grid grid-cols-1 gap-2 py-2.5 sm:grid-cols-[minmax(10rem,38%)_minmax(0,1fr)] sm:items-start sm:gap-4">
      {title ? (
        <p className="text-[13px] font-normal leading-snug text-[#64748B]">{formatLabel(title)}</p>
      ) : null}
      <div className="group relative min-w-0">
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
          <div className="relative flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            {editable && showSelectAsText ? (
              <div
                className="absolute inset-0 z-[1] cursor-pointer bg-[#ffffff00]"
                onClick={() => {
                  setEnabledToEdit(true);
                  setFocused(true);
                  selectRef?.current?.focus();
                }}
              />
            ) : null}
            {showSelectAsText ? (
              <span
                className={classNames(
                  "break-words text-[13px] font-medium leading-[1.2em] tracking-normal text-tm-black-80",
                  {
                    "rounded-[4px] bg-tm-yellow px-[10px] py-[3.5px]": isValueChanged,
                  },
                )}
              >
                {selectDisplayLabel || "—"}
              </span>
            ) : (
              <select
                name={inputName}
                ref={selectRef}
                onChange={handleChange}
                disabled={!editable}
                className={classNames(
                  "notranslate max-w-full !bg-[#ff000000] px-[10px] py-[1.2px] text-[13px] font-medium leading-[1.2em] tracking-normal text-tm-black-80 outline-none",
                  {
                    "rounded-[4px] !bg-tm-yellow !py-[3.5px]": isValueChanged && !focused,
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
            )}
            {nestedInput ? (
              showSelectAsText && !enabledToEdit ? (
                <span
                  className={classNames(
                    "break-words text-[13px] font-medium leading-[1.2em] text-tm-black-80",
                    {
                      "rounded-[4px] bg-tm-yellow px-[10px] py-[3.5px]": isNestedInputChanged,
                    },
                  )}
                >
                  {nestedInputDefaultValue || "—"}
                </span>
              ) : (
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
              )
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
