import React, { FC } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import Input from "../input";

interface EmailInputProps {
    name?: string;
    register: UseFormRegister<any>;
    errors?: FieldErrors;
    placeholder?: string;
    label?: string;
    classOverrides?: string;
    errorMessageClass?: string;
}

const EmailInput: FC<EmailInputProps> = ({
    name = "email",
    register,
    errors,
    placeholder = "Please provide email",
    label = "Email Address",
    classOverrides,
    errorMessageClass = "!relative !left-0",
}) => {
    const emailRegister = register(name, {
        required: "Email field is required!",
        pattern: {
            value: /\S+@\S+\.\S+/,
            message: "Email format is invalid!",
        },
    });

    return (
        <div>
            <label className="block text-sm font-semibold text-tm-text mb-2">
                {label}
            </label>
            <Input
                name={name}
                placeholder={placeholder}
                register={emailRegister}
                errorMessageClass={errorMessageClass}
                hasError={Boolean(errors?.[name])}
                errors={errors}
                classOverrides={classOverrides || "tm-input"}
                type="email"
            />
        </div>
    );
};

export default EmailInput;

