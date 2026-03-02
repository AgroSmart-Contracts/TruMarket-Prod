import ImageIcon from "@mui/icons-material/Image";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import { FileImage, FileText, FileVideo } from "@phosphor-icons/react";

import UploadedFileBox from "src/components/dashboard/shipment-details/attached-documents-view/uploaded-file-box";
import { AccountTypeEnum, FileWithPreview, IMilestoneDetails, IUploadedFileProps } from "src/interfaces/global";
import { getFileExtension } from "src/lib/helpers";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { useGetWindowDimension } from "src/lib/hooks/useGetWindowDimensions";

import EmptyDocumentsBuyer from "./empty-documents-buyer";
import EmptyDocumentsSupplier from "./empty-documents-supplier";
import Loading from "../loading";

interface IDropZoneProps {
  uploadedFiles: IUploadedFileProps[];
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  open: () => void;
  uploadInProgress: boolean;
  selectedMilestone: IMilestoneDetails;
  handleChangeDocumentVisibility: (id: string, visibility: boolean) => Promise<void>;
}

export default function DropZone({
  uploadedFiles,
  getInputProps,
  getRootProps,
  open,
  uploadInProgress,
  selectedMilestone,
  handleChangeDocumentVisibility,
}: IDropZoneProps) {
  const { accountType } = useUserInfo();
  const { windowHeight } = useGetWindowDimension();
  const [dropZoneActive, setDropZoneActive] = useState(false);

  const renderContent = () => {
    if (!uploadedFiles.length && accountType === AccountTypeEnum.SUPPLIER) {
      return <EmptyDocumentsSupplier open={open} />;
    } else if (!uploadedFiles.length && accountType === AccountTypeEnum.BUYER) {
      return <EmptyDocumentsBuyer />;
    } else {
      return (
        <>
          {uploadedFiles.map((file, i) => (
            <UploadedFileBox
              key={i}
              fileExtension={getFileExtension(file.url)}
              description={file.description}
              url={file.url}
              id={file.id}
              seen={file.seen}
              milestoneId={selectedMilestone.id}
              publiclyVisible={file.publiclyVisible}
              handleChangeDocumentVisibility={handleChangeDocumentVisibility}
            />
          ))}
        </>
      );
    }
  };

  const dropzoneHeight = Math.max(260, windowHeight - 385);

  return (
    <section
      className="container relative h-full p-0"
      draggable
      onDragEnter={() => setDropZoneActive(true)}
      onDragEnd={() => setDropZoneActive(false)}
      onDrop={() => setDropZoneActive(false)}
    // onDragLeave={() => setDropZoneActive(false)}
    >
      <div
        {...getRootProps({ className: "dropzone" })}
        style={{ height: `${dropzoneHeight}px` }}
        className={classNames("pointer-events-auto h-full bg-[#00800000]", {
          "relative z-[99999] scale-95   rounded-[4px]  border border-tm-black-20  !bg-tm-white/90 shadow-custom":
            dropZoneActive,
        })}
      >
        {dropZoneActive ? (
          <div className="relative z-[9999999999] flex h-full w-full flex-col items-center justify-center">
            <div className="flex w-full flex-col items-center justify-center">
              <div className="flex items-center gap-[10px] ">
                <FileImage size={40} weight="duotone" />
                <FileText size={40} weight="duotone" />
                <FileVideo size={40} weight="duotone" />
              </div>
              <p className="py-[28px] text-center text-[13px]  font-semibold  leading-[1.2em] tracking-normal text-tm-black-80">
                Drop documents or images here or <br /> click to upload
              </p>
            </div>
          </div>
        ) : null}

        {uploadInProgress ? (
          <div className="relative z-[9999999999] flex h-full w-full flex-col items-center justify-center">
            <div className="absolute bottom-0 left-1/2 top-1/2 h-full w-full translate-y-1/2">
              <Loading />
            </div>
          </div>
        ) : null}

        <input {...getInputProps()} />
      </div>
      <div
        className={classNames("absolute top-[0px] flex h-full w-full flex-wrap  gap-[10px]", {
          "opacity-50": uploadInProgress,
        })}
      >
        {/* local files */}
        <>{!dropZoneActive ? renderContent() : null}</>
      </div>
    </section>
  );
}
