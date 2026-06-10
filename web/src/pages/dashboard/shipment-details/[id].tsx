import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import Container from "src/components/common/container";
import Loading from "src/components/common/loading";
import TMModal from "src/components/common/modal";
import DrawbackSummaryStrip from "src/components/dashboard/drawback/DrawbackSummaryStrip";
import DrawbackTabPanel from "src/components/dashboard/drawback/DrawbackTabPanel";
import PayDialog from "src/components/dashboard/account-details/deposit-flow/DepositDialog";
import PaymentDocumentUploadDialog from "src/components/dashboard/payments/PaymentDocumentUploadDialog";
import ShipmentBaseInfo from "src/components/dashboard/shipment-details/shipment-base-info";
import ShipmentDetailsHeader from "src/components/dashboard/shipment-details/shipment-details-header";
import ShipmentDocumentsTab from "src/components/dashboard/shipment-details/shipment-documents-tab";
import ShipmentMilestonesPanel from "src/components/dashboard/shipment-details/shipment-milestones-panel";
import {
  ShipmentDetailModalView,
  ShipmentModalContent,
} from "src/components/dashboard/shipment-details/shipment-modal-content";
import PaymentsTable from "src/components/dashboard/shipment-details/payments-table";
import { APP_NAME } from "src/constants";
import { useModal } from "src/context/modal-context";
import { PaymentsService } from "src/controller/PaymentsAPI.service";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum, MilestoneEnum } from "src/interfaces/global";
import { Payment } from "src/interfaces/payment";
import { useDrawbackForDeal } from "src/lib/hooks/useDrawbackForDeal";
import { useShipmentDetailTab } from "src/lib/hooks/useShipmentDetailTab";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { shipmentDetailTabClass, shipmentDetailTabsForAccount } from "src/lib/shipment-details-tabs";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { selectPreviewModalContent, setPreviewModalDescription } from "src/store/previewModalContentSlice";
import {
  selectMilestoneDetails,
  selectShipmentDetailsCurrentMilestone,
  setMilestoneDetails,
  setShipmentDetailsCurrentMilestone,
} from "src/store/shipmentDetailsSlice";

