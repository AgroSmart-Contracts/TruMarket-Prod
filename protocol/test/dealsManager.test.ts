import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { deploy, mintDeal, decodeDealManagerEvents, Accounts } from './setup';
import { DealsManager, ERC20Mock } from '../typechain-types';
import '@nomicfoundation/hardhat-ethers';

const accounts: Accounts = {} as any;
const MAX = ethers.parseEther('100');

describe('DealsManager', function () {
  before(async () => {
    const [wallet1, wallet2, wallet3, wallet4] = await hre.ethers.getSigners();

    accounts.deployerAccount = wallet1;
    accounts.financialAccount = wallet2; // borrower
    accounts.dealsManagerAccount = wallet3; // owner
    accounts.investorAccount = wallet4; // unprivileged
  });

  async function repay(erc20: ERC20Mock, dealsManager: DealsManager, amount: bigint) {
    await erc20.mint(accounts.financialAccount.address, amount);
    await erc20
      .connect(accounts.financialAccount)
      .approve(await dealsManager.getAddress(), amount);
    return dealsManager.connect(accounts.financialAccount).donateToDeal(0, amount);
  }

  describe('constructor', () => {
    it('should fail if underlying is zero', async () => {
      const { vaultFactory } = await deploy(hre, accounts);
      const DealsManager = await hre.ethers.getContractFactory('DealsManager');
      await expect(
        DealsManager.deploy(
          accounts.dealsManagerAccount.address,
          ethers.ZeroAddress,
          await vaultFactory.getAddress(),
        ),
      ).to.be.revertedWith('Invalid underlying token');
    });

    it('should fail if vault factory is zero', async () => {
      const { erc20 } = await deploy(hre, accounts);
      const DealsManager = await hre.ethers.getContractFactory('DealsManager');
      await expect(
        DealsManager.deploy(
          accounts.dealsManagerAccount.address,
          await erc20.getAddress(),
          ethers.ZeroAddress,
        ),
      ).to.be.revertedWith('Invalid vault factory');
    });

    it('should fail if the factory is bound to another DealsManager', async () => {
      const { erc20, vaultFactory } = await deploy(hre, accounts);
      const DealsManager = await hre.ethers.getContractFactory('DealsManager');
      await expect(
        DealsManager.deploy(
          accounts.dealsManagerAccount.address,
          await erc20.getAddress(),
          await vaultFactory.getAddress(),
        ),
      ).to.be.revertedWith('Vault factory not bound to this contract');
    });

    it('should bind the factory to the DealsManager', async () => {
      const { dealsManager, vaultFactory } = await deploy(hre, accounts);
      expect(await vaultFactory.dealsManager()).to.equal(await dealsManager.getAddress());
    });
  });

  describe('ownership', () => {
    it('should reject transferring ownership to the zero address', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).transferOwnership(ethers.ZeroAddress),
      )
        .to.be.revertedWithCustomError(dealsManager, 'OwnableInvalidOwner')
        .withArgs(ethers.ZeroAddress);
    });

    it('should transfer ownership in two steps', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .transferOwnership(accounts.investorAccount.address);
      expect(await dealsManager.owner()).to.equal(accounts.dealsManagerAccount.address);
      expect(await dealsManager.pendingOwner()).to.equal(accounts.investorAccount.address);

      await dealsManager.connect(accounts.investorAccount).acceptOwnership();
      expect(await dealsManager.owner()).to.equal(accounts.investorAccount.address);
    });

    it('should not let a non-owner transfer ownership', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager
          .connect(accounts.investorAccount)
          .transferOwnership(accounts.investorAccount.address),
      ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
    });

    it('should not allow renouncing ownership', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).renounceOwnership(),
      ).to.be.revertedWith('Renounce disabled');
      await expect(
        dealsManager.connect(accounts.investorAccount).renounceOwnership(),
      ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
      expect(await dealsManager.owner()).to.equal(accounts.dealsManagerAccount.address);
    });
  });

  describe('mint', () => {
    it('should register a deal and deploy a vault', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);

      const tx = await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(MAX, accounts.financialAccount.address);

      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
      if (!receipt) return;

      const parsedEvents = decodeDealManagerEvents(receipt, dealsManager.interface.formatJson());
      const dealCreated = parsedEvents.find((e) => e && e.eventName === 'DealCreated');
      expect(dealCreated?.args).to.deep.equal({
        dealId: 0n,
        borrower: accounts.financialAccount.address,
        maxDeposit: MAX,
      });

      expect(await dealsManager.ownerOf(0)).to.equal(accounts.dealsManagerAccount.address);
      expect(await dealsManager.completed(0)).to.equal(false);
      expect(await dealsManager.borrower(0)).to.equal(accounts.financialAccount.address);
      expect(await dealsManager.maxDeposit(0)).to.equal(MAX);

      const vault = await hre.ethers.getContractAt('DealVault', await dealsManager.vault(0));
      expect(await vault.owner()).to.equal(await dealsManager.getAddress());
      expect(await vault.asset()).to.equal(await erc20.getAddress());
    });

    it('should pause and block deposits on the new vault', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      expect(await vault.paused()).to.equal(true);
      expect(await vault.depositBlocked()).to.equal(true);
    });

    it('should fail if borrower address is zero', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).mint(MAX, ethers.ZeroAddress),
      ).to.be.revertedWith('Invalid borrower address');
    });

    it('should fail if max deposit is zero', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).mint(0, accounts.financialAccount.address),
      ).to.be.revertedWith('Max deposit must be positive');
    });

    it('should fail if not called by owner', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await expect(
        dealsManager.connect(accounts.investorAccount).mint(MAX, accounts.financialAccount.address),
      ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
    });
  });

  describe('views', () => {
    it('should revert for an unknown deal id', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);
      await expect(dealsManager.completed(1)).to.be.revertedWith('Deal not found');
      await expect(dealsManager.vault(1)).to.be.revertedWith('Deal not found');
      await expect(dealsManager.maxDeposit(1)).to.be.revertedWith('Deal not found');
      await expect(dealsManager.borrower(1)).to.be.revertedWith('Deal not found');
    });
  });

  describe('setDealCompleted', () => {
    it('should complete and unpause after repayment exceeds maxDeposit', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      await repay(erc20, dealsManager, ethers.parseEther('110'));

      await expect(dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0))
        .to.emit(dealsManager, 'DealCompleted')
        .withArgs(0)
        .and.to.emit(vault, 'DealCompleted');

      expect(await dealsManager.completed(0)).to.equal(true);
      expect(await vault.paused()).to.equal(false);
      // complete() only unpauses; deposits stay blocked
      expect(await vault.depositBlocked()).to.equal(true);
    });

    it('should complete but keep the vault paused when repayment equals maxDeposit', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      await repay(erc20, dealsManager, MAX);

      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);
      expect(await dealsManager.completed(0)).to.equal(true);
      expect(await vault.paused()).to.equal(true);
    });

    it('should fail if deal is already completed', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);
      await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);
      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0),
      ).to.be.revertedWith('Deal already completed');
    });

    it('should fail for an unknown deal or a non-owner', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);
      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(1),
      ).to.be.revertedWith('Deal not found');
      await expect(
        dealsManager.connect(accounts.investorAccount).setDealCompleted(0),
      ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
    });
  });

  describe('changeDealBorrower', () => {
    it('should change the borrower and emit an event', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);

      await expect(
        dealsManager
          .connect(accounts.dealsManagerAccount)
          .changeDealBorrower(0, accounts.investorAccount.address),
      )
        .to.emit(dealsManager, 'DealBorrowerChanged')
        .withArgs(0, accounts.financialAccount.address, accounts.investorAccount.address);

      expect(await dealsManager.borrower(0)).to.equal(accounts.investorAccount.address);
    });

    it('should reject invalid changes', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);
      const owner = dealsManager.connect(accounts.dealsManagerAccount);

      await expect(owner.changeDealBorrower(1, accounts.investorAccount.address)).to.be.revertedWith(
        'Deal not found',
      );
      await expect(owner.changeDealBorrower(0, ethers.ZeroAddress)).to.be.revertedWith(
        'Invalid borrower address',
      );
      await expect(owner.changeDealBorrower(0, accounts.financialAccount.address)).to.be.revertedWith(
        'Same borrower',
      );
      await expect(
        dealsManager
          .connect(accounts.investorAccount)
          .changeDealBorrower(0, accounts.investorAccount.address),
      ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
    });
  });

  describe('donateToDeal', () => {
    it('should move borrower repayment into the vault and emit events', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      const amount = ethers.parseEther('50');

      await expect(repay(erc20, dealsManager, amount))
        .to.emit(dealsManager, 'BorrowerDonation')
        .withArgs(0, accounts.financialAccount.address, amount)
        .and.to.emit(vault, 'Donation')
        .withArgs(await dealsManager.getAddress(), amount);

      expect(await erc20.balanceOf(await vault.getAddress())).to.equal(amount);
      expect(await erc20.balanceOf(await dealsManager.getAddress())).to.equal(0);
      expect(await vault.totalSupply()).to.equal(0);
    });

    it('should reject invalid donations', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);
      await erc20.mint(accounts.investorAccount.address, MAX);
      await erc20.connect(accounts.investorAccount).approve(await dealsManager.getAddress(), MAX);

      await expect(
        dealsManager.connect(accounts.investorAccount).donateToDeal(0, MAX),
      ).to.be.revertedWith('Only borrower can donate');
      await expect(
        dealsManager.connect(accounts.financialAccount).donateToDeal(0, 0),
      ).to.be.revertedWith('Amount must be positive');
      await expect(
        dealsManager.connect(accounts.financialAccount).donateToDeal(1, MAX),
      ).to.be.revertedWith('Deal not found');
    });

    it('should block reentrant calls', async () => {
      const token = await hre.ethers.deployContract('ReentrantERC20Mock', accounts.deployerAccount);
      const { dealsManager } = await deploy(hre, accounts, token as unknown as ERC20Mock);
      await mintDeal(hre, accounts, dealsManager);
      const amount = ethers.parseEther('10');
      await token.mint(accounts.financialAccount.address, amount);
      await token.connect(accounts.financialAccount).approve(await dealsManager.getAddress(), amount);

      await token.setHook(
        await dealsManager.getAddress(),
        dealsManager.interface.encodeFunctionData('donateToDeal', [0, amount]),
      );
      await expect(
        dealsManager.connect(accounts.financialAccount).donateToDeal(0, amount),
      ).to.be.revertedWithCustomError(dealsManager, 'ReentrancyGuardReentrantCall');
    });
  });

  describe('vault controls', () => {
    it('should not expose deposit unblock controls', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      expect(dealsManager.interface.hasFunction('unblockVaultDeposits')).to.equal(false);
      expect(dealsManager.interface.hasFunction('blockVaultDeposits')).to.equal(false);
    });

    it('reopenVault should unpause and keep deposits blocked', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);

      await expect(dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0))
        .to.emit(vault, 'DepositsBlocked')
        .and.to.emit(vault, 'Unpaused');

      expect(await vault.paused()).to.equal(false);
      expect(await vault.depositBlocked()).to.equal(true);
      expect(await vault.maxDeposit(accounts.investorAccount.address)).to.equal(0);
    });

    it('pauseVault should pause a reopened vault', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

      await expect(dealsManager.connect(accounts.dealsManagerAccount).pauseVault(0)).to.emit(
        vault,
        'Paused',
      );
      expect(await vault.paused()).to.equal(true);
    });

    for (const fn of ['reopenVault', 'pauseVault'] as const) {
      it(`${fn} should reject a non-owner and an unknown deal`, async () => {
        const { dealsManager } = await deploy(hre, accounts);
        await mintDeal(hre, accounts, dealsManager);
        await expect(
          dealsManager.connect(accounts.investorAccount)[fn](0),
        ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
        await expect(
          dealsManager.connect(accounts.dealsManagerAccount)[fn](1),
        ).to.be.revertedWith('Deal not found');
      });
    }
  });

  describe('transferFromVault', () => {
    it('should send vault funds to the borrower', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      await repay(erc20, dealsManager, ethers.parseEther('110'));
      const amount = ethers.parseEther('50');
      const before = await erc20.balanceOf(accounts.financialAccount.address);

      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).transferFromVault(0, amount, true),
      )
        .to.emit(dealsManager, 'VaultFundsTransferred')
        .withArgs(0, accounts.financialAccount.address, amount)
        .and.to.emit(vault, 'TransferToBorrower')
        .withArgs(accounts.financialAccount.address, amount);

      expect((await erc20.balanceOf(accounts.financialAccount.address)) - before).to.equal(amount);
    });

    it('should send vault funds to the owner', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      await mintDeal(hre, accounts, dealsManager);
      await repay(erc20, dealsManager, ethers.parseEther('110'));

      await expect(
        dealsManager
          .connect(accounts.dealsManagerAccount)
          .transferFromVault(0, ethers.parseEther('110'), false),
      )
        .to.emit(dealsManager, 'VaultFundsTransferred')
        .withArgs(0, accounts.dealsManagerAccount.address, ethers.parseEther('110'));
      expect(await erc20.balanceOf(accounts.dealsManagerAccount.address)).to.equal(
        ethers.parseEther('110'),
      );
    });

    it('should reject invalid transfers', async () => {
      const { dealsManager, erc20 } = await deploy(hre, accounts);
      const vault = await mintDeal(hre, accounts, dealsManager);
      await repay(erc20, dealsManager, ethers.parseEther('10'));
      const owner = dealsManager.connect(accounts.dealsManagerAccount);

      await expect(owner.transferFromVault(0, 0, true)).to.be.revertedWith('Amount must be positive');
      await expect(owner.transferFromVault(1, 1, true)).to.be.revertedWith('Deal not found');
      await expect(owner.transferFromVault(0, ethers.parseEther('11'), true)).to.be.revertedWith(
        'Insufficient funds',
      );
      await expect(
        dealsManager.connect(accounts.investorAccount).transferFromVault(0, 1, true),
      ).to.be.revertedWithCustomError(dealsManager, 'OwnableUnauthorizedAccount');
      expect(await vault.totalAssets()).to.equal(ethers.parseEther('10'));
    });
  });

  describe('DealVaultFactory', () => {
    it('should only deploy vaults for its DealsManager', async () => {
      const { vaultFactory, erc20 } = await deploy(hre, accounts);
      await expect(
        vaultFactory.connect(accounts.investorAccount).deploy(await erc20.getAddress(), MAX),
      )
        .to.be.revertedWithCustomError(vaultFactory, 'UnauthorizedDeployer')
        .withArgs(accounts.investorAccount.address);
    });

    it('should reject a zero DealsManager address', async () => {
      const Factory = await hre.ethers.getContractFactory('DealVaultFactory');
      await expect(Factory.deploy(ethers.ZeroAddress)).to.be.revertedWith('Invalid deals manager');
    });
  });
});
