import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";

import Button from "src/components/common/button";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum, IUploadedFileProps, MilestoneEnum } from "src/interfaces/global";
import { getFileExtension } from "src/lib/helpers";
interface DocumentBoxFooterProps {
  handleOpenUploadDocumentsDialog: () => void;
  uploadedFiles: IUploadedFileProps[];
  currentMilestone: MilestoneEnum;
  milestone?: MilestoneEnum;
}

const DocumentBoxFooter: React.FC<DocumentBoxFooterProps> = ({
  handleOpenUploadDocumentsDialog,
  uploadedFiles,
  currentMilestone,
  milestone,
}) => {
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [loading, setLoading] = useState(false);

  const downloadResourcesOnClick = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/s3-images-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uploadedFiles }),
      });

      if (response.ok) {
        const blob = await response.blob();
        saveAs(blob, `milestone-files-${Date.now()}.zip`);
      } else {
        console.error("Failed to download files");
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="pt-[8px]">
      <div className="flex items-center justify-end gap-[10px]">
        <div>
          <Button loading={loading} disabled={loading || !uploadedFiles.length} onClick={downloadResourcesOnClick}>
            <div className="flex items-center gap-[6px]">
              <p className="text-[14px] font-bold capitalize leading-[1.2em]">Download Documents</p>
              <DownloadIcon className="!h-[18px] !w-[18px]" />
            </div>
          </Button>
        </div>
        {!isBuyer && currentMilestone !== MilestoneEnum.M7 && currentMilestone === milestone! && (
          <div className="flex items-center   gap-[10px]">
            <Button onClick={() => handleOpenUploadDocumentsDialog()}>
              <div className="flex items-center gap-[6px]">
                <p className="whitespace-pre text-[14px] font-bold capitalize leading-[1.2em]">Upload Documents</p>
                <UploadIcon className="!h-[18px] !w-[18px]" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentBoxFooter;
