import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button, { ButtonVariants } from "src/components/common/button";
import Input from "src/components/common/input";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { resetShipmentAgreementState, selectShipmentAgreementState, setShipmentAgreementState } from "src/store/createShipmentAgreementSlice";
import { ICreateShipmentParams, ISubmitAgreementForm } from "src/interfaces/shipment";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { normalizeField } from "src/lib/helpers";
import FieldTitle from "src/components/common/input/field-title";

interface SubmitAgreementProps {
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndex: number;
}

const SubmitAgreement: React.FC<SubmitAgreementProps> = ({ setSelectedIndex, selectedIndex }) => {
  const { accountType, userInfo } = useUserInfo();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const shipmentFormData: any = useAppSelector(selectShipmentAgreementState);

  const {
    handleSubmit,
    register,
    control,
    getValues,
    watch,
    formState: { errors },
  } = useForm<ISubmitAgreementForm>({
    defaultValues: {
      description: shipmentFormData.description,
    },
  });

  const router = useRouter();

  //!!TODO refactor
  const handleCreateShipment = async () => {
    const milestones =
      (shipmentFormData.milestones as { description: string; fundsDistribution: number }[]) || [];

    const normalizedData: ICreateShipmentParams = {
      name: shipmentFormData.name,
      variety: shipmentFormData.variety,
      description: shipmentFormData.description,
      shippingStartDate: new Date(shipmentFormData.shippingStartDate),
      offerUnitPrice: shipmentFormData.offerUnitPrice,
      presentation: shipmentFormData.presentation,
      quantity: shipmentFormData.quantity,
      transport: shipmentFormData.transport,
      quality: normalizeField(shipmentFormData.quality),
      origin: normalizeField(shipmentFormData.origin),
      destination: normalizeField(shipmentFormData.destination),
      portOfOrigin: shipmentFormData.port_origin,
      portOfDestination: shipmentFormData.port_destination,
      milestones,
      expectedShippingEndDate: shipmentFormData.expectedShippingEndDate,
      investmentAmountPercentage: shipmentFormData.investmentAmountPercentage,
      investmentAmount:
        +shipmentFormData.offerUnitPrice *
        +shipmentFormData.quantity *
        (+shipmentFormData.investmentAmountPercentage / 100),
      // hardcodedValues
      contractId: 0,
      roi: 0,
      netBalance: 0,
      revenue: 0,
      nftID: 0,
    };

    if (isBuyer) {
      const buyerSideParticipants = shipmentFormData.participants.map((participants: any) => participants.value);
      normalizedData.suppliersEmails = shipmentFormData.addresseeParticipants.map(
        (participants: any) => participants.value,
      );
      normalizedData.buyersEmails = [userInfo?.user?.email, ...buyerSideParticipants];
      normalizedData.buyerCompany = {
        name: shipmentFormData.companyName,
        country: shipmentFormData.country?.value,
        taxId: shipmentFormData.taxId,
      };
      normalizedData.supplierCompany = {
        name: shipmentFormData.addresseeCompanyName,
        country: shipmentFormData.addresseeCountry?.value,
        taxId: shipmentFormData.addresseeTaxId,
      };
    }

    if (!isBuyer) {
      const supplierSideParticipants = shipmentFormData.participants.map((participants: any) => participants.value);
      normalizedData.buyersEmails = shipmentFormData.addresseeParticipants.map(
        (participants: any) => participants.value,
      );
      normalizedData.suppliersEmails = [userInfo?.user?.email, ...supplierSideParticipants];
      normalizedData.buyerCompany = {
        name: shipmentFormData.addresseeCompanyName,
        country: shipmentFormData.addresseeCountry?.value,
        taxId: shipmentFormData.addresseeTaxId,
      };
      normalizedData.supplierCompany = {
        name: shipmentFormData.companyName,
        country: shipmentFormData.country?.value,
        taxId: shipmentFormData.taxId,
      };
    }

    try {
      setLoading(true);
      await ShipmentService.createShipment(normalizedData);
      toast.success("Shipment agreement created successfully!");
      router.push("/dashboard");
      dispatch(resetShipmentAgreementState());
    } catch (err) {
      toast.error("Error during creating shipment agreement!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleCreateShipment)}>
      <div className="flex flex-col gap-[12px]">
        <div className="flex flex-col gap-[5px]">
          <FieldTitle>
            Additional Details <span className="font-light">(optional)</span>
          </FieldTitle>
          <Input
            name="description"
            type="text"
            isTextArea
            classOverrides="!bg-[#ff000000] min-h-[80px]"
            placeholder="Please enter description"
            defaultValue={shipmentFormData.description}
            register={register("description", {
              required: false,
              onChange: (e) => dispatch(setShipmentAgreementState({ field: "description", value: e.target.value })),
            })}
            hasError={Boolean(errors.description)}
            errors={errors}
          />
        </div>
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
        <Button
          loading={loading}
          disabled={loading}
          classOverrides="!h-[40px] !min-h-[40px] !py-2 sm:!py-2.5"
        >
          <p className="text-[14px] font-bold leading-[1.2em] text-tm-white">Confirm agreement</p>
        </Button>
      </div>
    </form>
  );
};

export default SubmitAgreement;
