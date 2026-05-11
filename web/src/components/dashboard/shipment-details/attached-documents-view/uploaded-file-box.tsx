import React, { useEffect, useState } from "react";

import FileTypeDetector from "src/components/common/file-uploader/file-type-detector";
import { AccountTypeEnum } from "src/interfaces/global";
import { useUserInfo } from "src/lib/hooks/useUserInfo";

interface UploadedFileBoxProps {
  fileType?: string;
  description: string;
  url: string;
  fileExtension: string;
  isLocal?: boolean;
  id: string;
  allowOnlyDownload?: boolean;
  seen?: boolean;
  milestoneId?: string;
  publiclyVisible?: boolean;
  handleChangeDocumentVisibility?: (id: string, visibility: boolean) => Promise<void>;
}

const UploadedFileBox: React.FC<UploadedFileBoxProps> = ({
  fileType,
  description,
  url,
  id,
  fileExtension,
  milestoneId,
  allowOnlyDownload = false,
  isLocal = false,
  seen = true,
  publiclyVisible = false,
  handleChangeDocumentVisibility,
}) => {
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [publishEnabled, setPublishEnabled] = useState(false);

  useEffect(() => {
    // const key = localStorage.getItem("publishEnabled");
    // if (key) {
    setPublishEnabled(true);
    // }
  }, []);

  const visibilityBtnBase =
    "inline-flex w-full shrink-0 items-center justify-center rounded-md border-2 px-2 py-2 text-center text-[12px] font-semibold leading-tight transition-[box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4E8C37] focus-visible:ring-offset-1 disabled:opacity-50";

  return (
    <div className="group relative flex w-full max-w-[160px] flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {isBuyer && !seen ? (
        <p className="absolute left-2 top-2 z-[9] rounded border border-slate-600 bg-slate-200 px-1.5 py-0.5 text-[11px] font-medium text-slate-800 shadow-sm">
          new
        </p>
      ) : null}
      <div className="shrink-0 border-b border-slate-100 bg-slate-50/80">
        <FileTypeDetector
          allowOnlyDownload={allowOnlyDownload}
          fileType={fileType}
          url={url}
          description={description}
          fileExtension={fileExtension}
          milestoneId={milestoneId}
          seen={seen}
          id={id}
          publiclyVisible={publiclyVisible}
        />
      </div>
      {handleChangeDocumentVisibility && publishEnabled ? (
        <div
          className={`flex min-h-0 flex-1 flex-col gap-2 p-2.5 ${publiclyVisible ? "bg-emerald-50/50" : "bg-white"}`}
        >
          <p className="line-clamp-3 min-h-[2.5rem] text-[13px] font-normal leading-snug text-slate-700">{description}</p>
          <button
            type="button"
            className={
              publiclyVisible
                ? `${visibilityBtnBase} border-slate-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_0_rgba(15,23,42,0.08)]`
                : `${visibilityBtnBase} border-[#4E8C37] bg-white !text-[#4E8C37] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_0_rgba(78,140,55,0.22)]`
            }
            onClick={() => handleChangeDocumentVisibility(id, !publiclyVisible)}
          >
            {publiclyVisible ? "Make private" : "Make public"}
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default UploadedFileBox;
