import { ethers } from 'ethers';
import hre from 'hardhat';
import deployed from './addresses/deployed.json';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [bobWallet, aliceWallet, dealsManagerWallet] = await hre.ethers.getSigners();

  const dealsManager = await hre.ethers.getContractAt(
    'DealsManager',
    deployed['Deals Manager'] as string,
    dealsManagerWallet
  );

  const tx = await dealsManager.mint(
    [0, 0, 100, 0, 0, 0, 0],
    ethers.parseEther('0'),
    dealsManagerWallet.address
  );

  // await dealsManager.proceed(2, 1);

  const status = await dealsManager.status(0);

  console.log('Minted NFT with next details:', {
    owner: dealsManagerWallet.address,
    milestones: [0, 0, 100, 0, 0, 0, 0],
    status,
  });

  const vault = await dealsManager.vault(0);

  fs.writeFileSync(
    path.join(__dirname, './addresses/vaults.json'),
    `
{
  "dealVault":"${vault}"
}
`
  );
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
