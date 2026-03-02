import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import classNames from "classnames";

import DropZone from "src/components/common/file-uploader";
import { FileWithPreview, IUploadedFileProps, MilestoneEnum, IMilestoneDetails } from "src/interfaces/global";
import { ShipmentService } from "src/controller/ShipmentAPI.service";

import DocumentBoxFooter from "../document-box-footer";

interface AttachedDocumentsViewProps {
  currentMilestone: MilestoneEnum;
  dealId?: string;
  milestones: IMilestoneDetails[];
  refetch: () => void;
  currentMilestoneFiles: IUploadedFileProps[];
  milestone?: MilestoneEnum;
}

const AttachedDocumentsView: React.FC<AttachedDocumentsViewProps> = ({
  currentMilestone,
  dealId,
  milestones,
  refetch,
  currentMilestoneFiles,
  milestone,
}) => {
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: async (acceptedFiles: File[]) => {
      //async upload in loop
      try {
        setUploadInProgress(true);
        for (const file of acceptedFiles) {
          await handleUploadFileToMilestone(file);
        }
      } finally {
        setUploadInProgress(false);
        refetch();
      }
    },

    onDragEnter: () => {},
    maxFiles: 5,
    onDropRejected(fileRejections, event) {
      const rejectReason = fileRejections[0].errors[0].code;
      if (rejectReason === "too-many-files") {
        toast.error("Upload limit exceeded: Please upload a maximum of 10 files per submission.");
      }
    },
  });

  const handleUploadFileToMilestone = async (file: File) => {
    try {
      const filesMap = {
        description: file.name,
        file,
      };
      await ShipmentService.uploadDocToMilestone(filesMap, dealId, milestones[currentMilestone].id);
    } catch (err) {
      toast.error(`Error while uploading ${file.name} document, please try again!`);
    }
  };

  const handleChangeDocumentVisibility = async (docId: string, visibility: boolean) => {
    if (!dealId) return;

    try {
      await ShipmentService.updateDocumentVisibility(dealId, milestones[currentMilestone].id, docId, visibility);
      await refetch();
    } catch (err) {
      toast.error(`Error making document visible, please try again!`);
    }
  };

  return (
    <div className="flex  flex-col justify-between rounded-bl-[4px] rounded-br-[4px]  bg-tm-white p-[20px]">
      <div className={classNames("flex flex-wrap gap-[10px] overflow-y-scroll")}>
        <DropZone
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          open={open}
          uploadedFiles={currentMilestoneFiles}
          uploadInProgress={uploadInProgress}
          selectedMilestone={milestones[currentMilestone]}
          handleChangeDocumentVisibility={handleChangeDocumentVisibility}
        />
      </div>

      <DocumentBoxFooter
        currentMilestone={currentMilestone}
        uploadedFiles={currentMilestoneFiles}
        handleOpenUploadDocumentsDialog={() => open()}
        milestone={milestone}
      />
    </div>
  );
};

export default AttachedDocumentsView;
