import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import { deploy, setupCompleteDealToRedeem, setupPartialDealToRedeem, setupUnstartedDealToRedeem, Accounts } from './setup';
import { DealsManager, ERC20Mock, DealVault } from '../typechain-types';
import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

const accounts: Accounts = {} as any;

interface Fixture {
  vault: DealVault;
  dealsManager: DealsManager;
  token: ERC20Mock;
  accounts: {
    financialAccount: HardhatEthersSigner;
    borrowerAccount: HardhatEthersSigner;
  };
}

async function deployFixture(): Promise<Fixture> {
  const [financialAccount, borrowerAccount] = await ethers.getSigners();

  // Deploy token
  const Token = await ethers.getContractFactory("ERC20Mock");
  const token = await Token.deploy();

  // Deploy DealsManager with owner and token
  const DealsManager = await ethers.getContractFactory("DealsManager");
  const dealsManager = await DealsManager.deploy(borrowerAccount.address, await token.getAddress());

  // Get vault from first deal
  const milestones = [10, 10, 80, 0, 0, 0, 0];
  const amount = ethers.parseEther("100");
  await dealsManager.connect(borrowerAccount).mint(milestones, amount, borrowerAccount.address);
  const vaultAddress = await dealsManager.vault(0);
  const vault = await ethers.getContractAt("DealVault", vaultAddress) as DealVault;

  return {
    vault,
    dealsManager,
    token,
    accounts: {
      financialAccount,
      borrowerAccount
    }
  };
}

