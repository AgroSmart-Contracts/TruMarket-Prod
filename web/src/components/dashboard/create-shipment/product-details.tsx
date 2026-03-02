import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Input from "src/components/common/input";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { selectShipmentAgreementState, setShipmentAgreementState } from "src/store/createShipmentAgreementSlice";
import SelectDropDown from "src/components/common/select";
import { productQualityOptions } from "src/lib/static";
import { ValidationStates } from "src/interfaces/global";
import { IProductDetailsForm } from "src/interfaces/shipment";
import FieldTitle from "src/components/common/input/field-title";

import ExtendedNextButton from "./extended-next-button";

interface ProductDetailsProps {
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndex: number;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ setSelectedIndex, selectedIndex }) => {
  const dispatch = useAppDispatch();
  const shipmentFormData = useAppSelector(selectShipmentAgreementState);
  const {
    handleSubmit,
    register,
    control,
    getValues,
    formState: { errors },
  } = useForm<IProductDetailsForm>({
    defaultValues: {
      name: shipmentFormData.name,
      variety: shipmentFormData.variety,
      quality: shipmentFormData.quality,
      presentation: shipmentFormData.presentation,
    },
  });

  const handleNextStep = async (data: IProductDetailsForm) => {
    Object.keys(data).map((key) => {
      dispatch(
        setShipmentAgreementState({
          field: key,
          value: data[key as keyof IProductDetailsForm],
        }),
      );
    });
    setSelectedIndex((prev) => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit(handleNextStep)}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[5px]">
          <FieldTitle>Name the Product</FieldTitle>
          <Input
            name="name"
            type="text"
            classOverrides="!bg-[#ff000000]"
            placeholder="Please provide product name"
            register={register("name", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.name)}
            errors={errors}
          />
        </div>
        <div className="flex flex-col gap-[5px]">
          <FieldTitle>Describe the variety</FieldTitle>
          <Input
            name="variety"
            type="text"
            classOverrides="!bg-[#ff000000]"
            placeholder="Please describe the variety"
            register={register("variety", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.variety)}
            errors={errors}
          />
        </div>
        <div className="flex flex-col gap-[5px]">
          <FieldTitle>Select the Quality</FieldTitle>
          <SelectDropDown
            id="quality"
            placeHolder="Select quality"
            state={errors.quality ? ValidationStates.ERROR : ""}
            // value={inputDefaultValues.job_category?.value}
            options={productQualityOptions}
            rules={{
              required: {
                value: true,
                message: "field is required!",
              },
            }}
            control={control}
            errors={errors}
            clearable
            isRequired
          />
        </div>
        <div className="flex flex-col gap-[5px]">
          <FieldTitle>Describe the presentation</FieldTitle>
          <Input
            name="presentation"
            type="text"
            classOverrides="!bg-[#ff000000]"
            placeholder="For example: 3kg boxes"
            register={register("presentation", {
              required: "field is required!",
            })}
            hasError={Boolean(errors.presentation)}
            errors={errors}
          />
        </div>
      </div>
      <div className="mt-[30px] w-full">
        <ExtendedNextButton classnames="!w-full" />
      </div>
    </form>
  );
};

export default ProductDetails;
