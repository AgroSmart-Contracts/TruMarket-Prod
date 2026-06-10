import { Tab } from "@headlessui/react";
import classNames from "classnames";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { DealStatus, ShippingDetails } from "src/interfaces/shipment";
import Loading from "src/components/common/loading";

import ShipmentBox from "../shipment-box";
import NoData from "./no-data";

interface AllShipmentsProps {
  shipmentData?: ShippingDetails[];
  status: DealStatus;
  isBuyer: boolean;
  loading: boolean;
  footer?: React.ReactNode;
}

const AllShipments: React.FC<AllShipmentsProps> = ({
  shipmentData,
  status,
  isBuyer,
  loading,
  footer,
}) => {
  const { t } = useTranslation("dashboard");

  return (
    <div className="flex flex-col gap-[16px]">
      {loading ? (
        <Loading />
      ) : (
        <>
          {!shipmentData?.length ? (
            <NoData text={t("empty.noShipments")} />
          ) : (
            <>
              {shipmentData?.map((shipment, i) => (
                <ShipmentBox
                  supplierEmails={shipment.suppliers!}
                  buyerEmails={shipment.buyers!}
                  newDocuments={shipment.newDocuments!}
                  key={i}
                  shipment={shipment}
                  status={shipment.status as DealStatus}
                />
              ))}
            </>
          )}
          {footer}
        </>
      )}
    </div>
  );
};

export default AllShipments;