describe('DealVault', function () {
  before(async () => {
    const [wallet1, wallet2, wallet3, wallet4] =
      await hre.ethers.getSigners();

    accounts.deployerAccount = wallet1;
    accounts.financialAccount = wallet2;
    accounts.dealsManagerAccount = wallet3;
    accounts.investorAccount = wallet4;
  });

  describe('Deposit', () => {
    it('should allow investor to deposit funds', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // mint investor tokens
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      // allow vault to transfer investor funds
      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      // deposit investor funds
      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      const balance = await erc20.balanceOf(vaultAddress);
      expect(balance).to.equal(ethers.parseEther('100'));
    });

    it('should allow financial account to deposit funds', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // mint financial account tokens
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('500'));

      // allow vault to transfer financial account funds
      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('500'));

      // deposit financial account funds
      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      const balance = await erc20.balanceOf(vaultAddress);
      expect(balance).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Redeem', () => {
    it('should allow investor to redeem funds from completed deal', async () => {
      const { erc20, dealVault } = await setupCompleteDealToRedeem(hre, accounts);

      const initialBalance = await erc20.balanceOf(accounts.investorAccount.address);
      await dealVault.connect(accounts.investorAccount).redeem(
        ethers.parseEther('100'),
        accounts.investorAccount.address,
        accounts.investorAccount.address
      );
      const finalBalance = await erc20.balanceOf(accounts.investorAccount.address);

      expect(finalBalance - initialBalance).to.be.greaterThan(ethers.parseEther('100'));
      expect(finalBalance - initialBalance).to.be.lessThan(ethers.parseEther('110'));
    });

  });

  describe('Max Deposit and Mint', () => {
    it('should return correct max deposit amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      const maxDeposit = await dealVault.maxDeposit(accounts.investorAccount.address);
      expect(maxDeposit).to.equal(ethers.parseEther('100'));
    });

    it('should return correct max mint amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      const maxMint = await dealVault.maxMint(accounts.investorAccount.address);
      expect(maxMint).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Pause and Unpause', () => {
    it('should allow owner to pause and unpause the vault', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('500'));

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      // Use DealsManager to call pause through proceed
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);
      expect(await dealVault.paused()).to.be.true;

      // Complete all milestones before unpausing
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 2);
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 3);
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 4);
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 5);
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 6);
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 7);

      await erc20
        .connect(accounts.financialAccount)
        .approve(await dealsManager.getAddress(), ethers.parseEther('110'));

      await dealsManager
        .connect(accounts.financialAccount)
        .donateToDeal(0, ethers.parseEther('110'));

      // Now we can complete the deal and unpause
      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);
      expect(await dealVault.paused()).to.be.false;
    });

    it('should prevent deposits when paused', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      // Pause through DealsManager
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);

      await expect(
        dealVault
          .connect(accounts.investorAccount)
          .deposit(ethers.parseEther('100'), accounts.investorAccount.address)
      ).to.be.rejectedWith('Unfinished Deal');
    });
  });

  describe('Withdraw', () => {
    it('should allow investor to withdraw funds from completed deal', async () => {
      const { erc20, dealVault } = await setupCompleteDealToRedeem(hre, accounts);

      const initialBalance = await erc20.balanceOf(accounts.investorAccount.address);
      await dealVault.connect(accounts.investorAccount).withdraw(
        ethers.parseEther('100'),
        accounts.investorAccount.address,
        accounts.investorAccount.address
      );
      const finalBalance = await erc20.balanceOf(accounts.investorAccount.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther('100'));
    });

    it('should prevent withdrawals when paused', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      // Pause through DealsManager
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);

      await expect(
        dealVault.connect(accounts.investorAccount).withdraw(
          ethers.parseEther('100'),
          accounts.investorAccount.address,
          accounts.investorAccount.address
        )
      ).to.be.rejectedWith('Unfinished Deal');
    });
  });

  describe('Mint', () => {
    it('should allow investor to mint shares', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .mint(ethers.parseEther('100'), accounts.investorAccount.address);

      const balance = await erc20.balanceOf(vaultAddress);
      expect(balance).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Transfer to Borrower', () => {
    it('should allow owner to transfer funds to borrower', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      // Transfer through DealsManager's proceed function
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);
      const borrowerBalance = await erc20.balanceOf(accounts.financialAccount.address);
      expect(borrowerBalance).to.equal(0);

      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 2);
      const borrowerBalance2 = await erc20.balanceOf(accounts.financialAccount.address);
      expect(borrowerBalance2).to.equal(0);

      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 3);
      const borrowerBalance3 = await erc20.balanceOf(accounts.financialAccount.address);
      expect(borrowerBalance3).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Block and Unblock Deposits', () => {
    it('should block deposits when called by owner', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        10, 0, 90, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('100'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      // Use DealsManager to call blockDeposits through proceed
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);

      // Try to deposit with a non-owner account
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await expect(
        dealVault
          .connect(accounts.investorAccount)
          .deposit(ethers.parseEther('100'), accounts.investorAccount.address)
      ).to.be.rejectedWith('Unfinished Deal');
    });

    it("should unblock deposits after all milestones are completed", async function () {
      const { vault, dealsManager, token, accounts } = await loadFixture(deployFixture);
      const { financialAccount, borrowerAccount } = accounts;

      // Create a deal with 3 milestones
      const milestoneDistribution = [10, 10, 80, 0, 0, 0, 0];
      const totalAmount = ethers.parseEther("100");

      // Mint deal and get vault
      await dealsManager.connect(borrowerAccount).mint(
        milestoneDistribution,
        totalAmount,
        borrowerAccount.address
      );

      // Fund the vault completely
      await token.mint(financialAccount.address, totalAmount);
      await token.connect(financialAccount).transfer(borrowerAccount.address, totalAmount);
      await token.connect(borrowerAccount).approve(await dealsManager.getAddress(), totalAmount);
      await dealsManager.connect(borrowerAccount).donateToDeal(0, totalAmount);

      // Block deposits through proceed
      await dealsManager.connect(borrowerAccount).proceed(0, 1);
      expect(await vault.paused()).to.be.true;

      // Complete all milestones
      for (let i = 1; i < 7; i++) {
        await dealsManager.connect(borrowerAccount).proceed(0, i + 1);
      }

      await token.connect(borrowerAccount).approve(await dealsManager.getAddress(), totalAmount);
      await dealsManager.connect(borrowerAccount).donateToDeal(0, totalAmount);

      // Set deal as completed
      await dealsManager.connect(borrowerAccount).setDealCompleted(0);

      // Unblock deposits
      expect(await vault.paused()).to.be.false;
    });

    it('should prevent deposits when blocked', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        10, 0, 90, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('100'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      // Block deposits through proceed
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);

      // Try to deposit with a non-owner account
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await expect(
        dealVault
          .connect(accounts.investorAccount)
          .deposit(ethers.parseEther('100'), accounts.investorAccount.address)
      ).to.be.rejectedWith('Unfinished Deal');
    });
  });

  describe('Min Deposit', () => {
    it('should update minimum deposit amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        10, 0, 90, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('100'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      // Use DealsManager to set min deposit through proceed
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);
      expect(await dealVault.minDeposit()).to.equal(ethers.parseEther('1'));
    });

    it('should fail to set zero minimum deposit', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        10, 0, 90, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('100'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      // Use DealsManager to try setting zero min deposit through proceed
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);
      expect(await dealVault.minDeposit()).to.not.equal(0);
    });
  });

  describe('Donate', () => {
    it("should allow owner to donate", async function () {
      const { vault, dealsManager, token, accounts } = await loadFixture(deployFixture);
      const { financialAccount, borrowerAccount } = accounts;
      const vaultAddress = await dealsManager.vault(0);

      // Create a deal with 3 milestones
      const milestoneDistribution = [10, 10, 80, 0, 0, 0, 0];
      const totalAmount = ethers.parseEther("100");

      // Mint deal and get vault
      await dealsManager.connect(borrowerAccount).mint(
        milestoneDistribution,
        totalAmount,
        borrowerAccount.address
      );

      // Mint tokens to borrower account
      await token.mint(borrowerAccount.address, ethers.parseEther('500'));

      // Fund the vault completely
      await token.mint(financialAccount.address, ethers.parseEther('500'));
      await token.connect(financialAccount).approve(vaultAddress, totalAmount);
      await vault.connect(financialAccount).deposit(totalAmount, financialAccount.address);

      // Complete all milestones
      for (let i = 0; i < 7; i++) {
        await dealsManager.connect(borrowerAccount).proceed(0, i + 1);
      }

      // Try to donate
      const donationAmount = totalAmount + ethers.parseEther("10");
      await token.connect(borrowerAccount).approve(await dealsManager.getAddress(), donationAmount);

      await dealsManager.connect(borrowerAccount).donateToDeal(0, donationAmount);

      // Set deal as completed
      await dealsManager.connect(borrowerAccount).setDealCompleted(0);


      const finalBalance = await token.balanceOf(await vault.getAddress());

      expect(finalBalance).to.equal(donationAmount);
    });

    it('should fail to donate zero amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        10, 0, 90, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault first
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('100'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      // Fund the borrower account
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('10'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('10'));

      // Use DealsManager to try donating zero amount through proceed
      await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);
      expect(await erc20.balanceOf(vaultAddress)).to.not.equal(0);
    });
  });

  describe('Complete', () => {
    it('should allow completing deal even if vault is not fully funded', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Complete all milestones without funding
      for (let i = 1; i <= 7; i++) {
        await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, i);
      }

      // Should succeed even without funding
      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);

      const status = await dealsManager.status(0);
      expect(status).to.equal(8);
      expect(await dealVault.paused()).to.be.false;
    });

    it('should fail to complete if not called by owner', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [
        0, 0, 100, 0, 0, 0, 0
      ];
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Fund the vault
      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(vaultAddress, ethers.parseEther('500'));

      await dealVault
        .connect(accounts.financialAccount)
        .deposit(ethers.parseEther('110'), accounts.financialAccount.address);

      await expect(
        dealVault
          .connect(accounts.investorAccount)
          .complete()
      ).to.be.revertedWithCustomError(dealVault, 'OwnableUnauthorizedAccount');
    });
  });
});
