import { Chip } from "@mui/material";
import classNames from "classnames";
import React from "react";

import { DealStatus } from "src/interfaces/shipment";

interface DealStatusRenderedProps {
  status: DealStatus;
}

const DealStatusRendered: React.FC<DealStatusRenderedProps> = ({ status }) => {
  const statusColors = {
    [DealStatus.Cancelled]: "!bg-tm-danger",
    [DealStatus.Confirmed]: "!bg-tm-green",
    [DealStatus.Finished]: "!bg-tm-green",
    [DealStatus.Proposal]: "!bg-tm-yellow",
  };

  const statusToHumanReadable = {
    [DealStatus.Cancelled]: "Cancelled",
    [DealStatus.Confirmed]: "Confirmed",
    [DealStatus.Finished]: "Finished",
    [DealStatus.Proposal]: "Pending",
  };
  return (
    <Chip
      className={statusColors[status as keyof typeof statusColors]}
      label={
        <p className={classNames("text-[14px] font-bold capitalize text-tm-white")}>
          {statusToHumanReadable[status as keyof typeof statusToHumanReadable]}
        </p>
      }
    ></Chip>
  );
};

export default DealStatusRendered;
