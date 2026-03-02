import React, { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { useRouter } from "next/router";
import { Plus } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";

import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum } from "src/interfaces/global";
import { DealStatus } from "src/interfaces/shipment";
import { useUserInfo } from "src/lib/hooks/useUserInfo";

import ActiveShipmentTabView from "./active-shipment-tab-view";
import AllShipments from "./all-shipments";
import FinishedShipmentTabView from "./finished-shipment-tab-view";
import PendingShipmentTabView from "./pending-shipment-tab-view";
import ShipmentTabHeaders from "./shipment-tab-header";

interface TabViewProps { }

const ShipmentTabView: React.FC<TabViewProps> = () => {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { accountType } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;

  // const dealStatus = {
  //   0: DealStatus.Confirmed,
  //   1: DealStatus.Proposal,
  //   2: DealStatus.Finished,
  // };

  //!! TODO it should be converted to single API call after there will be endpoint to fetch `Count` for each status
  const { data: confirmedShipmentList, isLoading: isConfirmedShipmentListLoading } = useQuery({
    queryKey: ["get-confirmed-shipments"],
    queryFn: () => ShipmentService.getShipments(DealStatus.Confirmed),
    initialData: [],
  });

  const { data: pendingShipmentList, isLoading: isPendingShipmentListLoading } = useQuery({
    queryKey: ["get-pending-shipments"],
    queryFn: () => ShipmentService.getShipments(DealStatus.Proposal),
    initialData: [],
  });

  const { data: finishedShipmentList, isLoading: isFinishedShipmentListLoading } = useQuery({
    queryKey: ["get-finished-shipments"],
    queryFn: () => ShipmentService.getShipments(DealStatus.Finished),
    initialData: [],
  });

  const dataLength =
    Number(confirmedShipmentList?.length) + Number(pendingShipmentList?.length) + Number(finishedShipmentList?.length);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-lg shadow-sm py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-tm-black-80 mb-2">Shipments Dashboard</h1>
            <p className="text-tm-black-60">Manage and track all your agricultural trade shipments</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/create-shipment")}
            className="bg-tm-primary hover:bg-tm-primary-dark text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
          >
            <Plus size={20} weight="bold" />
            <span className="text-[14px] uppercase tracking-wide">New Shipment</span>
          </button>
        </div>
      </div>

      {/* Shipments Tabs */}
      <Tab.Group defaultIndex={1} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
        <Tab.List>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <ShipmentTabHeaders
                all={dataLength || 0}
                active={confirmedShipmentList?.length || 0}
                pending={pendingShipmentList?.length || 0}
                finished={finishedShipmentList?.length || 0}
              />
            </div>
          </div>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className={classNames("rounded-[4px]  rounded-br-[4px] bg-[#ffffff80]  p-[20px]")}>
            <AllShipments
              isBuyer={isBuyer}
              shipmentData={[...confirmedShipmentList, ...pendingShipmentList, ...finishedShipmentList]}
              status={DealStatus.All}
              loading={isConfirmedShipmentListLoading || isPendingShipmentListLoading || isFinishedShipmentListLoading}
            />
          </Tab.Panel>
          <Tab.Panel className={classNames("rounded-[4px]  rounded-br-[4px] bg-[#ffffff80]  p-[20px]")}>
            <ActiveShipmentTabView isBuyer={isBuyer} shipmentData={confirmedShipmentList} status={DealStatus.Confirmed} />
          </Tab.Panel>
          <Tab.Panel className={classNames("rounded-[4px]  rounded-br-[4px]  bg-[#ffffff80]  p-[20px]")}>
            <PendingShipmentTabView isBuyer={isBuyer} shipmentData={pendingShipmentList} status={DealStatus.Proposal} />
          </Tab.Panel>
          <Tab.Panel className={classNames("rounded-[4px]  rounded-br-[4px] bg-[#ffffff80]  p-[20px]")}>
            <FinishedShipmentTabView isBuyer={isBuyer} shipmentData={finishedShipmentList} status={DealStatus.Finished} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default ShipmentTabView;
