import React from "react";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useRouter } from "next/router";

import { useModal } from "src/context/modal-context";
import { useAppDispatch } from "src/lib/hooks";
import { setPreviewModalContent } from "src/store/previewModalContentSlice";
import { ShipmentDetailModalView } from "src/components/dashboard/shipment-details/shipment-modal-content";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { ShipmentService } from "src/controller/ShipmentAPI.service";

interface FileActionsWrapperProps {
  preview?: () => void;
  edit?: () => void;
  deleteAction?: () => void;
  isVideo?: boolean;
  description?: string;
  id: string;
  url: string;
  allowOnlyDownload?: boolean;
  seen?: boolean;
  milestoneId?: string;
  publiclyVisible: boolean;
}

const FileActionsWrapper: React.FC<FileActionsWrapperProps> = ({
  edit,
  preview,
  deleteAction,
  description,
  url,
  id,
  milestoneId,
  allowOnlyDownload = false,
  isVideo = false,
  seen = true,
  publiclyVisible = false,
}) => {
  const { openModal } = useModal();

  const dispatch = useAppDispatch();
  const { query } = useRouter();

  const { accountType } = useUserInfo();
  const handlePreview = async () => {
    openModal(ShipmentDetailModalView.DOCUMENT_PREVIEW);
    dispatch(setPreviewModalContent({ id, url, description: description || "", publiclyVisible }));
    if (!seen) {
      await ShipmentService.markMilestoneDocumentAsSeen(query.id as string, milestoneId as string, id);
    }
  };

  const handleDelete = () => {
    openModal(ShipmentDetailModalView.DELETE_ATTACHMENT);
    dispatch(setPreviewModalContent({ id, url, description: description || "", publiclyVisible }));
  };

  const handleEdit = () => {
    openModal(ShipmentDetailModalView.EDIT_ATTACHMENT);
    dispatch(setPreviewModalContent({ id, url, description: description || "", publiclyVisible }));
  };

  return (
    <div className="absolute right-[7px] top-[5px] z-[999] flex flex-col gap-[5px] opacity-0 transition-opacity duration-500 group-hover:opacity-100">
      <div className="flex  gap-[5px]">
        <a href={url} download={description} target="_blank" rel="noreferrer">
          <div className="w-auto cursor-pointer rounded-[4px] bg-[#000000cc] p-[3px]">
            <DownloadIcon className="!h-[24px] !w-[24px] !text-tm-white" />
          </div>
        </a>
        {!allowOnlyDownload && (
          <div onClick={() => handlePreview()} className="w-auto cursor-pointer rounded-[4px] bg-[#000000cc] p-[3px]">
            {isVideo ? (
              <PlayArrowIcon className="!h-[24px] !w-[24px] !text-tm-white" />
            ) : (
              <OpenInFullIcon className="!h-[24px] !w-[24px] !text-tm-white" />
            )}
          </div>
        )}
      </div>
      {accountType === AccountTypeEnum.SUPPLIER && !allowOnlyDownload ? (
        <div className="flex gap-[5px]">
          <div onClick={() => handleDelete()} className="w-auto cursor-pointer rounded-[4px] bg-[#000000cc] p-[3px]">
            <DeleteIcon className="!h-[24px] !w-[24px] !text-tm-white" />
          </div>
          <div onClick={() => handleEdit()} className="w-auto cursor-pointer rounded-[4px] bg-[#000000cc] p-[3px]">
            <EditIcon className="!h-[24px] !w-[24px] !text-tm-white" />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FileActionsWrapper;
