import { ethers } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Accounts } from './types';
import { DealsManager, ERC20Mock } from '../../typechain-types';

export async function deploy(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts
): Promise<{
  erc20: ERC20Mock;
  dealsManager: DealsManager;
}> {
  const ERC20Mock = await hre.ethers.getContractFactory('ERC20Mock');
  const erc20 = await ERC20Mock.connect(accounts.deployerAccount).deploy();

  const DealsManager = await hre.ethers.getContractFactory('DealsManager');
  const dealsManager = await DealsManager.connect(accounts.deployerAccount).deploy(
    accounts.dealsManagerAccount.address,
    erc20.target
  );

  return { erc20, dealsManager };
}
