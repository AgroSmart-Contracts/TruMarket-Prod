import React from "react";
import { Control, FieldErrors, UseFormRegister, UseFormGetValues, UseFormSetValue, UseFormHandleSubmit } from "react-hook-form";
import EmailInput from "src/components/common/email-input";
import TermsCheckbox from "src/components/common/terms-checkbox";

interface SharedRegisterFormProps {
    register: UseFormRegister<any>;
    control: Control<any>;
    errors?: FieldErrors;
    setValue: UseFormSetValue<any>;
    onSubmit?: ReturnType<UseFormHandleSubmit<any>>;
    children?: React.ReactNode;
}

const SharedRegisterForm: React.FC<SharedRegisterFormProps> = ({
    register,
    control,
    errors,
    setValue,
    onSubmit,
    children,
}) => {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <EmailInput
                register={register}
                errors={errors}
            />
            <TermsCheckbox
                control={control}
                errors={errors}
                setValue={setValue}
            />
            {children}
        </form>
    );
};

export default SharedRegisterForm;

