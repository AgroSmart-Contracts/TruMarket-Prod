import type { StylesConfig } from "react-select";

import { ValidationStates } from "src/interfaces/global";

/** TruMarket chrome: matches `tmFormControl*` inputs (rounded-xl, slate border, green focus). */
const TM_BORDER_DEFAULT = "#E5E7EB";
const TM_BORDER_FOCUS = "#4E8C37";
const TM_TEXT = "#0f172a";
const TM_ERROR = "#F25E6B";

export const SelectDropDownStyles = (
  inputHeight?: number | string,
  dropDownPositionL?: number,
  dropDownPositionT?: number,
  validationState: ValidationStates | string = ValidationStates.SUCCESS,
  disableBorderRight?: boolean,
  lowerCase?: boolean,
): StylesConfig => {
  const hasError = validationState === ValidationStates.ERROR;

  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      outline: "none",
      minHeight: inputHeight || "42px",
      height: inputHeight || "42px",
      border: "none",
      borderRadius: disableBorderRight ? "12px 0 0 12px" : "12px",
      boxShadow: "none",
      backgroundColor: "transparent",
      cursor: "pointer",
    }),
    container: (baseStyles, state) => ({
      ...baseStyles,
      outline: "none",
      border: hasError
        ? `2px solid ${TM_ERROR}`
        : state.isFocused
          ? `1px solid ${TM_BORDER_FOCUS}`
          : `1px solid ${TM_BORDER_DEFAULT}`,
      borderRadius: disableBorderRight ? "12px 0 0 12px" : "12px",
      boxShadow: state.isFocused && !hasError ? `0 0 0 1px ${TM_BORDER_FOCUS}26` : "none",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    }),
    valueContainer: (baseStyles) => ({
      ...baseStyles,
      fontSize: 14,
      lineHeight: 1.25,
      padding: "10px 16px",
      textTransform: lowerCase ? "lowercase" : "none",
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      color: TM_TEXT,
      opacity: 0.45,
      fontWeight: 400,
      margin: 0,
    }),

    input: (baseStyles) => ({
      ...baseStyles,
      outline: "none",
      color: TM_TEXT,
      margin: 0,
      padding: 0,
    }),

    singleValue: (baseStyles) => ({
      ...baseStyles,
      overflow: "unset",
      color: TM_TEXT,
      fontWeight: 500,
    }),

    menu: (baseStyles) => ({
      ...baseStyles,
      ...(typeof dropDownPositionL === "number" ? { left: dropDownPositionL } : {}),
      ...(typeof dropDownPositionT === "number" ? { top: dropDownPositionT } : {}),
      zIndex: 999,
      marginTop: 4,
      borderRadius: 12,
      border: `1px solid ${TM_BORDER_DEFAULT}`,
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
    }),
    menuList: (base) => ({
      ...base,
      padding: 4,
    }),
    option: (baseStyles, { isFocused, isSelected }) => ({
      ...baseStyles,
      cursor: "pointer",
      borderRadius: 8,
      fontSize: 14,
      backgroundColor: isSelected ? TM_BORDER_FOCUS : isFocused ? "rgba(78,140,55,0.08)" : "#ffffff",
      color: isSelected ? "#ffffff" : TM_TEXT,
    }),
    indicatorsContainer: (baseStyles) => ({
      ...baseStyles,
      position: "relative",
      right: "0",
    }),
    clearIndicator: (baseStyles) => ({
      ...baseStyles,
      padding: "0",
      cursor: "pointer",
      color: TM_TEXT,
      "&:hover": {
        color: TM_BORDER_FOCUS,
      },
    }),
    dropdownIndicator: (baseStyles) => ({
      ...baseStyles,
      padding: "0 10px 0 0",
      cursor: "pointer",
      color: TM_TEXT,
      opacity: 0.55,
      "&:hover": {
        color: TM_BORDER_FOCUS,
        opacity: 1,
      },
    }),
    multiValue: (baseStyles) => ({
      ...baseStyles,
      lineHeight: "14px",
    }),
  };
};
