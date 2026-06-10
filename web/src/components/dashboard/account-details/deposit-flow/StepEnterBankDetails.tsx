import React from 'react';

import { Field, FieldContent, FieldLabel } from 'src/components/ui/field';
import { Input } from 'src/components/ui/input';

import type { RecipientBankDetails } from './deposit-types';

interface StepEnterBankDetailsProps {
  bankDetails: Partial<RecipientBankDetails>;
  onChange: (details: Partial<RecipientBankDetails>) => void;
}

export const StepEnterBankDetails: React.FC<StepEnterBankDetailsProps> = ({
  bankDetails,
  onChange,
}) => {
  const handleChange =
    (field: keyof RecipientBankDetails) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ [field]: e.target.value } as Partial<RecipientBankDetails>);
  };

  const renderField = (
    id: keyof RecipientBankDetails,
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
                ? (e) =>
                    onChange({
                      [id]: e.target.value.toUpperCase(),
                    } as Partial<RecipientBankDetails>)
                : handleChange(id)
            }
            className="mt-2"
          />
        </FieldContent>
      </Field>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Supplier bank details</h3>
        <p className="mt-0.5 text-xs text-slate-600">
          The supplier does not have a linked account yet. Enter the settlement details to continue.
        </p>
      </div>

      <div className="max-w-[520px] space-y-4">
        {renderField('accountHolderName', 'Beneficiary name', { required: true })}
        {renderField('countryCode', 'Country code', { required: true, transformUppercase: true })}
        {renderField('bankName', 'Bank name', { required: true })}
        {renderField('accountNumber', 'Account number', { required: true })}
        {renderField('swiftBic', 'SWIFT/BIC', { required: true, transformUppercase: true })}
      </div>
    </div>
  );
};
