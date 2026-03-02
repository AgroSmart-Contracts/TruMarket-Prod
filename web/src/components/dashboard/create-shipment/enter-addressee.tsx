import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import Input from "src/components/common/input";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { selectShipmentAgreementState, setShipmentAgreementState } from "src/store/createShipmentAgreementSlice";
import { AccountTypeEnum, ValidationStates } from "src/interfaces/global";
import Button from "src/components/common/button";
import FieldTitle from "src/components/common/input/field-title";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import SelectDropDown from "src/components/common/select";
import { countryOrigins } from "src/lib/static";
import CreatableInput from "src/components/common/select/creatable";

import ExtendedNextButton from "./extended-next-button";

interface EnterAddresseeProps {
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  accountType: AccountTypeEnum;
  selectedIndex: number;
}

interface AddresseeCompanyInfo {
  addresseeCompanyName: string;
  addresseeCountry: string;
  addresseeTaxId: string;
  addresseeParticipants: string;
}

const EnterAddressee: React.FC<EnterAddresseeProps> = ({ setSelectedIndex, accountType, selectedIndex }) => {
  const dispatch = useAppDispatch();
  const shipmentFormData = useAppSelector(selectShipmentAgreementState);
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
  } = useForm<AddresseeCompanyInfo>({
    defaultValues: {
      addresseeCompanyName: shipmentFormData.addresseeCompanyName,
      addresseeCountry: shipmentFormData.addresseeCountry,
      addresseeTaxId: shipmentFormData.addresseeTaxId,
      addresseeParticipants: shipmentFormData.addresseeParticipants,
    },
  });

  const handleNextStep = async (data: AddresseeCompanyInfo) => {
    Object.keys(data).map((key) => {
      dispatch(
        setShipmentAgreementState({
          field: key,
          value: data[key as keyof AddresseeCompanyInfo],
        }),
      );
    });

    setSelectedIndex((prev) => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit(handleNextStep)} className="flex flex-col gap-[12px]">
      <div className="flex flex-col gap-[5px]">
        <FieldTitle>E-mail address(es)</FieldTitle>
        <CreatableInput
          id="addresseeParticipants"
          inputHeight="auto"
          state={errors.addresseeParticipants ? ValidationStates.ERROR : ""}
          placeHolder={`Your ${isBuyer ? "Supplier's" : "Buyer's"} email address(es)`}
          rules={{
            required: true,
            message: "field is required!",
          }}
          errors={errors}
          control={control}
          isRequired
        />
      </div>
      <div>
        <div className="flex justify-between">
          <FieldTitle classOverrides="mb-[5px]">Company name</FieldTitle>
          <p className="tracking-0 text-[12px] leading-[1.2em] text-tm-green opacity-70">Optional</p>
        </div>
        <Input
          name="addresseeCompanyName"
          type="text"
          classOverrides="!bg-[#ff000000]"
          placeholder={`Your ${isBuyer ? "Supplier's" : "Buyer's"} company name`}
          register={register("addresseeCompanyName", {
            required: false,
          })}
          hasError={Boolean(errors.addresseeCompanyName)}
          errors={errors}
        />
      </div>
      <div className="w-full">
        <div className="flex justify-between">
          <FieldTitle classOverrides="mb-[5px]">Country</FieldTitle>
          <p className="tracking-0 text-[12px] leading-[1.2em] text-tm-green opacity-70">Optional</p>
        </div>
        <SelectDropDown
          id="addresseeCountry"
          placeHolder={`The Country where your ${isBuyer ? "Supplier's" : "Buyer's"} company is located`}
          state={errors.addresseeCountry ? ValidationStates.ERROR : ""}
          inputHeight="40px"
          // value={inputDefaultValues.job_category?.value}
          options={countryOrigins}
          rules={{
            required: {
              value: false,
              message: "",
            },
          }}
          disableBorderRight
          control={control}
          errors={errors}
          clearable
          isRequired
        />
      </div>
      <div>
        <div className="flex justify-between">
          <FieldTitle classOverrides="mb-[5px]">Tax ID</FieldTitle>
          <p className="tracking-0 text-[12px] leading-[1.2em] text-tm-green opacity-70">Optional</p>
        </div>
        <Input
          name="addresseeTaxId"
          type="text"
          classOverrides="!bg-[#ff000000]"
          placeholder={`Your ${isBuyer ? "Supplier's" : "Buyer's"} company tax ID`}
          register={register("addresseeTaxId", {
            required: false,
          })}
          hasError={Boolean(errors.addresseeTaxId)}
          errors={errors}
        />
      </div>
      <div className="mt-[30px] flex gap-[10px] items-center">
        <div className="!w-auto">
          <Button
            onClick={() => setSelectedIndex((prev) => prev - 1)}
            classOverrides="!h-[40px] !min-h-[40px] !py-2 sm:!py-2.5"
          >
            <ChevronLeftIcon />
          </Button>
        </div>
        <ExtendedNextButton />
      </div>
    </form>
  );
};

export default EnterAddressee;
