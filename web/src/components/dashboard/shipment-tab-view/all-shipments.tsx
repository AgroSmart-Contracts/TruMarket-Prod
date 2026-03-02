import { Tab } from "@headlessui/react";
import classNames from "classnames";
import React, { useEffect } from "react";

import { DealStatus, ShippingDetails } from "src/interfaces/shipment";
import { hasDocsWithLength } from "src/lib/helpers";
import Loading from "src/components/common/loading";

import ShipmentBox from "../shipment-box";
import NoData from "./no-data";

interface AllShipmentsProps {
  shipmentData?: ShippingDetails[];
  status: DealStatus;
  isBuyer: boolean;
  loading: boolean;
}

const AllShipments: React.FC<AllShipmentsProps> = ({ shipmentData, status, isBuyer, loading }) => {
  return (
    <div className="flex flex-col gap-[16px]">
      {loading ? (
        <Loading />
      ) : (
        <>
          {!shipmentData?.length ? (
            <NoData text="No Shipments to show" />
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
                  status={shipment.status as DealStatus}
                />
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default AllShipments;
