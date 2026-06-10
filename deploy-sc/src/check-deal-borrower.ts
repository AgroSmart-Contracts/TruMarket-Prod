import { AlchemyProvider, ethers } from "ethers";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// ABI for the functions and events we need
const DEALS_MANAGER_ABI = [
  "event DealCreated(uint256 indexed dealId, address indexed borrower, uint256 maxDeposit)",
  "event DealBorrowerChanged(uint256 indexed dealId, address indexed oldBorrower, address indexed newBorrower)"
] as const;

async function queryEventsInChunks(
  contract: ethers.Contract,
  filter: any,
  startBlock: number,
  endBlock: number
): Promise<ethers.EventLog[]> {
  const CHUNK_SIZE = 500;
  const events: ethers.EventLog[] = [];

  for (let i = startBlock; i <= endBlock; i += CHUNK_SIZE) {
    const toBlock = Math.min(i + CHUNK_SIZE - 1, endBlock);
    const chunk = await contract.queryFilter(filter, i, toBlock) as ethers.EventLog[];
    events.push(...chunk);
  }

  return events;
}

async function main() {
  const tokenId = 4;

  // Connect to the network
  const provider = new AlchemyProvider('base', process.env.ALCHEMY_API_KEY);

  // Create a contract instance
  const dealsManager = new ethers.Contract(process.env.DEALS_MANAGER_ADDRESS || "", DEALS_MANAGER_ABI, provider);

  try {
    // Get the current block number
    const currentBlock = await provider.getBlockNumber();
    // For this example, we'll start from a recent block range (last 10000 blocks)
    // Adjust these numbers based on when your contract was deployed
    const startBlock = Math.max(0, currentBlock - 10000);

    // Get DealCreated events for this token
    const dealCreatedFilter = dealsManager.filters.DealCreated(tokenId);
    const dealCreatedEvents = await queryEventsInChunks(dealsManager, dealCreatedFilter, startBlock, currentBlock);

    // Get DealBorrowerChanged events for this token
    const borrowerChangedFilter = dealsManager.filters.DealBorrowerChanged(tokenId);
    const borrowerChangedEvents = await queryEventsInChunks(dealsManager, borrowerChangedFilter, startBlock, currentBlock);

    if (dealCreatedEvents.length === 0) {
      console.log(`No deal found with token ID ${tokenId}`);
      return;
    }

    // Get initial borrower from DealCreated event
    let currentBorrower = dealCreatedEvents[0].args[1]; // borrower is the second argument
    console.log(`Initial borrower: ${currentBorrower}`);

    // If there were any borrower changes, show the history
    if (borrowerChangedEvents.length > 0) {
      console.log("\nBorrower change history:");
      borrowerChangedEvents.forEach((event, index) => {
        console.log(`Change ${index + 1}:`);
        console.log(`  From: ${event.args[1]}`); // oldBorrower is the second argument
        console.log(`  To: ${event.args[2]}`);   // newBorrower is the third argument
        currentBorrower = event.args[2];
      });
    }

    console.log(`\nCurrent borrower: ${currentBorrower}`);
  } catch (error) {
    console.error("Error fetching deal borrower:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
