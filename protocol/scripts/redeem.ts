import { ethers } from 'ethers';
import hre from 'hardhat';

import contracts from './addresses/vaults.json';
import deployed from './addresses/deployed.json';

const vaultAddress = contracts['dealVault'] || '0xCafac3dD18aC6c6e92c921884f9E4176737C052c';

async function main() {
  const [bobWallet, aliceWallet] = await hre.ethers.getSigners();

  const vault = await hre.ethers.getContractAt(
    'DealVault',
    vaultAddress as string
  );

  await vault.connect(bobWallet).redeem(
    ethers.parseEther('100'),
    bobWallet.address,
    bobWallet.address
  );

  console.log(
    `BOB: ${ethers.formatEther(
      await vault.balanceOf(bobWallet.address)
    )} shares`
  );
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
