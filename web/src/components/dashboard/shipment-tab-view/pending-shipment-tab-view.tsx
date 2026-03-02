import { Tab } from "@headlessui/react";
import classNames from "classnames";
import React, { useEffect } from "react";

import { DealStatus } from "src/interfaces/shipment";

import ShipmentBox from "../shipment-box";
import NoData from "./no-data";

interface PendingShipmentTabViewProps {
  shipmentData?: any[];
  status: DealStatus;
  isBuyer: boolean;
}

const PendingShipmentTabView: React.FC<PendingShipmentTabViewProps> = ({ shipmentData, status, isBuyer }) => {
  return (
    <div className="flex flex-col gap-[16px]">
      {!shipmentData?.length ? (
        <NoData text="No pending shipments to show" />
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

export default PendingShipmentTabView;
