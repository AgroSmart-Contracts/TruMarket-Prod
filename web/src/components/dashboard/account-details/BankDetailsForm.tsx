import React from "react";

import { Field, FieldContent, FieldLabel } from "src/components/ui/field";
import { Input } from "src/components/ui/input";
import Button, { ButtonSizes, ButtonVariants } from "src/components/common/button";
import type { UserProfileInfo } from "src/interfaces/auth";

type BankDetails = NonNullable<UserProfileInfo["bankDetails"]>;

interface BankDetailsFormProps {
    value: BankDetails;
    isLinked?: boolean;
    saving: boolean;
    isEditing: boolean;
    onChange: (patch: Partial<BankDetails>) => void;
    onSave: () => void;
    onToggleEdit: () => void;
}

interface BankDetailRowProps {
    label: string;
    value: string | undefined;
}

const BankDetailRow: React.FC<BankDetailRowProps> = ({ label, value }) => {
    if (!value) return null;

    return (
        <div className="grid grid-cols-[160px,1fr] gap-x-6 px-4 py-3 text-[13px]">
            <span className="text-tm-black-60">{label}</span>
            <span className="font-semibold text-tm-black-80">{value}</span>
        </div>
    );
};

export const BankDetailsForm: React.FC<BankDetailsFormProps> = ({
    value,
    isLinked,
    saving,
    isEditing,
    onChange,
    onSave,
    onToggleEdit,
}) => {
    const handleChange =
        (field: keyof BankDetails) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                onChange({ [field]: e.target.value } as Partial<BankDetails>);
            };

    const renderField = (
        id: keyof BankDetails,
        label: string,
        options?: { required?: boolean; transformUppercase?: boolean },
    ) => {
        const valueForId = value[id] ?? "";

        return (
            <Field className="gap-0">
                <FieldLabel className="text-[13px] text-tm-black-80" htmlFor={id}>
                    {label}
                    {options?.required ? <span className="text-red">*</span> : null}
                </FieldLabel>
                <FieldContent className="gap-0">
                    <Input
                        id={id}
                        value={valueForId}
                        onChange={
                            options?.transformUppercase
                                ? (e) =>
                                    onChange({
                                        [id]: e.target.value.toUpperCase(),
                                    } as Partial<BankDetails>)
                                : handleChange(id)
                        }
                        disabled={!isEditing}
                        className="mt-2 h-auto w-full rounded-lg border border-tm-black-20 px-[8px] py-[6px] text-[13px]"
                    />
                </FieldContent>
            </Field>
        );
    };

    const isViewMode = !!isLinked && !isEditing;

    if (isViewMode) {
        // Presenting mode: show read-only summary similar to the example card
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[13px] text-tm-black-80">
                        Status:{' '}
                        <span className="font-semibold text-[#4E8C37]">
                            Linked
                        </span>
                    </p>
                    <Button
                        onClick={onToggleEdit}
                        variant={ButtonVariants.SECONDARY}
                        size={ButtonSizes.MD}
                    >
                        <div className="flex items-center gap-[6px]">
                            <p className="text-[13px] font-bold leading-[1.2em]">Edit</p>
                        </div>
                    </Button>
                </div>

                <div className="divide-y divide-[#E5E7EB]">
                    <BankDetailRow label="Beneficiary name" value={value.beneficiaryName} />
                    <BankDetailRow label="Country" value={value.country} />
                    <BankDetailRow label="Bank name" value={value.bankName} />
                    <BankDetailRow label="Address line 1" value={value.addressLine1} />
                    <BankDetailRow label="City" value={value.city} />
                    <BankDetailRow label="Postal code" value={value.postalCode} />
                    <BankDetailRow label="Account number" value={value.accountNumber} />
                    <BankDetailRow label="SWIFT/BIC" value={value.swiftCode} />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <p className="text-[13px] text-tm-black-80">
                    Status:{' '}
                    <span className="font-semibold text-[#4E8C37]">
                        Linked
                    </span>
                </p>
                {renderField("beneficiaryName", "Beneficiary name", { required: true })}

                {renderField("country", "Country", {
                    transformUppercase: true,
                })}

                {renderField("bankName", "Bank name")}

                {renderField("addressLine1", "Address line 1")}

                {renderField("city", "City")}

                {renderField("postalCode", "Postal code")}

                {renderField("accountNumber", "Account number", { required: true })}

                {renderField("swiftCode", "SWIFT/BIC", { required: true })}
            </div>

            <div className="mt-[16px] flex w-full items-center">
                {isEditing ? (
                    <>
                        <div className="flex-1">
                            <Button
                                onClick={onToggleEdit}
                                variant={ButtonVariants.SECONDARY}
                                size={ButtonSizes.MD}
                                disabled={saving}
                            >
                                <div className="flex items-center gap-[6px]">
                                    <p className="text-[13px] font-bold leading-[1.2em]">
                                        Cancel
                                    </p>
                                </div>
                            </Button>
                        </div>
                        <div className="flex flex-1 justify-end">
                            <Button
                                onClick={onSave}
                                variant={ButtonVariants.PRIMARY}
                                size={ButtonSizes.MD}
                                disabled={saving}
                            >
                                <div className="flex items-center gap-[6px]">
                                    <p className="text-[13px] font-bold leading-[1.2em]">
                                        {saving ? "Saving..." : "Save"}
                                    </p>
                                </div>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex w-full justify-end">
                        <Button
                            onClick={onToggleEdit}
                            variant={ButtonVariants.SECONDARY}
                            size={ButtonSizes.MD}
                            disabled={saving}
                        >
                            <div className="flex items-center gap-[6px]">
                                <p className="text-[13px] font-bold leading-[1.2em]">
                                    Edit bank details
                                </p>
                            </div>
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

