import WarningIcon from "@mui/icons-material/Warning";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useWindowSize } from "react-use";

import Loading from "src/components/common/loading";
import TMModal from "src/components/common/modal";
import ModalContent, { ModalContentProps } from "src/components/common/modal/modal-content";
import { useModal } from "src/context/modal-context";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum } from "src/interfaces/global";
import { ICreateShipmentParams, ShippingDetails } from "src/interfaces/shipment";
import {
  arrayToCommaSeparatedString,
  commaSeparatedStringToArray,
  isApprovedByAllUser,
  milestoneDescriptions,
  normalizeShipmentAgreementDetailsData,
  openInNewTab,
} from "src/lib/helpers";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { useScrollToError } from "src/lib/hooks/useScrollToError";

import AgreementActions from "./agreement-actions";
import AgreementDetailList from "./agreement-details-list";
import CompanyInfoModalContent from "./company-info-modal-content";

interface AgreementDetailsViewProps {}

export const placeHolder = {
  name: "",
  variety: "",
  quality: "",
  presentation: "",
  quantity: 0,
  offerUnitPrice: 0,
  totalValue: 0,
  transport: "",
  email: "",
  origin: "",
  portOfOriginCity: "",
  destination: "",
  portOfDestinationCity: "",
  shippingStartDate: "",
  description: "",
  packaging_and_process: "",
  finished_product_and_storage: "",
  production_and_fields: "",
  transport_to_port_of_origin: "",
  port_of_origin: "",
  transit: "",
  port_of_destination: "",
  addresseeCountry: "",
  addresseeCompanyName: "",
  addresseeTaxId: "",
  addresseeParticipants: "",
  companyName: "",
  taxId: "",
  country: "",
  participants: "",
};

export enum AgreementDetailsModalContentEnum {
  ACCEPT_AGREEMENT,
  SHIPMENT_CREATED,
  SUBMIT_CHANGES,
  ACCEPT_AGREEMENT_UNSUBMITTED_CHANGES,
  WAITING_ACCEPTANCE,
  CANCEL_ACCEPTANCE,
  WAITING_PARTICIPANTS_TO_CONFIRM,
}

