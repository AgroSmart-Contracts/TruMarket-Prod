import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import moment from "moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Flag from "react-world-flags";

import Container from "src/components/common/container";
import Loading from "src/components/common/loading";
import TMModal from "src/components/common/modal";
import MuiTooltip from "src/components/common/mui-tooltip";
import ShipmentInfo from "src/components/common/shipment-info";
import AttachedDocumentsView from "src/components/dashboard/shipment-details/attached-documents-view";
import DocumentBoxHeader from "src/components/dashboard/shipment-details/document-box-header/header";
import ShipmentBaseInfo from "src/components/dashboard/shipment-details/shipment-base-info";
import ShipmentDetailsHeader from "src/components/dashboard/shipment-details/shipment-details-header";
import ShipmentFinance from "src/components/dashboard/shipment-details/shipment-details-header/ShipmentFinance";
import ShipmentMilestoneStatus from "src/components/dashboard/shipment-details/shipment-milestone-status";
import {
  ShipmentDetailModalView,
  ShipmentModalContent,
} from "src/components/dashboard/shipment-details/shipment-modal-content";
import { APP_NAME } from "src/constants";
import { useModal } from "src/context/modal-context";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
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
    queryKey: ["shipment-details"],
    queryFn: () => ShipmentService.getShipmentDetails(query.id as string),
    enabled: Boolean(query.id),
  });

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
      <div className="py-4 sm:py-[30px]">
        <Container>
          <div className="mb-4 sm:mb-[30px] flex flex-col lg:flex-row items-stretch lg:items-start justify-between gap-4 sm:gap-[10px]">
            <div className="w-full lg:w-[35%]">
              <ShipmentDetailsHeader
                productName={shipmentDetails?.name}
                userAccountType={accountType}
                isPublished={shipmentDetails?.isPublished}
                publish={() => {
                  openModal(ShipmentDetailModalView.PUBLISH);
                }}
              />
            </div>
            <div className="w-full lg:w-[65%] space-y-4">
              <ShipmentBaseInfo
                accountType={accountType}
                emailInfo={isBuyer ? shipmentDetails?.suppliers : shipmentDetails?.buyers}
                value={shipmentDetails?.totalValue || 0}
                identifier={(shipmentDetails?.id as string) || "-"}
                handleShowAgreement={() => openModal(ShipmentDetailModalView.AGREEMENT_DETAILS)}
              />
              {shipmentDetails?.investmentAmount &&
                shipmentDetails?.vaultAddress &&
                accountType === AccountTypeEnum.BUYER ? (
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
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-4 sm:gap-[10px]">
            <div className="w-full lg:w-[35%]">
              <div className="rounded-tl-[4px] rounded-tr-[4px] border-b border-b-tm-black-20 bg-tm-white px-4 sm:px-[30px] py-4 sm:py-[25px]">
                <p className="text-base sm:text-[17px] font-bold leading-[1em] text-tm-black-80">Milestone timeline</p>
              </div>
              <div
                className="rounded-bl-[4px] rounded-br-[4px] bg-tm-white px-4 sm:px-[30px] pb-6 sm:pb-[44px] pt-4 sm:pt-[30px] lg:min-h-[calc(100vh-295px)]"
              >
                <div className="flex items-start gap-2 sm:gap-[10px]">
                  <div className="h-[20px] w-[20px] flex-shrink-0">
                    <Flag code={getCountryCode(shipmentDetails?.origin as string)} />
                  </div>
                  <ShipmentInfo
                    title={`${shipmentDetails?.portOfOrigin}, ${shipmentDetails?.origin}`}
                    value={`${moment(shipmentDetails?.shippingStartDate).format("DD.MM.YYYY")} | ${moment(shipmentDetails?.shippingStartDate).endOf("day").fromNow()}`}
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
                    value={`${moment(shipmentDetails?.expectedShippingEndDate).format("DD.MM.YYYY")} | ${moment(shipmentDetails?.expectedShippingEndDate).endOf("day").fromNow()}`}
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:w-[65%] rounded-[4px]">
              <DocumentBoxHeader dealId={query.id as string} refetchShipmentData={refetch} />
              <AttachedDocumentsView
                currentMilestone={shipmentDetailsCurrentMilestone || 0}
                milestone={shipmentDetails?.currentMilestone}
                dealId={shipmentDetails?.id}
                milestones={shipmentDetails?.milestones || []}
                refetch={refetch}
                currentMilestoneFiles={shipmentDetails?.milestones[shipmentDetailsCurrentMilestone]?.docs || []}
              />

              {/* <DocumentViewer /> */}
              {/* <UppyFileUploader /> */}
              {/* <button onClick={openModal}>mocjer</button> */}
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
      </div>
    </>
  );
};

export default ShipmentDetails;
