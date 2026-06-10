import classNames from "classnames";
import React, { useEffect, useRef, InputHTMLAttributes, ChangeEvent, FC } from "react";
import { FieldErrors } from "react-hook-form";

import { cn } from "src/lib/utils";
import { tmFormControlInputClassName, tmFormControlTextareaClassName } from "src/lib/form-control-styles";

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

  const isRange = rest.type === "range";

  return (
    <div className="relative">
      {isTextArea ? (
        <textarea
          {...rest}
          {...(register ? { ...register } : null)}
          {...onchangeHandler}
          name={name}
          ref={textareaRef}
          className={cn(
            tmFormControlTextareaClassName({ invalid: Boolean(hasError) }),
            "text-tm-black-80 placeholder:font-light",
            classOverrides,
          )}
        />
      ) : (
        <div className="relative">
          <input
            {...rest}
            {...(register ? { ...register } : null)}
            {...onchangeHandler}
            name={name}
            className={cn(
              isRange
                ? "h-2 w-full cursor-pointer accent-tm-green"
                : tmFormControlInputClassName({ invalid: Boolean(hasError) }),
              !isRange && "text-tm-black-80 placeholder:font-light",
              classOverrides,
              {
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
