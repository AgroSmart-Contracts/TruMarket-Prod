import { ethers } from 'ethers';
import hre from 'hardhat';

import deployed from './addresses/deployed.json';

// const wallet = '0x6bc9A4Cd646754f3bEd42b779F9b0C061D279e9D';
// const wallet = '0x0b00Ef4025bE8067bf00A60d54Ca0e60607c1e8d'; // buyer
// const wallet = '0x970C5F910C119217F9e4808578552a45d4E6FEcb'; // investor
// const wallet = '0x68746887795659d5bD7D57Ef5398419AA15ff34b';
const wallet = '0x180b6DdbC81e860BcF8d2cafFf6186e3c9C22a5a'

async function main() {
  const [bobWallet, aliceWallet] = await hre.ethers.getSigners();

  const erc20 = await hre.ethers.getContractAt(
    'ERC20Mock',
    deployed['ERC20'] as string
  );

  const bobErc20Amount = ethers.parseEther('100');
  await erc20.mint(bobWallet.address, bobErc20Amount);

  const aliceErc20Amount = ethers.parseEther('100');
  await erc20.mint(aliceWallet.address, aliceErc20Amount);

  const walletErc20Amount = ethers.parseEther('1000');
  await erc20.mint(wallet, walletErc20Amount);

  const ethAmount = ethers.parseEther('10');
  await bobWallet.sendTransaction({
    to: wallet,
    value: ethAmount
  });

  console.log(
    `BOB: ${ethers.formatEther(
      await erc20.balanceOf(bobWallet.address)
    )} tokens`
  );
  console.log(
    `ALICE: ${ethers.formatEther(
      await erc20.balanceOf(aliceWallet.address)
    )} tokens`
  );


}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
