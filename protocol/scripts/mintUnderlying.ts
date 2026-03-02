import { ethers } from 'ethers';
import hre from 'hardhat';

import deployed from './addresses/deployed.json';

async function main() {
  const [bobWallet, aliceWallet] = await hre.ethers.getSigners();

  const erc20 = await hre.ethers.getContractAt(
    'ERC20Mock',
    deployed['ERC20'] as string
  );

  const bobErc20Amount = ethers.parseEther('100');
  await erc20.mint(bobWallet.address, bobErc20Amount);

  console.log(
    `BOB: ${ethers.formatEther(
      await erc20.balanceOf(bobWallet.address)
    )} tokens`
  );
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