const AgreementDetailsView: React.FC<AgreementDetailsViewProps> = () => {
  const { query } = useRouter();
  const { accountType, userInfo } = useUserInfo();
  const { push } = useRouter();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [comparativeData, setComparativeData] = useState<any>(placeHolder);
  const containerRef = useRef(null);
  const [changesCount, setChangesCount] = useState(0);
  const { openModal, closeModal, modalOpen } = useModal();
  const [vpHeight, setVpHeight] = useState(900);
  const [submittedAt, setSubmittedAt] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [shipmentId, setShipmentId] = useState("");
  const [missingInfoModal, setMissingInfoModal] = useState(false);
  const [notified, setNotified] = useState(false);
  const [modalContent, setModalContent] = useState<AgreementDetailsModalContentEnum>(
    AgreementDetailsModalContentEnum.ACCEPT_AGREEMENT,
  );

  const {
    handleSubmit,
    register,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      ...comparativeData,
    },
  });

  const { height } = useWindowSize();

  const {
    data: shipmentAgreementDetails,
    isLoading: isShipmentAgreementDetailsLoading,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["get-shipment-details"],
    queryFn: () => ShipmentService.getShipmentDetails(query.id as string),
    select: (data) => {
      return normalizeShipmentAgreementDetailsData(data, isBuyer);
    },
    enabled: Boolean(query.id),
  });

  useScrollToError(errors, containerRef, Date.now());

  useEffect(() => {
    if (isSuccess && shipmentAgreementDetails) {
      setComparativeData(shipmentAgreementDetails);
      reset(shipmentAgreementDetails);
    }
  }, [isSuccess, refetch, shipmentAgreementDetails]);

  const handleOpenSubmitChangesModal = (data: ShippingDetails) => {
    openModal();
    setModalContent(AgreementDetailsModalContentEnum.SUBMIT_CHANGES);
  };
  //!! TODO refactor
  const handleSubmitChanges = async () => {
    const normalizeMilestone = (description: string) => ({
      description,
      fundsDistribution: Number(comparativeData[description]),
    });

    const milestones = milestoneDescriptions.map(normalizeMilestone);

    const normalizedData: ICreateShipmentParams = {
      name: comparativeData.name,
      variety: comparativeData.variety,
      description: comparativeData.description,
      shippingStartDate: new Date(comparativeData.shippingStartDate),
      expectedShippingEndDate: new Date(comparativeData.expectedShippingEndDate),
      offerUnitPrice: comparativeData.offerUnitPrice,
      presentation: comparativeData.presentation,
      quantity: comparativeData.quantity,
      transport: comparativeData.transport,
      quality: comparativeData.quality,
      origin: comparativeData.origin,
      portOfOrigin: comparativeData.portOfOriginCity,
      destination: comparativeData.destination,
      portOfDestination: comparativeData.portOfDestinationCity,
      milestones,
      // hardcodedValues
      investmentAmount: 0,
      investmentAmountPercentage: "0",
      contractId: 0,
      roi: 0,
      netBalance: 0,
      revenue: 0,
      nftID: 0,
    };

    if (isBuyer) {
      const buyerSideParticipants = commaSeparatedStringToArray(comparativeData.participants);
      normalizedData.suppliersEmails = commaSeparatedStringToArray(comparativeData.addresseeParticipants);
      normalizedData.buyersEmails = [...buyerSideParticipants];
      normalizedData.buyerCompany = {
        name: comparativeData.companyName,
        country: comparativeData.country,
        taxId: comparativeData.taxId,
      };
      normalizedData.supplierCompany = {
        name: comparativeData.addresseeCompanyName,
        country: comparativeData.addresseeCountry,
        taxId: comparativeData.addresseeTaxId,
      };
    }

    if (!isBuyer) {
      const supplierSideParticipants = commaSeparatedStringToArray(comparativeData.participants);
      normalizedData.buyersEmails = commaSeparatedStringToArray(comparativeData.addresseeParticipants);
      normalizedData.suppliersEmails = [...supplierSideParticipants];
      normalizedData.buyerCompany = {
        name: comparativeData.addresseeCompanyName,
        country: comparativeData.addresseeCountry,
        taxId: comparativeData.addresseeTaxId,
      };
      normalizedData.supplierCompany = {
        name: comparativeData.companyName,
        country: comparativeData.country,
        taxId: comparativeData.taxId,
      };
    }

    try {
      setLoading(true);
      await ShipmentService.updateShipmentDealDetails(query.id as string, normalizedData);
      await refetch();
      toast.success("Agreement changes submitted.");
      closeModal();
      setChangesCount(0);
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDeal = async () => {
    try {
      setLoading(true);
      const response = await ShipmentService.updateShipmentDealDetails(query.id as string, { confirm: true });
      setShipmentId(response.id);
      const buyersApproved = isApprovedByAllUser(response.buyers);
      const suppliersApproved = isApprovedByAllUser(response.suppliers);

      const allApproved = buyersApproved && suppliersApproved;
      const waitingApproval = !buyersApproved || !suppliersApproved;

      if ((isBuyer && allApproved) || (!isBuyer && allApproved)) {
        setModalContent(AgreementDetailsModalContentEnum.SHIPMENT_CREATED);
      } else if ((isBuyer && waitingApproval) || (!isBuyer && waitingApproval)) {
        setModalContent(AgreementDetailsModalContentEnum.WAITING_PARTICIPANTS_TO_CONFIRM);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
      refetch();
    }
  };

  const handleCancelAcceptance = async () => {
    try {
      setLoading(true);
      await ShipmentService.updateShipmentDealDetails(query.id as string, { cancel: true });
      toast.success("Deal cancelled!");
      push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message);
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const modalContentData = {
    [AgreementDetailsModalContentEnum.ACCEPT_AGREEMENT]: {
      modalMainTitle: "Accept the agreement?",
      modalSubTitle: `To proceed with creating a smart contract for this shipment, approval from all participating parties is necessary.`,
      primaryOptionText: "Cancel",
      secondaryOptionText: "Accept",
      primaryOptionLoading: false,
      secondaryOptionLoading: loading,
      primaryOptionAction: () => closeModal(),
      secondaryOptionAction: () => handleAcceptDeal(),
    },
    [AgreementDetailsModalContentEnum.SHIPMENT_CREATED]: {
      modalMainTitle: "Shipment created",
      modalSubTitle: "Smart contract has been created. Now you can track/manage your shipment.",
      primaryOptionText: "View the contract",
      secondaryOptionText: "Go to shipment",
      primaryOptionLoading: false,
      secondaryOptionLoading: false,
      primaryOptionAction: () =>
        openInNewTab(
          `${process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER as string}/token/${process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}`,
        ),
      secondaryOptionAction: () => {
        closeModal();
        push(`/dashboard/shipment-details/${shipmentId}`);
      },
    },
    [AgreementDetailsModalContentEnum.SUBMIT_CHANGES]: {
      modalMainTitle: "Submit the changes?",
      modalSubTitle: `${isBuyer ? "Supplier" : "Buyer"} acceptance will be reset, he will receive a changes request via email.`,
      primaryOptionText: "Cancel",
      secondaryOptionText: "Submit",
      primaryOptionLoading: false,
      secondaryOptionLoading: loading,
      primaryOptionAction: () => closeModal(),
      secondaryOptionAction: () => handleSubmitChanges(),
    },
    [AgreementDetailsModalContentEnum.WAITING_ACCEPTANCE]: {
      modalMainTitle: `${isBuyer ? "Supplier" : "Buyer"} has been notified via email that you are waiting for the acceptance.`,
      modalSubTitle: "",
      primaryOptionText: "Resend email",
      secondaryOptionText: "Ok",
      primaryOptionLoading: false,
      secondaryOptionLoading: loading,
      primaryOptionAction: () => closeModal(),
      secondaryOptionAction: () => closeModal(),
    },
    [AgreementDetailsModalContentEnum.WAITING_PARTICIPANTS_TO_CONFIRM]: {
      modalMainTitle: `You have accepted the agreement. To proceed to the next step, all other participants must also accept the agreement. Please wait for their confirmation.`,
      modalSubTitle: "",
      secondaryOptionText: "Ok",
      primaryOptionLoading: false,
      secondaryOptionLoading: false,
      secondaryOptionAction: () => closeModal(),
    },
    [AgreementDetailsModalContentEnum.CANCEL_ACCEPTANCE]: {
      modalMainTitle: "Cancel your acceptance?",
      modalSubTitle: `${isBuyer ? "Supplier" : "Buyer"} will be notified.`,
      primaryOptionText: "No",
      secondaryOptionText: "Yes",
      primaryOptionLoading: false,
      secondaryOptionLoading: loading,
      primaryOptionAction: () => closeModal(),
      secondaryOptionAction: () => handleCancelAcceptance(),
    },
    [AgreementDetailsModalContentEnum.ACCEPT_AGREEMENT_UNSUBMITTED_CHANGES]: {
      modalMainTitle: "Accept the agreement?",
      modalSubTitle: "",
      children: (
        <div className="flex items-center gap-[20px]">
          <WarningIcon className="!h-[35px] !w-[35px] !text-[#FCB13F]" />
          <p className="text-[13px] leading-[1.2em] tracking-normal text-tm-black-80">
            To proceed with creating a smart contract for this shipment, approval from all participating parties is
            necessary.
          </p>
        </div>
      ),
      primaryOptionText: "Cancel",
      secondaryOptionText: "Reset changes and accept",
      primaryOptionLoading: false,
      secondaryOptionLoading: loading,
      primaryOptionAction: () => closeModal(),
      secondaryOptionAction: () => {
        handleResetChanges();
        handleAcceptDeal();
      },
    },
  };

  const modalContentView = modalContentData[modalContent] as ModalContentProps;

  const handleResetChanges = () => {
    setComparativeData(shipmentAgreementDetails!);
    reset(shipmentAgreementDetails);
  };

  const handleOpenAcceptModal = async () => {
    const validated = await trigger();
    if (validated) {
      if (changesCount) {
        setModalContent(AgreementDetailsModalContentEnum.ACCEPT_AGREEMENT_UNSUBMITTED_CHANGES);
        openModal();
      } else {
        setModalContent(AgreementDetailsModalContentEnum.ACCEPT_AGREEMENT);
        openModal();
      }
    }
  };

  useEffect(() => {
    setVpHeight(height);
  }, []);

  useEffect(() => {
    if (shipmentAgreementDetails) {
      if (
        (!shipmentAgreementDetails?.companyName ||
          !shipmentAgreementDetails?.taxId ||
          !shipmentAgreementDetails?.country) &&
        !notified
      ) {
        setMissingInfoModal(true);
        setNotified(true);
      }
    }
  }, [shipmentAgreementDetails]);

  return (
    <div>
      <div
        style={{ height: `${vpHeight - 290}px` }}
        ref={containerRef}
        className="w-full overflow-y-auto rounded-[4px] bg-[#0000000d]"
      >
        <div className="relative">
          {isShipmentAgreementDetailsLoading && !shipmentAgreementDetails ? (
            <div className="mt-[160px] flex justify-center">
              <Loading />
            </div>
          ) : (
            <AgreementDetailList
              agreementData={shipmentAgreementDetails ?? {}}
              comparativeData={comparativeData}
              setComparativeData={setComparativeData}
              handleResetChanges={handleResetChanges}
              changesCount={changesCount}
              handleSubmitAgreementDetailsForm={handleOpenSubmitChangesModal}
              setChangesCount={setChangesCount}
              handleSubmit={handleSubmit}
              register={register}
              errors={errors}
            />
          )}
        </div>
      </div>
      <AgreementActions
        handleOpenAcceptModal={handleOpenAcceptModal}
        buyerEmails={shipmentAgreementDetails?.buyers || []}
        supplierEmails={shipmentAgreementDetails?.suppliers || []}
        handleShowCancelAcceptanceModal={() => {
          openModal();
          setModalContent(AgreementDetailsModalContentEnum.CANCEL_ACCEPTANCE);
        }}
      />
      <TMModal open={modalOpen} handleClose={closeModal} showCloseIcon={false} classOverrides="max-w-[450px] w-full">
        <ModalContent
          modalMainTitle={modalContentView.modalMainTitle}
          modalSubTitle={modalContentView.modalSubTitle}
          primaryOptionAction={modalContentView.primaryOptionAction}
          secondaryOptionAction={modalContentView.secondaryOptionAction}
          primaryOptionText={modalContentView.primaryOptionText}
          secondaryOptionText={modalContentView.secondaryOptionText}
          primaryOptionLoading={modalContentView.primaryOptionLoading}
          secondaryOptionLoading={modalContentView.secondaryOptionLoading}
        >
          {modalContentView.children}
        </ModalContent>
      </TMModal>
      <TMModal
        open={missingInfoModal}
        handleClose={() => setMissingInfoModal(false)}
        headerText="Provide your company data to continue"
        showHeader={true}
        showCloseIcon={true}
        classOverrides="max-w-[550px] w-full"
      >
        <CompanyInfoModalContent
          addresseeCompanyName={comparativeData.companyName}
          addresseeTaxId={comparativeData.taxId}
          addresseeCountry={comparativeData.country}
          addresseeParticipants={comparativeData.participants}
          refetch={refetch}
          closeModal={() => setMissingInfoModal(false)}
          dealId={query.id as string}
          accountType={accountType}
        />
      </TMModal>
    </div>
  );
};

export default AgreementDetailsView;
