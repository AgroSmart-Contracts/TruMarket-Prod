import hre from 'hardhat';

import deployed from './addresses/deployed.json';

async function main() {
  const dealsManager = await hre.ethers.getContractAt(
    'DealsManager',
    deployed['Deals Manager'] as string
  );

  const completed = await dealsManager.completed(0);
  const vault = await dealsManager.vault(0);
  const maxDeposit = await dealsManager.maxDeposit(0);
  const borrower = await dealsManager.borrower(0);

  console.log('NFT details:', {
    completed,
    vault,
    maxDeposit: maxDeposit.toString(),
    borrower,
  });
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
