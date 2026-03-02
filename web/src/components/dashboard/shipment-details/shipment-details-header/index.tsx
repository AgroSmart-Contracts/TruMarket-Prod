import React, { useEffect } from "react";
import { CheckCircle } from "@phosphor-icons/react";

import { AccountTypeEnum } from "src/interfaces/global";

interface ShipmentDetailsHeaderProps {
  productName?: string;
  shipmentNumber?: string;
  publish: () => void;
  isPublished?: boolean;
  userAccountType: string;
}

const ShipmentDetailsHeader: React.FC<ShipmentDetailsHeaderProps> = ({
  productName,
  shipmentNumber,
  publish,
  isPublished,
  userAccountType,
}) => {
  const [publishEnabled, setPublishEnabled] = React.useState(false);

  useEffect(() => {
    // const key = localStorage.getItem("publishEnabled");
    // if (key) {
    setPublishEnabled(true);
    // }
  }, []);

  return (
    <div className="px-[30px]">
      <div className="flex items-center gap-[15px] text-[26px]  leading-[1.2em] tracking-normal text-tm-black-80">
        <h1 className="font-bold">{productName}</h1>
        {/* <p className="font-light">#{shipmentNumber}</p> */}
        {publishEnabled &&
          userAccountType === AccountTypeEnum.BUYER &&
          (isPublished ? (
            <p className="flex items-center text-sm font-light text-tm-green">
              Published
              <span className="ml-2">
                <CheckCircle size={16} />
              </span>
            </p>
          ) : (
            <button
              onClick={() => {
                publish();
              }}
              className="rounded-md bg-tm-green px-2 py-1 text-sm text-tm-white"
            >
              Publish
            </button>
          ))}
      </div>
    </div>
  );
};

export default ShipmentDetailsHeader;
