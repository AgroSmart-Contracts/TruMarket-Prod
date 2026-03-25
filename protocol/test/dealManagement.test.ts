import { expect } from 'chai';
import hre from 'hardhat';
import { Accounts, deploy, decodeDealManagerEvents } from './setup';
import '@nomicfoundation/hardhat-ethers';

const accounts: Accounts = {} as any;

describe('Deal Management (tracking only)', function () {
  before(async () => {
    const [wallet1, wallet2, wallet3, wallet4] = await hre.ethers.getSigners();
    accounts.deployerAccount = wallet1;
    accounts.financialAccount = wallet2;
    accounts.dealsManagerAccount = wallet3;
    accounts.investorAccount = wallet4;
  });

  describe('Deployment', () => {
    it('deploys DealsManager', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      expect(dealsManager.target).to.not.equal(undefined);
    });
  });

  describe('mint', () => {
    it('fails if milestones distribution does not sum to 100', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 1, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await expect(
        dealsManager
          .connect(accounts.dealsManagerAccount)
          .mint(milestones, maxDeposit, accounts.financialAccount.address)
      ).to.be.rejectedWith('Milestones distribution should be 100');
    });

    it('creates a deal NFT and stores initial state', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      const tx = await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;
      if (!receipt) return;

      const parsedEvents = decodeDealManagerEvents(receipt, dealsManager.interface.formatJson());
      const dealCreated = parsedEvents.find((e) => e && e.eventName === 'DealCreated');
      expect(dealCreated?.args).to.deep.equal({
        dealId: BigInt(0),
        borrower: accounts.financialAccount.address,
        maxDeposit,
      });

      // The deal NFT is minted to the buyer (passed as borrower_ in `mint`).
      expect(await dealsManager.ownerOf(0n)).to.equal(accounts.financialAccount.address);
      expect(await dealsManager.status(0)).to.equal(0);
      expect(await dealsManager.milestones(0)).to.deep.equal(milestones);
      expect(await dealsManager.maxDeposit(0)).to.equal(maxDeposit);
      expect(await dealsManager.borrower(0)).to.equal(accounts.financialAccount.address);
    });

    it('fails if borrower is zero', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).mint(milestones, maxDeposit, hre.ethers.ZeroAddress)
      ).to.be.rejectedWith('Invalid borrower address');
    });

    it('fails if maxDeposit is zero', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];

      await expect(
        dealsManager.connect(accounts.dealsManagerAccount).mint(milestones, 0n, accounts.financialAccount.address)
      ).to.be.rejectedWith('Max deposit must be positive');
    });
  });

  describe('proceed', () => {
    it('fails if attempting to skip a milestone', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);

      // Move the deal to FUNDED stage so `proceed` can be called.
      await dealsManager
        .connect(accounts.financialAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);
      await dealsManager.connect(accounts.financialAccount).publishToInvestors(0);
      await dealsManager.connect(accounts.dealsManagerAccount).assignRiskScore(0, 50);
      await dealsManager.connect(accounts.dealsManagerAccount).markDealFunded(0);

      await expect(dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 2)).to.be.rejectedWith(
        'wrong milestone to proceed to'
      );
    });

    it('updates status and emits milestone event (amountTransferred is always 0)', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [10, 0, 90, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      const tx = await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);
      await tx.wait();

      await dealsManager
        .connect(accounts.financialAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);
      await dealsManager.connect(accounts.financialAccount).publishToInvestors(0);
      await dealsManager.connect(accounts.dealsManagerAccount).assignRiskScore(0, 50);
      await dealsManager.connect(accounts.dealsManagerAccount).markDealFunded(0);

      const proceedTx = await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);
      const receipt = await proceedTx.wait();

      expect(receipt).to.not.be.null;
      if (!receipt) return;

      const parsedEvents = decodeDealManagerEvents(receipt, dealsManager.interface.formatJson());
      const milestoneChanged = parsedEvents.find((e) => e && e.eventName === 'DealMilestoneChanged');
      expect(milestoneChanged?.args).to.deep.equal({
        dealId: BigInt(0),
        milestone: 1n,
        amountTransferred: 0n,
      });

      expect(await dealsManager.status(0)).to.equal(1);
    });

    it('fails for invalid milestone numbers', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);

      await dealsManager
        .connect(accounts.financialAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);
      await dealsManager.connect(accounts.financialAccount).publishToInvestors(0);
      await dealsManager.connect(accounts.dealsManagerAccount).assignRiskScore(0, 50);
      await dealsManager.connect(accounts.dealsManagerAccount).markDealFunded(0);

      await expect(dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 0)).to.be.rejectedWith(
        'wrong milestone to proceed to'
      );
      await expect(dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 8)).to.be.rejectedWith(
        'wrong milestone to proceed to'
      );
    });
  });

  describe('setDealCompleted', () => {
    it('fails if not all milestones are completed', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);

      await dealsManager
        .connect(accounts.financialAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);
      await dealsManager.connect(accounts.financialAccount).publishToInvestors(0);
      await dealsManager.connect(accounts.dealsManagerAccount).assignRiskScore(0, 50);
      await dealsManager.connect(accounts.dealsManagerAccount).markDealFunded(0);

      await expect(dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0)).to.be.rejectedWith(
        'all milestones must be completed'
      );
    });

    it('marks deal completed after milestone 7', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);

      await dealsManager
        .connect(accounts.financialAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);
      await dealsManager.connect(accounts.financialAccount).publishToInvestors(0);
      await dealsManager.connect(accounts.dealsManagerAccount).assignRiskScore(0, 50);
      await dealsManager.connect(accounts.dealsManagerAccount).markDealFunded(0);

      // Proceed through all milestones 1..7
      for (let i = 1; i <= 7; i++) {
        await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, i);
      }

      const receipt = await (await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0)).wait();
      expect(receipt).to.not.be.null;
      if (!receipt) return;

      const parsedEvents = decodeDealManagerEvents(receipt, dealsManager.interface.formatJson());
      const completed = parsedEvents.find((e) => e && e.eventName === 'DealCompleted');
      expect(completed?.args).to.deep.equal({ dealId: BigInt(0) });

      expect(await dealsManager.status(0)).to.equal(8);
    });
  });

  describe('borrower management', () => {
    it('allows changing the borrower', async () => {
      const { dealsManager } = await deploy(hre, accounts);
      const milestones: [number, number, number, number, number, number, number] = [0, 0, 100, 0, 0, 0, 0];
      const maxDeposit = hre.ethers.parseEther('100');

      await dealsManager
        .connect(accounts.dealsManagerAccount)
        .mint(milestones, maxDeposit, accounts.financialAccount.address);

      const tx = await dealsManager
        .connect(accounts.financialAccount)
        .changeDealBorrower(0, accounts.investorAccount.address);
      const receipt = await tx.wait();

      expect(receipt).to.not.be.null;
      if (!receipt) return;

      const parsedEvents = decodeDealManagerEvents(receipt, dealsManager.interface.formatJson());
      const borrowerChanged = parsedEvents.find((e) => e && e.eventName === 'DealBorrowerChanged');
      expect(borrowerChanged?.args).to.deep.equal({
        dealId: BigInt(0),
        oldBorrower: accounts.financialAccount.address,
        newBorrower: accounts.investorAccount.address,
      });

      expect(await dealsManager.borrower(0)).to.equal(accounts.investorAccount.address);
    });
  });
});

