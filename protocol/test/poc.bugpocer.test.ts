import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { deploy, mintDeal, Accounts } from './setup';
import '@nomicfoundation/hardhat-ethers';

/**
 * Regression for Olympix BugPoCer finding 5.1.1 (PoC fed31448): a 1 USDC depositor
 * on a reopened, empty deal vault captured almost all of the borrower's repayment.
 * The attack needed the owner to unblock deposits, which DealsManager no longer allows.
 */
const accounts: Accounts = {} as any;
const USDC = (n: number) => BigInt(n) * 1_000_000n;

describe('BugPoCer 5.1.1 regression: repayment cannot be captured by a depositor', function () {
  before(async () => {
    const [deployer, borrower, admin, attacker] = await hre.ethers.getSigners();
    accounts.deployerAccount = deployer;
    accounts.financialAccount = borrower;
    accounts.dealsManagerAccount = admin;
    accounts.investorAccount = attacker;
  });

  it('keeps the repayment in the vault for the owner to route', async () => {
    const { dealsManager, erc20 } = await deploy(hre, accounts);
    const vault = await mintDeal(hre, accounts, dealsManager, USDC(100));
    const vaultAddress = await vault.getAddress();
    const attacker = accounts.investorAccount;
    const borrower = accounts.financialAccount;
    const REPAYMENT = USDC(110);

    // 1. Owner reopens the vault. Deposits stay blocked and cannot be unblocked.
    await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);
    expect(dealsManager.interface.hasFunction('unblockVaultDeposits')).to.equal(false);
    expect(await vault.depositBlocked()).to.equal(true);

    // 2. Attacker cannot buy shares.
    await erc20.mint(attacker.address, USDC(1));
    await erc20.connect(attacker).approve(vaultAddress, USDC(1));
    await expect(
      vault.connect(attacker).deposit(USDC(1), attacker.address),
    ).to.be.revertedWith('Forbidden');
    await expect(
      vault.connect(attacker).mint(10n ** 12n, attacker.address),
    ).to.be.revertedWith('Forbidden');
    expect(await vault.totalSupply()).to.equal(0);

    // 3. Owner can re-pause the vault.
    await dealsManager.connect(accounts.dealsManagerAccount).pauseVault(0);
    expect(await vault.paused()).to.equal(true);

    // 4. Borrower repays; nothing is claimable by share holders.
    await erc20.mint(borrower.address, REPAYMENT);
    await erc20.connect(borrower).approve(await dealsManager.getAddress(), REPAYMENT);
    await dealsManager.connect(borrower).donateToDeal(0, REPAYMENT);

    expect(await vault.balanceOf(attacker.address)).to.equal(0);
    expect(await erc20.balanceOf(attacker.address)).to.equal(USDC(1));
    expect(await erc20.balanceOf(vaultAddress)).to.equal(REPAYMENT);
  });
});
