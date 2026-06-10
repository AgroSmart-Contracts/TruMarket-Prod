import React, { useMemo, useState } from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { useRouter } from "next/router";
import { Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum } from "src/interfaces/global";
import { DealStatus } from "src/interfaces/shipment";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import DrawbackRecoveryBanner from "src/components/dashboard/drawback/DrawbackRecoveryBanner";
import { summarizeDrawbackRecovery } from "src/lib/drawback";

import ActiveShipmentTabView from "./active-shipment-tab-view";
import AllShipments from "./all-shipments";
import FinishedShipmentTabView from "./finished-shipment-tab-view";
import ShipmentTabHeaders from "./shipment-tab-header";

const ShipmentTabView: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const isSupplier = accountType === AccountTypeEnum.SUPPLIER;

  const {
    data: confirmedShipmentList = [],
    isPending: isConfirmedPending,
    isFetching: isConfirmedFetching,
  } = useQuery({
    queryKey: ["get-confirmed-shipments"],
    queryFn: () => ShipmentService.getShipments(DealStatus.Confirmed),
    staleTime: 60_000,
  });

  const {
    data: finishedShipmentList = [],
    isPending: isFinishedPending,
    isFetching: isFinishedFetching,
  } = useQuery({
    queryKey: ["get-finished-shipments"],
    queryFn: () => ShipmentService.getShipments(DealStatus.Finished),
    staleTime: 60_000,
  });

  const allDeals = useMemo(
    () => [...confirmedShipmentList, ...finishedShipmentList],
    [confirmedShipmentList, finishedShipmentList],
  );

  const loading =
    isConfirmedPending ||
    isConfirmedFetching ||
    isFinishedPending ||
    isFinishedFetching;
  const drawbackSummary = summarizeDrawbackRecovery(allDeals);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="rounded-lg bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-1 text-2xl font-bold text-tm-black-80 sm:mb-2 sm:text-3xl">{t("title")}</h1>
            <p className="text-sm text-tm-black-60 sm:text-base">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/dashboard/create-shipment")}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-tm-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all duration-200 hover:bg-tm-primary-dark hover:shadow-lg sm:w-auto sm:px-6 sm:py-3"
          >
            <Plus size={20} weight="bold" />
            <span>{t("newShipment")}</span>
          </button>
        </div>
      </div>

      {isSupplier ? <DrawbackRecoveryBanner summary={drawbackSummary} /> : null}

      <Tab.Group defaultIndex={1} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List className="overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
          <ShipmentTabHeaders
            all={loading ? undefined : allDeals.length}
            active={loading ? undefined : confirmedShipmentList.length}
            finished={loading ? undefined : finishedShipmentList.length}
          />
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className={classNames("rounded-[4px] rounded-br-[4px] bg-[#ffffff80] p-4 sm:p-5 lg:p-[20px]")}>
            <AllShipments
              isBuyer={isBuyer}
              shipmentData={allDeals}
              status={DealStatus.All}
              loading={loading}
            />
          </Tab.Panel>
          <Tab.Panel className={classNames("rounded-[4px] rounded-br-[4px] bg-[#ffffff80] p-4 sm:p-5 lg:p-[20px]")}>
            <ActiveShipmentTabView
              isBuyer={isBuyer}
              shipmentData={confirmedShipmentList}
              status={DealStatus.Confirmed}
              loading={loading}
            />
          </Tab.Panel>
          <Tab.Panel className={classNames("rounded-[4px] rounded-br-[4px] bg-[#ffffff80] p-4 sm:p-5 lg:p-[20px]")}>
            <FinishedShipmentTabView
              isBuyer={isBuyer}
              shipmentData={finishedShipmentList}
              status={DealStatus.Finished}
              loading={loading}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ShipmentTabView;
