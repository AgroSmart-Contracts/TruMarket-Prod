import { ethers } from 'ethers';
import hre from 'hardhat';

import deployed from './addresses/deployed.json';

async function main() {
  const [bobWallet, aliceWallet] = await hre.ethers.getSigners();

  const dealsManager = await hre.ethers.getContractAt(
    'DealsManager',
    deployed['Deals Manager'] as string
  );

  const status = await dealsManager.status(0);
  const milestones = await dealsManager.milestones(0);
  const vault = await dealsManager.vault(0);

  console.log('NFT details:', {
    status,
    milestones,
    vault,
  });
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
