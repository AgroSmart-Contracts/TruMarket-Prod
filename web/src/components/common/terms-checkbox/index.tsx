import React from "react";
import classNames from "classnames";
import { Control, Controller, FieldErrors, UseFormSetValue } from "react-hook-form";
import { CheckBox } from "../checkbox";
import { useModal } from "src/context/modal-context";
import { AuthTMModalView } from "src/pages";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { selectIsTermsAndConditionsChecked, setTermsAndConditionsChecked } from "src/store/UiSlice";

interface TermsCheckboxProps {
    control: Control<any>;
    errors?: FieldErrors;
    setValue: UseFormSetValue<any>;
}

const TermsCheckbox: React.FC<TermsCheckboxProps> = ({ control, errors, setValue }) => {
    const { openModal } = useModal();
    const dispatch = useAppDispatch();
    const isTermsAndConditionChecked = useAppSelector(selectIsTermsAndConditionsChecked);

    return (
        <Controller
            control={control}
            rules={{
                required: true,
            }}
            name="terms"
            render={({ field: { onChange } }) => (
                <div className="flex items-start gap-3 p-4 rounded-tm-md border border-tm-neutral-dark bg-tm-neutral-light">
                    <CheckBox
                        id="terms"
                        checkBoxName="terms"
                        checkBoxValue={isTermsAndConditionChecked}
                        classes={classNames("!w-5 !h-5", {
                            "!border-tm-danger": errors?.terms,
                            "!border-tm-primary": !errors?.terms,
                        })}
                        setChecked={(checked) => {
                            dispatch(setTermsAndConditionsChecked({ state: checked }));
                            onChange(checked);
                            setValue("terms", checked, { shouldValidate: true });
                        }}
                    />
                    <p
                        className={classNames("text-sm flex-1", {
                            "text-tm-danger": errors?.terms,
                            "text-tm-text": !errors?.terms,
                        })}
                    >
                        I accept{" "}
                        <span
                            className="font-semibold cursor-pointer hover:text-tm-primary transition-colors underline"
                            onClick={() => openModal(AuthTMModalView.TERMS_AND_CONDITIONS)}
                        >
                            Terms and Conditions
                        </span>
                        {" "}and{" "}
                        <span
                            className="font-semibold cursor-pointer hover:text-tm-primary transition-colors underline"
                            onClick={() => openModal(AuthTMModalView.PRIVACY_POLICY)}
                        >
                            Privacy Policy
                        </span>
                    </p>
                </div>
            )}
        />
    );
};

export default TermsCheckbox;

