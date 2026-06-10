import React, { useState } from "react";
import { saveAs } from "file-saver";
import { useTranslation } from "react-i18next";
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import Cookies from "js-cookie";

import Button from "src/components/common/button";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum, IUploadedFileProps, MilestoneEnum } from "src/interfaces/global";
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
  const { t } = useTranslation("shipment");
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [loading, setLoading] = useState(false);

  const downloadResourcesOnClick = async () => {
    try {
      setLoading(true);

      const jwt = Cookies.get("jwt");
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/s3-images-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
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
              <p className="text-[14px] font-bold capitalize leading-[1.2em]">{t("downloadDocuments")}</p>
              <DownloadIcon className="!h-[18px] !w-[18px]" />
            </div>
          </Button>
        </div>
        {!isBuyer && currentMilestone !== MilestoneEnum.M7 && currentMilestone === milestone! && (
          <div className="flex items-center   gap-[10px]">
            <Button onClick={() => handleOpenUploadDocumentsDialog()}>
              <div className="flex items-center gap-[6px]">
                <p className="whitespace-pre text-[14px] font-bold capitalize leading-[1.2em]">{t("uploadDocuments")}</p>
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
