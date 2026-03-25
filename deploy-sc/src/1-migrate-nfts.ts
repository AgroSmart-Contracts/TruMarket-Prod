import { AlchemyProvider, ethers } from 'ethers';

require('dotenv').config();

// Minimal ABI for migrating deals + enabling the stage-gated milestone flow.
const DEALS_MANAGER_ABI = [
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function milestones(uint256 tokenId) view returns (uint8[7])',
  'function status(uint256 tokenId) view returns (uint8)',
  'function mint(uint8[7] milestones_, uint256 maxDeposit_, address borrower_)',
  'function proceed(uint256 tokenId_, uint8 milestone_)',
  'function inviteSupplier(uint256 tokenId_, address supplier_)',
  'function publishToInvestors(uint256 tokenId_)',
  'function assignRiskScore(uint256 tokenId_, uint16 riskScore_)',
  'function markDealFunded(uint256 tokenId_)',
  'function setDealCompleted(uint256 tokenId_)',
] as const;

async function main() {
  // Define provider and wallet
  const sepoliaProvider = new AlchemyProvider(
    'sepolia',
    process.env.ALCHEMY_API_KEY
  );
  const polygonAmoyProvider = new ethers.JsonRpcProvider(
    `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
  );
  const sepoliaWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY || '',
    sepoliaProvider
  );
  const polygonAmoyWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY || '',
    polygonAmoyProvider
  );

  // Define contract address and ABI
  const newContractAddress = '0xe74bddDe356bAdD2A7d1E90D9a628543F8ac8477';
  const oldContractAddress = '0xc464d88170d150556c7722a6ccbd5216d744a024';

  // Create contracts instances
  const oldNftContract = new ethers.Contract(
    oldContractAddress,
    DEALS_MANAGER_ABI,
    polygonAmoyWallet
  );

  const newNftContract = new ethers.Contract(
    newContractAddress,
    DEALS_MANAGER_ABI,
    sepoliaWallet
  );

  // Get total NFTs from old contract
  let totalNfts = 0;

  try {
    while (true) {
      await oldNftContract.ownerOf(totalNfts);
      totalNfts++;
    }
  } catch (err) {
    console.log('Total NFTs:', totalNfts);
  }

  // mint NFTs in new contract
  for (let i = 0; i < totalNfts; i++) {
    const owner = (await oldNftContract.ownerOf(i)) as `0x${string}`;
    const milestones = (await oldNftContract.milestones(i)) as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    console.log(`got for nft ${i}: `, milestones, owner);
    const tx = await newNftContract.mint([...milestones], BigInt(0), owner);
    await tx.wait();
    console.log('after minting');

    // Enable the new stage-gated milestone flow so we can sync historical milestone progress.
    await (await newNftContract.inviteSupplier(BigInt(i), sepoliaWallet.address)).wait();
    await (await newNftContract.publishToInvestors(BigInt(i))).wait();
    await (await newNftContract.assignRiskScore(BigInt(i), 50)).wait();
    await (await newNftContract.markDealFunded(BigInt(i))).wait();

    const status = (await oldNftContract.status(i)) as number;

    if (status > 0 && status <= 7) {
      for (let j = 1; j <= status; j++) {
        const tx2 = await newNftContract.proceed(BigInt(i), j);
        await tx2.wait();
      }
    } else if (status === 8) {
      for (let j = 1; j <= 7; j++) {
        const tx2 = await newNftContract.proceed(BigInt(i), j);
        await tx2.wait();
      }

      const tx2 = await newNftContract.setDealCompleted(BigInt(i));
      await tx2.wait();
    }

    const newStatus = await newNftContract.status(i);

    console.log('Minted NFT with next details:', {
      owner,
      milestones,
      oldNftStatus: status,
      status: newStatus,
    });
  }
}

main().catch((error) => {
  console.error('Error deploying contract:', error);
  process.exit(1);
});
