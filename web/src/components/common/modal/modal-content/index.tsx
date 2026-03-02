import React from "react";
import classNames from "classnames";

import Button from "../../button";

export interface ModalContentProps {
  modalMainTitle?: string;
  modalSubTitle?: string;
  children?: React.ReactNode;
  primaryOptionText: string;
  secondaryOptionText: string;
  primaryOptionAction: () => void;
  secondaryOptionAction: () => void;
  primaryOptionLoading?: boolean;
  secondaryOptionLoading?: boolean;
  wrapperContainerClassOverrides?: string;
}

const ModalContent: React.FC<ModalContentProps> = ({
  modalMainTitle,
  modalSubTitle,
  children,
  primaryOptionAction,
  secondaryOptionAction,
  primaryOptionText,
  secondaryOptionText,
  primaryOptionLoading,
  secondaryOptionLoading,
  wrapperContainerClassOverrides,
}) => {
  return (
    <div className={classNames("w-full", wrapperContainerClassOverrides)}>
      <div className="flex flex-col gap-3 sm:gap-[10px] px-6 sm:px-[30px] pb-5 sm:pb-[20px] pt-6 sm:pt-[30px] text-center">
        {modalMainTitle ? (
          <p className="text-base sm:text-[15px] font-bold leading-[1.2em] tracking-normal text-tm-black-80">{modalMainTitle}</p>
        ) : null}
        {modalSubTitle ? (
          <p className="text-sm sm:text-[13px] leading-[1.5em] tracking-normal text-gray-600">{modalSubTitle}</p>
        ) : null}
        {children}
      </div>
      <div className="h-[1px] w-full bg-tm-black-20"></div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-14 p-5">
        {primaryOptionText ? (
          <Button
            onClick={primaryOptionAction}
            loading={primaryOptionLoading}
            disabled={primaryOptionLoading}
            classOverrides="w-full sm:w-auto sm:!min-w-[120px]"
          >
            <p className="text-sm sm:text-[14px] font-bold capitalize leading-[1.2em] text-tm-white">{primaryOptionText}</p>
          </Button>
        ) : null}

        <Button
          onClick={secondaryOptionAction}
          loading={secondaryOptionLoading}
          disabled={secondaryOptionLoading}
          classOverrides="w-full sm:w-auto sm:!min-w-[120px]"
        >
          <p className="whitespace-nowrap text-sm sm:text-[14px] font-bold leading-[1.2em] text-tm-white">{secondaryOptionText}</p>
        </Button>
      </div>
    </div>
  );
};

export default ModalContent;
