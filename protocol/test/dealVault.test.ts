import { expect } from 'chai';
import hre from 'hardhat';
import { ethers } from 'ethers';
import { deployStandaloneVault, Accounts } from './setup';
import { DealVault, ERC20Mock } from '../typechain-types';
import '@nomicfoundation/hardhat-ethers';

/**
 * DealVault unit tests. Vaults here are deployed directly with an EOA owner
 * (`dealsManagerAccount`), unpaused and deposit-unblocked, so the legacy
 * deposit / mint / redeem / withdraw path can be exercised. DealsManager vaults
 * cannot reach this state (see dealsManager.test.ts).
 */
const accounts: Accounts = {} as any;
const MAX = ethers.parseEther('100');
const MIN = 1_000_000n;

describe('DealVault', function () {
  before(async () => {
    const [wallet1, wallet2, wallet3, wallet4] = await hre.ethers.getSigners();
    accounts.deployerAccount = wallet1;
    accounts.financialAccount = wallet2; // second investor / borrower
    accounts.dealsManagerAccount = wallet3; // vault owner
    accounts.investorAccount = wallet4;
  });

  const owner = () => accounts.dealsManagerAccount;
  const investor = () => accounts.investorAccount;

  async function fund(erc20: ERC20Mock, vault: DealVault, who = investor(), amount = ethers.parseEther('500')) {
    await erc20.mint(who.address, amount);
    await erc20.connect(who).approve(await vault.getAddress(), amount);
  }

  async function depositAs(vault: DealVault, erc20: ERC20Mock, assets: bigint, who = investor()) {
    await fund(erc20, vault, who);
    await vault.connect(who).deposit(assets, who.address);
  }

  async function donateAsOwner(vault: DealVault, erc20: ERC20Mock, amount: bigint) {
    await erc20.mint(owner().address, amount);
    await erc20.connect(owner()).approve(await vault.getAddress(), amount);
    return vault.connect(owner()).donate(amount);
  }

  describe('constructor', () => {
    it('should set up the vault', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      expect(await vault.asset()).to.equal(await erc20.getAddress());
      expect(await vault.owner()).to.equal(owner().address);
      expect(await vault.decimals()).to.equal(18 + 6); // decimals offset 6
      expect(await vault.minDeposit()).to.equal(MIN);
      expect(await vault.paused()).to.equal(false);
      expect(await vault.depositBlocked()).to.equal(false);
    });

    it('should not approve the deployer to spend vault funds', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      expect(
        await erc20.allowance(await vault.getAddress(), accounts.deployerAccount.address),
      ).to.equal(0);
    });

    it('should reject invalid parameters', async () => {
      const { erc20 } = await deployStandaloneVault(hre, accounts);
      const Vault = await hre.ethers.getContractFactory('DealVault');
      const token = await erc20.getAddress();
      await expect(Vault.deploy(ethers.ZeroAddress, MAX, MAX, owner().address)).to.be.revertedWith(
        'Invalid underlying token',
      );
      await expect(Vault.deploy(token, 0, MAX, owner().address)).to.be.revertedWith(
        'Max deposit must be positive',
      );
      await expect(Vault.deploy(token, MAX, 0, owner().address)).to.be.revertedWith(
        'Max mint must be positive',
      );
    });
  });

  describe('deposit', () => {
    it('should mint shares at the 1e6 virtual offset and emit Deposit', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await fund(erc20, vault);

      await expect(vault.connect(investor()).deposit(MIN, investor().address))
        .to.emit(vault, 'Deposit')
        .withArgs(investor().address, investor().address, MIN, MIN * 1_000_000n);

      expect(await vault.balanceOf(investor().address)).to.equal(10n ** 12n);
      expect(await erc20.balanceOf(await vault.getAddress())).to.equal(MIN);
    });

    it('should reject invalid deposits', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await fund(erc20, vault);
      const v = vault.connect(investor());

      await expect(v.deposit(MIN, ethers.ZeroAddress)).to.be.revertedWith('Invalid receiver address');
      await expect(v.deposit(MIN - 1n, investor().address)).to.be.revertedWith(
        'Deposit amount below minimum',
      );
      await expect(v.deposit(MAX + 1n, investor().address)).to.be.revertedWith('Exceeds max deposit');

      await vault.connect(owner()).blockDeposits();
      await expect(v.deposit(MIN, investor().address)).to.be.revertedWith('Forbidden');

      await vault.connect(owner()).pause();
      await expect(v.deposit(MIN, investor().address)).to.be.revertedWith('Unfinished Deal');
    });

    it('should cap deposits on principal, not on donations', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await donateAsOwner(vault, erc20, ethers.parseEther('50'));
      await fund(erc20, vault);
      await vault.connect(investor()).deposit(MAX, investor().address);
      expect(await vault.totalAssets()).to.equal(ethers.parseEther('150'));
    });
  });

  describe('mint', () => {
    it('should charge previewMint assets and emit Deposit', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await fund(erc20, vault);
      const shares = ethers.parseEther('100');
      const assets = await vault.previewMint(shares);
      expect(assets).to.equal(10n ** 14n);

      await expect(vault.connect(investor()).mint(shares, investor().address))
        .to.emit(vault, 'Deposit')
        .withArgs(investor().address, investor().address, assets, shares);

      expect(await vault.balanceOf(investor().address)).to.equal(shares);
      expect(await erc20.balanceOf(await vault.getAddress())).to.equal(assets);
      expect(await vault.maxDeposit(investor().address)).to.equal(MAX - assets);
    });

    it('should reject invalid mints', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await fund(erc20, vault);
      const v = vault.connect(investor());
      const okShares = 10n ** 12n;

      await expect(v.mint(okShares, ethers.ZeroAddress)).to.be.revertedWith('Invalid receiver address');
      await expect(v.mint(0, investor().address)).to.be.revertedWith('Share amount must be positive');
      await expect(v.mint(1_000_000n, investor().address)).to.be.revertedWith(
        'Equivalent asset amount below minimum',
      );
      await expect(v.mint((MAX + 1n) * 1_000_000n, investor().address)).to.be.revertedWith(
        'Exceeds max deposit',
      );

      await vault.connect(owner()).blockDeposits();
      await expect(v.mint(okShares, investor().address)).to.be.revertedWith('Forbidden');

      await vault.connect(owner()).pause();
      await expect(v.mint(okShares, investor().address)).to.be.revertedWith('Unfinished Deal');
    });
  });

  describe('maxDeposit / maxMint', () => {
    it('should return remaining principal headroom', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      expect(await vault.maxDeposit(investor().address)).to.equal(MAX);

      await depositAs(vault, erc20, ethers.parseEther('40'));
      const remaining = ethers.parseEther('60');
      expect(await vault.maxDeposit(investor().address)).to.equal(remaining);
      expect(await vault.maxMint(investor().address)).to.equal(await vault.convertToShares(remaining));
    });

    it('should return 0 when headroom is below the minimum deposit', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, MAX - (MIN - 1n));
      expect(await vault.maxDeposit(investor().address)).to.equal(0);
      expect(await vault.maxMint(investor().address)).to.equal(0);
    });

    it('should return the headroom when it equals the minimum deposit', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, MAX - MIN);
      expect(await vault.maxDeposit(investor().address)).to.equal(MIN);
      expect(await vault.maxMint(investor().address)).to.equal(await vault.convertToShares(MIN));
      await vault.connect(investor()).deposit(MIN, investor().address);
      expect(await vault.maxDeposit(investor().address)).to.equal(0);
      expect(await vault.maxMint(investor().address)).to.equal(0);
    });

    it('should return 0 while paused or deposit-blocked', async () => {
      const { vault } = await deployStandaloneVault(hre, accounts);
      await vault.connect(owner()).blockDeposits();
      expect(await vault.maxDeposit(investor().address)).to.equal(0);
      expect(await vault.maxMint(investor().address)).to.equal(0);

      await vault.connect(owner()).unblockDeposits();
      await vault.connect(owner()).pause();
      expect(await vault.maxDeposit(investor().address)).to.equal(0);
      expect(await vault.maxMint(investor().address)).to.equal(0);
    });
  });

  describe('maxWithdraw / maxRedeem', () => {
    it('should return the holder position when unpaused and 0 when paused', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      const assets = ethers.parseEther('10');
      await depositAs(vault, erc20, assets);
      const shares = await vault.balanceOf(investor().address);

      expect(await vault.maxRedeem(investor().address)).to.equal(shares);
      expect(await vault.maxWithdraw(investor().address)).to.equal(await vault.convertToAssets(shares));
      expect(await vault.maxWithdraw(investor().address)).to.be.greaterThan(0);

      await vault.connect(owner()).pause();
      expect(await vault.maxRedeem(investor().address)).to.equal(0);
      expect(await vault.maxWithdraw(investor().address)).to.equal(0);
    });
  });

  describe('redeem', () => {
    it('should pay out principal plus donated repayment', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, MAX);
      await donateAsOwner(vault, erc20, ethers.parseEther('10'));
      const shares = await vault.balanceOf(investor().address);
      const expected = await vault.convertToAssets(shares);
      const before = await erc20.balanceOf(investor().address);

      await expect(vault.connect(investor()).redeem(shares, investor().address, investor().address))
        .to.emit(vault, 'Withdraw')
        .withArgs(investor().address, investor().address, investor().address, expected, shares);

      expect((await erc20.balanceOf(investor().address)) - before).to.equal(expected);
      expect(expected).to.be.greaterThan(MAX);
      expect(await vault.totalSupply()).to.equal(0);
      expect(await vault.maxDeposit(investor().address)).to.equal(MAX);
    });

    it('should reduce principal by the assets paid out', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, MAX);
      const half = (await vault.balanceOf(investor().address)) / 2n;
      const paid = await vault.convertToAssets(half);

      await vault.connect(investor()).redeem(half, investor().address, investor().address);
      expect(await vault.maxDeposit(investor().address)).to.equal(paid);
    });

    it('should spend allowance when redeeming for another owner', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, ethers.parseEther('10'));
      const shares = await vault.balanceOf(investor().address);
      const spender = accounts.financialAccount;

      await expect(
        vault.connect(spender).redeem(shares, spender.address, investor().address),
      ).to.be.revertedWithCustomError(vault, 'ERC20InsufficientAllowance');

      await vault.connect(investor()).approve(spender.address, shares);
      await vault.connect(spender).redeem(shares, spender.address, investor().address);
      expect(await vault.allowance(investor().address, spender.address)).to.equal(0);
      expect(await erc20.balanceOf(spender.address)).to.equal(ethers.parseEther('10'));
    });

    it('should reject invalid redemptions', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, ethers.parseEther('10'));
      const v = vault.connect(investor());
      const me = investor().address;

      await expect(v.redeem(1, ethers.ZeroAddress, me)).to.be.revertedWith('Invalid receiver address');
      await expect(v.redeem(1, me, ethers.ZeroAddress)).to.be.revertedWith('Invalid owner address');
      await expect(v.redeem(0, me, me)).to.be.revertedWith('Shares must be positive');
      await expect(v.redeem(1, me, me)).to.be.revertedWith('Insufficient assets for redemption');

      await vault.connect(owner()).pause();
      await expect(v.redeem(1, me, me)).to.be.revertedWith('Unfinished Deal');
    });
  });

  describe('withdraw', () => {
    it('should burn previewWithdraw shares and emit Withdraw', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, MAX);
      const assets = ethers.parseEther('30');
      const shares = await vault.previewWithdraw(assets);
      const before = await erc20.balanceOf(investor().address);

      await expect(vault.connect(investor()).withdraw(assets, investor().address, investor().address))
        .to.emit(vault, 'Withdraw')
        .withArgs(investor().address, investor().address, investor().address, assets, shares);

      expect((await erc20.balanceOf(investor().address)) - before).to.equal(assets);
      expect(await vault.maxDeposit(investor().address)).to.equal(assets);
    });

    it('should spend allowance when withdrawing for another owner', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, ethers.parseEther('10'));
      const spender = accounts.financialAccount;
      const assets = ethers.parseEther('5');

      await expect(
        vault.connect(spender).withdraw(assets, spender.address, investor().address),
      ).to.be.revertedWithCustomError(vault, 'ERC20InsufficientAllowance');

      await vault.connect(investor()).approve(spender.address, await vault.previewWithdraw(assets));
      await vault.connect(spender).withdraw(assets, spender.address, investor().address);
      expect(await erc20.balanceOf(spender.address)).to.equal(assets);
    });

    it('should reject invalid withdrawals', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await depositAs(vault, erc20, ethers.parseEther('10'));
      const v = vault.connect(investor());
      const me = investor().address;

      await expect(v.withdraw(1, ethers.ZeroAddress, me)).to.be.revertedWith('Invalid receiver address');
      await expect(v.withdraw(1, me, ethers.ZeroAddress)).to.be.revertedWith('Invalid owner address');
      await expect(v.withdraw(0, me, me)).to.be.revertedWith('Assets must be positive');

      await vault.connect(owner()).pause();
      await expect(v.withdraw(1, me, me)).to.be.revertedWith('Unfinished Deal');
    });
  });

  describe('owner controls', () => {
    it('should pause and unpause', async () => {
      const { vault } = await deployStandaloneVault(hre, accounts);
      await expect(vault.connect(owner()).pause()).to.emit(vault, 'Paused');
      expect(await vault.paused()).to.equal(true);
      await expect(vault.connect(owner()).unpause()).to.emit(vault, 'Unpaused');
      expect(await vault.paused()).to.equal(false);
    });

    it('should block and unblock deposits', async () => {
      const { vault } = await deployStandaloneVault(hre, accounts);
      await expect(vault.connect(owner()).blockDeposits()).to.emit(vault, 'DepositsBlocked');
      expect(await vault.depositBlocked()).to.equal(true);
      await expect(vault.connect(owner()).unblockDeposits()).to.emit(vault, 'DepositsUnblocked');
      expect(await vault.depositBlocked()).to.equal(false);
    });

    it('should set the minimum deposit', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await expect(vault.connect(owner()).setMinDeposit(0)).to.be.revertedWith(
        'Minimum deposit must be positive',
      );
      await vault.connect(owner()).setMinDeposit(5n * MIN);
      expect(await vault.minDeposit()).to.equal(5n * MIN);

      await fund(erc20, vault);
      await expect(vault.connect(investor()).deposit(2n * MIN, investor().address)).to.be.revertedWith(
        'Deposit amount below minimum',
      );
    });

    it('should accept donations without minting shares', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      const amount = ethers.parseEther('10');
      await expect(donateAsOwner(vault, erc20, amount))
        .to.emit(vault, 'Donation')
        .withArgs(owner().address, amount);
      expect(await vault.totalAssets()).to.equal(amount);
      expect(await vault.totalSupply()).to.equal(0);
      await expect(vault.connect(owner()).donate(0)).to.be.revertedWith('Amount must be positive');
    });

    it('should transfer funds to a recipient', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await donateAsOwner(vault, erc20, ethers.parseEther('10'));
      const to = accounts.financialAccount.address;
      const v = vault.connect(owner());

      await expect(v.transferToBorrower(ethers.ZeroAddress, 1)).to.be.revertedWith(
        'Invalid borrower address',
      );
      await expect(v.transferToBorrower(to, 0)).to.be.revertedWith('Amount must be positive');
      await expect(v.transferToBorrower(to, ethers.parseEther('11'))).to.be.revertedWith(
        'Insufficient funds',
      );
      await expect(v.transferToBorrower(to, ethers.parseEther('10')))
        .to.emit(vault, 'TransferToBorrower')
        .withArgs(to, ethers.parseEther('10'));
      expect(await erc20.balanceOf(to)).to.equal(ethers.parseEther('10'));
    });

    it('should complete only after assets exceed maxDeposit', async () => {
      const { erc20, vault } = await deployStandaloneVault(hre, accounts);
      await vault.connect(owner()).pause();
      await donateAsOwner(vault, erc20, MAX);
      await expect(vault.connect(owner()).complete()).to.be.revertedWith('Waiting for borrower funds');

      await donateAsOwner(vault, erc20, 1n);
      await expect(vault.connect(owner()).complete()).to.emit(vault, 'DealCompleted');
      expect(await vault.paused()).to.equal(false);

      // already unpaused: still completes
      await expect(vault.connect(owner()).complete()).to.emit(vault, 'DealCompleted');
    });

    it('should reject every owner-only call from a non-owner', async () => {
      const { vault } = await deployStandaloneVault(hre, accounts);
      const v = vault.connect(investor());
      const calls = [
        () => v.pause(),
        () => v.unpause(),
        () => v.blockDeposits(),
        () => v.unblockDeposits(),
        () => v.setMinDeposit(MIN),
        () => v.donate(1),
        () => v.complete(),
        () => v.transferToBorrower(investor().address, 1),
      ];
      for (const call of calls) {
        await expect(call()).to.be.revertedWithCustomError(vault, 'OwnableUnauthorizedAccount');
      }
    });
  });

  describe('reentrancy', () => {
    async function reentrantVault() {
      const token = await hre.ethers.deployContract('ReentrantERC20Mock', accounts.deployerAccount);
      const { vault } = await deployStandaloneVault(hre, accounts, MAX, token as unknown as ERC20Mock);
      await token.mint(investor().address, MAX);
      await token.connect(investor()).approve(await vault.getAddress(), MAX);
      return { token, vault };
    }

    it('should block reentry during deposit and mint', async () => {
      const { token, vault } = await reentrantVault();
      const me = investor().address;
      const reenter = vault.interface.encodeFunctionData('deposit', [MIN, me]);

      await token.setHook(await vault.getAddress(), reenter);
      await expect(vault.connect(investor()).deposit(MIN, me)).to.be.revertedWithCustomError(
        vault,
        'ReentrancyGuardReentrantCall',
      );

      await token.setHook(await vault.getAddress(), reenter);
      await expect(vault.connect(investor()).mint(10n ** 12n, me)).to.be.revertedWithCustomError(
        vault,
        'ReentrancyGuardReentrantCall',
      );
    });

    it('should block reentry during redeem and withdraw', async () => {
      const { token, vault } = await reentrantVault();
      const me = investor().address;
      await vault.connect(investor()).deposit(ethers.parseEther('10'), me);
      const reenter = vault.interface.encodeFunctionData('redeem', [1n, me, me]);

      await token.setHook(await vault.getAddress(), reenter);
      await expect(
        vault.connect(investor()).redeem(10n ** 18n, me, me),
      ).to.be.revertedWithCustomError(vault, 'ReentrancyGuardReentrantCall');

      await token.setHook(await vault.getAddress(), reenter);
      await expect(
        vault.connect(investor()).withdraw(ethers.parseEther('1'), me, me),
      ).to.be.revertedWithCustomError(vault, 'ReentrancyGuardReentrantCall');
    });
  });
});
