import React from "react";

import DocumentViewer from "src/components/common/document-viewer";
import ModalContent from "src/components/common/modal/modal-content";
import Input from "src/components/common/input";
import { getFileExtension, normalizeShipmentAgreementDetailsData } from "src/lib/helpers";
import { ShippingDetails } from "src/interfaces/shipment";
import { IMilestoneDetails } from "src/interfaces/global";

import AgreementDetailList from "../../agreement-details/agreement-details-list";
import UploadedFileBox from "../attached-documents-view/uploaded-file-box";

interface ShipmentModalContentParams {
  previewModalData: {
    url: string;
    id?: string;
    description: string;
    publiclyVisible: boolean;
  };
  shipmentDetails?: ShippingDetails;
  isBuyer: boolean;
  closeModal: () => void;
  deleteDocLoading: boolean;
  updateDocLoading: boolean;
  handleDeleteDealMilestoneDoc: (id: string) => Promise<void>;
  handleChangeDocumentDescription: (description: string) => void;
  handleSaveChangedDocumentDescription: (documentId: string) => Promise<void>;
  modalView: any;
  milestone: IMilestoneDetails | null;
  handlePublishment: () => Promise<void>;
  publishing: boolean;
}

export enum ShipmentDetailModalView {
  DOCUMENT_PREVIEW,
  AGREEMENT_DETAILS,
  DELETE_ATTACHMENT,
  EDIT_ATTACHMENT,
  PREVIOUS_MILESTONE_DOCS,
  PUBLISH,
}

export const ShipmentModalContent = ({
  previewModalData,
  shipmentDetails,
  isBuyer,
  closeModal,
  deleteDocLoading,
  handleDeleteDealMilestoneDoc,
  modalView,
  handleChangeDocumentDescription,
  updateDocLoading,
  handleSaveChangedDocumentDescription,
  milestone,
  handlePublishment,
  publishing,
}: ShipmentModalContentParams) => {
  const ShipmentDetailsModalContent = {
    [ShipmentDetailModalView.DOCUMENT_PREVIEW]: {
      content: <DocumentViewer url={previewModalData.url} description={previewModalData.description} />,
      showHeader: false,
      headerText: "",
      fullScreen: true,
      classOverRides: "",
      showCloseIcon: true,
    },
    [ShipmentDetailModalView.PREVIOUS_MILESTONE_DOCS]: {
      content: (
        <div className="h-[500px] overflow-y-scroll pt-[80px]">
          <div className="px-[40px]">
            <div className="flex items-center gap-[10px]">
              {milestone?.docs.map((doc) => (
                <UploadedFileBox
                  key={doc.id}
                  id={doc.id}
                  description={doc.description}
                  url={doc.url}
                  fileExtension={getFileExtension(doc.url) || ""}
                  allowOnlyDownload
                />
              ))}
            </div>
          </div>
        </div>
      ),
      showHeader: true,
      headerText: `${milestone?.description?.replace(/_/g, " ").toUpperCase()}: UPLOADED DOCUMENTS`,
      fullScreen: false,
      classOverRides: "!max-w-[900px]",
      showCloseIcon: true,
    },
    [ShipmentDetailModalView.AGREEMENT_DETAILS]: {
      content: (
        <div className="h-[800px] overflow-y-scroll pt-[60px]">
          <AgreementDetailList
            viewOnly
            agreementData={shipmentDetails?.id ? normalizeShipmentAgreementDetailsData(shipmentDetails, isBuyer) : null}
            comparativeData={
              shipmentDetails?.id ? normalizeShipmentAgreementDetailsData(shipmentDetails, isBuyer) : null
            }
          />
        </div>
      ),
      showHeader: true,
      headerText: `Agreement #${shipmentDetails?.id}`,
      fullScreen: false,
      classOverRides: "!max-w-[900px]",
      showCloseIcon: true,
    },
    [ShipmentDetailModalView.DELETE_ATTACHMENT]: {
      content: (
        <ModalContent
          primaryOptionText="Cancel"
          secondaryOptionText="Delete"
          primaryOptionAction={() => closeModal()}
          secondaryOptionLoading={deleteDocLoading}
          secondaryOptionAction={() => handleDeleteDealMilestoneDoc(previewModalData.id as string)}
          modalMainTitle={`Delete the attachment "${previewModalData.description}" ?`}
        />
      ),
      showHeader: false,
      headerText: "",
      fullScreen: false,
      classOverRides: "",
      showCloseIcon: false,
    },
    [ShipmentDetailModalView.EDIT_ATTACHMENT]: {
      content: (
        <ModalContent
          primaryOptionText="Cancel"
          secondaryOptionText="Save"
          wrapperContainerClassOverrides="!pt-[60px]"
          primaryOptionAction={() => closeModal()}
          secondaryOptionLoading={updateDocLoading}
          secondaryOptionAction={() => handleSaveChangedDocumentDescription(previewModalData.id || "")}
        >
          <div className="flex flex-col gap-[3px]">
            <p className="text-left text-[13px] font-bold leading-[1.2em] text-tm-black-80">Attachment name</p>
            <Input
              name="description"
              defaultValue={previewModalData.description}
              classOverrides="min-h-[80px]  !font-normal"
              onChange={(e) => handleChangeDocumentDescription(e.target.value)}
              textareaDependency={previewModalData.description}
              isTextArea
              textareaAutoHeigh
            />
            <p className="text-left text-[13px] font-bold leading-[1.2em] text-tm-black-80">
              Publicly visible to investors
            </p>
            <Input
              type="checkbox"
              name="publiclyVisible"
              defaultValue={previewModalData.publiclyVisible ? "true" : "false"}
              onChange={(e) => handleChangeDocumentDescription(e.target.value)}
            />
          </div>
        </ModalContent>
      ),
      showHeader: true,
      headerText: "Edit file attachment",
      fullScreen: false,
      classOverRides: "",
      showCloseIcon: true,
    },
    [ShipmentDetailModalView.PUBLISH]: {
      content: (
        <ModalContent
          primaryOptionText="Cancel"
          secondaryOptionText="Publish"
          wrapperContainerClassOverrides="!pt-[60px]"
          primaryOptionAction={() => closeModal()}
          secondaryOptionLoading={publishing}
          secondaryOptionAction={() => handlePublishment()}
        >
          <div className="flex flex-col gap-[3px]">
            <p className="text-left text-[13px] font-bold leading-[1.2em] text-tm-black-80">
              Publishing a shipment will display it in{" "}
              <a href="https://finance.trumarket.tech">https://finance.trumarket.tech</a>. This action is unreversible.
              Are you sure you want to publish the deal?
            </p>
          </div>
        </ModalContent>
      ),
      showHeader: true,
      headerText: "Publish shipment",
      fullScreen: false,
      classOverRides: "",
      showCloseIcon: true,
    },
  };

  return ShipmentDetailsModalContent[modalView as keyof typeof ShipmentDetailsModalContent];
};
