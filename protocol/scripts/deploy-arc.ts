import * as fs from 'fs';
import * as path from 'path';

import hre from 'hardhat';

import { ARC_MAINNET, ARC_TESTNET } from './cctp/constants';

type ArcNetworkConfig = typeof ARC_MAINNET | typeof ARC_TESTNET;

/**
 * Deploy DealVaultFactory + DealsManager on Arc (testnet or mainnet).
 * DealVault contracts are deployed automatically when the API calls mint().
 *
 * Usage:
 *   PRIVATE_KEY=0x... npx hardhat run scripts/deploy-arc.ts --network arcTestnet
 *   PRIVATE_KEY=0x... npx hardhat run scripts/deploy-arc.ts --network arcMainnet
 */
async function main() {
  const networkName = hre.network.name;
  const arcConfig: ArcNetworkConfig =
    networkName === 'arcMainnet' ? ARC_MAINNET : ARC_TESTNET;

  if (networkName !== 'arcMainnet' && networkName !== 'arcTestnet') {
    throw new Error(
      `Unsupported network "${networkName}". Use --network arcTestnet or arcMainnet.`,
    );
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error(
      'No deployer account. Set PRIVATE_KEY or BLOCKCHAIN_PRIVATE_KEY in protocol/.env',
    );
  }

  const usdcAddress = process.env.ARC_USDC_ADDRESS || arcConfig.usdcAddress;
  const chainId = Number((await hre.ethers.provider.getNetwork()).chainId);

  if (chainId !== arcConfig.chainId) {
    throw new Error(
      `Chain ID mismatch: expected ${arcConfig.chainId}, got ${chainId}`,
    );
  }

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Network:', networkName, 'chainId:', chainId);
  console.log('Deployer:', deployer.address);
  console.log('Underlying USDC:', usdcAddress);
  console.log('Native balance (gas):', hre.ethers.formatEther(balance), 'USDC');

  if (balance === 0n) {
    throw new Error(
      `Deployer ${deployer.address} has zero native USDC for gas on ${networkName}. Fund the wallet before deploying.`,
    );
  }

  if (networkName === 'arcMainnet') {
    console.log(
      '\n⚠️  MAINNET DEPLOY — real USDC gas. Confirm addresses after broadcast.\n',
    );
  }

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

  const addressFile =
    networkName === 'arcMainnet' ? 'arc-mainnet.json' : 'arc-testnet.json';

  const deployed = {
    network: networkName,
    chainId: arcConfig.chainId,
    deployer: deployer.address,
    dealVaultFactory: vaultFactoryAddress,
    dealsManager: dealsManagerAddress,
    usdc: usdcAddress,
    deployedAt: new Date().toISOString(),
    explorer: `${arcConfig.explorerUrl}/address/${dealsManagerAddress}`,
  };

  const outPath = path.join(__dirname, './addresses', addressFile);
  fs.writeFileSync(outPath, JSON.stringify(deployed, null, 2));

  console.log('\nDeployed DealVaultFactory:', vaultFactoryAddress);
  console.log('Deployed DealsManager:', dealsManagerAddress);
  console.log('Explorer:', deployed.explorer);
  console.log('Saved:', outPath);
  console.log('\nNext steps (API / web):');
  console.log('  DEALS_MANAGER_CONTRACT_ADDRESS=' + dealsManagerAddress);
  console.log('  INVESTMENT_TOKEN_CONTRACT_ADDRESS=' + usdcAddress);
  console.log('  BLOCKCHAIN_CHAIN_ID=' + arcConfig.chainId);
  console.log('  BLOCKCHAIN_RPC_URL=' + arcConfig.rpcUrl);
  console.log('  NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=' + dealsManagerAddress);
  console.log('  AUTOMATIC_DEALS_ACCEPTANCE=true');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
