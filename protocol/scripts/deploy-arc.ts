import * as fs from 'fs';
import * as path from 'path';

import hre from 'hardhat';

import { ARC_TESTNET } from './cctp/constants';

/**
 * Deploy DealsManager on Arc Testnet using native Arc USDC as underlying.
 * DealVault contracts are deployed automatically when the API calls mint().
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx hardhat run scripts/deploy-arc.ts --network arcTestnet
 */
async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const usdcAddress =
    process.env.ARC_USDC_ADDRESS || ARC_TESTNET.usdcAddress;

  console.log('Deployer:', deployer.address);
  console.log('Underlying USDC:', usdcAddress);
  console.log('Network:', hre.network.name, 'chainId:', (await hre.ethers.provider.getNetwork()).chainId);

  const vaultFactory = await hre.ethers.deployContract('DealVaultFactory');
  await vaultFactory.waitForDeployment();

  const dealsManager = await hre.ethers.deployContract('DealsManager', [
    deployer.address,
    usdcAddress,
    await vaultFactory.getAddress(),
  ]);
  await dealsManager.waitForDeployment();

  const dealsManagerAddress = await dealsManager.getAddress();
  const vaultFactoryAddress = await vaultFactory.getAddress();

  const deployed = {
    network: 'arcTestnet',
    chainId: ARC_TESTNET.chainId,
    deployer: deployer.address,
    dealVaultFactory: vaultFactoryAddress,
    dealsManager: dealsManagerAddress,
    usdc: usdcAddress,
    deployedAt: new Date().toISOString(),
    explorer: `${ARC_TESTNET.explorerUrl}/address/${dealsManagerAddress}`,
  };

  const outPath = path.join(__dirname, './addresses/arc-testnet.json');
  fs.writeFileSync(outPath, JSON.stringify(deployed, null, 2));

  console.log('\nDeployed DealVaultFactory:', vaultFactoryAddress);
  console.log('Deployed DealsManager:', dealsManagerAddress);
  console.log('Explorer:', deployed.explorer);
  console.log('Saved:', outPath);
  console.log('\nNext steps:');
  console.log('  1. Fund deployer with Arc testnet USDC (gas) from https://faucet.circle.com');
  console.log('  2. Set API env: DEALS_MANAGER_CONTRACT_ADDRESS=' + dealsManagerAddress);
  console.log('     (DealVaultFactory for reference only: ' + vaultFactoryAddress + ')');
  console.log('  3. Set API env: INVESTMENT_TOKEN_CONTRACT_ADDRESS=' + usdcAddress);
  console.log('  4. Set API env: DEAL_CHAIN_ID=' + ARC_TESTNET.chainId);
  console.log('  5. Set API env: DEAL_CHAIN_RPC_URL=' + ARC_TESTNET.rpcUrl);
  console.log('  6. Set web env: NEXT_PUBLIC_DEAL_NFT_CONTRACT_ADDRESS=' + dealsManagerAddress);
  console.log('  7. Set AUTOMATIC_DEALS_ACCEPTANCE=true to mint DealVault on deal create');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
