import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import moment from "moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Flag from "react-world-flags";

import Container from "src/components/common/container";
import Loading from "src/components/common/loading";
import TMModal from "src/components/common/modal";
import ShipmentInfo from "src/components/common/shipment-info";
import AttachedDocumentsView from "src/components/dashboard/shipment-details/attached-documents-view";
import DocumentBoxHeader from "src/components/dashboard/shipment-details/document-box-header/header";
import PaymentsTable from "src/components/dashboard/shipment-details/payments-table";
import ShipmentBaseInfo from "src/components/dashboard/shipment-details/shipment-base-info";
import ShipmentDetailsHeader from "src/components/dashboard/shipment-details/shipment-details-header";
import ShipmentFinance from "src/components/dashboard/shipment-details/shipment-details-header/ShipmentFinance";
import ShipmentMilestoneStatus from "src/components/dashboard/shipment-details/shipment-milestone-status";
import {
  ShipmentDetailModalView,
  ShipmentModalContent,
} from "src/components/dashboard/shipment-details/shipment-modal-content";
import PayDialog from "src/components/dashboard/account-details/deposit-flow/DepositDialog";
import PaymentDocumentUploadDialog from "src/components/dashboard/payments/PaymentDocumentUploadDialog";
import { APP_NAME } from "src/constants";
import { useModal } from "src/context/modal-context";
import { PaymentsService } from "src/controller/PaymentsAPI.service";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import { Payment } from "src/interfaces/payment";
import { getCountryCode } from "src/lib/helpers";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { useGetWindowDimension } from "src/lib/hooks/useGetWindowDimensions";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { milestones } from "src/lib/static";
import EthereumRpc from "src/lib/web3/evm.web3";
import { selectPreviewModalContent, setPreviewModalDescription } from "src/store/previewModalContentSlice";
import {
  selectMilestoneDetails,
  selectShipmentDetailsCurrentMilestone,
  setMilestoneDetails,
  setShipmentDetailsCurrentMilestone,
} from "src/store/shipmentDetailsSlice";

interface ShipmentDetailsProps { }

