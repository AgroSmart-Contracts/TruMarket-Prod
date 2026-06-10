import React from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";
interface ShipmentTabHeadersProps {
  active?: number;
  finished?: number;
  all?: number;
}

const ShipmentTabHeaders: React.FC<ShipmentTabHeadersProps> = ({ active, finished, all }) => {
  const { t } = useTranslation("dashboard");

  return (
    <>
      <div className="inline-flex min-w-max gap-1 rounded-lg bg-white p-1 shadow-sm">
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-3 py-2 text-xs font-medium leading-[1.2em] outline-none transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">{t("tabs.all")}</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-gray-100 text-gray-700": !selected,
              })}>
                {all ?? "—"}
              </span>
            </div>
          )}
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-3 py-2 text-xs font-medium leading-[1.2em] outline-none transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">{t("tabs.active")}</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-gray-100 text-gray-700": !selected,
              })}>
                {active ?? "—"}
              </span>
            </div>
          )}
        </Tab>
        <Tab
          className={({ selected }) =>
            classNames(
              "rounded-md px-3 py-2 text-xs font-medium leading-[1.2em] outline-none transition-all duration-200 sm:px-5 sm:py-2.5 sm:text-sm",
              {
                "bg-tm-primary text-white shadow-md": selected,
                "text-tm-black-60 hover:bg-tm-neutral-light hover:text-tm-black-80": !selected,
              },
            )
          }
        >
          {({ selected }) => (
            <div className="flex items-center gap-2">
              <span className="font-bold uppercase">{t("tabs.finished")}</span>
              <span className={classNames("text-xs font-semibold px-2 py-0.5 rounded-full min-w-[24px] text-center", {
                "bg-white/20 text-white": selected,
                "bg-gray-100 text-gray-700": !selected,
              })}>
                {finished ?? "—"}
              </span>
            </div>
          )}
        </Tab>
      </div>
    </>
  );
};

export default ShipmentTabHeaders;
