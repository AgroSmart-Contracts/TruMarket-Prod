import {
  Farm,
  Factory,
  Package,
  Truck,
  Anchor,
  Boat,
  Spinner,
  WarningCircle,
  CheckCircle,
} from "@phosphor-icons/react";

import { MilestoneEnum } from "src/interfaces/global";

import countryList from "./country-list.json";

export const productQualityOptions = [
  { value: "CAT1", label: "CAT1" },
  { value: "CAT2", label: "CAT2" },
  { value: "industrial", label: "industrial" },
];

export const countryOrigins = countryList.map((country) => {
  return {
    label: country.name,
    value: country.name,
  };
});

export const milestones = [
  {
    id: "",
    value: "production_and_fields",
    label: "Production and Fields",
    icon: <Farm weight="duotone" size={26} />,
    milestone: MilestoneEnum.M,
  },
  {
    id: "",
    value: "packaging_and_process",
    label: "Packaging and Process",
    icon: <Factory weight="duotone" size={26} />,
    milestone: MilestoneEnum.M1,
  },
  {
    id: "",
    value: "finished_product_and_storage",
    label: "Finished Product and Storage",
    icon: <Package weight="duotone" size={26} />,
    milestone: MilestoneEnum.M2,
  },
  {
    id: "",
    value: "transport_to_port_of_origin",
    label: "Transportation to Port of Origin",
    icon: <Truck weight="duotone" size={26} />,
    milestone: MilestoneEnum.M3,
  },
  {
    id: "",
    value: "port_of_origin",
    label: "Port of Origin",
    icon: <Anchor weight="duotone" size={26} />,
    milestone: MilestoneEnum.M4,
  },
  {
    id: "",
    value: "transit",
    label: "Transit",
    icon: <Boat weight="duotone" size={26} />,
    milestone: MilestoneEnum.M5,
  },
  {
    id: "",
    value: "port_of_destination",
    label: "Port of Destination",
    icon: <Anchor weight="duotone" size={26} />,
    milestone: MilestoneEnum.M6,
  },
];
