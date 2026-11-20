import { ethers } from 'ethers';
import hre from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';
import { deployProtocol } from './lib/deployProtocol';

async function main() {
  const [deployer, , deployerWallet] = await hre.ethers.getSigners();

  const erc20 = await hre.ethers.deployContract('ERC20Mock', deployer);
  await erc20.waitForDeployment();

  const { vaultFactory, dealsManager } = await deployProtocol(
    hre,
    deployer,
    deployerWallet.address,
    await erc20.getAddress(),
  );

  // const dealVault = await hre.ethers.deployContract('DealVault', [
  //   await erc20.getAddress(),
  //   'Deal Vault',
  //   'DV',
  // ]);
  // await dealVault.waitForDeployment();

  const deployed = {
    'Deals Manager': await dealsManager.getAddress(),
    'Deal Vault Factory': await vaultFactory.getAddress(),
    ERC20: await erc20.getAddress(),
    // 'Deal Vault': await dealVault.getAddress(),
  };

  fs.writeFileSync(
    path.join(__dirname, './addresses/deployed.json'),
    JSON.stringify(deployed, null, 2)
  );
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
