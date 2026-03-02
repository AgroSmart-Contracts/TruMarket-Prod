import { Tab } from "@headlessui/react";
import classNames from "classnames";
import React, { useEffect } from "react";

import { DealStatus } from "src/interfaces/shipment";

import ShipmentBox from "../shipment-box";
import NoData from "./no-data";

interface FinishedShipmentTabViewProps {
  shipmentData?: any[];
  status: DealStatus;
  isBuyer: boolean;
}

const FinishedShipmentTabView: React.FC<FinishedShipmentTabViewProps> = ({ shipmentData, status, isBuyer }) => {
  return (
    <div className="flex flex-col gap-[16px]">
      {!shipmentData?.length ? (
        <NoData text="No finished shipments to show" />
      ) : (
        <>
          {shipmentData?.map((shipment, i) => (
            <ShipmentBox
              supplierEmails={shipment.suppliers!}
              buyerEmails={shipment.buyers!}
              notStarted={false}
              isNew={shipment.newForBuyer!}
              newDocuments={shipment.newDocuments!}
              key={i}
              shipment={shipment}
              status={status}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default FinishedShipmentTabView;
