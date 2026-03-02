import classNames from "classnames";
import Image from "next/image";
import React from "react";

import {
  excelExtensions,
  fallbackExtensions,
  imageExtensions,
  pdfExtensions,
  videoExtensions,
  wordExtensions,
} from "./file-extensions";
import FileActionsWrapper from "./file-actions-wrapper";

interface FileTypeDetectorProps {
  fileType?: string;
  url: string;
  id: string;
  fileExtension: string;
  description: string;
  allowOnlyDownload?: boolean;
  seen?: boolean;
  milestoneId?: string;
  publiclyVisible: boolean;
}

const FileTypeDetector: React.FC<FileTypeDetectorProps> = ({
  fileType,
  url,
  fileExtension,
  id,
  description,
  milestoneId,
  seen = true,
  allowOnlyDownload = false,
  publiclyVisible = false,
}) => {
  if (fileType?.startsWith("image") || imageExtensions.includes(fileExtension)) {
    return (
      <DetectorWrapperBox
        url={url}
        seen={seen}
        milestoneId={milestoneId}
        description={description}
        id={id}
        allowOnlyDownload={allowOnlyDownload}
        publiclyVisible={publiclyVisible}
      >
        {/* Using <img> here is intentional to display arbitrary user-uploaded images without Next.js optimization overhead */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} className="h-full w-full rounded-[4px] object-cover" alt={`Image file: ${fileType}`} />
      </DetectorWrapperBox>
    );
  }

  if (fileType?.startsWith("video") || videoExtensions.includes(fileExtension)) {
    return (
      <DetectorWrapperBox
        url={url}
        seen={seen}
        description={description}
        id={id}
        allowOnlyDownload={allowOnlyDownload}
        milestoneId={milestoneId}
        isVideo
        publiclyVisible={publiclyVisible}
      >
        <video src={url} className="h-full w-full rounded-[4px] object-cover" autoPlay={false}></video>
      </DetectorWrapperBox>
    );
  }

  if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    wordExtensions.includes(fileExtension)
  ) {
    return (
      <DetectorWrapperBox
        url={url}
        seen={seen}
        description={description}
        id={id}
        allowOnlyDownload={allowOnlyDownload}
        milestoneId={milestoneId}
        invert
        publiclyVisible={publiclyVisible}
      >
        <Image
          src="/assets/m-word.png"
          className="h-full rounded-[4px]"
          objectFit="contain"
          fill
          alt={`word ${fileType}`}
        />
      </DetectorWrapperBox>
    );
  }

  if (fileType === "application/pdf" || pdfExtensions.includes(fileExtension)) {
    return (
      <DetectorWrapperBox
        url={url}
        seen={seen}
        description={description}
        allowOnlyDownload={allowOnlyDownload}
        milestoneId={milestoneId}
        id={id}
        invert
        publiclyVisible={publiclyVisible}
      >
        <Image
          src="/assets/m-pdf.png"
          className="h-full rounded-[4px]"
          objectFit="contain"
          fill
          alt={`pdf ${fileType}`}
        />
      </DetectorWrapperBox>
    );
  }

  if (
    fileType === "application/vnd.ms-excel" ||
    fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    excelExtensions.includes(fileExtension)
  ) {
    return (
      <DetectorWrapperBox
        url={url}
        seen={seen}
        description={description}
        allowOnlyDownload={allowOnlyDownload}
        milestoneId={milestoneId}
        id={id}
        invert
        publiclyVisible={publiclyVisible}
      >
        <Image
          src="/assets/m-excell.webp"
          className="h-full rounded-[4px]"
          objectFit="contain"
          fill
          alt={`pdf ${fileType}`}
        />
      </DetectorWrapperBox>
    );
  }

  return (
    <DetectorWrapperBox
      url={url}
      seen={seen}
      description={description}
      allowOnlyDownload={allowOnlyDownload}
      milestoneId={milestoneId}
      id={id}
      invert
      publiclyVisible={publiclyVisible}
    >
      <Image
        src="/assets/undetected-file.png"
        className="h-full rounded-[4px]"
        objectFit="contain"
        fill
        alt={`def ${fileType}`}
      />
    </DetectorWrapperBox>
  );
};

export default FileTypeDetector;

const DetectorWrapperBox = ({
  invert,
  children,
  url,
  id,
  description,
  milestoneId,
  allowOnlyDownload = false,
  isVideo = false,
  seen = true,
  publiclyVisible = false,
}: {
  invert?: boolean;
  children: React.ReactNode;
  url: string;
  description: string;
  id: string;
  allowOnlyDownload?: boolean;
  isVideo?: boolean;
  seen?: boolean;
  milestoneId?: string;
  publiclyVisible: boolean;
}) => {
  return (
    <div
      className={classNames("relative h-[120px] w-[148px]  pb-[5px]", {
        "bg-tm-white": invert,
      })}
    >
      <FileActionsWrapper
        isVideo={isVideo}
        url={url}
        id={id}
        description={description}
        allowOnlyDownload={allowOnlyDownload}
        seen={seen}
        milestoneId={milestoneId}
        publiclyVisible={publiclyVisible}
      />
      {children}
    </div>
  );
};
