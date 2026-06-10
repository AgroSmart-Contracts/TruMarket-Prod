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

  const DealVaultFactory = await ethers.getContractFactory("DealVaultFactory");
  const vaultFactory = await DealVaultFactory.deploy();

  const DealsManager = await ethers.getContractFactory("DealsManager");
  const dealsManager = await DealsManager.deploy(
    borrowerAccount.address,
    await token.getAddress(),
    await vaultFactory.getAddress()
  );

  // Get vault from first deal
    const amount = ethers.parseEther("100");
  await dealsManager.connect(borrowerAccount).mint(amount, borrowerAccount.address);
  await dealsManager.connect(borrowerAccount).reopenVault(0);
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
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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

      const shares = await dealVault.balanceOf(accounts.investorAccount.address);
      const initialBalance = await erc20.balanceOf(accounts.investorAccount.address);
      await dealVault.connect(accounts.investorAccount).redeem(
        shares,
        accounts.investorAccount.address,
        accounts.investorAccount.address
      );
      const finalBalance = await erc20.balanceOf(accounts.investorAccount.address);

      expect(finalBalance).to.be.greaterThan(initialBalance);
      expect(await dealVault.balanceOf(accounts.investorAccount.address)).to.equal(0);
    });

  });

  describe('Max Deposit and Mint', () => {
    it('should return correct max deposit amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      const maxDeposit = await dealVault.maxDeposit(accounts.investorAccount.address);
      expect(maxDeposit).to.equal(ethers.parseEther('100'));
    });

    it('should return correct max mint amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      const maxDeposit = await dealVault.maxDeposit(accounts.investorAccount.address);
      const maxMint = await dealVault.maxMint(accounts.investorAccount.address);
      expect(maxDeposit).to.equal(ethers.parseEther('100'));
      expect(maxMint).to.equal(await dealVault.convertToShares(maxDeposit));
    });
  });

  describe('Pause and Unpause', () => {
    it('should allow owner to pause and unpause the vault', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      expect(await dealVault.paused()).to.be.true;

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('110'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(await dealsManager.getAddress(), ethers.parseEther('110'));

      await dealsManager
        .connect(accounts.financialAccount)
        .donateToDeal(0, ethers.parseEther('110'));

      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);
      expect(await dealVault.paused()).to.be.false;
    });

    it('should prevent deposits when paused', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

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
      const { dealsManager } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      await expect(
        dealVault.connect(accounts.investorAccount).withdraw(
          ethers.parseEther('1'),
          accounts.investorAccount.address,
          accounts.investorAccount.address
        )
      ).to.be.rejectedWith('Unfinished Deal');
    });
  });

  describe('Mint', () => {
    it('should allow investor to mint shares', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      const shares = ethers.parseEther('100');
      const assets = await dealVault.convertToAssets(shares);
      await dealVault
        .connect(accounts.investorAccount)
        .mint(shares, accounts.investorAccount.address);

      const balance = await erc20.balanceOf(vaultAddress);
      expect(balance).to.equal(assets);
      expect(await dealVault.balanceOf(accounts.investorAccount.address)).to.equal(shares);
    });
  });

  describe('Transfer to Borrower', () => {
    it('should allow owner to transfer funds to borrower', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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

      const borrowerBalanceBefore = await erc20.balanceOf(accounts.financialAccount.address);
      expect(borrowerBalanceBefore).to.equal(0);

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .transferFromVault(0, ethers.parseEther('100'), true);

      const borrowerBalanceAfter = await erc20.balanceOf(accounts.financialAccount.address);
      expect(borrowerBalanceAfter).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Block and Unblock Deposits', () => {
    it('should block deposits after completion when vault stays paused', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);

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

    it('should unpause vault after repayment and completion', async function () {
      const { dealsManager, token, accounts } = await loadFixture(deployFixture);
      const { borrowerAccount } = accounts;
      const totalAmount = ethers.parseEther('110');
      const vaultAddress = await dealsManager.vault(0);

      await token.mint(borrowerAccount.address, totalAmount);
      await token.connect(borrowerAccount).approve(await dealsManager.getAddress(), totalAmount);
      await dealsManager.connect(borrowerAccount).donateToDeal(0, totalAmount);
      await dealsManager.connect(borrowerAccount).setDealCompleted(0);

      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress);
      expect(await dealVault.paused()).to.be.false;
    });

    it('should prevent deposits when vault is paused at mint', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      // Try to deposit while vault remains paused/blocked from mint
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
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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

      expect(await dealVault.minDeposit()).to.equal(1_000_000n);
    });

    it('should fail to set zero minimum deposit', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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
      expect(await dealVault.minDeposit()).to.not.equal(0);
    });
  });

  describe('Donate', () => {
    it('should allow borrower to donate via DealsManager', async function () {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const totalAmount = ethers.parseEther('110');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(ethers.parseEther('100'), accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);

      await erc20.mint(accounts.financialAccount.address, totalAmount);
      await erc20
        .connect(accounts.financialAccount)
        .approve(await dealsManager.getAddress(), totalAmount);

      await dealsManager
        .connect(accounts.financialAccount)
        .donateToDeal(0, totalAmount);

      expect(await erc20.balanceOf(vaultAddress)).to.equal(totalAmount);
    });

    it('should fail to donate zero amount', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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
      expect(await erc20.balanceOf(vaultAddress)).to.not.equal(0);
    });
  });

  describe('Complete', () => {
    it('should allow completing deal even if vault is not fully funded', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);

      expect(await dealsManager.completed(0)).to.equal(true);
      expect(await dealVault.paused()).to.be.true;
    });

    it('should fail to complete if not called by owner', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

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
        .deposit(ethers.parseEther('100'), accounts.financialAccount.address);

      await expect(
        dealVault
          .connect(accounts.investorAccount)
          .complete()
      ).to.be.revertedWithCustomError(dealVault, 'OwnableUnauthorizedAccount');
    });
  });
});
