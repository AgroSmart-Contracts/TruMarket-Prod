import { Package, Plus } from "@phosphor-icons/react";
import React from "react";
import { useRouter } from "next/router";

interface NoDataProps {
  text?: string;
}

const NoData: React.FC<NoDataProps> = ({ text }) => {

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="bg-green-50 rounded-full p-8">
            <Package size={80} weight="duotone" className="text-tm-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-tm-black-80 mb-3">{text || "No Data Available"}</h2>
        <p className="text-tm-black-60 mb-6">
          Get started by creating your first shipment to track and manage your agricultural trade.
        </p>
      </div>
    </div>
  );
};

export default NoData;
