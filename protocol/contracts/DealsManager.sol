// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import {DealVault} from "./DealVault.sol";

/**
 * @title DealsManager
 * @dev Manages the creation and progression of deals with milestone-based fund releases
 * @notice This contract handles deal creation, milestone progression, and fund management
 */
contract DealsManager is ERC721, Ownable2Step, ReentrancyGuard {
    /// @notice Emitted when a new deal is created
    event DealCreated(
        uint256 indexed dealId,
        address indexed borrower,
        uint256 maxDeposit
    );
    /// @notice Emitted when a deal milestone is changed
    event DealMilestoneChanged(
        uint256 indexed dealId,
        uint8 milestone,
        uint256 amountTransferred
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

    /// @dev Structure representing a deal
    struct Deal {
        uint8 status; // Current status of the deal
        uint8[7] milestones; // Milestone percentages
        address vault; // Address of the deal's vault
        uint256 maxDeposit; // Maximum deposit amount
        address borrower; // Address of the borrower
    }

    /// @notice Address of the underlying token (e.g., USDC)
    address private _underlying;
    /// @notice Counter for the next token ID
    uint256 private _nextTokenId;
    /// @notice Array of all deals
    Deal[] private _deals;

    /**
     * @dev Initializes the contract with the owner and underlying token
     * @param initialOwner_ Address of the initial owner
     * @param underlying_ Address of the underlying token
     */
    constructor(
        address initialOwner_,
        address underlying_
    ) ERC721("TruMarketDeals", "TMD") Ownable(initialOwner_) {
        require(underlying_ != address(0), "Invalid underlying token");
        _underlying = underlying_;
    }

    /**
     * @dev Override transferOwnership to add zero address check
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) public override onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        super.transferOwnership(newOwner);
    }

    /**
     * @notice Creates a new deal with specified milestones
     * @dev Includes reentrancy protection and input validation
     * @param milestones_ Array of milestone percentages (must sum to 100)
     * @param maxDeposit_ Maximum deposit amount for the deal
     * @param borrower_ Address of the borrower
     */
    function mint(
        uint8[7] memory milestones_,
        uint256 maxDeposit_,
        address borrower_
    ) public onlyOwner nonReentrant {
        require(borrower_ != address(0), "Invalid borrower address");
        require(maxDeposit_ > 0, "Max deposit must be positive");
        require(milestones_.length == 7, "Invalid milestones length");

        uint256 tokenId = _nextTokenId++;

        uint256 sum = 0;
        for (uint i = 0; i < milestones_.length; i++) {
            sum += uint256(milestones_[i]);
        }

        require(sum == 100, "Milestones distribution should be 100");

        address vaultAddress = address(
            new DealVault(_underlying, maxDeposit_, maxDeposit_, address(this))
        );

        Deal memory deal = Deal(0, milestones_, vaultAddress, maxDeposit_, borrower_);

        _deals.push(deal);

        _safeMint(msg.sender, tokenId);

        emit DealCreated(tokenId, borrower_, maxDeposit_);
    }

    /**
     * @notice Returns the milestones for a specific deal
     * @param tokenId_ ID of the deal
     * @return Array of milestone percentages
     */
    function milestones(
        uint256 tokenId_
    ) public view returns (uint8[7] memory) {
        require(tokenId_ <= _nextTokenId, "Deal not found");
        return _deals[tokenId_].milestones;
    }

    /**
     * @notice Returns the status of a specific deal
     * @param tokenId_ ID of the deal
     * @return Current status of the deal
     */
    function status(uint256 tokenId_) public view returns (uint8) {
        require(tokenId_ <= _nextTokenId, "Deal not found");
        return _deals[tokenId_].status;
    }

    /**
     * @notice Returns the vault address for a specific deal
     * @param tokenId_ ID of the deal
     * @return Address of the deal's vault
     */
    function vault(uint256 tokenId_) public view returns (address) {
        require(tokenId_ <= _nextTokenId, "Deal not found");
        return _deals[tokenId_].vault;
    }

    /**
     * @notice Returns the maximum deposit amount for a specific deal
     * @param tokenId_ ID of the deal
     * @return Maximum deposit amount
     */
    function maxDeposit(uint256 tokenId_) public view returns (uint256) {
        require(tokenId_ <= _nextTokenId, "Deal not found");
        return _deals[tokenId_].maxDeposit;
    }

    /**
     * @notice Proceeds to the next milestone of a deal
     * @dev Includes reentrancy protection and milestone validation
     * @param tokenId_ ID of the deal
     * @param milestone_ Next milestone number
     */
    function proceed(
        uint256 tokenId_,
        uint8 milestone_
    ) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(
            _deals[tokenId_].status + 1 == milestone_,
            "wrong milestone to proceed to"
        );
        require(milestone_ > 0 && milestone_ < 8, "Invalid milestone");

        if (milestone_ == 1) {
            // Deals can start regardless of funding level
            // Pause and block deposits when starting the deal
            DealVault(_deals[tokenId_].vault).pause();
            DealVault(_deals[tokenId_].vault).blockDeposits();
        }

        // Transfer funds based on milestone percentage of available assets
        // For partially funded deals, transfers percentage of what's actually available
        // This allows partially filled vaults to be fully drained through milestones
        // For off-chain deals with empty vaults, no transfer occurs (amountTransferred = 0)
        uint256 amountTransferred = 0;
        if (_deals[tokenId_].milestones[milestone_ - 1] != 0) {
            uint256 vaultAssets = DealVault(_deals[tokenId_].vault)
                .totalAssets();

            if (vaultAssets > 0) {
                // Calculate transfer amount as percentage of available assets
                // This ensures proportional distribution for partially funded deals
                uint256 amountToTransfer = Math.mulDiv(
                    vaultAssets,
                    _deals[tokenId_].milestones[milestone_ - 1],
                    100
                );

                // Transfer funds if amount is positive
                if (amountToTransfer > 0) {
                    DealVault(_deals[tokenId_].vault).transferToBorrower(
                        _deals[tokenId_].borrower,
                        amountToTransfer
                    );
                    amountTransferred = amountToTransfer;
                }
            }
            // If vault is empty (off-chain deal), amountTransferred remains 0
        }

        _deals[tokenId_].status++;
        emit DealMilestoneChanged(tokenId_, milestone_, amountTransferred);
    }

    /**
     * @notice Marks a deal as completed
     * @dev Includes reentrancy protection and status validation
     * @param tokenId_ ID of the deal
     */
    function setDealCompleted(uint256 tokenId_) public onlyOwner nonReentrant {
        require(tokenId_ <= _nextTokenId, "Deal not found");
        require(
            _deals[tokenId_].status == 7,
            "all milestones must be completed"
        );

        DealVault(_deals[tokenId_].vault).complete();

        _deals[tokenId_].status++;
        emit DealCompleted(tokenId_);
    }

    /**
     * @notice Changes the borrower of a deal
     * @dev Only callable by the owner
     * @param tokenId_ ID of the deal
     * @param newBorrower_ Address of the new borrower
     */
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

    /**
     * @notice Allows a borrower to donate funds to their deal's vault
     * @dev Includes reentrancy protection and borrower validation
     * @param tokenId_ ID of the deal
     * @param amount Amount of underlying tokens to donate
     */
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

        // Transfer tokens from borrower to DealsManager
        IERC20(_underlying).transferFrom(msg.sender, address(this), amount);

        // Approve the vault to spend the tokens
        IERC20(_underlying).approve(_deals[tokenId_].vault, amount);

        // Call donate on the vault
        DealVault(_deals[tokenId_].vault).donate(amount);

        emit BorrowerDonation(tokenId_, msg.sender, amount);
    }

    /**
     * @notice Allows the owner to transfer funds from a deal's vault to either the borrower or themselves
     * @dev Only callable by the owner and includes reentrancy protection
     * @param tokenId_ ID of the deal
     * @param amount Amount of underlying tokens to transfer
     * @param toBorrower If true, transfer to borrower; if false, transfer to owner
     */
    function transferFromVault(
        uint256 tokenId_,
        uint256 amount,
        bool toBorrower
    ) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(amount > 0, "Amount must be positive");

        address recipient = toBorrower ? _deals[tokenId_].borrower : owner();
        require(recipient != address(0), "Invalid recipient address");

        // Transfer funds from vault to recipient
        DealVault(_deals[tokenId_].vault).transferToBorrower(recipient, amount);

        emit VaultFundsTransferred(tokenId_, recipient, amount);
    }
}
