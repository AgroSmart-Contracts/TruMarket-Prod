import { Tab } from "@headlessui/react";
import classNames from "classnames";
import React, { useEffect } from "react";

import { DealStatus, ShippingDetails } from "src/interfaces/shipment";
import { hasDocsWithLength } from "src/lib/helpers";

import ShipmentBox from "../shipment-box";
import NoData from "./no-data";

interface ActiveShipmentTabViewProps {
  shipmentData?: ShippingDetails[];
  status: DealStatus;
  isBuyer: boolean;
}

const ActiveShipmentTabView: React.FC<ActiveShipmentTabViewProps> = ({ shipmentData, status, isBuyer }) => {
  return (
    <div className="flex flex-col gap-[16px]">
      {!shipmentData?.length ? (
        <NoData text="No active Shipments" />
      ) : (
        <>
          {shipmentData?.map((shipment, i) => (
            <ShipmentBox
              supplierEmails={shipment.suppliers!}
              buyerEmails={shipment.buyers!}
              notStarted={!hasDocsWithLength(shipment.milestones)}
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

export default ActiveShipmentTabView;
