import React from "react";

interface EmptyDocumentsBuyerProps {}

const EmptyDocumentsBuyer: React.FC<EmptyDocumentsBuyerProps> = () => {
  return (
    <div className="flex h-full w-full justify-center">
      <div className="flex w-full flex-col items-center justify-center">
        <p className="pb-[20px] pt-[10px] text-[13px] font-medium leading-[1em] tracking-normal text-tm-black-80">
          Documents provided by supplier will be visible here
        </p>
      </div>
    </div>
  );
};

export default EmptyDocumentsBuyer;
