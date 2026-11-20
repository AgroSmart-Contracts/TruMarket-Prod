import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import type { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * Deploys DealVaultFactory and DealsManager from `deployer`.
 *
 * The factory is bound at construction to the DealsManager address, which is predicted
 * as the deployer's next nonce. DealsManager's constructor reverts if the binding does
 * not match, so no other transaction may be sent from `deployer` in between.
 */
export async function deployProtocol(
  hre: HardhatRuntimeEnvironment,
  deployer: HardhatEthersSigner,
  owner: string,
  underlying: string,
) {
  const predictedDealsManager = hre.ethers.getCreateAddress({
    from: deployer.address,
    nonce: (await deployer.getNonce('pending')) + 1,
  });

  const vaultFactory = await hre.ethers.deployContract(
    'DealVaultFactory',
    [predictedDealsManager],
    deployer,
  );
  await vaultFactory.waitForDeployment();

  const dealsManager = await hre.ethers.deployContract(
    'DealsManager',
    [owner, underlying, await vaultFactory.getAddress()],
    deployer,
  );
  await dealsManager.waitForDeployment();

  return { vaultFactory, dealsManager };
}
