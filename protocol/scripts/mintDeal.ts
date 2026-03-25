import { ethers } from 'ethers';
import hre from 'hardhat';
import deployed from './addresses/deployed.json';

async function main() {
  const [bobWallet, aliceWallet, dealsManagerWallet] = await hre.ethers.getSigners();

  const dealsManager = await hre.ethers.getContractAt(
    'DealsManager',
    deployed['Deals Manager'] as string,
    dealsManagerWallet
  );

  const tx = await dealsManager.mint(
    [0, 0, 100, 0, 0, 0, 0],
    ethers.parseEther('100'),
    bobWallet.address
  );

  // await dealsManager.proceed(2, 1);

  const status = await dealsManager.status(0);
  const borrower = await dealsManager.borrower(0);
  const maxDeposit = await dealsManager.maxDeposit(0);

  console.log('Minted NFT with next details:', {
    owner: dealsManagerWallet.address,
    milestones: [0, 0, 100, 0, 0, 0, 0],
    status,
    borrower,
    maxDeposit,
  });
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
