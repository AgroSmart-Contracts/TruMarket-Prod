import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import FlightIcon from "@mui/icons-material/Flight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DirectionsBoatOutlinedIcon from "@mui/icons-material/DirectionsBoatOutlined";
import { Boat, AirplaneTilt } from "@phosphor-icons/react";

import DateTimePicker from "src/components/common/date-time-picker";
import Input from "src/components/common/input";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { selectShipmentAgreementState, setShipmentAgreementState } from "src/store/createShipmentAgreementSlice";
import SelectDropDown from "src/components/common/select";
import { ValidationStates } from "src/interfaces/global";
import { countryOrigins } from "src/lib/static";
import RadioGroup from "src/components/common/radio-group";
import Button from "src/components/common/button";
import { IOriginAndDestination } from "src/interfaces/shipment";
import FieldTitle from "src/components/common/input/field-title";

import ExtendedNextButton from "./extended-next-button";

interface OriginAndDestinationProps {
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndex: number;
}

const OriginAndDestination: React.FC<OriginAndDestinationProps> = ({ setSelectedIndex, selectedIndex }) => {
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
  } = useForm<IOriginAndDestination>({
    defaultValues: {
      transport: shipmentFormData.transport ?? "sea_fright",
      origin: shipmentFormData.origin,
      destination: shipmentFormData.destination,
      port_origin: shipmentFormData.port_origin,
      shippingStartDate: shipmentFormData.shippingStartDate,
      expectedShippingEndDate: shipmentFormData.expectedShippingEndDate,
      port_destination: shipmentFormData.port_destination,
    },
  });

  const handleNextStep = async (data: IOriginAndDestination) => {
    Object.keys(data).map((key) => {
      dispatch(
        setShipmentAgreementState({
          field: key,
          value: data[key as keyof IOriginAndDestination],
        }),
      );
    });

    setSelectedIndex((prev) => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit(handleNextStep)} className="flex flex-col gap-[12px] px-0">
      <div className="flex flex-col gap-[5px]">
        <FieldTitle>What mode of transport are you using?</FieldTitle>
        <div className="flex items-center gap-[10px]">
          <div className="flex w-1/2 flex-col gap-[5px]">
            <RadioGroup
              title="Sea freight"
              value="sea_fright"
              registeredField="transport"
              register={register("transport", {
                required: "field is required!",
              })}
              icon={<Boat size={25} weight="duotone" />}
              error={errors.transport}
              setValue={setValue}
              selectedValue={watch("transport")}
            />
          </div>
          <div className="w-1/2">
            <RadioGroup
              title="By air"
              value="by_air"
              registeredField="transport"
              register={register("transport", {
                required: "field is required!",
              })}
              icon={
                <div>
                  <AirplaneTilt size={25} weight="duotone" />
                </div>
              }
              error={errors.transport}
              setValue={setValue}
              selectedValue={watch("transport")}
            />
          </div>
        </div>
      </div>
      <div className="flex items-start">
        <div className="flex w-1/2 flex-col gap-[5px]">
          <FieldTitle>Name the Port of Origin</FieldTitle>
          <SelectDropDown
            id="origin"
            placeHolder="Country"
            state={errors.origin ? ValidationStates.ERROR : ""}
            inputHeight="40px"
            // value={inputDefaultValues.job_category?.value}
            options={countryOrigins}
            rules={{
              required: {
                value: true,
                message: "Field is required!",
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
        <div className="flex w-1/2 flex-col gap-[5px]">
          <FieldTitle classOverrides="opacity-0 pointer-events-none">Port</FieldTitle>
          <Input
            name="port_origin"
            type="text"
            placeholder="Port"
            classOverrides="!bg-[#ff000000] h-[40px] !border-l-0 !rounded-tl-none !rounded-bl-none"
            register={register("port_origin", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.port_origin)}
            errors={errors}
          />
        </div>
      </div>

      <div className="flex items-start">
        <div className="flex w-1/2 flex-col gap-[5px]">
          <FieldTitle>Name the Port of Destination</FieldTitle>
          <SelectDropDown
            id="destination"
            placeHolder="Country"
            state={errors.destination ? ValidationStates.ERROR : ""}
            inputHeight="40px"
            // value={inputDefaultValues.job_category?.value}
            options={countryOrigins}
            disableBorderRight
            showErrorMessage={false}
            rules={{
              required: {
                value: true,
                message: "Field is required!",
              },
            }}
            control={control}
            errors={errors}
            clearable
            isRequired
          />
        </div>
        <div className="flex w-1/2 flex-col gap-[5px]">
          <FieldTitle classOverrides="opacity-0 pointer-events-none">Port</FieldTitle>
          <Input
            name="port_destination"
            type="text"
            placeholder="Port"
            classOverrides="!bg-[#ff000000] h-[40px] !border-l-0 !rounded-tl-none !rounded-bl-none"
            register={register("port_destination", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.port_destination)}
            errors={errors}
          />
        </div>
      </div>
      <div className="flex flex-col gap-[5px]">
        <FieldTitle>What is the expected departure date?</FieldTitle>
        <DateTimePicker
          name="shippingStartDate"
          classOverrides="!bg-[#ff000000]"
          register={register("shippingStartDate", {
            required: "field is required!",
          })}
          hasError={Boolean(errors.shippingStartDate)}
          errors={errors}
        />
      </div>
      <div className="flex flex-col gap-[5px]">
        <FieldTitle>What is the expected arrival date?</FieldTitle>
        <DateTimePicker
          name="expectedShippingEndDate"
          classOverrides="!bg-[#ff000000]"
          register={register("expectedShippingEndDate", {
            required: "field is required!",
          })}
          hasError={Boolean(errors.expectedShippingEndDate)}
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

export default OriginAndDestination;
