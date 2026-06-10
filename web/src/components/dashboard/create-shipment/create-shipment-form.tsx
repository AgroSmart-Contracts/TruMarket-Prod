import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import Button, { ButtonVariants } from "src/components/common/button";
import CancelBackButton from "src/components/common/cancel-back-button";
import Input from "src/components/common/input";
import FieldTitle from "src/components/common/input/field-title";
import CreatableInput from "src/components/common/select/creatable";
import SelectDropDown from "src/components/common/select";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { ValidationStates } from "src/interfaces/global";
import { ICreateShipmentParams } from "src/interfaces/shipment";
import {
  mergeSuggestionsIntoCreatePayload,
  type DealFieldSuggestions,
} from "src/lib/deal-document-analysis/apply-suggestions";
import { CurrencyFormatter, normalizeCreatableSelectOptions, normalizeField } from "src/lib/helpers";
import { countryOrigins } from "src/lib/static";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import {
  resetShipmentAgreementState,
  selectShipmentAgreementState,
  setShipmentAgreementState,
} from "src/store/createShipmentAgreementSlice";

import UploadDealDocuments, { type PendingDealDocument } from "./upload-deal-documents";
import ShipmentSummarySidebar from "./shipment-summary-sidebar";

type SelectOption = { label: string; value: string };

export interface CreateShipmentFormValues {
  name: string;
  quantity: string;
  offerUnitPrice: string;
  origin: SelectOption | null;
  destination: SelectOption | null;
  addresseeParticipants: SelectOption[];
}

interface CreateShipmentFormProps {
  isBuyer: boolean;
  pendingDocuments: PendingDealDocument[];
  setPendingDocuments: React.Dispatch<React.SetStateAction<PendingDealDocument[]>>;
}

function parseWizardDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  return new Date(value);
}

function optionLabel(option: SelectOption | string | null | undefined): string {
  if (!option) return "";
  if (typeof option === "string") return option;
  return option.label || option.value || "";
}

const fieldClass = "flex flex-col gap-[5px]";

