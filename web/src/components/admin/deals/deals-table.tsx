import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Badge, Chip, Divider, TableCell, TableRow } from "@mui/material";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FolderIcon from "@mui/icons-material/Folder";
import { useWindowSize } from "react-use";
import FileOpenIcon from "@mui/icons-material/FileOpen";

import { Order } from "src/interfaces/admin";
import { ShippingDetails } from "src/interfaces/shipment";
import { milestones } from "src/lib/static";
import { IMilestoneDetails, ITransportType, MilestoneEnum } from "src/interfaces/global";
import { CopyToClipBoard, getCountryCode, truncateContractAddress } from "src/lib/helpers";
import Button, { ButtonVariants } from "src/components/common/button";

import EnhancedTableHead from "../base-table/table-head";
import { headCells } from "./static";
import ParticipantTag from "./participant-tag";
import DealStatusRendered from "./deal-status";
import CountryTag from "./country-tag";

export default function DealsTable({
  dealsData,
  handleOpenShipmentDetailsModal,
  handleOpenDeleteAgreementModal,
  handleOpenMilestoneFilesModal,
  handleOpenNftLogsModal,
}: {
  dealsData: ShippingDetails[];
  handleOpenShipmentDetailsModal: (shipmentDetails: ShippingDetails) => void;
  handleOpenDeleteAgreementModal: (agreementId: string) => void;
  handleOpenMilestoneFilesModal: (milestone: IMilestoneDetails[]) => void;
  handleOpenNftLogsModal: (id: string) => void;
}) {
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<keyof ShippingDetails>("nftID");
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [dense, setDense] = useState(false);
  const { height } = useWindowSize();
  const [windowHeight, setWindowHeight] = useState(height);

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ShippingDetails) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
        <TableContainer sx={{ height: `65vh` }}>
          <Table
            sx={{ minWidth: 750 }}
            stickyHeader
            aria-label="sticky table"
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={0}
              headCells={headCells}
            />
            <TableBody>
              {dealsData?.map((row, index) => {
                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    key={row.id}
                    sx={{ cursor: "pointer" }}
                    // onClick={() => handleOpenShipmentDetailsModal(row)}
                  >
                    <TableCell align="center">
                      <p className="text-tm-black-80">#{row.id}</p>
                    </TableCell>
                    <TableCell align="center">
                      {row.suppliers.map((supplier) => (
                        <ParticipantTag key={supplier.id} email={supplier.email} approved={supplier?.approved} />
                      ))}
                    </TableCell>
                    <TableCell align="center">
                      {row.buyers.map((buyer) => (
                        <ParticipantTag key={buyer.id} email={buyer.email} approved={buyer?.approved} />
                      ))}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={
                          milestones[
                            row.currentMilestone > MilestoneEnum.M6 ? row.currentMilestone - 1 : row.currentMilestone
                          ]?.label
                        }
                        icon={
                          <Badge
                            badgeContent={
                              row.milestones[
                                row.currentMilestone > MilestoneEnum.M6
                                  ? row.currentMilestone - 1
                                  : row.currentMilestone
                              ]?.docs.length
                            }
                            color="primary"
                          >
                            <FileOpenIcon color="action" />
                          </Badge>
                        }
                        onClick={() => handleOpenMilestoneFilesModal(row.milestones)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {row.transport === ITransportType.BY_AIR ? (
                        <Chip label="By Air" icon={<AirplanemodeActiveIcon />} />
                      ) : (
                        <Chip label="By Sea" icon={<DirectionsBoatIcon />} />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <CountryTag
                        countryCode={getCountryCode(row.origin)}
                        address={`${row.origin}, ${row.portOfOrigin}`}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <CountryTag
                        countryCode={getCountryCode(row.destination)}
                        address={`${row.destination}, ${row.portOfDestination}`}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <DealStatusRendered status={row.status} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={row.nftID || "Not Minted"} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={truncateContractAddress(row.mintTxHash) || "Not Minted"}
                        icon={row.mintTxHash ? <ContentCopyIcon /> : undefined}
                        onClick={() =>
                          CopyToClipBoard(row.mintTxHash, "transaction hash successfully copied on your clipboard!")
                        }
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Button disabled={!row.mintTxHash} onClick={() => handleOpenNftLogsModal(row.id)}>
                        <p className="whitespace-nowrap text-[14px] font-bold">Nft Logs</p>
                      </Button>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "250px" }}>
                      <Button onClick={() => handleOpenShipmentDetailsModal(row)}>
                        <p className="text-[14px] font-bold">Details</p>
                      </Button>
                    </TableCell>
                    <TableCell align="center" sx={{ width: "250px" }}>
                      <Button
                        variant={ButtonVariants.FILLED_DANGER}
                        onClick={() => handleOpenDeleteAgreementModal(row.id)}
                      >
                        <p className="text-[14px] font-bold text-tm-white">Delete</p>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
