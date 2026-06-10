// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IDealVault {
    function pause() external;

    function unpause() external;

    function blockDeposits() external;

    function unblockDeposits() external;

    function complete() external;

    function donate(uint256 amount) external;

    function transferToBorrower(address borrower, uint256 amount) external;

    function totalAssets() external view returns (uint256);
}