const CreateShipmentForm: React.FC<CreateShipmentFormProps> = ({
  isBuyer,
  pendingDocuments,
  setPendingDocuments,
}) => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userInfo } = useUserInfo();
  const shipmentFormData = useAppSelector(selectShipmentAgreementState);
  const [loading, setLoading] = useState(false);
  const [analyzingDocuments, setAnalyzingDocuments] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateShipmentFormValues>({
    defaultValues: {
      name: shipmentFormData.name ?? "",
      quantity: shipmentFormData.quantity ?? "",
      offerUnitPrice: shipmentFormData.offerUnitPrice ?? "",
      origin: (shipmentFormData.origin as unknown as SelectOption) ?? null,
      destination: (shipmentFormData.destination as unknown as SelectOption) ?? null,
      addresseeParticipants: normalizeCreatableSelectOptions(
        shipmentFormData.addresseeParticipants,
      ),
    },
  });

  const watched = watch();

  useEffect(() => {
    if (!shipmentFormData.documentSuggestions) return;

    const fields: (keyof CreateShipmentFormValues)[] = [
      "name",
      "quantity",
      "offerUnitPrice",
      "origin",
      "destination",
    ];
    for (const field of fields) {
      const value = shipmentFormData[field];
      if (value != null && value !== "") {
        setValue(field, value as CreateShipmentFormValues[typeof field]);
      }
    }
    if (shipmentFormData.addresseeParticipants) {
      setValue(
        "addresseeParticipants",
        normalizeCreatableSelectOptions(shipmentFormData.addresseeParticipants),
      );
    }
  }, [shipmentFormData.documentSuggestions, setValue, shipmentFormData]);

  const syncFieldToRedux = (field: string, value: unknown) => {
    dispatch(setShipmentAgreementState({ field, value }));
  };

  useEffect(() => {
    syncFieldToRedux("origin", watched.origin);
    syncFieldToRedux("destination", watched.destination);
    syncFieldToRedux("addresseeParticipants", watched.addresseeParticipants);
  }, [watched.origin, watched.destination, watched.addresseeParticipants]);

  const onSubmit = async (data: CreateShipmentFormValues) => {
    const milestones = shipmentFormData.milestones as unknown as
      | { description: string; fundsDistribution: number }[]
      | undefined;

    const normalizedData: ICreateShipmentParams = {
      name: data.name,
      description: shipmentFormData.description ?? "",
      offerUnitPrice: data.offerUnitPrice,
      quantity: data.quantity,
      ...(shipmentFormData.variety ? { variety: shipmentFormData.variety } : {}),
      ...(shipmentFormData.presentation ? { presentation: shipmentFormData.presentation } : {}),
      ...(shipmentFormData.quality
        ? {
          quality: normalizeField(
            shipmentFormData.quality as unknown as { label: string; value: string },
          ),
        }
        : {}),
      origin: normalizeField(data.origin as { label: string; value: string }),
      destination: normalizeField(data.destination as { label: string; value: string }),
      ...(shipmentFormData.transport ? { transport: shipmentFormData.transport } : {}),
      ...(shipmentFormData.port_origin ? { portOfOrigin: shipmentFormData.port_origin } : {}),
      ...(shipmentFormData.port_destination
        ? { portOfDestination: shipmentFormData.port_destination }
        : {}),
      ...(milestones?.length ? { milestones } : {}),
      ...(shipmentFormData.shippingStartDate
        ? { shippingStartDate: parseWizardDate(shipmentFormData.shippingStartDate) }
        : {}),
      ...(shipmentFormData.expectedShippingEndDate
        ? {
          expectedShippingEndDate: parseWizardDate(
            shipmentFormData.expectedShippingEndDate,
          ),
        }
        : {}),
      ...(shipmentFormData.investmentAmount != null && shipmentFormData.investmentAmount !== ""
        ? { investmentAmount: Number(shipmentFormData.investmentAmount) }
        : {}),
      contractId: 0,
      roi: 0,
      netBalance: 0,
      revenue: 0,
      nftID: 0,
    };

    const sideParticipants = (
      (shipmentFormData.participants as unknown as { value: string }[]) ?? []
    ).map((participants) => participants.value);
    const addresseeEmails = data.addresseeParticipants.map((p) => p.value);

    if (isBuyer) {
      normalizedData.suppliersEmails = addresseeEmails;
      normalizedData.buyersEmails = [userInfo?.user?.email, ...sideParticipants].filter(
        Boolean,
      ) as string[];
    } else {
      normalizedData.buyersEmails = addresseeEmails;
      normalizedData.suppliersEmails = [userInfo?.user?.email, ...sideParticipants].filter(
        Boolean,
      ) as string[];
    }

    try {
      setLoading(true);

      let createPayload = normalizedData;
      const storedSuggestions = shipmentFormData.documentSuggestions as
        | DealFieldSuggestions
        | undefined;
      if (storedSuggestions && typeof storedSuggestions === "object") {
        createPayload = mergeSuggestionsIntoCreatePayload(
          normalizedData,
          storedSuggestions,
        );
      }

      const deal = await ShipmentService.createShipment(createPayload);
      toast.success(t("toasts.created"));
      dispatch(resetShipmentAgreementState());
      void router.push("/dashboard");

      if (pendingDocuments.length > 0 && deal?.id) {
        const files = pendingDocuments.map((p) => p.file);
        void ShipmentService.uploadDealCreationDocuments(deal.id, files).catch(() => {
          toast.warn(t("createShipment.documents.uploadAfterCreateWarn"));
        });
      }
    } catch {
      toast.error(t("toasts.createError"));
    } finally {
      setLoading(false);
    }
  };

  const totalValue =
    Number(watched.quantity || 0) * Number(watched.offerUnitPrice || 0);

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-6">
      <div className="tm-card min-w-0 flex-1 !p-5 sm:!p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className={fieldClass}>
            <FieldTitle>{t("createShipment.fields.productName")}</FieldTitle>
            <Input
              name="name"
              type="text"
              placeholder={t("createShipment.fields.productNamePlaceholder")}
              register={register("name", {
                required: t("createShipment.validation.required"),
                onChange: (e) => syncFieldToRedux("name", e.target.value),
              })}
              hasError={Boolean(errors.name)}
              errors={errors}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className={fieldClass}>
              <FieldTitle>
                {isBuyer
                  ? t("createShipment.fields.quantityBuy")
                  : t("createShipment.fields.quantitySell")}
              </FieldTitle>
              <Input
                name="quantity"
                type="number"
                step="0.01"
                placeholder={
                  isBuyer
                    ? t("createShipment.fields.quantityPlaceholderBuy")
                    : t("createShipment.fields.quantityPlaceholderSell")
                }
                register={register("quantity", {
                  required: t("createShipment.validation.required"),
                  onChange: (e) => syncFieldToRedux("quantity", e.target.value),
                })}
                hasError={Boolean(errors.quantity)}
                errors={errors}
              />
            </div>

            <div className={fieldClass}>
              <FieldTitle>{t("createShipment.fields.pricePerUnit")}</FieldTitle>
              <Input
                name="offerUnitPrice"
                type="number"
                step="0.01"
                placeHolderRight="USD"
                placeholder={t("createShipment.fields.pricePerUnitPlaceholder")}
                register={register("offerUnitPrice", {
                  required: t("createShipment.validation.required"),
                  onChange: (e) => syncFieldToRedux("offerUnitPrice", e.target.value),
                })}
                hasError={Boolean(errors.offerUnitPrice)}
                errors={errors}
              />
            </div>

            <div className={fieldClass}>
              <FieldTitle>{t("createShipment.fields.totalAgreementValue")}</FieldTitle>
              <div
                className={`flex h-[40px] items-center rounded-md border px-3 text-sm font-semibold ${totalValue > 0
                    ? "border-tm-green/30 bg-tm-green/5 text-tm-green"
                    : "border-[#E2E8F0] bg-[#F8FAFC] text-tm-black-80"
                  }`}
              >
                {totalValue > 0 ? CurrencyFormatter(totalValue) : "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className={fieldClass}>
              <FieldTitle>{t("createShipment.fields.countryOrigin")}</FieldTitle>
              <SelectDropDown
                id="origin"
                placeHolder={t("createShipment.fields.countryPlaceholder")}
                state={errors.origin ? ValidationStates.ERROR : ""}
                inputHeight="40px"
                options={countryOrigins}
                rules={{
                  required: {
                    value: true,
                    message: t("createShipment.validation.required"),
                  },
                }}
                control={control}
                errors={errors}
                clearable
                isRequired
              />
            </div>

            <div className={fieldClass}>
              <FieldTitle>{t("createShipment.fields.countryDestination")}</FieldTitle>
              <SelectDropDown
                id="destination"
                placeHolder={t("createShipment.fields.countryPlaceholder")}
                state={errors.destination ? ValidationStates.ERROR : ""}
                inputHeight="40px"
                options={countryOrigins}
                rules={{
                  required: {
                    value: true,
                    message: t("createShipment.validation.required"),
                  },
                }}
                control={control}
                errors={errors}
                clearable
                isRequired
              />
            </div>
          </div>

          <div className={fieldClass}>
            <FieldTitle>{t("createShipment.fields.emailAddresses")}</FieldTitle>
            <CreatableInput
              id="addresseeParticipants"
              inputHeight="40px"
              state={errors.addresseeParticipants ? ValidationStates.ERROR : ""}
              placeHolder={
                isBuyer
                  ? t("createShipment.fields.emailPlaceholderSupplier")
                  : t("createShipment.fields.emailPlaceholderBuyer")
              }
              rules={{
                required: true,
                message: t("createShipment.validation.required"),
              }}
              errors={errors}
              control={control}
              isRequired
            />
          </div>

          <div className={fieldClass}>
            <FieldTitle>{t("createShipment.sections.documents")}</FieldTitle>
            <UploadDealDocuments
              compact
              pendingDocuments={pendingDocuments}
              setPendingDocuments={setPendingDocuments}
              onAnalyzingChange={setAnalyzingDocuments}
            />
          </div>

          <div className="mt-1 flex flex-col-reverse gap-3 border-t border-[#E5E7EB] pt-4 sm:flex-row sm:items-center sm:justify-end">
            <CancelBackButton
              type="button"
              classOverrides="!w-full sm:!w-auto"
              onClick={() => router.push("/dashboard")}
              disabled={loading || analyzingDocuments}
            >
              {t("createShipment.cancel")}
            </CancelBackButton>
            <Button
              type="submit"
              variant={ButtonVariants.FILLED_GREEN}
              classOverrides="!h-[40px] !min-h-[40px] !w-full sm:!min-w-[200px]"
              loading={loading}
              disabled={loading || analyzingDocuments}
            >
              {t("createShipment.confirmAgreement")}
            </Button>
          </div>
        </form>
      </div>

      <div className="w-full shrink-0 lg:w-[280px] xl:w-[300px]">
        <ShipmentSummarySidebar
          name={watched.name}
          quantity={watched.quantity}
          offerUnitPrice={watched.offerUnitPrice}
          originLabel={optionLabel(watched.origin)}
          destinationLabel={optionLabel(watched.destination)}
          addresseeParticipants={watched.addresseeParticipants ?? []}
          documentCount={pendingDocuments.length}
          isBuyer={isBuyer}
        />
      </div>
    </div>
  );
};

export default CreateShipmentForm;
