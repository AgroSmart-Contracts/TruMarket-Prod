import { AlchemyProvider, ethers } from 'ethers';
import { DealsManagerContract } from './contract';

require('dotenv').config();

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
    DealsManagerContract.abi,
    polygonAmoyWallet
  );

  const newNftContract = new ethers.Contract(
    newContractAddress,
    DealsManagerContract.abi,
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

    const status = (await oldNftContract.status(i)) as number;
    for (let j = 1; j <= status; j++) {
      const tx = await newNftContract.proceed(BigInt(i), j);
      await tx.wait();
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
