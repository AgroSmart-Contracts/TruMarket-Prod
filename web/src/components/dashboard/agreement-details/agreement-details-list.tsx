import React, { useEffect } from "react";
import { FieldErrors, UseFormHandleSubmit, UseFormRegister, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { CurrencyFormatter, calculateTranchPercentageSum } from "src/lib/helpers";
import { formatTransportLabel } from "src/lib/format-transport-label";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { countryOrigins } from "src/lib/static";

import AgreementDetailsListItem from "./agreement-detail-list-item";
import AgreementDetailSection from "./agreement-detail-section";
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
  const { t } = useTranslation("shipment");
  const { accountType } = useUserInfo();

  const trancheTitle = (key: string) => {
    const stepKey = `milestoneSteps.${key}`;
    const translated = t(stepKey);
    return translated !== stepKey ? `${translated}:` : key;
  };

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
    <form
      className={viewOnly ? "pb-1" : "relative pb-8 pt-4"}
      onSubmit={handleSubmit?.((data) => handleSubmitAgreementDetailsForm?.(data))}
    >
      <AgreementDetailSection title={t("agreementPreview.sections.product")} showDivider={false}>
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.product")}
            inputName="name"
            register={register}
            defaultValue={comparativeData.name}
            isValueChanged={isValueChanged("name")}
            errors={errors}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.variety")}
            inputName="variety"
            register={register}
            errors={errors}
            defaultValue={comparativeData.variety}
            isValueChanged={isValueChanged("variety")}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.quality")}
            inputName="quality"
            register={register}
            errors={errors}
            defaultValue={comparativeData.quality}
            isValueChanged={isValueChanged("quality")}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.presentation")}
            inputName="presentation"
            register={register}
            errors={errors}
            defaultValue={comparativeData.presentation}
            isValueChanged={isValueChanged("presentation")}
            editable={!viewOnly}
            required
          />
      </AgreementDetailSection>

      <AgreementDetailSection title={t("agreementPreview.sections.payment")}>
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.amount")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.price")}
            inputName="offerUnitPrice"
            register={register}
            errors={errors}
            defaultValue={comparativeData.offerUnitPrice}
            isValueChanged={isValueChanged("offerUnitPrice")}
            editable={!viewOnly}
            required
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.investmentAmount")}
            inputName="investmentAmount"
            defaultValue={CurrencyFormatter(comparativeData.investmentAmount)}
            isValueChanged={isValueChanged("investmentAmount")}
            editable={false}
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.totalValue")}
            inputName="totalValue"
            defaultValue={CurrencyFormatter(comparativeData.totalValue)}
            isValueChanged={isValueChanged("totalValue")}
            editable={false}
          />
      </AgreementDetailSection>

      <AgreementDetailSection title={t("agreementPreview.sections.tranches")}>
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("production_and_fields")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("packaging_and_process")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("finished_product_and_storage")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("transport_to_port_of_origin")}
            inputName="transport_to_port_of_origin"
            defaultValue={comparativeData.transport_to_port_of_origin}
            isValueChanged={isValueChanged("transport_to_port_of_origin")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("port_of_origin")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("transit")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={trancheTitle("port_of_destination")}
            inputName="port_of_destination"
            defaultValue={comparativeData.port_of_destination}
            isValueChanged={isValueChanged("port_of_destination")}
            register={register}
            errors={errors}
            editable={!viewOnly}
            showPercentage
            required
          />
          {!viewOnly && (paymentTranchPercentage < 100 || paymentTranchPercentage > 100) ? (
            <p className="py-2 text-[13px] text-tm-danger">{t("agreementPreview.trancheSumError")}</p>
          ) : null}
      </AgreementDetailSection>

      <AgreementDetailSection title={t("agreementPreview.sections.routeTimeline")}>
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.modeOfTransport")}
            inputName="transport"
            defaultValue={
              viewOnly
                ? formatTransportLabel(comparativeData.transport, t)
                : comparativeData.transport
            }
            isValueChanged={isValueChanged("transport")}
            isSelectBox={!viewOnly}
            editable={!viewOnly}
            selectBoxOptions={[
              { label: t("agreementPreview.transport.sea_freight"), value: "sea_freight" },
              { label: t("agreementPreview.transport.by_air"), value: "by_air" },
            ]}
          />

          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.from")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.to")}
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
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.date")}
            inputName="shippingStartDate"
            inputType="date"
            register={register}
            errors={errors}
            defaultValue={comparativeData.shippingStartDate}
            isValueChanged={isValueChanged("shippingStartDate")}
            editable={!viewOnly}
            required
          />
      </AgreementDetailSection>

      <AgreementDetailSection
        title={
          accountType === AccountTypeEnum.BUYER
            ? t("agreementPreview.sections.supplierData")
            : t("agreementPreview.sections.buyerData")
        }
      >
          <AgreementDetailsListItem
            readOnly={viewOnly}
            title={t("agreementPreview.fields.company")}
            handleChange={handleChange}
            inputName="addresseeCompanyName"
            defaultValue={comparativeData?.addresseeCompanyName}
            isValueChanged={isValueChanged("addresseeCompanyName")}
            register={register}
            errors={errors}
            required={false}
            editable={!viewOnly}
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.country")}
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
            readOnly={viewOnly}
            title={t("agreementPreview.fields.taxId")}
            handleChange={handleChange}
            inputName="addresseeTaxId"
            defaultValue={comparativeData?.addresseeTaxId}
            isValueChanged={isValueChanged("addresseeTaxId")}
            register={register}
            errors={errors}
            required={false}
            editable={!viewOnly}
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            title={t("agreementPreview.fields.participants")}
            handleChange={handleChange}
            inputName="addresseeParticipants"
            defaultValue={comparativeData?.addresseeParticipants}
            isValueChanged={isValueChanged("addresseeParticipants")}
            register={register}
            errors={errors}
            required
            editable={!viewOnly}
          />
      </AgreementDetailSection>

      <AgreementDetailSection title={t("agreementPreview.sections.yourData")}>
          <AgreementDetailsListItem
            readOnly={viewOnly}
            title={t("agreementPreview.fields.company")}
            handleChange={handleChange}
            inputName="companyName"
            defaultValue={comparativeData?.companyName}
            isValueChanged={isValueChanged("companyName")}
            register={register}
            errors={errors}
            required
            editable={!viewOnly}
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.country")}
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
            readOnly={viewOnly}
            title={t("agreementPreview.fields.taxId")}
            handleChange={handleChange}
            inputName="taxId"
            defaultValue={comparativeData?.taxId}
            isValueChanged={isValueChanged("taxId")}
            register={register}
            errors={errors}
            required
            editable={!viewOnly}
          />
          <AgreementDetailsListItem
            readOnly={viewOnly}
            title={t("agreementPreview.fields.participants")}
            handleChange={handleChange}
            inputName="participants"
            defaultValue={comparativeData?.participants}
            isValueChanged={isValueChanged("participants")}
            register={register}
            errors={errors}
            required
            editable={!viewOnly}
          />
      </AgreementDetailSection>

      <AgreementDetailSection title={t("agreementPreview.sections.additionalInfo")}>
          <AgreementDetailsListItem
            readOnly={viewOnly}
            handleChange={handleChange}
            title={t("agreementPreview.fields.description", { defaultValue: "Description" })}
            register={register}
            errors={errors}
            inputName="description"
            defaultValue={comparativeData.description}
            isValueChanged={isValueChanged("description")}
            editable={!viewOnly}
          />
      </AgreementDetailSection>
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
