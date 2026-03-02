import React from 'react';
import { Field, FieldContent, FieldLabel } from 'src/components/ui/field';
import { Input } from 'src/components/ui/input';
import type { UserProfileInfo } from 'src/interfaces/auth';

type BankDetails = NonNullable<UserProfileInfo['bankDetails']>;

interface StepEnterBankDetailsProps {
  bankDetails: Partial<BankDetails>;
  onChange: (details: Partial<BankDetails>) => void;
}

export const StepEnterBankDetails: React.FC<StepEnterBankDetailsProps> = ({
  bankDetails,
  onChange,
}) => {
  const handleChange = (field: keyof BankDetails) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [field]: e.target.value } as Partial<BankDetails>);
  };

  const renderField = (
    id: keyof BankDetails,
    label: string,
    options?: { required?: boolean; transformUppercase?: boolean },
  ) => {
    const valueForId = bankDetails[id] ?? '';

    return (
      <Field className="gap-0">
        <FieldLabel className="text-[13px] text-tm-black-80" htmlFor={id}>
          {label}
          {options?.required ? <span className="text-red-500">*</span> : null}
        </FieldLabel>
        <FieldContent className="gap-0">
          <Input
            id={id}
            value={valueForId}
            onChange={
              options?.transformUppercase
                ? (e) => onChange({ [id]: e.target.value.toUpperCase() } as Partial<BankDetails>)
                : handleChange(id)
            }
            className="mt-2 h-auto w-full rounded-lg border border-tm-black-20 px-[8px] py-[6px] text-[13px]"
          />
        </FieldContent>
      </Field>
    );
  };

  return (
    <div className="space-y-4">
      <p className="mb-4 text-sm text-slate-600">
        Enter the recipient&apos;s bank account details for payment processing.
      </p>

      <div className="max-w-[520px] space-y-4">
        {renderField('beneficiaryName', 'Beneficiary name', { required: true })}
        {renderField('bankName', 'Bank name')}
        {renderField('accountNumber', 'Account number', { required: true })}
        {renderField('swiftCode', 'SWIFT/BIC', { required: true })}
      </div>
    </div>
  );
};
