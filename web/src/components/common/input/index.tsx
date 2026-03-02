import classNames from "classnames";
import React, { useEffect, useRef, InputHTMLAttributes, TextareaHTMLAttributes, ChangeEvent, FC } from "react";
import { FieldErrors } from "react-hook-form";

import ValidationErrorMessage from "../validation-error-message";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  classOverrides?: string;
  register?: any;
  onChange?: (value: ChangeEvent<HTMLTextAreaElement> | ChangeEvent<HTMLInputElement>) => void;
  errors?: FieldErrors;
  name: string;
  hasError?: boolean;
  isTextArea?: boolean;
  placeHolderRight?: string;
  showErrorMessage?: boolean;
  textareaDependency?: string;
  textareaAutoHeigh?: boolean;
  errorMessageClass?: string;
  messagePlacement?: "middle_right";
}

const Input: FC<InputProps> = ({
  classOverrides,
  errors,
  name,
  onChange,
  hasError,
  register,
  placeHolderRight,
  textareaDependency,
  textareaAutoHeigh,
  errorMessageClass,
  showErrorMessage = true,
  messagePlacement = "middle_right",
  isTextArea = false,
  ...rest
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onchangeHandler = onChange ? { onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(e) } : {};

  const errorMessagePlacement = {
    middle_right: "absolute -right-[100px] top-[5px]",
  };

  useEffect(() => {
    if (textareaRef.current && textareaAutoHeigh) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textareaDependency]);

  return (
    <div className="relative">
      {isTextArea ? (
        <textarea
          {...rest}
          {...(register ? { ...register } : null)}
          {...onchangeHandler}
          name={name}
          ref={textareaRef}
          className={classNames(
            classOverrides,
            " w-full rounded-[4px]  border p-[10px] text-[13px] font-bold leading-[1.2em] tracking-normal text-tm-black-80 outline-none placeholder:font-light",
            {
              "!border-2 border-tm-danger": hasError,
              "border-tm-black-20": !hasError,
            },
          )}
        />
      ) : (
        <div className="relative">
          <input
            {...rest}
            {...(register ? { ...register } : null)}
            {...onchangeHandler}
            name={name}
            className={classNames(
              classOverrides,
              " w-full rounded-[4px]  border text-[13px] font-bold leading-[1.2em] tracking-normal text-tm-black-80 outline-none placeholder:font-light " +
              (rest.type === "range" ? "" : "p-[10px]"),
              {
                "!border-2 border-tm-danger": hasError,
                "border-tm-black-20": !hasError,
                "pr-[40px]": placeHolderRight,
              },
            )}
          />
          {placeHolderRight ? (
            <span className="absolute right-[10px] top-[12px] text-[13px] font-light leading-[1.2em] text-tm-black-80">
              {placeHolderRight}
            </span>
          ) : null}
        </div>
      )}

      {showErrorMessage ? (
        <ValidationErrorMessage
          className={classNames(errorMessageClass, errorMessagePlacement[messagePlacement])}
          errors={errors ?? {}}
          name={name}
        />
      ) : null}
    </div>
  );
};

export default Input;
