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

  const milestones: [number, number, number, number, number, number, number] = [
    0, 0, 100, 0, 0, 0, 0
  ];
  const vaultFunds = ethers.parseEther('100');

  // Create deal
  await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(milestones, vaultFunds, accounts.financialAccount.address);

  const vaultAddress = await dealsManager.vault(0);

  // mint investor tokens
  await erc20
    .connect(accounts.deployerAccount)
    .mint(accounts.investorAccount.address, ethers.parseEther('500'));

  // allow vault to transfer investor funds
  await erc20
    .connect(accounts.investorAccount)
    .approve(vaultAddress, ethers.parseEther('100'));

  const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

  // deposit investor funds
  await dealVault
    .connect(accounts.investorAccount)
    .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

  // mint borrower tokens
  await erc20
    .connect(accounts.deployerAccount)
    .mint(accounts.financialAccount.address, ethers.parseEther('500'));

  // allow vault to transfer borrower funds
  await erc20
    .connect(accounts.financialAccount)
    .approve(vaultAddress, ethers.parseEther('500'));

  // proceed through all milestones
  for (let i = 1; i <= 7; i++) {
    await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, i);
  }

  // Approve the DealsManager to spend tokens
  await erc20
    .connect(accounts.financialAccount)
    .approve(await dealsManager.getAddress(), ethers.parseEther('110'));

  // Donate to the deal through DealsManager
  await dealsManager
    .connect(accounts.financialAccount)
    .donateToDeal(0, ethers.parseEther('110'));

  // complete the deal
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

  const milestones: [number, number, number, number, number, number, number] = [
    50, 0, 0, 0, 0, 0, 50
  ];
  const vaultFunds = ethers.parseEther('100');

  // Create deal
  await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(milestones, vaultFunds, accounts.financialAccount.address);

  const vaultAddress = await dealsManager.vault(0);

  // mint investor tokens
  await erc20
    .connect(accounts.deployerAccount)
    .mint(accounts.investorAccount.address, ethers.parseEther('500'));

  // allow vault to transfer investor funds
  await erc20
    .connect(accounts.investorAccount)
    .approve(vaultAddress, ethers.parseEther('100'));

  const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

  // deposit funds
  await dealVault
    .connect(accounts.investorAccount)
    .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

  // proceed to milestone 1
  await dealsManager.connect(accounts.dealsManagerAccount).proceed(0, 1);

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

  const milestones: [number, number, number, number, number, number, number] = [
    10, 0, 20, 0, 30, 0, 40
  ];
  const vaultFunds = ethers.parseEther('100');

  // Create deal
  await dealsManager
    .connect(accounts.dealsManagerAccount)
    .mint(milestones, vaultFunds, accounts.financialAccount.address);

  const vaultAddress = await dealsManager.vault(0);

  // mint investor tokens
  await erc20
    .connect(accounts.deployerAccount)
    .mint(accounts.investorAccount.address, ethers.parseEther('500'));

  // allow vault to transfer investor funds
  await erc20
    .connect(accounts.investorAccount)
    .approve(vaultAddress, ethers.parseEther('100'));

  const dealVault = await hre.ethers.getContractAt('DealVault', vaultAddress) as DealVault;

  // deposit funds
  await dealVault
    .connect(accounts.investorAccount)
    .deposit(ethers.parseEther('100'), accounts.investorAccount.address);

  return {
    erc20,
    dealsManager,
    dealVault,
  };
}
