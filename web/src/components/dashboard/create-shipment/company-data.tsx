import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { AuthService } from "src/controller/AuthAPI.service";
import Button from "src/components/common/button";
import CreatableInput from "src/components/common/select/creatable";
import DateTimePicker from "src/components/common/date-time-picker";
import FieldTitle from "src/components/common/input/field-title";
import Input from "src/components/common/input";
import SelectDropDown from "src/components/common/select";
import { ICompanyInfo, ValidationStates } from "src/interfaces/global";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { countryOrigins } from "src/lib/static";
import { selectShipmentAgreementState, setShipmentAgreementState } from "src/store/createShipmentAgreementSlice";

import ExtendedNextButton from "./extended-next-button";

interface CompanyDataProps {
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndex: number;
}

const CompanyData: React.FC<CompanyDataProps> = ({ setSelectedIndex, selectedIndex }) => {
  const dispatch = useAppDispatch();
  const shipmentFormData = useAppSelector(selectShipmentAgreementState);
  const {
    handleSubmit,
    register,
    control,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ICompanyInfo>({
    defaultValues: {
      companyName: shipmentFormData.companyName,
      taxId: shipmentFormData.taxId,
      country: shipmentFormData.country,
      participants: shipmentFormData?.participants,
    },
  });

  useEffect(() => {
    const values = getValues();
    if (values.companyName || values.taxId || values.country || values.participants.length) {
      return;
    }

    AuthService.getUserProfileInfo().then((user) => {
      if (!user.company) return;
      setValue("companyName", user.company.name);
      setValue("taxId", user.company.taxId);

      const country = user.company
        ? countryOrigins.find((country) => user.company && country.value === user.company.country)
        : undefined;

      if (country) {
        setValue("country", country);
      }
    });
  }, []);

  const handleNextStep = async (data: any) => {
    Object.keys(data).map((key) => {
      dispatch(
        setShipmentAgreementState({
          field: key,
          value: data[key as keyof ICompanyInfo],
        }),
      );
    });
    setSelectedIndex((prev) => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit(handleNextStep)} className="flex flex-col gap-[12px]">
      <div className="flex flex-col gap-[5px]">
        <FieldTitle>Company name</FieldTitle>
        <Input
          name="companyName"
          type="text"
          classOverrides="!bg-[#ff000000]"
          placeholder="Your company name"
          register={register("companyName", {
            required: "field is required!",
          })}
          hasError={Boolean(errors.companyName)}
          errors={errors}
        />
      </div>
      <div className="flex w-full flex-col gap-[5px]">
        <FieldTitle>Country</FieldTitle>

        <SelectDropDown
          id="country"
          placeHolder="Country"
          state={errors.country ? ValidationStates.ERROR : ""}
          inputHeight="40px"
          // value={inputDefaultValues.job_category?.value}
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
          clearable
          isRequired
        />
      </div>
      <div className="flex flex-col gap-[5px]">
        <FieldTitle>Tax ID</FieldTitle>
        <Input
          name="taxId"
          type="text"
          classOverrides="!bg-[#ff000000]"
          placeholder="Your company tax ID"
          register={register("taxId", {
            required: "field is required!",
          })}
          hasError={Boolean(errors.taxId)}
          errors={errors}
        />
      </div>
      <div>
        <div className="flex justify-between">
          <FieldTitle classOverrides="mb-[5px]">Invite participants by email</FieldTitle>
          <p className="tracking-0 text-[12px] leading-[1.2em] text-tm-green opacity-70">Optional</p>
        </div>
        <CreatableInput
          id="participants"
          inputHeight="auto"
          state={errors.participants ? ValidationStates.ERROR : ""}
          placeHolder="Coworker email that you want invite in this agreement"
          rules={{
            required: false,
          }}
          control={control}
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

export default CompanyData;
