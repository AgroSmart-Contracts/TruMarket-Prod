import React from "react";

import EmptyDocumentsBuyer from "src/components/common/file-uploader/empty-documents-buyer";
import UploadedFileBox from "src/components/dashboard/shipment-details/attached-documents-view/uploaded-file-box";
import { IMilestoneDetails } from "src/interfaces/global";
import { getFileExtension } from "src/lib/helpers";

interface UploadedFilesProps {
  milestones: IMilestoneDetails[] | null;
}

const UploadedFiles: React.FC<UploadedFilesProps> = ({ milestones }) => {
  const dashedToSpaced = (dashedString?: string) => {
    return dashedString?.replace(/_/g, " ");
  };
  return (
    <div className="flex flex-col gap-[20px] pt-[40px]">
      {milestones?.map((milestone, i) => (
        <div key={i} className="flex flex-col gap-[10px]">
          <div className="px-[40px]">
            <p className="text-[18px] font-bold capitalize">{dashedToSpaced(milestone.description)}</p>
          </div>
          <div className="px-[40px]">
            {milestone && milestone?.docs?.length ? (
              <div className="flex items-center gap-[10px]">
                {milestone.docs.map((doc) => (
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
            ) : (
              <div className="py-[20px]">
                <EmptyDocumentsBuyer />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadedFiles;
