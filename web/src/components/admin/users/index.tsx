import { Box, Paper, Table, TableBody, TableContainer, TableCell, TableRow, Button, Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { AdminService } from "src/controller/AdminAPI.service";
import EnhancedTableHead from "../base-table/table-head";

interface UsersProps { }

const headCells = [
  { id: "email", numeric: false, disablePadding: false, label: "Email" },
  { id: "accountType", numeric: false, disablePadding: false, label: "Account Type" },
  { id: "role", numeric: false, disablePadding: false, label: "Role" },
  { id: "walletAddress", numeric: false, disablePadding: false, label: "Wallet Address" },
];

const Users: React.FC<UsersProps> = () => {
  const {
    data: users,
    isLoading: isDealsDataLoading,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["get-users"],
    queryFn: () => AdminService.getUsers(),
    placeholderData: [],
  });

  return (
    <Box className="py-1" sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
        <TableContainer sx={{ height: `65vh` }}>
          <Table
            sx={{ minWidth: 750 }}
            stickyHeader
            aria-label="sticky table"
            aria-labelledby="tableTitle"
            size={"medium"}
          >
            <EnhancedTableHead
              numSelected={0}
              order={"asc"}
              orderBy={"email"}
              onRequestSort={() => { }}
              rowCount={users?.length || 0}
              headCells={headCells}
            />
            <TableBody>
              {users ? (
                users.map((user, index) => {
                  return (
                    <TableRow hover tabIndex={-1} key={user.id} sx={{ cursor: "pointer" }}>
                      <TableCell align="center">{user.email}</TableCell>
                      <TableCell align="center">{user.accountType}</TableCell>
                      <TableCell align="center">{user.role === 1 ? "Admin" : "User"}</TableCell>
                      <TableCell align="center">{user.walletAddress}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <div />
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Users;
