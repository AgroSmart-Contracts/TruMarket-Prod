import React, { useEffect, useState } from "react";

import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum } from "src/interfaces/global";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import {
  cloneShipmentAgreementState,
  resetShipmentAgreementState,
  setShipmentAgreementState,
} from "src/store/createShipmentAgreementSlice";
import { AuthService } from "src/controller/AuthAPI.service";

import CreateShipmentForm from "./create-shipment-form";
import { type PendingDealDocument } from "./upload-deal-documents";

const CreateShipment: React.FC = () => {
  const [pendingDocuments, setPendingDocuments] = useState<PendingDealDocument[]>([]);
  const [formKey, setFormKey] = useState(0);
  const [ready, setReady] = useState(false);
  const dispatch = useAppDispatch();
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;

  useEffect(() => {
    if (!accountType) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const cloneShipmentId = urlParams.get("cloneShipmentId");

    const finishInit = () => {
      setReady(true);
      setFormKey((k) => k + 1);
    };

    if (!cloneShipmentId) {
      dispatch(resetShipmentAgreementState());
      AuthService.getUserProfileInfo()
        .then((profile) => {
          if (!profile.company) {
            return;
          }
          dispatch(setShipmentAgreementState({ field: "participants", value: [] }));
        })
        .finally(finishInit);
      return;
    }

    ShipmentService.getShipmentDetails(cloneShipmentId).then(async (shipment) => {
      let companyParticipants: { label: string; value: string }[] = [];
      let otherCompanyParticipants: { label: string; value: string }[] = [];
      if (isBuyer) {
        companyParticipants = shipment.buyers
          .slice(1)
          .map((p) => ({ label: p.email, value: p.email }));
        otherCompanyParticipants = shipment.suppliers.map((p) => ({
          label: p.email,
          value: p.email,
        }));
      } else {
        companyParticipants = shipment.suppliers
          .slice(1)
          .map((p) => ({ label: p.email, value: p.email }));
        otherCompanyParticipants = shipment.buyers.map((p) => ({
          label: p.email,
          value: p.email,
        }));
      }

      dispatch(
        cloneShipmentAgreementState({
          shipment: {
            name: shipment.name,
            ...(shipment.variety ? { variety: shipment.variety } : {}),
            ...(shipment.quality
              ? { quality: { label: shipment.quality, value: shipment.quality } as { label: string; value: string } }
              : {}),
            ...(shipment.presentation ? { presentation: shipment.presentation } : {}),
            quantity: "" + shipment.quantity,
            offerUnitPrice: "" + shipment.offerUnitPrice,
            origin: { label: shipment.origin, value: shipment.origin },
            destination: { label: shipment.destination, value: shipment.destination },
            shippingStartDate: shipment.shippingStartDate,
            expectedShippingEndDate: shipment.expectedShippingEndDate,
            ...(shipment.transport ? { transport: "" + shipment.transport } : {}),
            ...(shipment.portOfOrigin ? { port_origin: "" + shipment.portOfOrigin } : {}),
            ...(shipment.portOfDestination
              ? { port_destination: "" + shipment.portOfDestination }
              : {}),
            participants: companyParticipants,
            addresseeParticipants: otherCompanyParticipants,
            ...(shipment.description ? { description: shipment.description } : {}),
          } as unknown as { [key: string]: string },
        }),
      );

      if (shipment.milestones?.length) {
        dispatch(
          setShipmentAgreementState({
            field: "milestones",
            value: shipment.milestones.map((m) => ({
              description: m.description,
              fundsDistribution: m.fundsDistribution,
            })),
          }),
        );
      }

      finishInit();
    });
  }, [accountType, dispatch, isBuyer]);

  if (!ready || !accountType) {
    return null;
  }

  return (
    <CreateShipmentForm
      key={formKey}
      isBuyer={isBuyer}
      pendingDocuments={pendingDocuments}
      setPendingDocuments={setPendingDocuments}
    />
  );
};

export default CreateShipment;
