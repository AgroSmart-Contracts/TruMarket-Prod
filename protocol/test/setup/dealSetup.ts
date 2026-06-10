import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Accounts } from './types';
import { DealsManager, ERC20Mock, DealVault } from '../../typechain-types';
import { deploy } from './deployment';

export async function setupCompleteDealToRedeem(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts
): Promise<{
  erc20: ERC20Mock;
  dealsManager: DealsManager;
  dealVault: DealVault;
}> {
  const { erc20, dealsManager } = await deploy(hre, accounts);

  const vaultFunds = ethers.parseEther('100');

  await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(vaultFunds, accounts.financialAccount.address);

  const vaultAddress = await dealsManager.vault(0);
  const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

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
    .mint(accounts.financialAccount.address, ethers.parseEther('500'));

  await erc20
    .connect(accounts.financialAccount)
    .approve(await dealsManager.getAddress(), ethers.parseEther('110'));

  await dealsManager
    .connect(accounts.financialAccount)
    .donateToDeal(0, ethers.parseEther('110'));

  await dealsManager.connect(accounts.dealsManagerAccount).setDealCompleted(0);

  return {
    erc20,
    dealsManager,
    dealVault,
  };
}

export async function setupPartialDealToRedeem(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts
): Promise<{
  erc20: ERC20Mock;
  dealsManager: DealsManager;
  dealVault: DealVault;
}> {
  const { erc20, dealsManager } = await deploy(hre, accounts);

  const vaultFunds = ethers.parseEther('100');

  await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(vaultFunds, accounts.financialAccount.address);

  const vaultAddress = await dealsManager.vault(0);

  await erc20
    .connect(accounts.deployerAccount)
    .mint(accounts.investorAccount.address, ethers.parseEther('500'));

  await erc20
    .connect(accounts.investorAccount)
    .approve(vaultAddress, ethers.parseEther('100'));

  const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

  await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

  await dealVault
    .connect(accounts.investorAccount)
    .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

  return {
    erc20,
    dealsManager,
    dealVault,
  };
}

export async function setupUnstartedDealToRedeem(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts
): Promise<{
  erc20: ERC20Mock;
  dealsManager: DealsManager;
  dealVault: DealVault;
}> {
  const { erc20, dealsManager } = await deploy(hre, accounts);

  const vaultFunds = ethers.parseEther('100');

  await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(vaultFunds, accounts.financialAccount.address);

  const vaultAddress = await dealsManager.vault(0);

  await erc20
    .connect(accounts.deployerAccount)
    .mint(accounts.investorAccount.address, ethers.parseEther('500'));

  await erc20
    .connect(accounts.investorAccount)
    .approve(vaultAddress, ethers.parseEther('100'));

  const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

  await dealsManager.connect(accounts.dealsManagerAccount).reopenVault(0);

  await dealVault
    .connect(accounts.investorAccount)
    .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

  return {
    erc20,
    dealsManager,
    dealVault,
  };
}
