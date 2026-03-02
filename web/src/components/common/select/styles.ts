//@ts-nocheck

import { ValidationStates } from "src/interfaces/global";

export const SelectDropDownStyles = (
  inputHeight?: number | string,
  dropDownPositionL?: number,
  dropDownPositionT?: number,
  validationState: ValidationStates | string,
  disableBorderRight?: boolean,
  lowerCase?: boolean,
) => {
  const hasError = validationState === ValidationStates.ERROR;

  return {
    control: (baseStyles, state) => ({
      ...baseStyles,
      outline: "none",
      height: inputHeight || "36px",
      border: "none",
      borderRadius: "4px",
      boxShadow: "none",
      backgroundColor: "transparent",
      // minWidth: 200,
    }),
    container: (baseStyles, state) => ({
      ...baseStyles,
      outline: "none",
      border: hasError ? "2px solid #FA2020" : "1px solid #00000033",
      borderRadius: disableBorderRight ? "4px 0 0 4px" : "4px",
    }),
    valueContainer: (baseStyles, state) => ({
      ...baseStyles,
      fontSize: 13,
      lineHeight: 0,
      textTransform: lowerCase ? "lowercase" : "capitalize",
    }),
    placeholder: (baseStyles, state) => ({
      ...baseStyles,
      color: "#2D3E57",
      opacity: 0.5,
      fontWeight: 200,
    }),

    input: (baseStyles, state) => ({
      ...baseStyles,
      outline: "none",
      color: "#2D3E57",
    }),

    singleValue: (baseStyles, state) => ({
      ...baseStyles,
      overflow: "unset",
      color: "#2D3E57",
      textTransform: "capitalize",
    }),

    menu: (baseStyles, state) => ({
      ...baseStyles,
      left: dropDownPositionL || -2,
      top: dropDownPositionT || 35,
      zIndex: 999,
    }),
    option: (baseStyles, { isFocused }) => ({
      ...baseStyles,
      "&:hover": {
        backgroundColor: "#2D3E57",
        color: "#ffffff",
      },
      cursor: "pointer",
      backgroundColor: isFocused ? "#2D3E57" : "#ffffff",
      color: isFocused ? "#ffffff" : "#495057",
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
      color: "#2D3E57",
      "&:hover": {
        color: "#2D3E57",
      },
    }),
    dropdownIndicator: (baseStyles) => ({
      ...baseStyles,
      padding: "0 5px 0 0",
      cursor: "pointer",
      color: "#2D3E57",
      "&:hover": {
        color: "#2D3E57",
      },
    }),
    multiValue: (baseStyles) => ({
      ...baseStyles,
      lineHeight: "14px",
    }),
  };
};
