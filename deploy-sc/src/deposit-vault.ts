import { AlchemyProvider, ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Contract ABI for DealVault - only including functions we need
const DEALVAULT_ABI = [
  "function deposit(uint256 assets, address receiver) returns (uint256)",
  "function minDeposit() view returns (uint256)",
  "function paused() view returns (bool)",
  "function depositBlocked() view returns (bool)",
  "function asset() view returns (address)"
];

// ERC20 ABI - only including functions we need
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

async function main() {
  // Configuration
  const VAULT_ADDRESS = "0xF600C099d9072E70E806c385fd4c1E730F511Da3";
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  const BASE_RPC = "https://mainnet.base.org";

  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY environment variable is required");
  }

  // Connect to Base network
  const provider = new AlchemyProvider('base', process.env.ALCHEMY_API_KEY);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  console.log("Using wallet address:", wallet.address);

  // Connect to DealVault contract
  const vaultContract = new ethers.Contract(VAULT_ADDRESS, DEALVAULT_ABI, wallet);

  // Check if vault is accepting deposits
  const isPaused = await vaultContract.paused();
  const isBlocked = await vaultContract.depositBlocked();
  if (isPaused || isBlocked) {
    throw new Error("Vault is not accepting deposits (paused or blocked)");
  }

  // Get minimum deposit amount
  const minDeposit = await vaultContract.minDeposit();
  console.log("Minimum deposit amount:", minDeposit.toString());

  // Get underlying token address
  const tokenAddress = await vaultContract.asset();
  console.log("Underlying token address:", tokenAddress);

  // Connect to the underlying token contract
  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const decimals = await tokenContract.decimals();

  // Check our token balance
  const balance = await tokenContract.balanceOf(wallet.address);
  console.log("Token balance:", ethers.formatUnits(balance, decimals));


  // // Amount to deposit (using minimum deposit amount for this example)
  const depositAmount = minDeposit;
  console.log("Depositing amount:", depositAmount);

  // Approve vault to spend our tokens
  console.log("Approving tokens...");
  const approveTx = await tokenContract.approve(VAULT_ADDRESS, depositAmount);
  await approveTx.wait();
  console.log("Approval confirmed in tx:", approveTx.hash);

  // Deposit into vault
  console.log("Depositing tokens...");
  const depositTx = await vaultContract.deposit(depositAmount, wallet.address);
  const receipt = await depositTx.wait();
  console.log("Deposit confirmed in tx:", depositTx.hash);

  // // Get deposit event details
  // const depositEvent = receipt?.logs.find(
  //   (log: ethers.Log) => log.topics[0] === ethers.id("Deposit(address,address,uint256,uint256)")
  // );
  // if (depositEvent) {
  //   const parsedLog = vaultContract.interface.parseLog({
  //     topics: depositEvent.topics,
  //     data: depositEvent.data
  //   });
  //   if (parsedLog) {
  //     console.log("Shares received:", parsedLog.args[3].toString());
  //   }
  // }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
