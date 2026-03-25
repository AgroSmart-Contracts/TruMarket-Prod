// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DealsManager
 * @dev Manages the creation and progression of deals with milestone/shipments tracking.
 * @notice Liquidity and fund transfers are managed off-chain (e.g., Lagoon), so this contract only updates deal state.
 */
contract DealsManager is ERC721, Ownable2Step, ReentrancyGuard {
    // Deal lifecycle stages for the off-chain Lagoon integration.
    // - Stage is independent from milestone progress (`status`).
    // - Milestone progress remains 0..8 (milestones 1..7 then completed).
    uint8 public constant STAGE_DRAFT = 0;
    uint8 public constant STAGE_SUPPLIER_INVITED = 1;
    uint8 public constant STAGE_PUBLISHED = 2;
    uint8 public constant STAGE_FUNDED = 3;
    uint8 public constant STAGE_COMPLETED = 4;

    /// @notice Minimum/maximum APY model bounds (stored as basis points).
    /// @dev APY is derived from riskScore using a simple linear mapping:
    /// maxApyBps (riskScore=0) -> minApyBps (riskScore=maxRiskScore)
    uint256 public minApyBps = 500; // 5.00%
    uint256 public maxApyBps = 1500; // 15.00%
    uint16 public maxRiskScore = 100;

    /// @notice Emitted when Lagoon routes liquidity to this deal (per-deal vault allocation)
    event DealFunded(uint256 indexed dealId, address perDealVault);

    /// @notice Emitted when Trumarket admin assigns riskScore and derived APY
    event DealRiskScoreAssigned(
        uint256 indexed dealId,
        uint16 riskScore,
        uint256 apyBps
    );

    /// @notice Emitted when the buyer invites a supplier
    event DealSupplierInvited(uint256 indexed dealId, address indexed supplier);

    /// @notice Emitted when the deal is published to investors
    event DealPublished(uint256 indexed dealId, address indexed publishedBy);

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
        uint256 amountTransferred // Always 0 in the Lagoon/off-chain funding model
    );
    /// @notice Emitted when a deal is completed
    event DealCompleted(uint256 indexed dealId);
    /// @notice Emitted when a deal's borrower is changed
    event DealBorrowerChanged(
        uint256 indexed dealId,
        address indexed oldBorrower,
        address indexed newBorrower
    );
    // Note: funding is now managed off-chain via Lagoon; this contract only tracks deal lifecycle.

    /// @dev Structure representing a deal
    struct Deal {
        uint8 status; // Milestone progress: 0..8
        uint8 stage; // Buyer/supplier/publish/funding lifecycle stage: 0..4
        uint8[7] milestones; // Milestone percentages
        uint256 maxDeposit; // Maximum deposit amount
        address borrower; // Supplier payout recipient (historically called "borrower")
        address buyer; // Buyer that created the deal
        address vault; // Lagoon-created per-deal vault
        bool riskScoreAssigned;
        uint16 riskScore;
        uint256 apyBps;
    }

    /// @notice Counter for the next token ID
    uint256 private _nextTokenId;
    /// @notice Array of all deals
    Deal[] private _deals;

    /**
     * @dev Initializes the contract with an initial owner.
     * @param initialOwner_ Address of the initial owner
     */
    constructor(address initialOwner_)
        ERC721("TruMarketDeals", "TMD")
        Ownable(initialOwner_) {}

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

        uint256 tokenId = _nextTokenId++;

        uint256 sum = 0;
        for (uint i = 0; i < milestones_.length; i++) {
            sum += uint256(milestones_[i]);
        }

        require(sum == 100, "Milestones distribution should be 100");

        Deal memory deal = Deal({
            status: 0,
            stage: STAGE_DRAFT,
            milestones: milestones_,
            maxDeposit: maxDeposit_,
            borrower: borrower_,
            buyer: borrower_,
            vault: address(0),
            riskScoreAssigned: false,
            riskScore: 0,
            apyBps: 0
        });

        _deals.push(deal);

        // Mint the deal NFT to the buyer to match the buyer-led flow.
        _safeMint(borrower_, tokenId);

        emit DealCreated(tokenId, borrower_, maxDeposit_);
    }

    /**
     * @notice Buyer creates a new deal.
     * @dev This is the buyer-led entrypoint. For backwards-compatibility with existing backends,
     * the `mint(...)` function (admin-only) still exists and performs the same initialization.
     */
    function createDeal(
        uint8[7] memory milestones_,
        uint256 maxDeposit_
    ) external nonReentrant returns (uint256) {
        address buyer_ = msg.sender;
        require(buyer_ != address(0), "Invalid buyer address");
        require(maxDeposit_ > 0, "Max deposit must be positive");

        uint256 sum = 0;
        for (uint i = 0; i < milestones_.length; i++) {
            sum += uint256(milestones_[i]);
        }
        require(sum == 100, "Milestones distribution should be 100");

        uint256 tokenId = _nextTokenId++;

        Deal memory deal = Deal({
            status: 0,
            stage: STAGE_DRAFT,
            milestones: milestones_,
            maxDeposit: maxDeposit_,
            borrower: buyer_, // supplier not invited yet; placeholder = buyer
            buyer: buyer_,
            vault: address(0),
            riskScoreAssigned: false,
            riskScore: 0,
            apyBps: 0
        });

        _deals.push(deal);
        _safeMint(buyer_, tokenId);
        emit DealCreated(tokenId, buyer_, maxDeposit_);
        return tokenId;
    }

    /**
     * @notice Returns the milestones for a specific deal
     * @param tokenId_ ID of the deal
     * @return Array of milestone percentages
     */
    function milestones(
        uint256 tokenId_
    ) public view returns (uint8[7] memory) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].milestones;
    }

    /**
     * @notice Returns the status of a specific deal
     * @param tokenId_ ID of the deal
     * @return Current status of the deal
     */
    function status(uint256 tokenId_) public view returns (uint8) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].status;
    }

    /**
     * @notice Returns the lifecycle stage for a specific deal
     * @param tokenId_ ID of the deal
     */
    function dealStage(uint256 tokenId_) public view returns (uint8) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].stage;
    }

    /**
     * @notice Returns the maximum deposit amount for a specific deal
     * @param tokenId_ ID of the deal
     * @return Maximum deposit amount
     */
    function maxDeposit(uint256 tokenId_) public view returns (uint256) {
        require(tokenId_ < _nextTokenId, "Deal not found");
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
    ) public nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(_deals[tokenId_].stage == STAGE_FUNDED, "Deal not funded yet");
        require(_isMilestoneExecutor(tokenId_, msg.sender), "Not authorized to proceed");
        require(
            _deals[tokenId_].status + 1 == milestone_,
            "wrong milestone to proceed to"
        );
        require(milestone_ > 0 && milestone_ < 8, "Invalid milestone");

        // Funding is now managed off-chain (Lagoon-managed liquidity pool).
        // This contract only tracks deal progression, so `amountTransferred` is always 0.
        _deals[tokenId_].status++;
        emit DealMilestoneChanged(tokenId_, milestone_, 0);
    }

    /**
     * @notice Marks a deal as completed
     * @dev Includes reentrancy protection and status validation
     * @param tokenId_ ID of the deal
     */
    function setDealCompleted(uint256 tokenId_) public nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(_deals[tokenId_].stage == STAGE_FUNDED, "Deal not funded");
        require(_isMilestoneExecutor(tokenId_, msg.sender), "Not authorized to complete");
        require(
            _deals[tokenId_].status == 7,
            "all milestones must be completed"
        );

        _deals[tokenId_].status++;
        _deals[tokenId_].stage = STAGE_COMPLETED;
        emit DealCompleted(tokenId_);
    }

    /**
     * @notice Buyer invites the supplier to the deal
     */
    function inviteSupplier(uint256 tokenId_, address supplier_) public nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(supplier_ != address(0), "Invalid supplier address");

        Deal storage d = _deals[tokenId_];
        require(d.stage == STAGE_DRAFT, "Deal not in draft stage");
        require(msg.sender == d.buyer || msg.sender == owner(), "Not authorized to invite supplier");
        if (supplier_ == d.borrower) {
            // Allow admin migration/initialization to move the state even if the supplier equals the placeholder.
            require(msg.sender == owner(), "Same supplier");
        }

        address oldBorrower = d.borrower;
        d.borrower = supplier_;
        d.stage = STAGE_SUPPLIER_INVITED;

        // Historical event name preserved for compatibility with existing indexers.
        emit DealBorrowerChanged(tokenId_, oldBorrower, supplier_);
        emit DealSupplierInvited(tokenId_, supplier_);
    }

    /**
     * @notice Publishes the deal to investors (buyer or supplier)
     */
    function publishToInvestors(uint256 tokenId_) public nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");

        Deal storage d = _deals[tokenId_];
        require(d.stage == STAGE_SUPPLIER_INVITED, "Deal not ready for publishing");
        require(msg.sender == d.buyer || msg.sender == d.borrower || msg.sender == owner(), "Not authorized to publish");

        d.stage = STAGE_PUBLISHED;
        emit DealPublished(tokenId_, msg.sender);
    }

    /**
     * @notice Admin assigns riskScore and derived APY
     */
    function assignRiskScore(uint256 tokenId_, uint16 riskScore_) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        Deal storage d = _deals[tokenId_];
        require(d.stage == STAGE_PUBLISHED, "Deal not published");
        require(!d.riskScoreAssigned, "Risk score already assigned");
        require(riskScore_ <= maxRiskScore, "Invalid risk score");

        uint256 apyBps_ = _riskScoreToApyBps(riskScore_);
        d.riskScoreAssigned = true;
        d.riskScore = riskScore_;
        d.apyBps = apyBps_;

        emit DealRiskScoreAssigned(tokenId_, riskScore_, apyBps_);
    }

    /**
     * @notice Admin marks deal as funded after Lagoon routes capital to the per-deal vault
     */
    function markDealFunded(uint256 tokenId_) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        Deal storage d = _deals[tokenId_];
        require(d.stage == STAGE_PUBLISHED, "Deal not published");
        require(d.riskScoreAssigned, "Risk score not assigned");

        d.stage = STAGE_FUNDED;
        emit DealFunded(tokenId_, d.vault);
    }

    /**
     * @notice Admin stores Lagoon-created per-deal vault address
     */
    function setDealVault(uint256 tokenId_, address perDealVault_) public onlyOwner nonReentrant {
        require(tokenId_ < _nextTokenId, "Deal not found");
        require(perDealVault_ != address(0), "Invalid vault address");
        _deals[tokenId_].vault = perDealVault_;
    }

    /// @notice Returns the per-deal vault address (Lagoon-created)
    function vault(uint256 tokenId_) public view returns (address) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].vault;
    }

    /// @notice Returns the buyer address for a specific deal
    function buyer(uint256 tokenId_) public view returns (address) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].buyer;
    }

    /// @notice Returns the configured APY for a specific deal
    function apyBps(uint256 tokenId_) public view returns (uint256) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].apyBps;
    }

    /// @notice Returns the risk score for a specific deal
    function riskScore(uint256 tokenId_) public view returns (uint16) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].riskScore;
    }

    /**
     * @notice Backwards-compatible alias for supplier invitation.
     * @dev Historically called `changeDealBorrower`; now used for supplier onboarding.
     */
    function changeDealBorrower(uint256 tokenId_, address newBorrower_) public {
        inviteSupplier(tokenId_, newBorrower_);
    }

    /**
     * @notice Updates the APY model used when deriving APY from riskScore.
     */
    function setApyModel(
        uint16 maxRiskScore_,
        uint256 minApyBps_,
        uint256 maxApyBps_
    ) public onlyOwner {
        require(maxRiskScore_ > 0, "Invalid maxRiskScore");
        require(minApyBps_ <= maxApyBps_, "minApyBps > maxApyBps");
        maxRiskScore = maxRiskScore_;
        minApyBps = minApyBps_;
        maxApyBps = maxApyBps_;
    }

    function _riskScoreToApyBps(uint16 riskScore_) internal view returns (uint256) {
        // Linear mapping: higher risk -> lower APY.
        // riskScore_=0 => maxApyBps, riskScore_=maxRiskScore => minApyBps
        uint256 range = maxApyBps - minApyBps;
        uint256 scaled = (uint256(riskScore_) * range) / uint256(maxRiskScore);
        return maxApyBps - scaled;
    }

    function _isMilestoneExecutor(uint256 tokenId_, address executor) internal view returns (bool) {
        Deal storage d = _deals[tokenId_];
        return executor == d.buyer || executor == d.borrower || executor == owner();
    }

    /**
     * @notice Returns the borrower address for a specific deal
     * @param tokenId_ ID of the deal
     */
    function borrower(uint256 tokenId_) public view returns (address) {
        require(tokenId_ < _nextTokenId, "Deal not found");
        return _deals[tokenId_].borrower;
    }
}
