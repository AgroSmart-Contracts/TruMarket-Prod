import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

import { AdminService } from "src/controller/AdminAPI.service";
import TMModal from "src/components/common/modal";
import { useModal } from "src/context/modal-context";
import AgreementDetailList from "src/components/dashboard/agreement-details/agreement-details-list";
import { ShippingDetails, DealStatus } from "src/interfaces/shipment";
import { normalizeShipmentAgreementDetailsData } from "src/lib/helpers";
import ModalContent from "src/components/common/modal/modal-content";
import Loading from "src/components/common/loading";
import { IMilestoneDetails, IUploadedFileProps } from "src/interfaces/global";

import DealsTable from "./deals-table";
import Search from "./search";
import UploadedFiles from "../common/uploaded-files-view";
import NftModalLogsContent from "./nft-modal-logs-content";

export enum DealsModalViewEnum {
  AGREEMENT_DETAILS,
  DELETE_AGREEMENT,
  UPLOADED_FILES,
  NFT_LOGS,
}

export interface IDealsFilterForm {
  emailSearch: string;
  status?: {
    label: string;
    value: string;
  };
}

interface DealsProps {}

const Deals: React.FC<DealsProps> = () => {
  const { openModal, modalOpen, modalView, closeModal } = useModal();
  const [agreementId, setAgreementId] = useState("");
  const [deleteAgreementLoading, setDeleteAgreementLoading] = useState(false);
  const [shipmentDetails, setShipmentDetails] = useState<ShippingDetails | null>(null);
  const [milestoneDetails, setMilestoneDetails] = useState<IMilestoneDetails[] | null>(null);
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<IDealsFilterForm>({
    defaultValues: {
      emailSearch: "",
      status: undefined,
    },
  });

  const {
    data: dealsData,
    isLoading: isDealsDataLoading,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["get-all-deals"],
    queryFn: () =>
      AdminService.getDeals({
        emailSearch: getValues("emailSearch"),
        status: (getValues("status")?.value as DealStatus) || undefined,
      }),
    placeholderData: {
      data: [],
    },
  });

  const handleOpenShipmentDetailsModal = (shipmentDetails: ShippingDetails) => {
    setShipmentDetails(shipmentDetails);
    openModal(DealsModalViewEnum.AGREEMENT_DETAILS);
  };

  const handleOpenDeleteAgreementModal = (agreementId: string) => {
    setAgreementId(agreementId);
    openModal(DealsModalViewEnum.DELETE_AGREEMENT);
  };

  const handleOpenMilestoneFilesModal = (milestone: IMilestoneDetails[]) => {
    setMilestoneDetails(milestone);
    openModal(DealsModalViewEnum.UPLOADED_FILES);
  };

  const handleOpenNftLogsModal = (id: string) => {
    setAgreementId(id);
    openModal(DealsModalViewEnum.NFT_LOGS);
  };

  const handleDeleteDeal = async (dealId: string) => {
    setDeleteAgreementLoading(true);
    try {
      await AdminService.deleteDeal({ dealId });
      toast.success("Deal deleted successfully!");
      await refetch();
    } catch (err) {
      toast.error("Error ocurred while deleting the deal!");
    } finally {
      setDeleteAgreementLoading(false);
      closeModal();
    }
  };

  const dealModalViews = {
    [DealsModalViewEnum.AGREEMENT_DETAILS]: {
      view: (
        <div className="max-h-[700px] overflow-y-auto pt-[60px]">
          <AgreementDetailList
            viewOnly
            agreementData={shipmentDetails?.id ? normalizeShipmentAgreementDetailsData(shipmentDetails, false) : null}
            comparativeData={shipmentDetails?.id ? normalizeShipmentAgreementDetailsData(shipmentDetails, false) : null}
          />
        </div>
      ),
      modalTitle: `Agreement #${shipmentDetails?.id} Details`,
      classNames: "max-w-[900px]",
    },
    [DealsModalViewEnum.DELETE_AGREEMENT]: {
      view: (
        <div className="pt-[60px]">
          <ModalContent
            modalMainTitle="Are you sure that you want to delete this agreement?"
            modalSubTitle="This action is irreversible"
            primaryOptionAction={() => closeModal()}
            secondaryOptionAction={() => handleDeleteDeal(agreementId)}
            primaryOptionText="Cancel"
            secondaryOptionText="Delete"
            primaryOptionLoading={false}
            secondaryOptionLoading={deleteAgreementLoading}
          ></ModalContent>
        </div>
      ),
      modalTitle: `Deleting #${agreementId} Agreement`,
      classNames: "max-w-[550px]",
    },
    [DealsModalViewEnum.UPLOADED_FILES]: {
      view: (
        <div className="max-h-[700px] overflow-y-auto pt-[60px]">
          <div>
            <UploadedFiles milestones={milestoneDetails} />
          </div>
        </div>
      ),
      modalTitle: `Milestone Files`,
      classNames: "max-w-[950px]",
    },
    [DealsModalViewEnum.NFT_LOGS]: {
      view: <NftModalLogsContent dealId={agreementId} />,
      modalTitle: `Agreement #${agreementId} NFT logs`,
      classNames: "max-w-[950px]",
    },
  };

  const Modal = dealModalViews[modalView as keyof typeof dealModalViews];

  return (
    <section className="bg-blueGray-50 py-1">
      <div className="mx-auto mb-12 w-full  xl:mb-0">
        <div className="flex flex-col gap-[20px]">
          <Search
            register={register}
            reset={reset}
            errors={errors}
            control={control}
            handleSubmit={handleSubmit}
            refetch={refetch}
            showResetButton={isDirty}
          />

          {isDealsDataLoading ? (
            <Loading />
          ) : (
            <DealsTable
              dealsData={!isDealsDataLoading && isSuccess ? dealsData.data : []}
              handleOpenShipmentDetailsModal={handleOpenShipmentDetailsModal}
              handleOpenDeleteAgreementModal={handleOpenDeleteAgreementModal}
              handleOpenMilestoneFilesModal={handleOpenMilestoneFilesModal}
              handleOpenNftLogsModal={handleOpenNftLogsModal}
            />
          )}
        </div>
      </div>
      <TMModal
        open={modalOpen}
        showHeader
        headerText={Modal?.modalTitle}
        handleClose={() => closeModal()}
        classOverrides={Modal?.classNames}
      >
        <div className={Modal?.classNames}>{Modal?.view}</div>
      </TMModal>
    </section>
  );
};

export default Deals;
