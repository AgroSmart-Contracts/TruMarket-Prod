// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ReentrantERC20Mock
/// @notice Test-only token that calls back into a target during `transfer` / `transferFrom`.
///         Used to show the `nonReentrant` guards work. Not deployed to production.
contract ReentrantERC20Mock is ERC20 {
    address private _hookTarget;
    bytes private _hookData;

    constructor() ERC20("ReentrantERC20Mock", "RE20M") {}

    function mint(address account, uint256 amount) external {
        _mint(account, amount);
    }

    /// @notice Arms a one-shot callback, fired on the next transfer / transferFrom.
    function setHook(address target, bytes calldata data) external {
        _hookTarget = target;
        _hookData = data;
    }

    function transfer(address to, uint256 value) public override returns (bool) {
        _runHook();
        return super.transfer(to, value);
    }

    function transferFrom(address from, address to, uint256 value) public override returns (bool) {
        _runHook();
        return super.transferFrom(from, to, value);
    }

    function _runHook() private {
        address target = _hookTarget;
        if (target == address(0)) return;
        _hookTarget = address(0);
        (bool ok, bytes memory ret) = target.call(_hookData);
        if (!ok) {
            assembly {
                revert(add(ret, 32), mload(ret))
            }
        }
    }
}
