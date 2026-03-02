import React, { useEffect } from "react";
import { FieldErrors, UseFormHandleSubmit, UseFormRegister, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { CurrencyFormatter, calculateTranchPercentageSum } from "src/lib/helpers";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { countryOrigins } from "src/lib/static";

import AgreementDetailsListItem from "./agreement-detail-list-item";
import AgreementDetailInput from "./agreement-detail-input";
import AgreementDetailListHeader from "./agreement-detail-list-header";
import AgreementDetailChangesAlert from "./agreement-detail-changes-alert";

interface AgreementDetailListProps {
  // !!TODO types
  agreementData: any;
  comparativeData?: any;
  setComparativeData?: any;
  changesCount?: number;
  register?: UseFormRegister<any>;
  errors?: FieldErrors<any>;
  setChangesCount?: React.Dispatch<React.SetStateAction<number>>;
  handleSubmit?: UseFormHandleSubmit<any>;
  handleResetChanges?: () => void;
  handleSubmitAgreementDetailsForm?: (data: any) => void;
  viewOnly?: boolean;
}

const AgreementDetailList: React.FC<AgreementDetailListProps> = ({
  agreementData,
  comparativeData,
  setComparativeData,
  changesCount,
  errors,
  register,
  handleSubmitAgreementDetailsForm,
  setChangesCount,
  handleSubmit,
  handleResetChanges,
  viewOnly = false,
}) => {
  const { accountType } = useUserInfo();

  const paymentTranchPercentage = calculateTranchPercentageSum({
    production_and_fields: comparativeData.production_and_fields,
    packaging_and_process: comparativeData.packaging_and_process,
    finished_product_and_storage: comparativeData.finished_product_and_storage,
    transport_to_port_of_origin: comparativeData.transport_to_port_of_origin,
    port_of_origin: comparativeData.port_of_origin,
    transit: comparativeData.transit,
    port_of_destination: comparativeData.port_of_destination,
  });

  const isValueChanged = (fieldName: string) => {
    return comparativeData[fieldName] !== agreementData[fieldName];
  };

  // Event handler to update form data on input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setComparativeData({
      ...comparativeData,
      [name]: value,
    });
  };

  useEffect(() => {
    let count = 0;
    for (const fieldName in comparativeData) {
      if (isValueChanged(fieldName)) {
        count++;
      }
    }
    if (setChangesCount) {
      setChangesCount(count);
    }
  }, [comparativeData]);

  return (
    <form className="relative py-[26px]" onSubmit={handleSubmit?.((data) => handleSubmitAgreementDetailsForm?.(data))}>
      <div className="px-[30px] ">
        <AgreementDetailListHeader text="Product:" />
        <div className="flex flex-col  pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Product:"
            inputName="name"
            register={register}
            defaultValue={comparativeData.name}
            isValueChanged={isValueChanged("name")}
            errors={errors}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Variety:"
            inputName="variety"
            register={register}
            errors={errors}
            defaultValue={comparativeData.variety}
            isValueChanged={isValueChanged("variety")}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Quality:"
            inputName="quality"
            register={register}
            errors={errors}
            defaultValue={comparativeData.quality}
            isValueChanged={isValueChanged("quality")}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Presentation:"
            inputName="presentation"
            register={register}
            errors={errors}
            defaultValue={comparativeData.presentation}
            isValueChanged={isValueChanged("presentation")}
            editable={!viewOnly}
            required
          />
        </div>
      </div>
      <div className="my-[30px] h-[1px] w-full bg-tm-gray-light"></div>
      <div className="px-[30px]">
        <AgreementDetailListHeader text="Payment:" />
        <div className="flex flex-col  pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Amount:"
            inputName="quantity"
            register={register}
            errors={errors}
            defaultValue={comparativeData.quantity}
            isValueChanged={isValueChanged("quantity")}
            editable={!viewOnly}
            inputType="number"
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Price:"
            inputName="offerUnitPrice"
            register={register}
            errors={errors}
            defaultValue={comparativeData.offerUnitPrice}
            isValueChanged={isValueChanged("offerUnitPrice")}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Investment Amount:"
            inputName="investmentAmount"
            defaultValue={CurrencyFormatter(comparativeData.investmentAmount)}
            isValueChanged={isValueChanged("investmentAmount")}
            editable={false}
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Total Value:"
            inputName="totalValue"
            defaultValue={CurrencyFormatter(comparativeData.totalValue)}
            isValueChanged={isValueChanged("totalValue")}
            editable={false}
          />
        </div>
      </div>
      <div className="my-[30px] h-[1px] w-full bg-tm-gray-light"></div>
      <div className="px-[30px]">
        <AgreementDetailListHeader text="Tranches:" />
        <div className="flex flex-col  pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Production and fields:"
            inputName="production_and_fields"
            defaultValue={comparativeData.production_and_fields}
            isValueChanged={isValueChanged("production_and_fields")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Packaging and process:"
            inputName="packaging_and_process"
            defaultValue={comparativeData.packaging_and_process}
            isValueChanged={isValueChanged("packaging_and_process")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Finished product and storage:"
            inputName="finished_product_and_storage"
            defaultValue={comparativeData.finished_product_and_storage}
            isValueChanged={isValueChanged("finished_product_and_storage")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Transport to port of origin:"
            inputName="transport_to_port_of_origin"
            defaultValue={comparativeData.transport_to_port_of_origin}
            isValueChanged={isValueChanged("transport_to_port_of_origin")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Port of origin:"
            inputName="port_of_origin"
            defaultValue={comparativeData.port_of_origin}
            isValueChanged={isValueChanged("port_of_origin")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Transit:"
            inputName="transit"
            defaultValue={comparativeData.transit}
            isValueChanged={isValueChanged("transit")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Port of destination:"
            inputName="port_of_destination"
            defaultValue={comparativeData.port_of_destination}
            isValueChanged={isValueChanged("port_of_destination")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          {paymentTranchPercentage < 100 || paymentTranchPercentage > 100 ? (
            <p className="mt-[4px] text-[13px] text-tm-danger">The sum must be 100%</p>
          ) : null}
        </div>
      </div>
      <div className="my-[30px] h-[1px] w-full bg-tm-gray-light"></div>
      <div className="px-[30px]">
        <AgreementDetailListHeader text="Route and Timeline:" />
        <div className="flex flex-col  pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Mode of transport:"
            inputName="transport"
            defaultValue={comparativeData.transport}
            isValueChanged={isValueChanged("transport")}
            isSelectBox
            editable={!viewOnly}
            selectBoxOptions={[
              { label: "Sea freight", value: "sea_freight" },
              { label: "By Air", value: "by_air" },
            ]}
          />

          <AgreementDetailsListItem
            handleChange={handleChange}
            title="From:"
            inputName="origin"
            defaultValue={comparativeData.origin}
            isValueChanged={isValueChanged("origin")}
            isSelectBox
            nestedInput
            editable={!viewOnly}
            nestedInputDefaultValue={comparativeData.portOfOriginCity}
            isNestedInputChanged={isValueChanged("portOfOriginCity")}
            register={register}
            errors={errors}
            required
            nestedInputName="portOfOriginCity"
            selectBoxOptions={countryOrigins}
          />

          <AgreementDetailsListItem
            handleChange={handleChange}
            title="to:"
            inputName="destination"
            defaultValue={comparativeData.destination}
            isValueChanged={isValueChanged("destination")}
            isSelectBox
            nestedInput
            required
            nestedInputDefaultValue={comparativeData.portOfDestinationCity}
            isNestedInputChanged={isValueChanged("portOfDestinationCity")}
            nestedInputName="portOfDestinationCity"
            register={register}
            errors={errors}
            editable={!viewOnly}
            selectBoxOptions={countryOrigins}
          />

          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Date:"
            inputName="shippingStartDate"
            inputType="date"
            register={register}
            errors={errors}
            defaultValue={comparativeData.shippingStartDate}
            isValueChanged={isValueChanged("shippingStartDate")}
            editable={!viewOnly}
            required
          />
        </div>
      </div>
      <div className="my-[30px] h-[1px] w-full bg-tm-gray-light"></div>
      <div className="px-[30px]">
        <AgreementDetailListHeader text={accountType === AccountTypeEnum.BUYER ? "Supplier data" : "Buyer data"} />
        <div className="flex flex-col gap-[10px] pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            title="Company:"
            handleChange={handleChange}
            inputName="addresseeCompanyName"
            defaultValue={comparativeData?.addresseeCompanyName}
            isValueChanged={isValueChanged("addresseeCompanyName")}
            register={register}
            errors={errors}
            required={false}
            editable
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Country:"
            inputName="addresseeCountry"
            defaultValue={comparativeData?.addresseeCountry}
            isValueChanged={isValueChanged("addresseeCountry")}
            isSelectBox
            required={false}
            register={register}
            errors={errors}
            editable={!viewOnly}
            selectBoxOptions={countryOrigins}
          />
          <AgreementDetailsListItem
            title="Tax ID:"
            handleChange={handleChange}
            inputName="addresseeTaxId"
            defaultValue={comparativeData?.addresseeTaxId}
            isValueChanged={isValueChanged("addresseeTaxId")}
            register={register}
            errors={errors}
            required={false}
            editable
          />
          <AgreementDetailsListItem
            title="Participants:"
            handleChange={handleChange}
            inputName="addresseeParticipants"
            defaultValue={comparativeData?.addresseeParticipants}
            isValueChanged={isValueChanged("addresseeParticipants")}
            register={register}
            errors={errors}
            required
            editable
          />
        </div>
      </div>
      <div className="my-[30px] h-[1px] w-full bg-tm-gray-light"></div>
      <div className="px-[30px]">
        <AgreementDetailListHeader text="Your Data" />
        <div className="flex flex-col gap-[10px] pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            title="Company:"
            handleChange={handleChange}
            inputName="companyName"
            defaultValue={comparativeData?.companyName}
            isValueChanged={isValueChanged("companyName")}
            register={register}
            errors={errors}
            required
            editable
          />
          <AgreementDetailsListItem
            handleChange={handleChange}
            title="Country:"
            inputName="country"
            defaultValue={comparativeData?.country}
            isValueChanged={isValueChanged("country")}
            isSelectBox
            required
            register={register}
            errors={errors}
            editable={!viewOnly}
            selectBoxOptions={countryOrigins}
          />
          <AgreementDetailsListItem
            title="Tax ID:"
            handleChange={handleChange}
            inputName="taxId"
            defaultValue={comparativeData?.taxId}
            isValueChanged={isValueChanged("taxId")}
            register={register}
            errors={errors}
            required
            editable
          />
          <AgreementDetailsListItem
            title="Participants:"
            handleChange={handleChange}
            inputName="participants"
            defaultValue={comparativeData?.participants}
            isValueChanged={isValueChanged("participants")}
            register={register}
            errors={errors}
            required
            editable
          />
        </div>
      </div>
      <div className="my-[30px] h-[1px] w-full bg-tm-gray-light"></div>
      <div className="px-[30px]">
        <AgreementDetailListHeader text="Additional Information:" />
        <div className="flex flex-col  pl-[20px] pt-[14px]">
          <AgreementDetailsListItem
            handleChange={handleChange}
            register={register}
            errors={errors}
            inputName="description"
            defaultValue={comparativeData.description}
            isValueChanged={isValueChanged("description")}
            editable={!viewOnly}
          />
        </div>
      </div>
      {changesCount && !viewOnly ? (
        <div className="sticky bottom-[20px] ml-auto mr-[20px] w-[270px]">
          <div>
            <AgreementDetailChangesAlert
              changesCount={changesCount}
              loading={false}
              resetFormAction={handleResetChanges}
            />
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default AgreementDetailList;
