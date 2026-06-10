import React from "react";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/router";

import { useModal } from "src/context/modal-context";
import { useAppDispatch } from "src/lib/hooks";
import { setPreviewModalContent } from "src/store/previewModalContentSlice";
import { ShipmentDetailModalView } from "src/components/dashboard/shipment-details/shipment-modal-content";
import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { downloadBlobOrOpenInNewTab } from "src/lib/vercel-blob";

interface FileActionsWrapperProps {
  edit?: () => void;
  deleteAction?: () => void;
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
  deleteAction,
  description,
  url,
  id,
  milestoneId,
  allowOnlyDownload = false,
  seen = true,
  publiclyVisible = false,
}) => {
  const { openModal } = useModal();

  const dispatch = useAppDispatch();
  const { query } = useRouter();

  const { accountType } = useUserInfo();

  const handleDownload = async () => {
    if (!seen && milestoneId && query.id) {
      try {
        await ShipmentService.markMilestoneDocumentAsSeen(query.id as string, milestoneId, id);
      } catch {
        // non-blocking: download should still proceed
      }
    }
    await downloadBlobOrOpenInNewTab(url, description || "document");
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
        <button
          type="button"
          className="cursor-pointer border-0 bg-transparent p-0"
          onClick={() => void handleDownload()}
          title="Download"
        >
          <div className="w-auto cursor-pointer rounded-[4px] bg-[#000000cc] p-[3px]">
            <DownloadIcon className="!h-[24px] !w-[24px] !text-tm-white" />
          </div>
        </button>
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
