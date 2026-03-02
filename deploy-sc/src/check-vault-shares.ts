import { AlchemyProvider, ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Contract ABI for DealVault - only including functions we need
const DEALVAULT_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function convertToAssets(uint256 shares) view returns (uint256)",
  "function maxWithdraw(address owner) view returns (uint256)"
];

async function main() {
  // Configuration
  const VAULT_ADDRESS = "0xF600C099d9072E70E806c385fd4c1E730F511Da3";
  const WALLET_TO_CHECK = "0xb31625732E0Eb25631ecED2E3860e34492681401";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Connect to Base network
  const provider = new AlchemyProvider('base', process.env.ALCHEMY_API_KEY);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Connected with wallet:", wallet.address);

  // Connect to DealVault contract
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, DEALVAULT_ABI, wallet);

  try {
    // Get the share balance
    const shareBalance = await vaultContract.balanceOf(WALLET_TO_CHECK);

    // Get total supply for context
    const totalSupply = await vaultContract.totalSupply();

    // Get the equivalent asset amount
    const assetAmount = await vaultContract.convertToAssets(shareBalance);

    const maxWithdraw = await vaultContract.maxWithdraw(WALLET_TO_CHECK);

    // Format the numbers for better readability
    const formattedShares = ethers.formatUnits(shareBalance, 6); // DLS tokens use 18 decimals
    const formattedAssets = ethers.formatUnits(assetAmount, 6); // USDC uses 6 decimals
    const formattedTotalSupply = ethers.formatUnits(totalSupply, 6);
    const formattedMaxWithdraw = ethers.formatUnits(maxWithdraw, 6);

    console.log("\nShare Balance Check Results:");
    console.log("----------------------------------------");
    console.log(`Wallet Address: ${WALLET_TO_CHECK}`);
    console.log(`Share Balance: ${formattedShares} DLS`);
    console.log(`Total Supply: ${formattedTotalSupply} DLS`);
    console.log(`Share Percentage: ${(Number(formattedShares) / Number(formattedTotalSupply) * 100).toFixed(2)}%`);
    console.log(`Equivalent Asset Amount: ${formattedAssets} USDC`);
    console.log(`Max Withdraw: ${formattedMaxWithdraw} USDC`);
    console.log("----------------------------------------\n");
  } catch (error) {
    console.error("Error checking share balance:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
