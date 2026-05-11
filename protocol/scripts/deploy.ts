import { ethers } from 'ethers';
import hre from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [_1, _2, deployerWallet] = await hre.ethers.getSigners();

  const erc20 = await hre.ethers.deployContract('ERC20Mock');
  await erc20.waitForDeployment();

  const dealsManager = await hre.ethers.deployContract('DealsManager', [
    deployerWallet.address,
    await erc20.getAddress(),
  ]);
  await dealsManager.waitForDeployment();

  // const dealVault = await hre.ethers.deployContract('DealVault', [
  //   await erc20.getAddress(),
  //   'Deal Vault',
  //   'DV',
  // ]);
  // await dealVault.waitForDeployment();

  const deployed = {
    'Deals Manager': await dealsManager.getAddress(),
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
