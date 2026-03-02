import { ethers } from "hardhat";
import { DealVault } from "../typechain-types";
import { formatEther } from "ethers";

async function main() {
  // The specific vault address
  const vaultAddress = "0xF410c6d91D1f7a078c83f02052Dd672f7bEf5Faa";

  console.log("Fetching Donation events for vault:", vaultAddress);

  // Get vault contract instance
  const vault = await ethers.getContractAt("DealVault", vaultAddress) as DealVault;

  try {
    // Get current block
    const currentBlock = await ethers.provider.getBlockNumber();
    console.log("Current block:", currentBlock);

    // Fetch Donation events (last 1000 blocks)
    const startBlock = Math.max(0, currentBlock - 1000);
    const filter = vault.filters.Donation();
    const events = await vault.queryFilter(filter, 32296984, 32296984 + 200);

    console.log("\nFound", events.length, "Donation events:\n");

    // Display each event's details
    for (const event of events) {
      const block = await event.getBlock();
      const timestamp = new Date(Number(block.timestamp) * 1000);

      console.log("Event details:");
      console.log("- Transaction hash:", event.transactionHash);
      console.log("- Block number:", event.blockNumber);
      console.log("- Timestamp:", timestamp.toLocaleString());
      console.log("- Donor:", event.args[0]);
      console.log("- Amount:", formatEther(event.args[1]), "ETH");

      // Get transaction details
      const tx = await event.getTransaction();
      console.log("- From address:", tx.from);
      console.log("- Gas used:", (await event.getTransactionReceipt()).gasUsed.toString());
      console.log(""); // Empty line for readability
    }

    // Get vault's current state
    const totalAssets = await vault.totalAssets();
    const isPaused = await vault.paused();
    const isBlocked = await vault.depositBlocked();

    console.log("\nCurrent vault state:");
    console.log("- Total assets:", formatEther(totalAssets), "ETH");
    console.log("- Paused:", isPaused);
    console.log("- Deposits blocked:", isBlocked);

  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
