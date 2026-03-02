import { ShippingDetails } from "src/interfaces/shipment";

export const headCells = [
  {
    id: "id",
    numeric: false,
    disablePadding: true,
    label: "Agreement ID",
  },
  {
    id: "suppliers",
    numeric: false,
    disablePadding: true,
    label: "Suppliers",
  },
  {
    id: "buyers",
    numeric: false,
    disablePadding: true,
    label: "Buyers",
  },
  {
    id: "currentMilestone",
    numeric: true,
    disablePadding: false,
    label: "Current Milestone",
  },
  {
    id: "transport",
    numeric: true,
    disablePadding: false,
    label: "Transport",
  },
  {
    id: "origin",
    numeric: true,
    disablePadding: false,
    label: "Origin Country/Port",
  },
  {
    id: "destination",
    numeric: true,
    disablePadding: false,
    label: "Destination Country/Port",
  },
  {
    id: "status",
    numeric: true,
    disablePadding: false,
    label: "Status",
  },
  {
    id: "nftID",
    numeric: true,
    disablePadding: false,
    label: "nftID",
  },
  {
    id: "mintTxHash",
    numeric: true,
    disablePadding: false,
    label: "Agreement acceptance Tx Hash",
  },
  {
    id: "nftLogs",
    numeric: true,
    disablePadding: false,
    label: "Check NFT logs",
  },
  {
    id: "details",
    numeric: true,
    disablePadding: false,
    label: "Details",
  },
  {
    id: "delete",
    numeric: true,
    disablePadding: false,
    label: "Delete",
  },
];
