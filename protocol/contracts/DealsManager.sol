// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {DealVaultFactory} from "./DealVaultFactory.sol";
import {IDealVault} from "./interfaces/IDealVault.sol";

/**
 * @title DealsManager
 * @author TruMarket
 *
 * @dev On-chain deal registry for TruMarket shipment finance.
 *
 * ## v2.0+ (Lagoon liquidity pool, off-chain milestones & payments)
 * - Investor USDC flows through a shared Lagoon pool (separate contracts).
 * - Milestones and supplier payouts are tracked off-chain (API / MongoDB).
 * - This contract provides deal identity (ERC-721), per-deal USDC vault bookkeeping,
 *   borrower repayment (`donateToDeal`), and admin vault transfers.
 *
 * @notice Ownable registry of deal NFTs (`TMD`). No on-chain milestone engine.
 */
contract DealsManager is ERC721, Ownable2Step, ReentrancyGuard {
    /// @notice Emitted when a new deal is created
    event DealCreated(
        uint256 indexed dealId,
        address indexed borrower,
        uint256 maxDeposit
    );
    /// @notice Emitted when a deal is completed
    event DealCompleted(uint256 indexed dealId);
    /// @notice Emitted when a deal's borrower is changed
    event DealBorrowerChanged(
        uint256 indexed dealId,
        address indexed oldBorrower,
        address indexed newBorrower
    );
    /// @notice Emitted when a borrower donates to a deal
    event BorrowerDonation(
        uint256 indexed dealId,
        address indexed borrower,
        uint256 amount
    );
    /// @notice Emitted when funds are transferred from a deal's vault
    event VaultFundsTransferred(
        uint256 indexed dealId,
        address indexed recipient,
        uint256 amount
    );

    struct Deal {
        bool completed;
        address vault;
        uint256 maxDeposit;
        address borrower;
    }

    /// @notice Address of the underlying token (e.g., USDC)
    address private _underlying;
    /// @notice Factory that deploys per-deal vaults (keeps this contract under 24KB)
    DealVaultFactory private immutable _vaultFactory;
    /// @notice Counter for the next token ID
    uint256 private _nextTokenId;
    /// @notice Array of all deals
    Deal[] private _deals;

    constructor(
        address initialOwner_,
        address underlying_,
        address vaultFactory_
    ) ERC721("TruMarketDeals", "TMD") Ownable(initialOwner_) {
        require(underlying_ != address(0), "Invalid underlying token");
        require(vaultFactory_ != address(0), "Invalid vault factory");
        _underlying = underlying_;
        _vaultFactory = DealVaultFactory(vaultFactory_);
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        super.transferOwnership(newOwner);
    }

    /**
     * @notice Registers a new deal as an ERC-721 and deploys its `DealVault`.
     * @param maxDeposit_ Maximum deposit / repayment reference amount for the vault
     * @param borrower_ Borrower wallet (buyer) for `donateToDeal`
     */
    function mint(
        uint256 maxDeposit_,
        address borrower_
    ) public onlyOwner nonReentrant {
        require(borrower_ != address(0), "Invalid borrower address");
        require(maxDeposit_ > 0, "Max deposit must be positive");

        uint256 tokenId = _nextTokenId++;

        address vaultAddress = _vaultFactory.deploy(
            _underlying,
            maxDeposit_,
            address(this)
        );

        // v2.0: investor deposits use the Lagoon pool; freeze direct vault deposits.
        IDealVault(vaultAddress).pause();
        IDealVault(vaultAddress).blockDeposits();

        _deals.push(
            Deal({
                completed: false,
                vault: vaultAddress,
                maxDeposit: maxDeposit_,
                borrower: borrower_
            })
        );

        _safeMint(msg.sender, tokenId);

        emit DealCreated(tokenId, borrower_, maxDeposit_);
    }

    function completed(uint256 tokenId_) public view returns (bool) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].completed;
    }

    function vault(uint256 tokenId_) public view returns (address) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].vault;
    }

    function maxDeposit(uint256 tokenId_) public view returns (uint256) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].maxDeposit;
    }

    function borrower(uint256 tokenId_) public view returns (address) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].borrower;
    }

    /**
     * @notice Marks a deal completed. Unlocks the vault when repayment exceeds `maxDeposit`.
     */
    function setDealCompleted(uint256 tokenId_) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(!_deals[tokenId_].completed, "Deal already completed");

        IDealVault dealVault = IDealVault(_deals[tokenId_].vault);
        uint256 assets = dealVault.totalAssets();
        if (assets > _deals[tokenId_].maxDeposit) {
            dealVault.complete();
        }

        _deals[tokenId_].completed = true;
        emit DealCompleted(tokenId_);
    }

    function changeDealBorrower(
        uint256 tokenId_,
        address newBorrower_
    ) public onlyOwner {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(newBorrower_ != address(0), "Invalid borrower address");
        require(newBorrower_ != _deals[tokenId_].borrower, "Same borrower");

        address oldBorrower = _deals[tokenId_].borrower;
        _deals[tokenId_].borrower = newBorrower_;

        emit DealBorrowerChanged(tokenId_, oldBorrower, newBorrower_);
    }

    function donateToDeal(
        uint256 tokenId_,
        uint256 amount
    ) public nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(
            msg.sender == _deals[tokenId_].borrower,
            "Only borrower can donate"
        );
        require(amount > 0, "Amount must be positive");

        IERC20(_underlying).transferFrom(msg.sender, address(this), amount);
        IERC20(_underlying).approve(_deals[tokenId_].vault, amount);
        IDealVault(_deals[tokenId_].vault).donate(amount);

        emit BorrowerDonation(tokenId_, msg.sender, amount);
    }

    /**
     * @notice Re-enables direct vault deposits (legacy v1.x / test helpers only).
     */
    function reopenVault(uint256 tokenId_) external onlyOwner {
        require(tokenId_ < _nextTokenId, "Deal not found");
        IDealVault dealVault = IDealVault(_deals[tokenId_].vault);
        dealVault.unpause();
        dealVault.unblockDeposits();
    }

    function transferFromVault(
        uint256 tokenId_,
        uint256 amount,
        bool toBorrower
    ) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(amount > 0, "Amount must be positive");

        address recipient = toBorrower ? _deals[tokenId_].borrower : owner();
        require(recipient != address(0), "Invalid recipient address");

        IDealVault(_deals[tokenId_].vault).transferToBorrower(recipient, amount);

        emit VaultFundsTransferred(tokenId_, recipient, amount);
    }
}
