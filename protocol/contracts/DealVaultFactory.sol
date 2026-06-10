// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DealVault} from "./DealVault.sol";

/**
 * @title DealVaultFactory
 * @notice Deploys per-deal `DealVault` instances so `DealsManager` stays under the 24KB limit.
 */
contract DealVaultFactory {
    function deploy(
        address underlying,
        uint256 maxDeposit,
        address owner
    ) external returns (address vault) {
        vault = address(new DealVault(underlying, maxDeposit, maxDeposit, owner));
    }
}
