import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button, { ButtonSizes, ButtonVariants } from "src/components/common/button";
import SelectDropDown from "src/components/common/select";
import { Field, FieldContent, FieldDescription, FieldLabel } from "src/components/ui/field";
import { Input } from "src/components/ui/input";
import { AuthService } from "src/controller/AuthAPI.service";
import { UserProfileInfo } from "src/interfaces/auth";
import { ICompanyInfo, ValidationStates } from "src/interfaces/global";
import { countryOrigins } from "src/lib/static";

type CompanyProfileStatus = "SAVED" | "NOT_SET";

interface CompanyDetailRowProps {
  label: string;
  value?: string;
}

const CompanyDetailRow: React.FC<CompanyDetailRowProps> = ({ label, value }) => (
  <div className="grid grid-cols-[160px,1fr] gap-x-6 px-4 py-3 text-[13px]">
    <span className="text-tm-black-60">{label}</span>
    <span className="break-words font-semibold text-tm-black-80">{value?.trim() ? value : "—"}</span>
  </div>
);

const companyLooksSaved = (c?: UserProfileInfo["company"]): boolean =>
  !!(c?.name?.trim() && c?.country?.trim() && c?.taxId?.trim());

export const CompanyDetailsForm: React.FC<{
  company?: UserProfileInfo["company"];
  onRefetch?: () => Promise<any> | void;
}> = ({ company, onRefetch }) => {
  const saved = companyLooksSaved(company);
  const [isEditing, setIsEditing] = useState<boolean>(!saved);
  const [saving, setSaving] = useState(false);

  const defaultCountry = useMemo(
    () => countryOrigins.find((countryOption) => countryOption.value === company?.country),
    [company?.country],
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<ICompanyInfo>({
    defaultValues: {
      companyName: company?.name || "",
      taxId: company?.taxId || "",
      country: defaultCountry,
    },
  });

  useEffect(() => {
    reset({
      companyName: company?.name || "",
      taxId: company?.taxId || "",
      country: countryOrigins.find((o) => o.value === company?.country),
    });
  }, [company?.name, company?.taxId, company?.country, reset]);

  const status: CompanyProfileStatus = saved ? "SAVED" : "NOT_SET";
  const statusMeta =
    status === "SAVED"
      ? { text: "Saved", color: "#4E8C37" as const }
      : { text: "Not provided", color: "#9CA3AF" as const };

  const isViewMode = saved && !isEditing;

  const onSave = async (data: ICompanyInfo) => {
    try {
      setSaving(true);
      await AuthService.updateCompany({
        company: {
          name: data.companyName.trim(),
          taxId: data.taxId.trim(),
          country: data.country?.value,
        },
      });
      toast.success("Company details updated.");
      setIsEditing(false);
      await onRefetch?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update company details.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (!saved) {
      reset({
        companyName: "",
        taxId: "",
        country: undefined,
      });
      setIsEditing(true);
      return;
    }
    if (isEditing) {
      reset({
        companyName: company?.name || "",
        taxId: company?.taxId || "",
        country: defaultCountry,
      });
      setIsEditing(false);
      return;
    }
    setIsEditing(true);
  };

  if (isViewMode) {
    return (
      <div className="tm-card flex flex-col gap-[20px]">
        <h2 className="text-[18px] font-semibold leading-[1.2em] tracking-normal text-tm-black-80">
          Company details
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-tm-black-80">
              Status:{" "}
              <span className="font-semibold" style={{ color: statusMeta.color }}>
                {statusMeta.text}
              </span>
            </p>
            <Button onClick={handleToggleEdit} variant={ButtonVariants.SECONDARY} size={ButtonSizes.MD}>
              <div className="flex items-center gap-[6px]">
                <p className="text-[13px] font-bold leading-[1.2em]">Edit</p>
              </div>
            </Button>
          </div>

          <div className="divide-y divide-[#E5E7EB]">
            <CompanyDetailRow label="Company name" value={company?.name} />
            <CompanyDetailRow label="Tax ID" value={company?.taxId} />
            <CompanyDetailRow label="Country" value={company?.country} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tm-card flex flex-col gap-[20px]">
      <h2 className="text-[18px] font-semibold leading-[1.2em] tracking-normal text-tm-black-80">
        Company details
      </h2>

      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <p className="text-[13px] text-tm-black-80">
          Status:{" "}
          <span className="font-semibold" style={{ color: statusMeta.color }}>
            {statusMeta.text}
          </span>
        </p>

        <Field className="gap-0">
          <FieldLabel className="text-[13px] text-tm-black-80" htmlFor="company-name-input">
            Company name<span className="text-red">*</span>
          </FieldLabel>
          <FieldContent className="gap-0">
            <Input
              invalid={Boolean(errors.companyName)}
              className="mt-2"
              placeholder="Company name"
              {...register("companyName", { required: "Company name is required." })}
              id="company-name-input"
            />
            {errors.companyName?.message ? (
              <FieldDescription className="text-destructive text-xs">{errors.companyName.message}</FieldDescription>
            ) : null}
          </FieldContent>
        </Field>

        <Field className="gap-0">
          <FieldLabel className="text-[13px] text-tm-black-80" htmlFor="company-tax-input">
            Tax ID<span className="text-red">*</span>
          </FieldLabel>
          <FieldContent className="gap-0">
            <Input
              invalid={Boolean(errors.taxId)}
              className="mt-2"
              placeholder="Tax ID"
              {...register("taxId", { required: "Tax ID is required." })}
              id="company-tax-input"
            />
            {errors.taxId?.message ? (
              <FieldDescription className="text-destructive text-xs">{errors.taxId.message}</FieldDescription>
            ) : null}
          </FieldContent>
        </Field>

        <Field className="gap-0">
          <FieldLabel className="text-[13px] text-tm-black-80" htmlFor="country">
            Country<span className="text-red">*</span>
          </FieldLabel>
          <FieldContent className="gap-0">
            <div className="mt-2">
              <SelectDropDown
                id="country"
                placeHolder="Select country"
                state={errors.country ? ValidationStates.ERROR : ""}
                inputHeight="42px"
                options={countryOrigins}
                rules={{
                  required: {
                    value: true,
                    message: "Country is required.",
                  },
                }}
                control={control}
                errors={errors}
                isRequired
              />
            </div>
          </FieldContent>
        </Field>

        <div className="mt-[16px] flex w-full items-center">
          <div className="flex-1">
            <Button
              type="button"
              onClick={handleToggleEdit}
              variant={ButtonVariants.SECONDARY}
              size={ButtonSizes.MD}
              disabled={saving}
            >
              <div className="flex items-center gap-[6px]">
                <p className="text-[13px] font-bold leading-[1.2em]">Cancel</p>
              </div>
            </Button>
          </div>
          <div className="flex flex-1 justify-end">
            <Button type="submit" variant={ButtonVariants.PRIMARY} size={ButtonSizes.MD} disabled={saving}>
              <div className="flex items-center gap-[6px]">
                <p className="text-[13px] font-bold leading-[1.2em]">{saving ? "Saving..." : "Save"}</p>
              </div>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
