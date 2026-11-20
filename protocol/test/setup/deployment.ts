import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Accounts } from './types';
import { DealsManager, DealVault, DealVaultFactory, ERC20Mock } from '../../typechain-types';
import { deployProtocol } from '../../scripts/lib/deployProtocol';

/**
 * Deploys the token (unless one is given), then DealVaultFactory and DealsManager
 * owned by `dealsManagerAccount`.
 */
export async function deploy(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts,
  token?: ERC20Mock,
): Promise<{ erc20: ERC20Mock; dealsManager: DealsManager; vaultFactory: DealVaultFactory }> {
  const erc20 =
    token ?? (await hre.ethers.deployContract('ERC20Mock', accounts.deployerAccount));
  const { vaultFactory, dealsManager } = await deployProtocol(
    hre,
    accounts.deployerAccount,
    accounts.dealsManagerAccount.address,
    await erc20.getAddress(),
  );
  return { erc20, dealsManager, vaultFactory };
}

/** Mints a deal and returns its vault (paused and deposit-blocked, owned by DealsManager). */
export async function mintDeal(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts,
  dealsManager: DealsManager,
  maxDeposit: bigint = ethers.parseEther('100'),
): Promise<DealVault> {
  const tx = await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(maxDeposit, accounts.financialAccount.address);
  const receipt = await tx.wait();
  const created = receipt!.logs
    .map((log) => dealsManager.interface.parseLog(log))
    .find((event) => event?.name === 'DealCreated');
  const vaultAddress = await dealsManager.vault(created!.args.dealId);
  return hre.ethers.getContractAt('DealVault', vaultAddress);
}

/**
 * Deploys a DealVault directly with `dealsManagerAccount` (an EOA) as owner, to test the
 * legacy deposit/mint/redeem/withdraw path. It starts unpaused and deposit-unblocked,
 * a state DealsManager vaults can no longer reach.
 */
export async function deployStandaloneVault(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts,
  maxDeposit: bigint = ethers.parseEther('100'),
  token?: ERC20Mock,
): Promise<{ erc20: ERC20Mock; vault: DealVault }> {
  const erc20 =
    token ?? (await hre.ethers.deployContract('ERC20Mock', accounts.deployerAccount));
  const vault = await hre.ethers.deployContract(
    'DealVault',
    [await erc20.getAddress(), maxDeposit, maxDeposit, accounts.dealsManagerAccount.address],
    accounts.deployerAccount,
  );
  return { erc20, vault };
}
