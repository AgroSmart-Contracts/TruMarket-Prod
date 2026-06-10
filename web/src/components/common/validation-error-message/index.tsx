import React from "react";
import { ErrorMessage } from "@hookform/error-message";
import { FieldErrors } from "react-hook-form";
import classNames from "classnames";

interface ValidationErrorMessageProps {
  errors?: FieldErrors;
  name: string;
  className?: string;
}

const ValidationErrorMessage: React.FC<ValidationErrorMessageProps> = ({ errors, name, className }) => {
  return (
    <div className={classNames(className, "my-[3px] text-[11px] font-bold text-tm-danger")}>
      <ErrorMessage errors={errors} name={name} />
    </div>
  );
};

export default ValidationErrorMessage;
