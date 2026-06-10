import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { deploy, decodeDealManagerEvents, Accounts } from './setup';
import { DealsManager, ERC20Mock, DealVault } from '../typechain-types';
import '@nomicfoundation/hardhat-ethers';

const accounts: Accounts = {} as any;

describe('DealsManager', function () {
  before(async () => {
    const [wallet1, wallet2, wallet3, wallet4] = await hre.ethers.getSigners();

    accounts.deployerAccount = wallet1;
    accounts.financialAccount = wallet2;
    accounts.dealsManagerAccount = wallet3;
    accounts.investorAccount = wallet4;
  });

  describe('mint', () => {
    it('should register a deal and deploy a vault', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      const tx = await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
      if (!receipt) return;

      const parsedEvents = decodeDealManagerEvents(
        receipt,
        dealsManager.interface.formatJson(),
      );
      const dealCreated = parsedEvents.find(
        (e) => e && e.eventName === 'DealCreated',
      );
      expect(dealCreated?.args).to.deep.equal({
        dealId: BigInt(0),
        borrower: accounts.financialAccount.address,
        maxDeposit: vaultFunds,
      });

      expect(await dealsManager.completed(0)).to.equal(false);
      expect(await dealsManager.vault(0)).to.contains('0x');
      expect(await dealsManager.borrower(0)).to.equal(
        accounts.financialAccount.address,
      );
    });

    it('should fail if borrower address is zero', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager
          .connect(accounts.dealsManagerAccount)
          .mint(ethers.parseEther('100'), ethers.ZeroAddress),
      ).to.be.rejectedWith('Invalid borrower address');
    });

    it('should fail if max deposit is zero', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager
          .connect(accounts.dealsManagerAccount)
          .mint(0, accounts.financialAccount.address),
      ).to.be.rejectedWith('Max deposit must be positive');
    });

    it('should pause and block deposits on the new vault', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(ethers.parseEther('100'), accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = (await hre.ethers.getContractAt(
        'DealVault',
        vaultAddress,
      )) as DealVault;

      expect(await dealVault.paused()).to.equal(true);
      expect(await dealVault.depositBlocked()).to.equal(true);
    });
  });

  describe('setDealCompleted', () => {
    it('should complete a deal after borrower repayment exceeds maxDeposit', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.financialAccount)
        .approve(await dealsManager.getAddress(), ethers.parseEther('110'));

      await dealsManager
        .connect(accounts.financialAccount)
        .donateToDeal(0, ethers.parseEther('110'));

      const tx = await dealsManager
        .connect(accounts.dealsManagerAccount)
        .setDealCompleted(0);
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;

      expect(await dealsManager.completed(0)).to.equal(true);
    });

    it('should fail if deal is already completed', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(ethers.parseEther('100'), accounts.financialAccount.address);

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .setDealCompleted(0);

      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0),
      ).to.be.rejectedWith('Deal already completed');
    });
  });

  describe('borrower management', () => {
    it('should change the borrower of a deal', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(ethers.parseEther('100'), accounts.financialAccount.address);

      const tx = await dealsManager
        .connect(accounts.dealsManagerAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
      expect(await dealsManager.borrower(0)).to.equal(
        accounts.investorAccount.address,
      );
    });
  });

  describe('transferFromVault', () => {
    it('should transfer funds from vault to borrower after reopenVault', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vaultFunds = ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(vaultFunds, accounts.financialAccount.address);

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .reopenVault(0);

      const vaultAddress = await dealsManager.vault(0);
      const dealVault = (await hre.ethers.getContractAt(
        'DealVault',
        vaultAddress,
      )) as DealVault;

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(vaultAddress, ethers.parseEther('100'));

      await dealVault
        .connect(accounts.investorAccount)
        .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

      const initialBorrowerBalance = await erc20.balanceOf(
        accounts.financialAccount.address,
      );
      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .transferFromVault(0, ethers.parseEther('50'), true);

      const finalBorrowerBalance = await erc20.balanceOf(
        accounts.financialAccount.address,
      );
      expect(finalBorrowerBalance - initialBorrowerBalance).to.equal(
        ethers.parseEther('50'),
      );
    });
  });

  describe('donateToDeal', () => {
    it('should accept borrower repayment into the vault', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const donationAmount = ethers.parseEther('50');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(ethers.parseEther('100'), accounts.financialAccount.address);

      const vaultAddress = await dealsManager.vault(0);

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.financialAccount.address, donationAmount);

      await erc20
        .connect(accounts.financialAccount)
        .approve(await dealsManager.getAddress(), donationAmount);

      await dealsManager
        .connect(accounts.financialAccount)
        .donateToDeal(0, donationAmount);

      expect(await erc20.balanceOf(vaultAddress)).to.equal(donationAmount);
    });

    it('should fail to donate if not called by borrower', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(ethers.parseEther('100'), accounts.financialAccount.address);

      await erc20
        .connect(accounts.deployerAccount)
        .mint(accounts.investorAccount.address, ethers.parseEther('500'));

      await erc20
        .connect(accounts.investorAccount)
        .approve(await dealsManager.getAddress(), ethers.parseEther('100'));

      await expect(
        dealsManager
          .connect(accounts.investorAccount)
          .donateToDeal(0, ethers.parseEther('100')),
      ).to.be.rejectedWith('Only borrower can donate');
    });
  });
});
