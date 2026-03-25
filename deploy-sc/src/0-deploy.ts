import { AlchemyProvider, ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

require('dotenv').config();

async function main() {
  const artifactPath = path.join(
    __dirname,
    '../../protocol/artifacts/contracts/DealsManager.sol/DealsManager.json'
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

  // Define provider and wallet
  const provider = new AlchemyProvider('base', process.env.ALCHEMY_API_KEY);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);

  // Create a ContractFactory
  const factory = new ethers.ContractFactory(
    artifact.abi,
    artifact.bytecode,
    wallet
  );

  // Deploy the contract
  const contract = await factory.deploy(
    wallet.address,
  );

  // Wait for the contract to be mined
  const deployedContract = await contract.waitForDeployment();

  console.log(
    'Contract deployed to address:',
    await deployedContract.getAddress()
  );
}

main().catch((error) => {
  console.error('Error deploying contract:', error);
  process.exit(1);
});
