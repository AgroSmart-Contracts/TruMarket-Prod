import React from "react";
import ImageIcon from "@mui/icons-material/Image";
import { FileImage, FileText, FileVideo } from "@phosphor-icons/react";

import Button from "../button";

interface EmptyDocumentsSupplierProps {
  open: () => void;
}

const EmptyDocumentsSupplier: React.FC<EmptyDocumentsSupplierProps> = ({ open }) => {
  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="flex items-center gap-[10px] ">
          <FileImage size={40} weight="duotone" />
          <FileText size={40} weight="duotone" />
          <FileVideo size={40} weight="duotone" />
        </div>
        <p className="py-[28px] text-center text-[13px]  font-semibold  leading-[1.2em] tracking-normal text-tm-black-80">
          Drop documents or images here or <br /> click to upload
        </p>
        <div>
          <Button onClick={() => open()}>
            <p className="Capitalize text-[14px] font-bold leading-[1.2em]">Upload Documents</p>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmptyDocumentsSupplier;
