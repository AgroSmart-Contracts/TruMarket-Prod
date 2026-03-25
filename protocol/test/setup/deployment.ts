import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Accounts } from './types';
import { DealsManager } from '../../typechain-types';

export async function deploy(
  hre: HardhatRuntimeEnvironment,
  accounts: Accounts
): Promise<{ dealsManager: DealsManager }> {
  const DealsManager = await hre.ethers.getContractFactory('DealsManager');
  const dealsManager = await DealsManager.connect(accounts.deployerAccount).deploy(
    accounts.dealsManagerAccount.address
  );

  return { dealsManager };
}
