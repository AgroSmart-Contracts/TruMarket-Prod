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
  const erc20 = await hre.ethers.getContractAt(
    'ERC20Mock',
    deployed['ERC20'] as string
  );

  const totalAssets = await vault.totalAssets();
  const maxDeposit = await vault.maxDeposit(bobWallet.address);
  const maxMint = await vault.maxMint(bobWallet.address);
  const paused = await vault.paused();

  console.log('Vault state:', {
    totalAssets: ethers.formatEther(totalAssets),
    maxDeposit: ethers.formatEther(maxDeposit),
    maxMint: ethers.formatEther(maxMint),
    paused,
  });
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
