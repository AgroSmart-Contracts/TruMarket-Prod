import { AlchemyProvider, ethers } from 'ethers';
import { DealsManagerContract } from './contract';

require('dotenv').config();

async function main() {
  // Define provider and wallet
  const sepoliaProvider = new AlchemyProvider(
    'sepolia',
    process.env.ALCHEMY_API_KEY
  );
  const sepoliaWallet = new ethers.Wallet(
    process.env.PRIVATE_KEY || '',
    sepoliaProvider
  );

  // Define contract address and ABI
  const newContractAddress = '0xE674499B626cf872Def5E373D36b6139ED357e71';

  // Create contracts instances

  const newNftContract = new ethers.Contract(
    newContractAddress,
    DealsManagerContract.abi,
    sepoliaWallet
  );

  // Get total NFTs from old contract
  let totalNfts = 0;

  try {
    while (true) {
      await newNftContract.ownerOf(totalNfts);
      totalNfts++;
    }
  } catch (err) {
    console.log('Total NFTs:', totalNfts);
  }

  // mint NFTs in new contract
  const tx = await newNftContract.mint(
    [0, 0, 100, 0, 0, 0, 0],
    BigInt(0),
    sepoliaWallet.address
  );

  await tx.wait();
  // for (let i = 0; i < totalNfts; i++) {
  //   const owner = (await oldNftContract.ownerOf(i)) as `0x${string}`;
  //   const milestones = (await oldNftContract.milestones(i)) as [
  //     number,
  //     number,
  //     number,
  //     number,
  //     number,
  //     number,
  //     number,
  //   ];
  //   console.log(`got for nft ${i}: `, milestones, owner);
  //   const tx = await newNftContract.mint([...milestones], BigInt(0), owner);
  //   await tx.wait();
  //   console.log('after minting');

  //   const status = (await oldNftContract.status(i)) as number;
  //   for (let j = 1; j <= status; j++) {
  //     const tx = await newNftContract.proceed(BigInt(i), j);
  //     await tx.wait();
  //   }

  //   const newStatus = await newNftContract.status(i);

  //   console.log('Minted NFT with next details:', {
  //     owner,
  //     milestones,
  //     oldNftStatus: status,
  //     status: newStatus,
  //   });
  // }
}

main().catch((error) => {
  console.error('Error deploying contract:', error);
  process.exit(1);
});
