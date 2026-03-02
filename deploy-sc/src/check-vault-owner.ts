import { AlchemyProvider, ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Minimal ABI for owner() function
const VAULT_ABI = [
  "function owner() view returns (address)"
];

async function main() {
  // The vault address to check
  const vaultAddress = "0xF600C099d9072E70E806c385fd4c1E730F511Da3";


  // Connect to the network
  const provider = new AlchemyProvider('base', process.env.ALCHEMY_API_KEY);

  // Create a contract instance
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);

  try {
    // Get the owner
    const owner = await vault.owner();
    console.log(`Vault Owner: ${owner}`);
  } catch (error) {
    console.error("Error fetching vault owner:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
