import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { BaseContract, Interface, BigNumberish } from 'ethers';

export interface Accounts {
  deployerAccount: HardhatEthersSigner;
  financialAccount: HardhatEthersSigner;
  dealsManagerAccount: HardhatEthersSigner;
  investorAccount: HardhatEthersSigner;
}
