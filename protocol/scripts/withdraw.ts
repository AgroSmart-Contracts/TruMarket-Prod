import { ethers } from "hardhat";
import { DealVault } from "../typechain-types";

async function main() {
  const [signer] = await ethers.getSigners();

  // Parameters
  const vaultAddress = "0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e";
  const amount = ethers.parseEther("610"); // Default to 1 ETH if not specified
  const receiver = process.env.RECEIVER_ADDRESS || signer.address;
  const owner = process.env.OWNER_ADDRESS || signer.address;

  if (!vaultAddress) {
    throw new Error("VAULT_ADDRESS environment variable is required");
  }

  console.log("Withdrawing from vault with parameters:");
  console.log("- Vault address:", vaultAddress);
  console.log("- Amount:", ethers.formatEther(amount), "ETH");
  console.log("- Receiver:", receiver);
  console.log("- Owner:", owner);
  console.log("- Signer:", signer.address);

  // Get vault contract instance
  const vault = await ethers.getContractAt("DealVault", vaultAddress) as DealVault;

  try {
    // Check if the vault is paused
    // const isPaused = await vault.paused();
    // if (isPaused) {
    //   throw new Error("Vault is paused. Cannot withdraw funds.");
    // }

    const totalAssets = await vault.totalAssets();
    console.log("Total assets:", ethers.formatEther(totalAssets));
    const totalSupply = await vault.totalSupply();
    console.log("Total supply:", ethers.formatEther(totalSupply));

    // Check owner's share balance
    const shareBalance = await vault.balanceOf(owner);
    console.log("Owner's share balance:", ethers.formatEther(shareBalance));

    // Perform the withdrawal
    const tx = await vault.connect(signer).withdraw(amount, receiver, owner);
    console.log("Withdrawal transaction submitted:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt?.blockNumber);

    // Get final balances
    const finalShareBalance = await vault.balanceOf(owner);
    console.log("Final share balance:", ethers.formatEther(finalShareBalance));

    const assetToken = await ethers.getContractAt("IERC20", await vault.asset());
    const receiverBalance = await assetToken.balanceOf(receiver);
    console.log("Receiver's token balance:", ethers.formatEther(receiverBalance));

  } catch (error) {
    console.error("Error during withdrawal:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

