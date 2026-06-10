import { ethers } from 'ethers';
import hre from 'hardhat';
import deployed from './addresses/deployed.json';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [, , dealsManagerWallet] = await hre.ethers.getSigners();

  const dealsManager = await hre.ethers.getContractAt(
    'DealsManager',
    deployed['Deals Manager'] as string,
    dealsManagerWallet
  );

  await dealsManager.mint(
    ethers.parseEther('100'),
    dealsManagerWallet.address
  );

  const completed = await dealsManager.completed(0);
  const vault = await dealsManager.vault(0);

  console.log('Minted NFT with next details:', {
    owner: dealsManagerWallet.address,
    completed,
    vault,
  });

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
