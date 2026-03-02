import React from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";

import Badge from "src/components/common/badge";
interface ShipmentTabHeadersProps {
  active: number;
  pending: number;
  finished: number;
  all: number;
}

const ShipmentTabHeaders: React.FC<ShipmentTabHeadersProps> = ({ pending, active, finished, all }) => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-1 inline-flex gap-1">
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-5 py-2.5 text-sm font-medium leading-[1.2em] outline-none transition-all duration-200",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">All</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-gray-100 text-gray-700": !selected,
              })}>
                {all}
              </span>
            </div>
          )}
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-5 py-2.5 text-sm font-medium leading-[1.2em] outline-none transition-all duration-200",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">Active</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-gray-100 text-gray-700": !selected,
              })}>
                {active}
              </span>
            </div>
          )}
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-5 py-2.5 text-sm font-medium leading-[1.2em] outline-none transition-all duration-200",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">Pending</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-orange-100 text-tm-accent": !selected,
              })}>
                {pending}
              </span>
            </div>
          )}
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-5 py-2.5 text-sm font-medium leading-[1.2em] outline-none transition-all duration-200",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">Finished</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-gray-100 text-gray-700": !selected,
              })}>
                {finished}
              </span>
            </div>
          )}
        </Tab>
      </div>
    </>
  );
};

export default ShipmentTabHeaders;
