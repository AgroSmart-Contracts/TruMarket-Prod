// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {DealVault} from "./DealVault.sol";

/**
 * @title DealVaultFactory
 * @notice Deploys per-deal `DealVault` instances so `DealsManager` stays under the 24KB limit.
 * @dev Bound to a single `DealsManager` at construction. Only that contract can deploy vaults,
 *      and it is always the vault owner. Deploy scripts pass the predicted `DealsManager`
 *      address; `DealsManager`'s constructor checks the binding.
 */
contract DealVaultFactory {
    /// @notice The only address allowed to deploy vaults through this factory
    address public immutable dealsManager;

    error UnauthorizedDeployer(address caller);

    constructor(address dealsManager_) {
        require(dealsManager_ != address(0), "Invalid deals manager");
        dealsManager = dealsManager_;
    }

    function deploy(
        address underlying,
        uint256 maxDeposit
    ) external returns (address vault) {
        if (msg.sender != dealsManager) revert UnauthorizedDeployer(msg.sender);
        vault = address(new DealVault(underlying, maxDeposit, maxDeposit, msg.sender));
    }
}
