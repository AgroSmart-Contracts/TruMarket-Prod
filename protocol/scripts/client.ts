import { ethers } from 'ethers';
import hre from 'hardhat';

const deployed: Record<string, string> = {
  'Deals Manager': '0x5fbdb2315678afecb367f032d93f642f64180aa3',
  ERC20: '0xe7f1725e7734ce288f8367e1bb143e90bb3f0512',
  'Deal Vault': '0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0',
};

const whitelistActions = {
  mintDeal: false,
  mintERC20forBob: false,
  mintERC20forVault: false,
  mintBobShares: false,
  redeemBobShares: false,
};

async function main() {
  const [bobWallet, aliceWallet] = await hre.ethers.getSigners();

  if (whitelistActions.mintDeal) {
    const dealsManager = await hre.ethers.getContractAt(
      'DealsManager',
      deployed['Deals Manager']
    );
    await dealsManager.mint(
      [0, 0, 100, 0, 0, 0, 0],
      ethers.parseEther('0'),
      bobWallet.address
    );

    const deals = await dealsManager.balanceOf(bobWallet.address);
    console.log(deals);
  }

  const erc20 = await hre.ethers.getContractAt('ERC20Mock', deployed['ERC20']);

  if (whitelistActions.mintERC20forBob) {
    const bobErc20Amount = ethers.parseEther('10');
    await erc20.mint(bobWallet.address, bobErc20Amount);
  }

  if (whitelistActions.mintERC20forVault) {
    const vaultErc20Amount = ethers.parseEther('10');
    await erc20.mint(deployed['Deal Vault'], vaultErc20Amount);
  }

  console.log(
    `BOB: ${ethers.formatEther(
      await erc20.balanceOf(bobWallet.address)
    )} tokens`
  );

  const dealVault = await hre.ethers.getContractAt(
    'DealVault',
    deployed['Deal Vault']
  );

  if (whitelistActions.mintBobShares) {
    await erc20.approve(deployed['Deal Vault'], ethers.parseEther('5'));

    await dealVault.connect(bobWallet).deposit(
      ethers.parseEther('5'),
      bobWallet.address
    );
  }

  if (whitelistActions.redeemBobShares) {
    await dealVault.connect(bobWallet).redeem(
      ethers.parseEther('5'),
      bobWallet.address,
      bobWallet.address
    );
  }

  console.log(
    `BOB: ${ethers.formatEther(
      await dealVault.balanceOf(bobWallet.address)
    )} shares`
  );
  console.log(
    `DEAL VAULT: ${ethers.formatEther(
      await erc20.balanceOf(deployed['Deal Vault'])
    )} tokens`
  );
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