const ShipmentDetails: React.FC<ShipmentDetailsProps> = () => {
  const { query } = useRouter();
  const { windowHeight } = useGetWindowDimension();
  const dispatch = useAppDispatch();
  const shipmentDetailsCurrentMilestone = useAppSelector(selectShipmentDetailsCurrentMilestone);
  const milestoneDetails = useAppSelector(selectMilestoneDetails);

  const currentMilestoneDetails = milestoneDetails[shipmentDetailsCurrentMilestone];
  const { modalOpen, closeModal, openModal, modalView } = useModal();
  const previewModalData = useAppSelector(selectPreviewModalContent);
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [deleteDocLoading, setDeleteDocLoading] = useState(false);
  const [updateDocLoading, setUpdateDocLoading] = useState(false);
  const [milestoneDetailsInfo, setMilestoneDetailsInfo] = useState<IMilestoneDetails | null>(null);
  const [completing, setCompleting] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isPaymentDocumentDialogOpen, setIsPaymentDocumentDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedPaymentDocuments, setSelectedPaymentDocuments] = useState<
    Payment["paymentDocuments"] | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState<"payments" | "documents" | "activity">("payments");
  const [refetchPaymentsTrigger, setRefetchPaymentsTrigger] = useState(0);

  const handleDeleteDealMilestoneDoc = async (documentId: string) => {
    try {
      setDeleteDocLoading(true);
      await ShipmentService.deleteShipmentMilestoneDoc(query.id as string, currentMilestoneDetails.id, documentId);
      toast.success("Deal document successfully deleted!");
      refetch();
    } catch (err) {
      toast.error("Error occurred while deleting document!");
    } finally {
      setDeleteDocLoading(false);
      closeModal();
    }
  };

  const handleChangeDocumentDescription = (description: string) => {
    dispatch(setPreviewModalDescription({ description }));
  };

  const handleSaveChangedDocumentDescription = async (documentId: string) => {
    try {
      setUpdateDocLoading(true);
      await ShipmentService.updateDocumentDescription(
        query.id as string,
        currentMilestoneDetails.id,
        documentId,
        previewModalData.description,
      );
      toast.success("Document description successfully updated!");
    } catch (err) {
      toast.error("Error while updating document description");
    } finally {
      setUpdateDocLoading(false);
      closeModal();
      await refetch();
    }
  };

  const markShipmentDetailsAndDocumentsAsSeen = async () => {
    await ShipmentService.updateShipmentDealDetails(query.id as string, {
      view: true,
    });

    if (isBuyer) {
      await ShipmentService.updateShipmentDealDetails(query.id as string, {
        viewDocuments: true,
      });
    }
  };

  const {
    data: shipmentDetails,
    isLoading: isShipmentDetailsLoading,
    refetch,
    fetchStatus,
    isSuccess,
  } = useQuery({
    queryKey: ["shipment-details", query.id],
    queryFn: () => ShipmentService.getShipmentDetails(query.id as string),
    enabled: Boolean(query.id),
  });
  const { data: paymentRows = [] } = useQuery({
    queryKey: ["payments", query.id, refetchPaymentsTrigger],
    queryFn: () => PaymentsService.getPayments(query.id as string),
    enabled: Boolean(query.id),
  });

  const paymentDocumentsForTab = paymentRows.flatMap((payment) =>
    (payment.paymentDocuments || []).map((doc, index) => ({
      id: `${payment.id}-${doc.documentType}-${index}`,
      documentType: doc.documentType,
      url: doc.url,
      uploadedAt: doc.uploadedAt,
      paymentSequence: payment.sequence,
    })),
  );

  const handlePaymentDocumentUpload = (paymentId: string, existingDocuments?: Payment["paymentDocuments"]) => {
    setSelectedPaymentId(paymentId);
    setSelectedPaymentDocuments(existingDocuments);
    setIsPaymentDocumentDialogOpen(true);
  };

  const handleSelectMilestone = (milestone: MilestoneEnum) => {
    if (shipmentDetails?.currentMilestone) {
      if (milestone <= shipmentDetails.currentMilestone) {
        dispatch(setShipmentDetailsCurrentMilestone({ currentMilestone: milestone }));
      }
    }
  };

  const [publishing, setPublishing] = useState(false);

  const handlePublishment = async () => {
    if (!shipmentDetails) return;

    try {
      setPublishing(true);

      await ShipmentService.updateShipmentDealDetails(shipmentDetails.id, { isPublished: true });
      await refetch();

      closeModal();
    } catch (err) {
      toast.error("Error while publishing shipment");
    } finally {
      setPublishing(false);
    }
  };

  const handleComplete = async () => {
    if (!shipmentDetails) return;

    try {
      setCompleting(true);
      await ShipmentService.updateShipmentDealDetails(shipmentDetails.id, { repaid: true });
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Error while completing shipment");
    }

    setCompleting(false);
  };

  const Modal = ShipmentModalContent({
    previewModalData,
    shipmentDetails,
    isBuyer,
    closeModal,
    deleteDocLoading,
    modalView,
    updateDocLoading,
    handleChangeDocumentDescription,
    handleDeleteDealMilestoneDoc,
    handleSaveChangedDocumentDescription,
    milestone: milestoneDetailsInfo,
    handlePublishment,
    publishing,
  });

  useEffect(() => {
    if (fetchStatus !== "fetching") {
      dispatch(setShipmentDetailsCurrentMilestone({ currentMilestone: shipmentDetails?.currentMilestone || 0 }));
      dispatch(setMilestoneDetails(shipmentDetails?.milestones || []));
    }
  }, [fetchStatus]);

  useEffect(() => {
    if (!isShipmentDetailsLoading && query.id) {
      markShipmentDetailsAndDocumentsAsSeen();
    }
  }, [isShipmentDetailsLoading]);

  if (isShipmentDetailsLoading) {
    return (
      <div className="absolute left-1/2 top-1/2 translate-y-1/2">
        <Loading />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${APP_NAME} - Details`}</title>
      </Head>
      <div className="py-4 sm:py-[30px] bg-[#F7FAFC]">
        <Container>
          {/* Header + actions */}
          <div className="mb-4 sm:mb-[24px] flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:w-auto">
              <ShipmentDetailsHeader
                productName={shipmentDetails?.name}
                userAccountType={accountType}
                isPublished={shipmentDetails?.isPublished}
                publish={() => {
                  openModal(ShipmentDetailModalView.PUBLISH);
                }}
              />
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              {isBuyer && (
                <button
                  type="button"
                  onClick={() => setIsPayDialogOpen(true)}
                  className="flex items-center gap-2 rounded-md bg-tm-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3A6A28]"
                >
                  <span className="text-base leading-none">+</span>
                  <span>Add payment</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => openModal(ShipmentDetailModalView.AGREEMENT_DETAILS)}
                className="rounded-md border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-xs font-medium text-[#0F172A] hover:bg-[#F3F4F6]"
              >
                View agreement
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-4 sm:gap-[10px]">
            {/* Left column: milestones + finance */}
            <div className="w-full lg:w-[32%] space-y-4">
              <div className="rounded-[4px] bg-[#FFFFFF] border border-[#E5EAF2] shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
                <div className="border-b border-b-[#E2E8F0] px-4 sm:px-[24px] py-4">
                  <p className="text-sm sm:text-[15px] font-semibold leading-[1.2em] text-[#0F172A]">
                    Milestones
                  </p>
                </div>
                <div className="px-4 sm:px-[24px] pb-5 sm:pb-[24px] pt-4 sm:pt-[20px]">
                  <div className="flex items-start gap-2 sm:gap-[10px]">
                    <div className="h-[20px] w-[20px] flex-shrink-0">
                      <Flag code={getCountryCode(shipmentDetails?.origin as string)} />
                    </div>
                    <ShipmentInfo
                      title={`${shipmentDetails?.portOfOrigin}, ${shipmentDetails?.origin}`}
                      value={`${moment(shipmentDetails?.shippingStartDate).format("DD.MM.YYYY")} | ${moment(
                        shipmentDetails?.shippingStartDate,
                      )
                        .endOf("day")
                        .fromNow()}`}
                    />
                  </div>
                  <div className="py-2 sm:py-[8px]">
                    <ShipmentMilestoneStatus
                      step={shipmentDetailsCurrentMilestone || 0}
                      milestoneInfo={shipmentDetails?.milestones || []}
                      currentActiveMilestoneDetails={currentMilestoneDetails}
                      isBuyer={isBuyer}
                      handleSelectMilestone={handleSelectMilestone}
                      transport={shipmentDetails?.transport}
                    />
                  </div>
                  <div className="flex items-start gap-2 sm:gap-[10px]">
                    <div className="h-[20px] w-[20px] flex-shrink-0">
                      <Flag code={getCountryCode(shipmentDetails?.destination as string)} />
                    </div>
                    <ShipmentInfo
                      title={`${shipmentDetails?.portOfDestination}, ${shipmentDetails?.destination}`}
                      value={`${moment(shipmentDetails?.expectedShippingEndDate).format("DD.MM.YYYY")} | ${moment(
                        shipmentDetails?.expectedShippingEndDate,
                      )
                        .endOf("day")
                        .fromNow()}`}
                    />
                  </div>
                </div>
              </div>

              {shipmentDetails?.investmentAmount && shipmentDetails?.vaultAddress ? (
                <ShipmentFinance
                  currentMilestone={shipmentDetails.currentMilestone}
                  requestFundAmount={shipmentDetails.investmentAmount}
                  vaultAddress={shipmentDetails.vaultAddress}
                  nftID={shipmentDetails.nftID}
                  shipmentStatus={shipmentDetails.status}
                  handleComplete={handleComplete}
                  borrowerAddress={
                    shipmentDetails.buyers.length && shipmentDetails.buyers[0].walletAddress
                      ? shipmentDetails.buyers[0].walletAddress
                      : ""
                  }
                  completing={completing}
                />
              ) : null}
            </div>

            {/* Right column: deal summary + tabs */}
            <div className="w-full lg:w-[68%] space-y-4 rounded-[4px]">
              {/* Deal summary */}
              <ShipmentBaseInfo
                accountType={accountType}
                emailInfo={isBuyer ? shipmentDetails?.suppliers : shipmentDetails?.buyers}
                value={shipmentDetails?.totalValue || 0}
                identifier={(shipmentDetails?.id as string) || "-"}
                handleShowAgreement={() => openModal(ShipmentDetailModalView.AGREEMENT_DETAILS)}
              />

              {/* Tabs */}
              <div className="rounded-[4px] bg-[#FFFFFF] border border-[#E5EAF2] shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between border-b border-b-[#EEF2F6] px-4 sm:px-[24px] pt-3 sm:pt-4">
                  <div className="flex gap-6 text-sm font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveTab("payments")}
                      className={`pb-3 transition-colors ${activeTab === "payments"
                        ? "border-b-2 border-tm-green text-tm-green font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                    >
                      Payments
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("documents")}
                      className={`pb-3 transition-colors ${activeTab === "documents"
                        ? "border-b-2 border-tm-green text-tm-green font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                    >
                      Documents
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("activity")}
                      className={`pb-3 transition-colors ${activeTab === "activity"
                        ? "border-b-2 border-tm-green text-tm-green font-semibold"
                        : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                    >
                      Activity
                    </button>
                  </div>

                  {activeTab === "payments" && isBuyer && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPayDialogOpen(true);
                      }}
                      className="hidden sm:inline-flex items-center gap-2 rounded-md bg-[#4E9136] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#3F7B2C]"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>Add payment</span>
                    </button>
                  )}
                </div>

                <div className="px-4 sm:px-[24px] pb-5 sm:pb-[24px] pt-4 sm:pt-[20px]">
                  {activeTab === "payments" && (
                    <PaymentsTable
                      dealId={query.id as string}
                      isBuyer={isBuyer}
                      onAddPaymentClick={() => setIsPayDialogOpen(true)}
                      onUploadDocumentsClick={handlePaymentDocumentUpload}
                      refetchKey={refetchPaymentsTrigger}
                    />
                  )}

                  {activeTab === "documents" && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-[#E5EAF2] bg-white p-4">
                        <p className="mb-3 text-sm font-semibold text-[#0F172A]">Payment Documents</p>
                        {paymentDocumentsForTab.length === 0 ? (
                          <p className="text-xs text-[#64748B]">No payment documents uploaded yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {paymentDocumentsForTab.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs hover:bg-[#F8FAFC]"
                              >
                                <span className="truncate text-[#0F172A]">
                                  {doc.documentType} {doc.paymentSequence ? `(Payment #${doc.paymentSequence})` : ""}
                                </span>
                                <span className="shrink-0 font-medium text-tm-green">View</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* {!isBuyer && (
                        <DocumentBoxHeader dealId={query.id as string} refetchShipmentData={refetch} />
                      )} */}
                      <AttachedDocumentsView
                        currentMilestone={shipmentDetailsCurrentMilestone || 0}
                        milestone={shipmentDetails?.currentMilestone}
                        dealId={shipmentDetails?.id}
                        milestones={shipmentDetails?.milestones || []}
                        refetch={refetch}
                        currentMilestoneFiles={
                          shipmentDetails?.milestones[shipmentDetailsCurrentMilestone]?.docs || []
                        }
                      />
                    </div>
                  )}

                  {activeTab === "activity" && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                      Activity timeline will appear here once there are updates for this deal.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Container>
        <TMModal
          fullScreen={Modal?.fullScreen}
          showHeader={Modal?.showHeader}
          headerText={Modal?.headerText}
          open={modalOpen}
          handleClose={closeModal}
          classOverrides={classNames(Modal?.classOverRides)}
          showCloseIcon={Modal?.showCloseIcon}
        >
          {Modal?.content}
        </TMModal>

        {isBuyer && (
          <PayDialog
            isOpen={isPayDialogOpen}
            onClose={() => {
              setIsPayDialogOpen(false);
            }}
            dealId={query.id as string}
            defaultRecipientEmail={
              shipmentDetails?.suppliers && shipmentDetails.suppliers.length > 0
                ? shipmentDetails.suppliers[0].email
                : ''
            }
            onPaymentComplete={() => {
              setRefetchPaymentsTrigger((prev) => prev + 1);
              refetch();
            }}
          />
        )}

        {selectedPaymentId && (
          <PaymentDocumentUploadDialog
            isOpen={isPaymentDocumentDialogOpen}
            onClose={() => {
              setIsPaymentDocumentDialogOpen(false);
              setSelectedPaymentId(null);
              setSelectedPaymentDocuments(undefined);
            }}
            paymentId={selectedPaymentId}
            dealId={query.id as string}
            onUploadComplete={() => {
              setRefetchPaymentsTrigger((prev) => prev + 1);
            }}
            existingDocuments={selectedPaymentDocuments}
          />
        )}

      </div>
    </>
  );
};

export default ShipmentDetails;
