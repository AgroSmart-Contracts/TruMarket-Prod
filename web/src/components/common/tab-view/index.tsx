import React from "react";
import { Tab } from "@headlessui/react";
import classNames from "classnames";

interface TabViewProps {
  tabHeaders: string[];
  tabContent: any[];
  selectedIndex?: number;
  onTabChange?: (index: number) => void;
}

const TabView: React.FC<TabViewProps> = ({ tabHeaders, tabContent, selectedIndex, onTabChange }) => {
  return (
    <Tab.Group selectedIndex={selectedIndex} onChange={onTabChange}>
      <Tab.List className="flex gap-2">
        {tabHeaders.map((category, i) => (
          <Tab
            key={category}
            className={({ selected }) =>
              classNames(
                "flex-1 px-6 py-3 text-sm font-semibold rounded-tm-md transition-all duration-200 outline-none",
                {
                  "bg-tm-primary text-tm-white shadow-tm-primary": selected,
                  "bg-tm-neutral text-tm-text hover:bg-tm-neutral-dark": !selected,
                },
              )
            }
          >
            {category}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {tabContent.map((view, i) => (
          <Tab.Panel
            key={i}
            className={classNames(
              "rounded-tm-lg pt-8 pb-4",
            )}
          >
            {view}
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default TabView;
