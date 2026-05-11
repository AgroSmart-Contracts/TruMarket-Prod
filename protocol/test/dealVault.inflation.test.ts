import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { DealVault, ERC20Mock } from "../typechain-types/contracts";

describe("DealVault Inflation Attack", function () {
  let vault: DealVault;
  let token: ERC20Mock;
  let owner: SignerWithAddress;
  let attacker: SignerWithAddress;
  let user: SignerWithAddress;
  const INITIAL_SUPPLY = ethers.parseEther("1000000");
  const VAULT_MAX_DEPOSIT = ethers.parseEther("1000000");

  async function logVaultState(step: string, vault: DealVault, attackerAddress: string, userAddress: string) {
    const totalAssets = await vault.totalAssets();
    const totalSupply = await vault.totalSupply();
    const sharePrice = totalSupply > 0 ? totalAssets * ethers.parseEther("1") / totalSupply : 0;

    console.log(`\n=== ${step} ===`);
    console.log(`Total Assets: ${ethers.formatEther(totalAssets)} ETH`);
    console.log(`Total Shares: ${ethers.formatEther(totalSupply)}`);
    console.log(`Share Price: ${ethers.formatEther(sharePrice)} ETH`);

    const attackerShares = await vault.balanceOf(attackerAddress);
    const attackerAssets = await vault.convertToAssets(attackerShares);
    console.log(`Attacker Shares: ${ethers.formatEther(attackerShares)}`);
    console.log(`Attacker Assets: ${ethers.formatEther(attackerAssets)} ETH`);

    const userShares = await vault.balanceOf(userAddress);
    const userAssets = await vault.convertToAssets(userShares);
    console.log(`User Shares: ${ethers.formatEther(userShares)}`);
    console.log(`User Assets: ${ethers.formatEther(userAssets)} ETH`);
  }

  beforeEach(async function () {
    [owner, attacker, user] = await ethers.getSigners();

    // Deploy mock token
    const Token = await ethers.getContractFactory("ERC20Mock");
    token = await Token.deploy();
    await token.waitForDeployment();

    // Mint initial supply to owner
    await token.mint(owner.address, INITIAL_SUPPLY);

    // Deploy vault
    const Vault = await ethers.getContractFactory("DealVault");
    vault = await Vault.deploy(
      await token.getAddress(),
      VAULT_MAX_DEPOSIT,
      VAULT_MAX_DEPOSIT,
      owner.address
    );
    await vault.waitForDeployment();

    // Approve vault to spend tokens
    await token.approve(await vault.getAddress(), VAULT_MAX_DEPOSIT);
  });

  describe("Inflation Attack", function () {
    it("should fail to perform inflation attack", async function () {
      // Victim's first deposit
      const firstUserDeposit = ethers.parseEther("100");
      await token.mint(user.address, firstUserDeposit);
      await token.connect(user).approve(await vault.getAddress(), firstUserDeposit);
      await vault.connect(user).deposit(firstUserDeposit, user.address);

      await logVaultState("After User First Deposit", vault, attacker.address, user.address);

      // Attacker's deposit
      const attackerDeposit = ethers.parseEther("1000");
      await token.mint(attacker.address, attackerDeposit);
      await token.connect(attacker).approve(await vault.getAddress(), attackerDeposit);
      await vault.connect(attacker).deposit(attackerDeposit, attacker.address);

      await logVaultState("After Attacker Deposit", vault, attacker.address, user.address);

      // Attacker's donation
      const donationAmount = ethers.parseEther("100");
      await token.mint(attacker.address, donationAmount);
      await token.connect(attacker).transfer(await vault.getAddress(), donationAmount);

      await logVaultState("After Attacker Donation", vault, attacker.address, user.address);

      // Victim's second deposit
      const secondUserDeposit = ethers.parseEther("200");
      await token.mint(user.address, secondUserDeposit);
      await token.connect(user).approve(await vault.getAddress(), secondUserDeposit);
      await vault.connect(user).deposit(secondUserDeposit, user.address);

      await logVaultState("After User Second Deposit", vault, attacker.address, user.address);

      // Victim withdraws all shares
      const userShares = await vault.balanceOf(user.address);
      await vault.connect(user).redeem(userShares, user.address, user.address);

      await logVaultState("After User Withdrawal", vault, attacker.address, user.address);

      // Attacker withdraws all shares
      const attackerShares = await vault.balanceOf(attacker.address);
      await vault.connect(attacker).redeem(attackerShares, attacker.address, attacker.address);

      await logVaultState("After Attacker Withdrawal", vault, attacker.address, user.address);

      // Calculate and verify victim's total investment vs received amount
      const totalUserInvestment = firstUserDeposit + secondUserDeposit;
      const userFinalBalance = await token.balanceOf(user.address);
      const userProfit = userFinalBalance - totalUserInvestment;

      console.log("\n=== Attack Results ===");
      console.log("User's Total Investment:", ethers.formatEther(totalUserInvestment), "ETH");
      console.log("User's Final Balance:", ethers.formatEther(userFinalBalance), "ETH");
      console.log("User's Profit/Loss:", ethers.formatEther(userProfit), "ETH");

      const totalAttackerInvestment = attackerDeposit;
      const attackerFinalBalance = await token.balanceOf(attacker.address);
      const attackerProfit = attackerFinalBalance - totalAttackerInvestment;

      console.log("\nAttacker's Total Investment:", ethers.formatEther(totalAttackerInvestment), "ETH");
      console.log("Attacker's Final Balance:", ethers.formatEther(attackerFinalBalance), "ETH");
      console.log("Attacker's Profit/Loss:", ethers.formatEther(attackerProfit), "ETH");

      // Allow for tiny rounding errors (less than 0.000001 ETH)
      expect(+ethers.formatEther(attackerProfit)).to.be.lessThanOrEqual(0.000000000000000002);

      // Check that the user's loss is minimal (allow for a small rounding error)
      const userLoss = totalUserInvestment - userFinalBalance;
      expect(userLoss).to.be.lessThanOrEqual(ethers.parseEther('0.000000000000000002'));

      // Check that the attacker's gain is minimal (allow for a small rounding error)
      const attackerGain = attackerFinalBalance - totalAttackerInvestment;
      expect(attackerGain).to.be.lessThanOrEqual(ethers.parseEther('0.000000000000000002'));
    });
  });
});
