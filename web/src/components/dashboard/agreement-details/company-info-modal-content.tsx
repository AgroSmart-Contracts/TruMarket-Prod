import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button from "src/components/common/button";
import Input from "src/components/common/input";
import FieldTitle from "src/components/common/input/field-title";
import SelectDropDown from "src/components/common/select";
import CreatableInput from "src/components/common/select/creatable";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum, ICompanyInfo, ValidationStates } from "src/interfaces/global";
import { commaSeparatedStringToArray } from "src/lib/helpers";
import { countryOrigins } from "src/lib/static";

interface CompanyInfoModalContentProps {
  addresseeCompanyName: string;
  addresseeTaxId: string;
  addresseeCountry: string;
  addresseeParticipants: string;
  dealId: string;
  accountType: AccountTypeEnum;
  closeModal: () => void;
  refetch: () => void;
}

const CompanyInfoModalContent: React.FC<CompanyInfoModalContentProps> = ({
  addresseeCompanyName,
  addresseeTaxId,
  addresseeCountry,
  addresseeParticipants,
  accountType,
  dealId,
  closeModal,
  refetch,
}) => {
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [loading, setLoading] = useState(false);
  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      addresseeCompanyName,
      addresseeTaxId,
      addresseeCountry: countryOrigins.find((country) => country.value === addresseeCountry),
      addresseeParticipants: commaSeparatedStringToArray(addresseeParticipants).map((participant) => {
        return {
          label: participant,
          value: participant,
        };
      }),
    },
  });

  const handleNextStep = async (data: any) => {
    const normalizedData: any = {
      confirm: false,
    };

    if (isBuyer) {
      const buyerSideParticipants = data.addresseeParticipants.map((participants: any) => participants.value);
      normalizedData.buyersEmails = [...buyerSideParticipants];
      normalizedData.buyerCompany = {
        name: data.addresseeCompanyName,
        country: data.addresseeCountry?.label,
        taxId: data.addresseeTaxId,
      };
    }

    if (!isBuyer) {
      const supplierSideParticipants = data.addresseeParticipants.map((participants: any) => participants.value);
      normalizedData.suppliersEmails = [...supplierSideParticipants];
      normalizedData.supplierCompany = {
        name: data.addresseeCompanyName,
        country: data.addresseeCountry?.label,
        taxId: data.addresseeTaxId,
      };
    }

    try {
      setLoading(true);
      await ShipmentService.updateShipmentDealDetails(dealId, normalizedData);
      await refetch();
      toast.success("Company data updated successfully!");
      closeModal();
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[100px]">
      <form onSubmit={handleSubmit(handleNextStep)} className="flex flex-col gap-[12px]">
        <div className="px-[30px]">
          <FieldTitle classOverrides="mb-[5px]">Company name</FieldTitle>
          <Input
            name="addresseeCompanyName"
            type="text"
            classOverrides="!bg-[#ff000000]"
            placeholder="Your company name"
            register={register("addresseeCompanyName", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.addresseeCompanyName)}
            showErrorMessage={false}
            errors={errors}
          />
        </div>
        <div className="w-full px-[30px]">
          <FieldTitle classOverrides="mb-[5px]">Country</FieldTitle>
          <SelectDropDown
            id="addresseeCountry"
            placeHolder="The country where your company located"
            state={errors.addresseeCountry ? ValidationStates.ERROR : ""}
            options={countryOrigins}
            rules={{
              required: {
                value: true,
                message: "field is required!",
              },
            }}
            disableBorderRight
            control={control}
            errors={errors}
            showErrorMessage={false}
            clearable
            isRequired
          />
        </div>
        <div className="px-[30px]">
          <FieldTitle classOverrides="mb-[5px]">Tax ID</FieldTitle>
          <Input
            name="addresseeTaxId"
            type="text"
            classOverrides="!bg-[#ff000000]"
            placeholder="Your company tax ID"
            register={register("addresseeTaxId", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.addresseeTaxId)}
            errors={errors}
            showErrorMessage={false}
          />
        </div>
        <div className="px-[30px] pb-[30px]">
          <div className="flex justify-between">
            <div className="flex flex-col">
              <FieldTitle classOverrides="mb-[5px]">Invite participants by email</FieldTitle>
              <p className="mb-[4px] text-[11px] leading-[1.1em] tracking-normal text-[#00000099]">
                Assigned coworkers will all have to confirm this agreement.
                <br /> They will be also authorized to manage the milestones.
              </p>
            </div>
            <p className="tracking-0 text-[12px] leading-[1.2em] text-tm-green opacity-70">Optional</p>
          </div>
          <CreatableInput
            id="addresseeParticipants"
            inputHeight="auto"
            state={errors.addresseeParticipants ? ValidationStates.ERROR : ""}
            placeHolder="Enter e-mail addresses"
            rules={{
              required: false,
            }}
            control={control}
          />
        </div>
        <div className="border-t border-t-tm-black-20 py-[20px]">
          <div className="px-[30px]">
            <Button loading={loading} disabled={loading}>
              <p className="text-[14px] font-bold leading-[1.2em]">Save and continue</p>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CompanyInfoModalContent;