const ShipmentDetails: React.FC = () => {
  const { t } = useTranslation(["shipment", "payments", "common"]);
  const { query } = useRouter();
  const dispatch = useAppDispatch();
  const shipmentDetailsCurrentMilestone = useAppSelector(selectShipmentDetailsCurrentMilestone);
  const milestoneDetails = useAppSelector(selectMilestoneDetails);

  const currentMilestoneDetails = milestoneDetails[shipmentDetailsCurrentMilestone];
  const { modalOpen, closeModal, openModal, modalView } = useModal();
  const previewModalData = useAppSelector(selectPreviewModalContent);
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const isSupplier = accountType === AccountTypeEnum.SUPPLIER;
  const [deleteDocLoading, setDeleteDocLoading] = useState(false);
  const [updateDocLoading, setUpdateDocLoading] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isPaymentDocumentDialogOpen, setIsPaymentDocumentDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [selectedPaymentDocuments, setSelectedPaymentDocuments] = useState<
    Payment["paymentDocuments"] | undefined
  >(undefined);
  const { activeTab, selectTab } = useShipmentDetailTab();
  const [refetchPaymentsTrigger, setRefetchPaymentsTrigger] = useState(0);

  const handleDeleteDealMilestoneDoc = async (documentId: string) => {
    try {
      setDeleteDocLoading(true);
      await ShipmentService.deleteShipmentMilestoneDoc(query.id as string, currentMilestoneDetails.id, documentId);
      toast.success(t("toasts.docDeleted", { ns: "shipment" }));
      refetch();
    } catch (err) {
      toast.error(t("toasts.docDeleteError", { ns: "shipment" }));
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
      toast.success(t("toasts.descUpdated", { ns: "shipment" }));
    } catch (err) {
      toast.error(t("toasts.descUpdateError", { ns: "shipment" }));
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

  const {
    requirements: drawbackRequirements,
    eligible: drawbackEligible,
    validation: drawbackValidation,
  } = useDrawbackForDeal(shipmentDetails, paymentRows, accountType);

  const shipmentDetailTabs = shipmentDetailTabsForAccount(isSupplier);

  useEffect(() => {
    if (!isSupplier && activeTab === "drawback") {
      selectTab("payments");
    }
  }, [isSupplier, activeTab, selectTab]);

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
      toast.error(t("toasts.publishError", { ns: "shipment" }));
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
      toast.error(t("toasts.completeError", { ns: "shipment" }));
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
    milestone: currentMilestoneDetails ?? null,
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
      <div className="bg-[#F7FAFC] pt-1 pb-4 sm:pt-2 sm:pb-[30px]">
        <Container>
          {/* Page header */}
          <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-start sm:justify-between">
            <ShipmentDetailsHeader
              productName={shipmentDetails?.name}
              userAccountType={accountType}
              dealStatus={shipmentDetails?.status}
              isPublished={shipmentDetails?.isPublished}
              publish={() => {
                openModal(ShipmentDetailModalView.PUBLISH);
              }}
            />
            <div className="flex flex-wrap items-center gap-2">
              {isBuyer ? (
                <button
                  type="button"
                  onClick={() => setIsPayDialogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-tm-green px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#3A6A28]"
                >
                  <span className="text-base leading-none">+</span>
                  <span>{t("addPayment", { ns: "shipment" })}</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => openModal(ShipmentDetailModalView.AGREEMENT_DETAILS)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-semibold text-[#0F172A] shadow-sm hover:bg-[#F8FAFC]"
              >
                {t("viewAgreement", { ns: "shipment" })}
              </button>
            </div>
          </div>

          {shipmentDetails && drawbackEligible ? (
            <div className="mb-4 sm:mb-6">
              <DrawbackSummaryStrip
                shipment={shipmentDetails}
                requirements={drawbackRequirements}
                validation={drawbackValidation}
              />
            </div>
          ) : null}

          <div className="flex flex-col items-stretch gap-4 sm:gap-[10px] lg:flex-row lg:items-start">
            {shipmentDetails ? (
              <div className="w-full space-y-4 lg:w-[32%]">
                <ShipmentMilestonesPanel
                  shipment={shipmentDetails}
                  currentMilestone={shipmentDetailsCurrentMilestone || 0}
                  currentMilestoneDetails={currentMilestoneDetails}
                  isBuyer={isBuyer}
                  onSelectMilestone={handleSelectMilestone}
                  onComplete={handleComplete}
                  completing={completing}
                />
                <ShipmentBaseInfo
                  accountType={accountType}
                  emailInfo={isBuyer ? shipmentDetails.suppliers : shipmentDetails.buyers}
                  value={shipmentDetails.totalValue || 0}
                  identifier={(shipmentDetails.id as string) || "-"}
                />
              </div>
            ) : null}

            <div className="min-w-0 flex-1">
              <div
                id="shipment-details-tabs"
                className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm"
              >
                <div className="flex flex-col gap-3 border-b border-[#EEF2F6] px-4 pb-0 pt-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 text-sm font-medium [-webkit-overflow-scrolling:touch] sm:gap-6">
                    {shipmentDetailTabs.map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => selectTab(tab)}
                        className={classNames(
                          shipmentDetailTabClass(activeTab === tab),
                          "shrink-0 whitespace-nowrap",
                        )}
                      >
                        {t(`tabs.${tab}`, { ns: "shipment" })}
                      </button>
                    ))}
                  </div>

                  {activeTab === "payments" && isBuyer && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPayDialogOpen(true);
                      }}
                      className="hidden items-center gap-2 rounded-md bg-tm-green px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-tm-primary-dark sm:inline-flex"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>{t("addPayment", { ns: "shipment" })}</span>
                    </button>
                  )}
                </div>

                <div className="px-4 pb-6 pt-2 sm:px-6">
                  {activeTab === "payments" && (
                    <PaymentsTable
                      dealId={query.id as string}
                      isBuyer={isBuyer}
                      onAddPaymentClick={() => setIsPayDialogOpen(true)}
                      onUploadDocumentsClick={handlePaymentDocumentUpload}
                      refetchKey={refetchPaymentsTrigger}
                    />
                  )}

                  {activeTab === "documents" && shipmentDetails?.id && (
                    <ShipmentDocumentsTab
                      dealId={shipmentDetails.id}
                      milestones={shipmentDetails.milestones || []}
                      payments={paymentRows}
                      currentMilestone={shipmentDetailsCurrentMilestone || 0}
                      dealCurrentMilestone={shipmentDetails.currentMilestone}
                      refetch={refetch}
                      onUploadToPayment={(paymentId) =>
                        handlePaymentDocumentUpload(
                          paymentId,
                          paymentRows.find((p) => p.id === paymentId)?.paymentDocuments,
                        )
                      }
                    />
                  )}

                  {activeTab === "activity" && (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                      {t("empty.noActivity", { ns: "shipment" })}
                    </div>
                  )}

                  {isSupplier && activeTab === "drawback" && shipmentDetails && (
                    <DrawbackTabPanel
                      dealId={shipmentDetails.id}
                      milestones={shipmentDetails.milestones || []}
                      payments={paymentRows}
                      currentMilestone={shipmentDetailsCurrentMilestone || 0}
                      dealCurrentMilestone={shipmentDetails.currentMilestone}
                      isSupplier={isSupplier}
                      onUploadComplete={() => {
                        void refetch();
                        setRefetchPaymentsTrigger((prev) => prev + 1);
                      }}
                    />
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
