export const DEAL_VAULT_ABI = {
  _format: 'hh-sol-artifact-1',
  contractName: 'DealVault',
  sourceName: 'contracts/DealVault.sol',
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "underlying_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "maxDeposit_",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "maxMint_",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "owner_",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "allowance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientAllowance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "balance",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "needed",
          "type": "uint256"
        }
      ],
      "name": "ERC20InsufficientBalance",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "approver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidApprover",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidReceiver",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "sender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "ERC20InvalidSpender",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "max",
          "type": "uint256"
        }
      ],
      "name": "ERC4626ExceededMaxDeposit",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "max",
          "type": "uint256"
        }
      ],
      "name": "ERC4626ExceededMaxMint",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "max",
          "type": "uint256"
        }
      ],
      "name": "ERC4626ExceededMaxRedeem",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "max",
          "type": "uint256"
        }
      ],
      "name": "ERC4626ExceededMaxWithdraw",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "EnforcedPause",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ExpectedPause",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ReentrancyGuardReentrantCall",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Approval",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "DealCompleted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "name": "Deposit",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "DepositsBlocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "DepositsUnblocked",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "donor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Donation",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Paused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "Transfer",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TransferToBorrower",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "Unpaused",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "sender",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "name": "Withdraw",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "asset",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "blockDeposits",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "complete",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "name": "convertToAssets",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        }
      ],
      "name": "convertToShares",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "internalType": "uint8",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "deposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "depositBlocked",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "donate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "maxDeposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "maxMint",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "maxRedeem",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "maxWithdraw",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "minDeposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        }
      ],
      "name": "mint",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "pause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "paused",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        }
      ],
      "name": "previewDeposit",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "name": "previewMint",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        }
      ],
      "name": "previewRedeem",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        }
      ],
      "name": "previewWithdraw",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "shares",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "redeem",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "minDeposit_",
          "type": "uint256"
        }
      ],
      "name": "setMinDeposit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "symbol",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalAssets",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        }
      ],
      "name": "transferFrom",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "transferToBorrower",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unblockDeposits",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "unpause",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "assets",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "receiver",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "withdraw",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  bytecode:
    '0x60c06040523480156200001157600080fd5b506040516200610138038062006101833981810160405281019062000037919062000b93565b80846040518060400160405280600b81526020017f4465616c205368617265730000000000000000000000000000000000000000008152506040518060400160405280600381526020017f444c5300000000000000000000000000000000000000000000000000000000008152508160039081620000b6919062000e75565b508060049081620000c8919062000e75565b505050600080620000df836200064e60201b60201c565b9150915081620000f1576012620000f3565b805b60ff1660a08160ff16815250508273ffffffffffffffffffffffffffffffffffffffff1660808173ffffffffffffffffffffffffffffffffffffffff1681525050505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603620001ac5760006040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401620001a3919062000f6d565b60405180910390fd5b620001bd816200076860201b60201c565b506000600560146101000a81548160ff0219169083151502179055506001600681905550620001fd678cd9deb727adbd3960c01b6200082e60201b60201c565b6200021967b5affafcdae6240a60c01b6200082e60201b60201c565b6200023567379c9419fa55d39460c01b6200082e60201b60201c565b62000251672f23c53a7434192260c01b6200082e60201b60201c565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff1603620002c3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401620002ba9062000feb565b60405180910390fd5b620002df678d60b0c174bd0afc60c01b6200082e60201b60201c565b620002fb6704899909d8b4d90c60c01b6200082e60201b60201c565b620003176713dfcb9d79057a9b60c01b6200082e60201b60201c565b62000333679a2cd992ef6a365d60c01b6200082e60201b60201c565b6000831162000379576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040162000370906200105d565b60405180910390fd5b620003956704b5d790b544655260c01b6200082e60201b60201c565b620003b167bfb92050f7caaadf60c01b6200082e60201b60201c565b620003cd67b667ea3f72ac99ff60c01b6200082e60201b60201c565b620003e967786839118e89428360c01b6200082e60201b60201c565b600082116200042f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016200042690620010cf565b60405180910390fd5b6200044b6762334e188ab24df860c01b6200082e60201b60201c565b6200046767b30297b67d01fa1160c01b6200082e60201b60201c565b826007819055506200048a67ae410aba0de4f10060c01b6200082e60201b60201c565b81600881905550620004ad677302b3b95cc8375660c01b6200082e60201b60201c565b83600960006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506200050a6740725d08d552cfd460c01b6200082e60201b60201c565b670de0b6b3a7640000600a8190555062000535673a916c28a9717ece60c01b6200082e60201b60201c565b6200055167132221724c9203d260c01b6200082e60201b60201c565b8373ffffffffffffffffffffffffffffffffffffffff1663095ea7b333856040518363ffffffff1660e01b81526004016200058e92919062001102565b6020604051808303816000875af1158015620005ae573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620005d491906200116c565b50620005f16789e8bb45d4fc4b9560c01b6200082e60201b60201c565b6200060d67dd6cae2e6dc9c4a960c01b6200082e60201b60201c565b620006206001806200083160201b60201c565b6200063c678ac912be368df05560c01b6200082e60201b60201c565b6001600b819055505050505062001326565b6000806000808473ffffffffffffffffffffffffffffffffffffffff1660405160240160405160208183030381529060405263313ce56760e01b6020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050604051620006c5919062001217565b600060405180830381855afa9150503d806000811462000702576040519150601f19603f3d011682016040523d82523d6000602084013e62000707565b606091505b50915091508180156200071c57506020815110155b1562000759576000818060200190518101906200073a919062001230565b905060ff8016811162000757576001819450945050505062000763565b505b6000809350935050505b915091565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b50565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603620008a65760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016200089d919062000f6d565b60405180910390fd5b620008ba60008383620008be60201b60201c565b5050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036200091457806002600082825462000907919062001291565b92505081905550620009ea565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015620009a3578381836040517fe450d38c0000000000000000000000000000000000000000000000000000000081526004016200099a93929190620012cc565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160362000a35578060026000828254039250508190555062000a82565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8360405162000ae1919062001309565b60405180910390a3505050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600062000b208262000af3565b9050919050565b62000b328162000b13565b811462000b3e57600080fd5b50565b60008151905062000b528162000b27565b92915050565b6000819050919050565b62000b6d8162000b58565b811462000b7957600080fd5b50565b60008151905062000b8d8162000b62565b92915050565b6000806000806080858703121562000bb05762000baf62000aee565b5b600062000bc08782880162000b41565b945050602062000bd38782880162000b7c565b935050604062000be68782880162000b7c565b925050606062000bf98782880162000b41565b91505092959194509250565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168062000c8757607f821691505b60208210810362000c9d5762000c9c62000c3f565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b60006008830262000d077fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8262000cc8565b62000d13868362000cc8565b95508019841693508086168417925050509392505050565b6000819050919050565b600062000d5662000d5062000d4a8462000b58565b62000d2b565b62000b58565b9050919050565b6000819050919050565b62000d728362000d35565b62000d8a62000d818262000d5d565b84845462000cd5565b825550505050565b600090565b62000da162000d92565b62000dae81848462000d67565b505050565b5b8181101562000dd65762000dca60008262000d97565b60018101905062000db4565b5050565b601f82111562000e255762000def8162000ca3565b62000dfa8462000cb8565b8101602085101562000e0a578190505b62000e2262000e198562000cb8565b83018262000db3565b50505b505050565b600082821c905092915050565b600062000e4a6000198460080262000e2a565b1980831691505092915050565b600062000e65838362000e37565b9150826002028217905092915050565b62000e808262000c05565b67ffffffffffffffff81111562000e9c5762000e9b62000c10565b5b62000ea8825462000c6e565b62000eb582828562000dda565b600060209050601f83116001811462000eed576000841562000ed8578287015190505b62000ee4858262000e57565b86555062000f54565b601f19841662000efd8662000ca3565b60005b8281101562000f275784890151825560018201915060208501945060208101905062000f00565b8683101562000f47578489015162000f43601f89168262000e37565b8355505b6001600288020188555050505b505050505050565b62000f678162000b13565b82525050565b600060208201905062000f84600083018462000f5c565b92915050565b600082825260208201905092915050565b7f496e76616c696420756e6465726c79696e6720746f6b656e0000000000000000600082015250565b600062000fd360188362000f8a565b915062000fe08262000f9b565b602082019050919050565b60006020820190508181036000830152620010068162000fc4565b9050919050565b7f4d6178206465706f736974206d75737420626520706f73697469766500000000600082015250565b600062001045601c8362000f8a565b915062001052826200100d565b602082019050919050565b60006020820190508181036000830152620010788162001036565b9050919050565b7f4d6178206d696e74206d75737420626520706f73697469766500000000000000600082015250565b6000620010b760198362000f8a565b9150620010c4826200107f565b602082019050919050565b60006020820190508181036000830152620010ea81620010a8565b9050919050565b620010fc8162000b58565b82525050565b600060408201905062001119600083018562000f5c565b620011286020830184620010f1565b9392505050565b60008115159050919050565b62001146816200112f565b81146200115257600080fd5b50565b60008151905062001166816200113b565b92915050565b60006020828403121562001185576200118462000aee565b5b6000620011958482850162001155565b91505092915050565b600081519050919050565b600081905092915050565b60005b83811015620011d4578082015181840152602081019050620011b7565b60008484015250505050565b6000620011ed826200119e565b620011f98185620011a9565b93506200120b818560208601620011b4565b80840191505092915050565b6000620012258284620011e0565b915081905092915050565b60006020828403121562001249576200124862000aee565b5b6000620012598482850162000b7c565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006200129e8262000b58565b9150620012ab8362000b58565b9250828201905080821115620012c657620012c562001262565b5b92915050565b6000606082019050620012e3600083018662000f5c565b620012f26020830185620010f1565b620013016040830184620010f1565b949350505050565b6000602082019050620013206000830184620010f1565b92915050565b60805160a051614db8620013496000396000610ce4015260005050614db86000f3fe608060405234801561001057600080fd5b506004361061023d5760003560e01c8063715018a61161013b578063ba087652116100b8578063d905777e1161007c578063d905777e146106e2578063dd62ed3e14610712578063ef8b30f714610742578063f14faf6f14610772578063f2fde38b1461078e5761023d565b8063ba08765214610618578063c63d75b614610648578063c6e6f59214610678578063c76ce2ef146106a8578063ce96cb77146106b25761023d565b806395d89b41116100ff57806395d89b411461054c578063a5b589b51461056a578063a9059cbb14610588578063b3d7f6b9146105b8578063b460af94146105e85761023d565b8063715018a6146104ce5780638456cb59146104d85780638da5cb5b146104e25780638fcc9cfb1461050057806394bf804d1461051c5761023d565b806338d52e0f116101c9578063522e11771161018d578063522e11771461043c5780635c975abb1461044657806364937fc2146104645780636e553f651461046e57806370a082311461049e5761023d565b806338d52e0f146103965780633f4ba83a146103b4578063402d267d146103be57806341b3d185146103ee5780634cdad5061461040c5761023d565b80630a28a477116102105780630a28a477146102de5780631136758d1461030e57806318160ddd1461032a57806323b872dd14610348578063313ce567146103785761023d565b806301e1d1141461024257806306fdde031461026057806307a2d13a1461027e578063095ea7b3146102ae575b600080fd5b61024a6107aa565b6040516102579190613f26565b60405180910390f35b6102686107f0565b6040516102759190613fd1565b60405180910390f35b61029860048036038101906102939190614024565b610882565b6040516102a59190613f26565b60405180910390f35b6102c860048036038101906102c391906140af565b610896565b6040516102d5919061410a565b60405180910390f35b6102f860048036038101906102f39190614024565b6108b9565b6040516103059190613f26565b60405180910390f35b610328600480360381019061032391906140af565b6108cd565b005b610332610c9f565b60405161033f9190613f26565b60405180910390f35b610362600480360381019061035d9190614125565b610ca9565b60405161036f919061410a565b60405180910390f35b610380610cd8565b60405161038d9190614194565b60405180910390f35b61039e610d12565b6040516103ab91906141be565b60405180910390f35b6103bc610d78565b005b6103d860048036038101906103d391906141d9565b610dee565b6040516103e59190613f26565b60405180910390f35b6103f6610e4f565b6040516104039190613f26565b60405180910390f35b61042660048036038101906104219190614024565b610e95565b6040516104339190613f26565b60405180910390f35b610444610ea9565b005b61044e611041565b60405161045b919061410a565b60405180910390f35b61046c611058565b005b61048860048036038101906104839190614206565b611121565b6040516104959190613f26565b60405180910390f35b6104b860048036038101906104b391906141d9565b61179d565b6040516104c59190613f26565b60405180910390f35b6104d66117e5565b005b6104e06117f9565b005b6104ea61186f565b6040516104f791906141be565b60405180910390f35b61051a60048036038101906105159190614024565b611899565b005b61053660048036038101906105319190614206565b61198e565b6040516105439190613f26565b60405180910390f35b61055461200a565b6040516105619190613fd1565b60405180910390f35b61057261209c565b60405161057f919061410a565b60405180910390f35b6105a2600480360381019061059d91906140af565b6120ef565b6040516105af919061410a565b60405180910390f35b6105d260048036038101906105cd9190614024565b612112565b6040516105df9190613f26565b60405180910390f35b61060260048036038101906105fd9190614246565b612126565b60405161060f9190613f26565b60405180910390f35b610632600480360381019061062d9190614246565b6126dc565b60405161063f9190613f26565b60405180910390f35b610662600480360381019061065d91906141d9565b612c92565b60405161066f9190613f26565b60405180910390f35b610692600480360381019061068d9190614024565b612cf3565b60405161069f9190613f26565b60405180910390f35b6106b0612d07565b005b6106cc60048036038101906106c791906141d9565b612dd0565b6040516106d99190613f26565b60405180910390f35b6106fc60048036038101906106f791906141d9565b612dec565b6040516107099190613f26565b60405180910390f35b61072c60048036038101906107279190614299565b612dfe565b6040516107399190613f26565b60405180910390f35b61075c60048036038101906107579190614024565b612e85565b6040516107699190613f26565b60405180910390f35b61078c60048036038101906107879190614024565b612e99565b005b6107a860048036038101906107a391906141d9565b613119565b005b60006107c0673da45eb56919ac0260c01b61319f565b6107d4674fa0b14c979c6b7f60c01b61319f565b6107e867f4edc89d781484d460c01b61319f565b600b54905090565b6060600380546107ff90614308565b80601f016020809104026020016040519081016040528092919081815260200182805461082b90614308565b80156108785780601f1061084d57610100808354040283529160200191610878565b820191906000526020600020905b81548152906001019060200180831161085b57829003601f168201915b5050505050905090565b600061088f8260006131a2565b9050919050565b6000806108a16131fb565b90506108ae818585613203565b600191505092915050565b60006108c6826001613215565b9050919050565b6108e167715624653bf483a060c01b61319f565b6108e961326e565b6108fd67db2b62791803af9960c01b61319f565b6109116797a3bd0ee76596d960c01b61319f565b6109196132f5565b61092d6748a763ca35da6ce160c01b61319f565b61094167017fdfc36635129c60c01b61319f565b610955675e461f0a87e51f0160c01b61319f565b61096967ed5fcbebc97c0c1860c01b61319f565b61097d6751e8c0873904bfd860c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036109ec576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109e390614385565b60405180910390fd5b6109ff669395853d8f3e4c60c01b61319f565b610a1367b37e68212e5cd74660c01b61319f565b610a2767b460642528ccc3cb60c01b61319f565b610a3b6746a1b3d1d54cf52160c01b61319f565b60008111610a7e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a75906143f1565b60405180910390fd5b610a9267bbd2db79cf55ee8260c01b61319f565b610aa6671a5dcb2905d78bde60c01b61319f565b610aba674bcc1c828c8e8a2060c01b61319f565b610ace674e1b20def8a5650f60c01b61319f565b600b54811115610b13576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b0a9061445d565b60405180910390fd5b610b2767e70b6a2867045a4c60c01b61319f565b610b3b67c731cc9d1eefaf1660c01b61319f565b80600b6000828254610b4d91906144ac565b92505081905550610b686773aed028834a23b660c01b61319f565b610b7c67c0b730ff8be07f0f60c01b61319f565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb83836040518363ffffffff1660e01b8152600401610bd99291906144e0565b6020604051808303816000875af1158015610bf8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c1c9190614535565b50610c3167482973199d4cf02e60c01b61319f565b610c4567e01c45a045e0fa0060c01b61319f565b8173ffffffffffffffffffffffffffffffffffffffff167f272db152efde405127896d7f37a1fc863f84ee8f19c882e95722854fd09625a682604051610c8b9190613f26565b60405180910390a2610c9b61333b565b5050565b6000600254905090565b600080610cb46131fb565b9050610cc1858285613345565b610ccc8585856133d9565b60019150509392505050565b6000610ce26134cd565b7f0000000000000000000000000000000000000000000000000000000000000000610d0d9190614562565b905090565b6000610d28672799f9e3c0d51f2a60c01b61319f565b610d3c67efba52246800023460c01b61319f565b610d50676da08911bb34c9d760c01b61319f565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b610d8c679fe290ab0d311a3660c01b61319f565b610d9461326e565b610da8679d23450dd3d54e4b60c01b61319f565b610dbc67b07c371c0caa788160c01b61319f565b610dd0677070fa0f7f0156f860c01b61319f565b610de467573e296c04c2533f60c01b61319f565b610dec6134d2565b565b6000610e046716aa38c37d22712b60c01b61319f565b610e1867d6e32e7bf5011bb960c01b61319f565b610e2c675c3577b679a2d28960c01b61319f565b6001600b54600754610e3e91906144ac565b610e489190614597565b9050919050565b6000610e65672b55f0ed5a6ed3bc60c01b61319f565b610e796717967b5a279db88960c01b61319f565b610e8d674f2efec3770ff83d60c01b61319f565b600a54905090565b6000610ea28260006131a2565b9050919050565b610ebd676aebd8faf0ee8ece60c01b61319f565b610ec561326e565b610ed967e11818c2457397e960c01b61319f565b610eed67369b0a8e37b4fa6960c01b61319f565b610ef56132f5565b610f0967f6335686197c804560c01b61319f565b610f1d670412cd5ed9501dbb60c01b61319f565b610f3167cdbfe34c42476d5f60c01b61319f565b610f45672c19941ec023f2b060c01b61319f565b610f5967661e52a262eb633060c01b61319f565b600754600b5411610f9f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f9690614617565b60405180910390fd5b610fb3670aa2135b2755aa6960c01b61319f565b610fc767cf202906e2cf06a960c01b61319f565b610fdb6761102ddbc74533a660c01b61319f565b610fe3610d78565b610ff7675faef630fafc31f860c01b61319f565b61100b6737ad57b48645b85d60c01b61319f565b7fb90297e612d54cca6f23d60092442eb63299f66ddbf94493c3d871747994a5b660405160405180910390a161103f61333b565b565b6000600560149054906101000a900460ff16905090565b61106c67fef78f11357c9c6a60c01b61319f565b61107461326e565b611088677c12bf65ac9b1c5a60c01b61319f565b61109c67688e0a318f315d7b60c01b61319f565b6110b067cdf6d2516c256e8760c01b61319f565b6000600960146101000a81548160ff0219169083151502179055506110df67227a77f25ae2ea7360c01b61319f565b6110f3675a832890e2bbb92660c01b61319f565b7f92157b8195c8c3ac00efedfa7044da4ff96d1ce98df0c0a14f62f0ae09caaaf660405160405180910390a1565b6000611137678dce5acd158d78fe60c01b61319f565b61113f6132f5565b61115367727212c33674bfe060c01b61319f565b61116767c8da80d344ea585b60c01b61319f565b61117b67da24d9656fdb734060c01b61319f565b61118f67369b6931b7a1790760c01b61319f565b6111a367fe992148f019e31160c01b61319f565b600015156111af611041565b1515146111f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111e890614683565b60405180910390fd5b61120567fe01e7e75f8c3d8860c01b61319f565b611219673ab7e6760a237c5560c01b61319f565b61122d678de1faf2a89b1a8b60c01b61319f565b61124167a1e7cc5babc36a3f60c01b61319f565b60001515600960149054906101000a900460ff16151514611297576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161128e906146ef565b60405180910390fd5b6112ab67064934273c814db360c01b61319f565b6112bf678bd1748f3cff894160c01b61319f565b6112d367d6b9abb27bf861d060c01b61319f565b6112e7673b6ea5c113f2b97660c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611356576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161134d9061475b565b60405180910390fd5b61136a670db97343e4e6ebb260c01b61319f565b61137e674c9bf710c7b0551960c01b61319f565b61139267318137e378ac70d060c01b61319f565b6113a667a3aadf2c22dabfed60c01b61319f565b600a548310156113eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113e2906147c7565b60405180910390fd5b6113ff671a93fd43a1f4612160c01b61319f565b611413670160b23c6dfae70b60c01b61319f565b61142767d6d00f7d68a5581f60c01b61319f565b61142f613535565b61144367bfd13b147d8804a360c01b61319f565b61145767aa9e3cef1fb31ffc60c01b61319f565b6000611461610c9f565b905061147767bdd98df6680d161160c01b61319f565b61148b672934a0c711e8a04460c01b61319f565b60006114a1674b5a173e67e0631960c01b61319f565b6114b5672058ad9f51dd8b6360c01b61319f565b600182036114ed576114d167424a9aa01d3bb20360c01b61319f565b6114e567e2e82f95b2e545d860c01b61319f565b849050611531565b61150167d5e4c9489ac4783f60c01b61319f565b61151567055bbacb0cad6b7460c01b61319f565b600b54828661152491906147e7565b61152e9190614858565b90505b611545674d3e13789815d71360c01b61319f565b611559676f7b5307b02e594360c01b61319f565b61156d67b5a03b20d485fbf160c01b61319f565b600081116115b0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115a7906148d5565b60405180910390fd5b6115c467daaaacab7e557fca60c01b61319f565b6115d867ab3045eb5b7aad9f60c01b61319f565b84600b60008282546115ea9190614597565b925050819055506116056793318cf8c0f13d1860c01b61319f565b61161967a8a55a39ece3127160c01b61319f565b611621610d12565b73ffffffffffffffffffffffffffffffffffffffff166323b872dd3330886040518463ffffffff1660e01b815260040161165d939291906148f5565b6020604051808303816000875af115801561167c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116a09190614535565b506116b567af7ae5699856bc9e60c01b61319f565b6116c9674fbf1a8eb565fa7c60c01b61319f565b6116d384826136c0565b6116e767f5050a96af7c84fd60c01b61319f565b6116fb67221da15ed59d1f2660c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7878460405161175a92919061492c565b60405180910390a3611776675a7b3047a4113ea960c01b61319f565b61178a677e99736cd4148d9760c01b61319f565b809250505061179761333b565b92915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6117ed61326e565b6117f76000613742565b565b61180d679c1550686099bc3f60c01b61319f565b61181561326e565b6118296746e2689b895a072960c01b61319f565b61183d67929aad1ffe550ab160c01b61319f565b61185167319378a5dab7666f60c01b61319f565b611865677561104260125b1d60c01b61319f565b61186d613808565b565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6118ad676689b70d6c1dbd2e60c01b61319f565b6118b561326e565b6118c9673e3020361b773a3960c01b61319f565b6118dd6798c40e31ea560e3660c01b61319f565b6118f167e161fec5af11e0f360c01b61319f565b611905677257a393324c407760c01b61319f565b611919678aed507ca843b5ae60c01b61319f565b6000811161195c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611953906149a1565b60405180910390fd5b61197067be62b946517b725560c01b61319f565b6119846733e3a88c46d9981760c01b61319f565b80600a8190555050565b60006119a46718611bc3b81f2a2760c01b61319f565b6119ac6132f5565b6119c067e59cf97a87e5f7be60c01b61319f565b6119d4676d6c0eac8d9b0d2960c01b61319f565b6119e86727c2d4b27023350760c01b61319f565b6119fc67f4c9a700de8780ec60c01b61319f565b611a1067cf4d6da3199c245a60c01b61319f565b60001515611a1c611041565b151514611a5e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611a5590614683565b60405180910390fd5b611a726726d38eeb4b564f4c60c01b61319f565b611a866769a32803023c27ee60c01b61319f565b611a9a67cf1683f49ac7096b60c01b61319f565b611aae67c6421a5dd205941260c01b61319f565b60001515600960149054906101000a900460ff16151514611b04576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611afb906146ef565b60405180910390fd5b611b186786f536a3e870103a60c01b61319f565b611b2c677e6629081064c5f860c01b61319f565b611b4067ffe26988401ab92360c01b61319f565b611b546719b96e00f0ceaa8060c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611bc3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611bba9061475b565b60405180910390fd5b611bd7679b3966992567f4ec60c01b61319f565b611beb67ba72ec4847947c4160c01b61319f565b611bff6795a17bb40334435b60c01b61319f565b611c136741c32399315fdb2660c01b61319f565b60008311611c56576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611c4d90614a0d565b60405180910390fd5b611c6a679c9a77e7316956e960c01b61319f565b611c7e676cb043350d42e44360c01b61319f565b611c9267fe0a9fa731da6a1f60c01b61319f565b611c9a613535565b611cae67bb613d751a32382160c01b61319f565b611cc267c4f51360eaa148bf60c01b61319f565b6000611ccc610c9f565b9050611ce26734f1d5ff0a5dc18c60c01b61319f565b611cf667c23e8b24438d7ae060c01b61319f565b6000611d0c6731d2d29923089df460c01b61319f565b611d2067f8cd1508382e929260c01b61319f565b60018203611d5857611d3c6755cf0a484bb8343e60c01b61319f565b611d50673b503f10a4cc4e6f60c01b61319f565b849050611d9c565b611d6c67fe9708d48f6f966a60c01b61319f565b611d8067ac36cc0227ed810060c01b61319f565b81600b5486611d8f91906147e7565b611d999190614858565b90505b611db067af578ce1faf7a8e960c01b61319f565b611dc467d9e319f1379240ad60c01b61319f565b611dd867caad78d998c1db3a60c01b61319f565b600a54811015611e1d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e1490614a9f565b60405180910390fd5b611e3167194995e08fe717ec60c01b61319f565b611e4567287bcb58bcfc6edc60c01b61319f565b80600b6000828254611e579190614597565b92505081905550611e7267f818a1e03fbeb1f660c01b61319f565b611e866796b5f326f404c09960c01b61319f565b611e8e610d12565b73ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b8152600401611eca939291906148f5565b6020604051808303816000875af1158015611ee9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f0d9190614535565b50611f226704c281188fe84dd760c01b61319f565b611f3667f9e3397133df12fe60c01b61319f565b611f4084866136c0565b611f5467ae7be8a0d3d7cb7c60c01b61319f565b611f686766a7048561eab78260c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d78388604051611fc792919061492c565b60405180910390a3611fe3678d65f5871ff1ab9960c01b61319f565b611ff76739eee54c2ebbb65460c01b61319f565b809250505061200461333b565b92915050565b60606004805461201990614308565b80601f016020809104026020016040519081016040528092919081815260200182805461204590614308565b80156120925780601f1061206757610100808354040283529160200191612092565b820191906000526020600020905b81548152906001019060200180831161207557829003601f168201915b5050505050905090565b60006120b26759bfcd8caa2efe3d60c01b61319f565b6120c6670c6699f500cf02b060c01b61319f565b6120da67865ea0dc8218c67a60c01b61319f565b600960149054906101000a900460ff16905090565b6000806120fa6131fb565b90506121078185856133d9565b600191505092915050565b600061211f8260016131a2565b9050919050565b600061213c67f1963969eba0ce3c60c01b61319f565b6121446132f5565b6121586786989125fdb3710660c01b61319f565b61216c677eda50c092fd609560c01b61319f565b612180675aeafd8d487b34a060c01b61319f565b612194677872290444b3091160c01b61319f565b6121a867bbe1141a2030448060c01b61319f565b600015156121b4611041565b1515146121f6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016121ed90614683565b60405180910390fd5b61220a6705ba455121b76aac60c01b61319f565b61221e678c587426086e3ec260c01b61319f565b61223267524bf5aeb1a36b3f60c01b61319f565b612246677ea4339e5efed80060c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036122b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016122ac9061475b565b60405180910390fd5b6122c967f0d4fe5c70d212ef60c01b61319f565b6122dd67af98be795736179b60c01b61319f565b6122f1672479f58ebfb45e7560c01b61319f565b61230567a128b41bfd86e22a60c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603612374576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161236b90614b0b565b60405180910390fd5b61238867aee0345c5933639b60c01b61319f565b61239c6786691d39d32af3c060c01b61319f565b6123b0673b13908b87ca4a5d60c01b61319f565b6123b8613535565b6123cc67ddc03313d468c0ea60c01b61319f565b6123e067fa703d8acd8fefe160c01b61319f565b60006123ea610c9f565b905061240067ca1de076201842fa60c01b61319f565b61241467a4f80f8f8380978660c01b61319f565b6000600b54828761242591906147e7565b61242f9190614858565b90506124456790ebbb94e12a89c460c01b61319f565b61245967fa60c6105d7344a160c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146124d8576124a067b87c38cc2e5bd39b60c01b61319f565b6124b4679cdd9228dd964c5d60c01b61319f565b6124c867a65d1fb54d72535760c01b61319f565b6124d3843383613345565b6124ed565b6124ec67bf9d63ec4188481460c01b61319f565b5b61250167484db5b4c196594760c01b61319f565b85600b600082825461251391906144ac565b9250508190555061252e67743128cd2dce6bc360c01b61319f565b61254267ed7e728e09230b5a60c01b61319f565b61254c848261386b565b61256067a85431a5303e149b60c01b61319f565b612574679be1d635048192e660c01b61319f565b61257c610d12565b73ffffffffffffffffffffffffffffffffffffffff1663a9059cbb86886040518363ffffffff1660e01b81526004016125b69291906144e0565b6020604051808303816000875af11580156125d5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906125f99190614535565b5061260e67f5557f3755e2fbd660c01b61319f565b612622677872dd5e0d300f9160c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167ffbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db898560405161269892919061492c565b60405180910390a46126b4672f95fe93695dd9e860c01b61319f565b6126c8670173ffe775244b1560c01b61319f565b80925050506126d561333b565b9392505050565b60006126f26789997c4ddda0ea1860c01b61319f565b6126fa6132f5565b61270e67689cf5575428e25f60c01b61319f565b61272267d187e2d69f1b4edc60c01b61319f565b61273667d22004c27dab9aee60c01b61319f565b61274a676ac0a7dd47b9d02360c01b61319f565b61275e673ce1afe0e2e499d360c01b61319f565b6000151561276a611041565b1515146127ac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016127a390614683565b60405180910390fd5b6127c0673c71cd8620e4a5aa60c01b61319f565b6127d467c37eca26b162dddf60c01b61319f565b6127e86771d8c8515cdaf07960c01b61319f565b6127fc67b5f3cc954989271b60c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361286b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016128629061475b565b60405180910390fd5b61287f675b3a4df0eb09c72d60c01b61319f565b612893678887c7eb62e0d4fd60c01b61319f565b6128a76717f779c3a943c37b60c01b61319f565b6128bb67c4ad6a5a7e1ed28360c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361292a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161292190614b0b565b60405180910390fd5b61293e6757ef2e279dbe23d260c01b61319f565b612952678f17628140a3731460c01b61319f565b612966677b102aba7db5ce1760c01b61319f565b61296e613535565b61298267751b35a1c05e3aa960c01b61319f565b61299667823febd30525261f60c01b61319f565b8173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614612a15576129dd67df6e8a1c4b8fb09d60c01b61319f565b6129f1677d83d785a4474cd660c01b61319f565b612a0567214b8ab35641a09160c01b61319f565b612a10823386613345565b612a2a565b612a2967a0fe603eb63b8e0e60c01b61319f565b5b612a3e67a3273c5f5f4a12b460c01b61319f565b612a5267e08792c4e99fedac60c01b61319f565b6000612a5c610c9f565b9050612a7267aa4460864a0cbfed60c01b61319f565b612a8667ddec4afc8985b5ca60c01b61319f565b600081600b5487612a9791906147e7565b612aa19190614858565b9050612ab76772964fa7c7d6f1ec60c01b61319f565b80600b6000828254612ac991906144ac565b92505081905550612ae467f893dbce7cb4328c60c01b61319f565b612af867bd3abd6a3f610ac860c01b61319f565b612b02848761386b565b612b1667584dcf0c0936b82760c01b61319f565b612b2a674b9ebbbedc771fde60c01b61319f565b612b32610d12565b73ffffffffffffffffffffffffffffffffffffffff1663a9059cbb86836040518363ffffffff1660e01b8152600401612b6c9291906144e0565b6020604051808303816000875af1158015612b8b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612baf9190614535565b50612bc4676a62b6af4a759c1660c01b61319f565b612bd86769a59306de4a2d8a60c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167ffbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db848a604051612c4e92919061492c565b60405180910390a4612c6a67f47e480afa630cde60c01b61319f565b612c7e67df0bcb6d07ac29d860c01b61319f565b8092505050612c8b61333b565b9392505050565b6000612ca8678258e6ba10b08c3f60c01b61319f565b612cbc6731b7fe43c5c0f8a260c01b61319f565b612cd067daf25828a3ddc39460c01b61319f565b6001600b54600854612ce291906144ac565b612cec9190614597565b9050919050565b6000612d00826000613215565b9050919050565b612d1b67c195f2babb6afa4a60c01b61319f565b612d2361326e565b612d3767ece5b3f8194801bb60c01b61319f565b612d4b674057a66c08572ffe60c01b61319f565b612d5f67f74d1c40be3cdf6f60c01b61319f565b6001600960146101000a81548160ff021916908315150217905550612d8e67cc73121d4f8c3eef60c01b61319f565b612da267cd5f7c48e51944d660c01b61319f565b7fa42716464c1db5dcbde8f45245f86811504bf01f15d4a375a9bd025fdbafe86060405160405180910390a1565b6000612de5612dde8361179d565b60006131a2565b9050919050565b6000612df78261179d565b9050919050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000612e92826000613215565b9050919050565b612ead673eeb7400f1f19ea160c01b61319f565b612eb561326e565b612ec967984331f1ba60f04060c01b61319f565b612edd6739fde33abc811ce460c01b61319f565b612ee56132f5565b612ef9678951359378cabd0360c01b61319f565b612f0d679a18cee366d67e9c60c01b61319f565b612f21677e67446abafe949860c01b61319f565b612f3567ee7123af92091f0360c01b61319f565b612f4967c42ad7fd30697eab60c01b61319f565b60008111612f8c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401612f83906143f1565b60405180910390fd5b612fa0672dc3f5f99ac5943360c01b61319f565b612fb467a58d8b0462e473bc60c01b61319f565b612fc8671c321b77162855ca60c01b61319f565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b8152600401613027939291906148f5565b6020604051808303816000875af1158015613046573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061306a9190614535565b5061307f678f5c83f05c5c329960c01b61319f565b80600b60008282546130919190614597565b925050819055506130ac6721a191bf21c4fb0160c01b61319f565b6130c0677b7bd7466f5f8c6460c01b61319f565b3373ffffffffffffffffffffffffffffffffffffffff167f5d8bc849764969eb1bcc6d0a2f55999d0167c1ccec240a4f39cf664ca9c4148e826040516131069190613f26565b60405180910390a261311661333b565b50565b61312161326e565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036131935760006040517f1e4fbdf700000000000000000000000000000000000000000000000000000000815260040161318a91906141be565b60405180910390fd5b61319c81613742565b50565b50565b60006131f360016131b16107aa565b6131bb9190614597565b6131c36134cd565b600a6131cf9190614c5e565b6131d7610c9f565b6131e19190614597565b84866138ed909392919063ffffffff16565b905092915050565b600033905090565b613210838383600161393c565b505050565b60006132666132226134cd565b600a61322e9190614c5e565b613236610c9f565b6132409190614597565b600161324a6107aa565b6132549190614597565b84866138ed909392919063ffffffff16565b905092915050565b6132766131fb565b73ffffffffffffffffffffffffffffffffffffffff1661329461186f565b73ffffffffffffffffffffffffffffffffffffffff16146132f3576132b76131fb565b6040517f118cdaa70000000000000000000000000000000000000000000000000000000081526004016132ea91906141be565b60405180910390fd5b565b600260065403613331576040517f3ee5aeb500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6002600681905550565b6001600681905550565b60006133518484612dfe565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146133d357818110156133c3578281836040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526004016133ba93929190614ca9565b60405180910390fd5b6133d28484848403600061393c565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361344b5760006040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161344291906141be565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036134bd5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016134b491906141be565b60405180910390fd5b6134c8838383613b13565b505050565b600090565b6134da613d38565b6000600560146101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa61351e6131fb565b60405161352b91906141be565b60405180910390a1565b613549675123f5a2520c05b260c01b61319f565b61355d67c9b35abd64b7c44d60c01b61319f565b61357167ff04984f5484ebb760c01b61319f565b600061357b610d12565b73ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016135b391906141be565b602060405180830381865afa1580156135d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906135f49190614cf5565b905061360a6755dbe1b85bb030f860c01b61319f565b61361e6746e20d930f2ece7860c01b61319f565b600b548111156136415761363c67b1895c6d25fd657a60c01b61319f565b6136bd565b61365567f851db3b553c4ad860c01b61319f565b613669676a0c343d2d0a670260c01b61319f565b600b548110156136a75761368767aa6eb9335f2b269660c01b61319f565b61369b671bdb1c83a95b9bd760c01b61319f565b80600b819055506136bc565b6136bb6771a7692d85da729460c01b61319f565b5b5b50565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036137325760006040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161372991906141be565b60405180910390fd5b61373e60008383613b13565b5050565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b613810613d78565b6001600560146101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586138546131fb565b60405161386191906141be565b60405180910390a1565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036138dd5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016138d491906141be565b60405180910390fd5b6138e982600083613b13565b5050565b600061391d6138fb83613db9565b801561391857506000848061391357613912614829565b5b868809115b613de7565b613928868686613df3565b6139329190614597565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036139ae5760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016139a591906141be565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603613a205760006040517f94280d62000000000000000000000000000000000000000000000000000000008152600401613a1791906141be565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508015613b0d578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051613b049190613f26565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603613b65578060026000828254613b599190614597565b92505081905550613c38565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015613bf1578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401613be893929190614ca9565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603613c815780600260008282540392505081905550613cce565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051613d2b9190613f26565b60405180910390a3505050565b613d40611041565b613d76576040517f8dfc202b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b613d80611041565b15613db7576040517fd93c066500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b600060016002836003811115613dd257613dd1614d22565b5b613ddc9190614d51565b60ff16149050919050565b60008115159050919050565b6000808385029050600080198587098281108382030391505060008103613e2e57838281613e2457613e23614829565b5b0492505050613eda565b808411613e4e57613e4d613e486000861460126011613ee1565b613efb565b5b600084868809905082811182039150808303925060008560000386169050808604955080840493506001818260000304019050808302841793506000600287600302189050808702600203810290508087026002038102905080870260020381029050808702600203810290508087026002038102905080870260020381029050808502955050505050505b9392505050565b6000613eec84613de7565b82841802821890509392505050565b634e487b71600052806020526024601cfd5b6000819050919050565b613f2081613f0d565b82525050565b6000602082019050613f3b6000830184613f17565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015613f7b578082015181840152602081019050613f60565b60008484015250505050565b6000601f19601f8301169050919050565b6000613fa382613f41565b613fad8185613f4c565b9350613fbd818560208601613f5d565b613fc681613f87565b840191505092915050565b60006020820190508181036000830152613feb8184613f98565b905092915050565b600080fd5b61400181613f0d565b811461400c57600080fd5b50565b60008135905061401e81613ff8565b92915050565b60006020828403121561403a57614039613ff3565b5b60006140488482850161400f565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061407c82614051565b9050919050565b61408c81614071565b811461409757600080fd5b50565b6000813590506140a981614083565b92915050565b600080604083850312156140c6576140c5613ff3565b5b60006140d48582860161409a565b92505060206140e58582860161400f565b9150509250929050565b60008115159050919050565b614104816140ef565b82525050565b600060208201905061411f60008301846140fb565b92915050565b60008060006060848603121561413e5761413d613ff3565b5b600061414c8682870161409a565b935050602061415d8682870161409a565b925050604061416e8682870161400f565b9150509250925092565b600060ff82169050919050565b61418e81614178565b82525050565b60006020820190506141a96000830184614185565b92915050565b6141b881614071565b82525050565b60006020820190506141d360008301846141af565b92915050565b6000602082840312156141ef576141ee613ff3565b5b60006141fd8482850161409a565b91505092915050565b6000806040838503121561421d5761421c613ff3565b5b600061422b8582860161400f565b925050602061423c8582860161409a565b9150509250929050565b60008060006060848603121561425f5761425e613ff3565b5b600061426d8682870161400f565b935050602061427e8682870161409a565b925050604061428f8682870161409a565b9150509250925092565b600080604083850312156142b0576142af613ff3565b5b60006142be8582860161409a565b92505060206142cf8582860161409a565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061432057607f821691505b602082108103614333576143326142d9565b5b50919050565b7f496e76616c696420626f72726f77657220616464726573730000000000000000600082015250565b600061436f601883613f4c565b915061437a82614339565b602082019050919050565b6000602082019050818103600083015261439e81614362565b9050919050565b7f416d6f756e74206d75737420626520706f736974697665000000000000000000600082015250565b60006143db601783613f4c565b91506143e6826143a5565b602082019050919050565b6000602082019050818103600083015261440a816143ce565b9050919050565b7f496e73756666696369656e742066756e64730000000000000000000000000000600082015250565b6000614447601283613f4c565b915061445282614411565b602082019050919050565b600060208201905081810360008301526144768161443a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006144b782613f0d565b91506144c283613f0d565b92508282039050818111156144da576144d961447d565b5b92915050565b60006040820190506144f560008301856141af565b6145026020830184613f17565b9392505050565b614512816140ef565b811461451d57600080fd5b50565b60008151905061452f81614509565b92915050565b60006020828403121561454b5761454a613ff3565b5b600061455984828501614520565b91505092915050565b600061456d82614178565b915061457883614178565b9250828201905060ff8111156145915761459061447d565b5b92915050565b60006145a282613f0d565b91506145ad83613f0d565b92508282019050808211156145c5576145c461447d565b5b92915050565b7f57616974696e6720666f7220626f72726f7765722066756e6473000000000000600082015250565b6000614601601a83613f4c565b915061460c826145cb565b602082019050919050565b60006020820190508181036000830152614630816145f4565b9050919050565b7f556e66696e6973686564204465616c0000000000000000000000000000000000600082015250565b600061466d600f83613f4c565b915061467882614637565b602082019050919050565b6000602082019050818103600083015261469c81614660565b9050919050565b7f466f7262696464656e0000000000000000000000000000000000000000000000600082015250565b60006146d9600983613f4c565b91506146e4826146a3565b602082019050919050565b60006020820190508181036000830152614708816146cc565b9050919050565b7f496e76616c696420726563656976657220616464726573730000000000000000600082015250565b6000614745601883613f4c565b91506147508261470f565b602082019050919050565b6000602082019050818103600083015261477481614738565b9050919050565b7f4465706f73697420616d6f756e742062656c6f77206d696e696d756d00000000600082015250565b60006147b1601c83613f4c565b91506147bc8261477b565b602082019050919050565b600060208201905081810360008301526147e0816147a4565b9050919050565b60006147f282613f0d565b91506147fd83613f0d565b925082820261480b81613f0d565b915082820484148315176148225761482161447d565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061486382613f0d565b915061486e83613f0d565b92508261487e5761487d614829565b5b828204905092915050565b7f536861726520616d6f756e7420746f6f20736d616c6c00000000000000000000600082015250565b60006148bf601683613f4c565b91506148ca82614889565b602082019050919050565b600060208201905081810360008301526148ee816148b2565b9050919050565b600060608201905061490a60008301866141af565b61491760208301856141af565b6149246040830184613f17565b949350505050565b60006040820190506149416000830185613f17565b61494e6020830184613f17565b9392505050565b7f4d696e696d756d206465706f736974206d75737420626520706f736974697665600082015250565b600061498b602083613f4c565b915061499682614955565b602082019050919050565b600060208201905081810360008301526149ba8161497e565b9050919050565b7f536861726520616d6f756e74206d75737420626520706f736974697665000000600082015250565b60006149f7601d83613f4c565b9150614a02826149c1565b602082019050919050565b60006020820190508181036000830152614a26816149ea565b9050919050565b7f4571756976616c656e7420617373657420616d6f756e742062656c6f77206d6960008201527f6e696d756d000000000000000000000000000000000000000000000000000000602082015250565b6000614a89602583613f4c565b9150614a9482614a2d565b604082019050919050565b60006020820190508181036000830152614ab881614a7c565b9050919050565b7f496e76616c6964206f776e657220616464726573730000000000000000000000600082015250565b6000614af5601583613f4c565b9150614b0082614abf565b602082019050919050565b60006020820190508181036000830152614b2481614ae8565b9050919050565b60008160011c9050919050565b6000808291508390505b6001851115614b8257808604811115614b5e57614b5d61447d565b5b6001851615614b6d5780820291505b8081029050614b7b85614b2b565b9450614b42565b94509492505050565b600082614b9b5760019050614c57565b81614ba95760009050614c57565b8160018114614bbf5760028114614bc957614bf8565b6001915050614c57565b60ff841115614bdb57614bda61447d565b5b8360020a915084821115614bf257614bf161447d565b5b50614c57565b5060208310610133831016604e8410600b8410161715614c2d5782820a905083811115614c2857614c2761447d565b5b614c57565b614c3a8484846001614b38565b92509050818404811115614c5157614c5061447d565b5b81810290505b9392505050565b6000614c6982613f0d565b9150614c7483614178565b9250614ca17fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8484614b8b565b905092915050565b6000606082019050614cbe60008301866141af565b614ccb6020830185613f17565b614cd86040830184613f17565b949350505050565b600081519050614cef81613ff8565b92915050565b600060208284031215614d0b57614d0a613ff3565b5b6000614d1984828501614ce0565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6000614d5c82614178565b9150614d6783614178565b925082614d7757614d76614829565b5b82820690509291505056fea26469706673582212204c7c301bde56aad3f33020fbd084bc482b8f455dd2cf3a3ce58f9208f7d9e93c64736f6c63430008180033',
  deployedBytecode:
    '0x608060405234801561001057600080fd5b506004361061023d5760003560e01c8063715018a61161013b578063ba087652116100b8578063d905777e1161007c578063d905777e146106e2578063dd62ed3e14610712578063ef8b30f714610742578063f14faf6f14610772578063f2fde38b1461078e5761023d565b8063ba08765214610618578063c63d75b614610648578063c6e6f59214610678578063c76ce2ef146106a8578063ce96cb77146106b25761023d565b806395d89b41116100ff57806395d89b411461054c578063a5b589b51461056a578063a9059cbb14610588578063b3d7f6b9146105b8578063b460af94146105e85761023d565b8063715018a6146104ce5780638456cb59146104d85780638da5cb5b146104e25780638fcc9cfb1461050057806394bf804d1461051c5761023d565b806338d52e0f116101c9578063522e11771161018d578063522e11771461043c5780635c975abb1461044657806364937fc2146104645780636e553f651461046e57806370a082311461049e5761023d565b806338d52e0f146103965780633f4ba83a146103b4578063402d267d146103be57806341b3d185146103ee5780634cdad5061461040c5761023d565b80630a28a477116102105780630a28a477146102de5780631136758d1461030e57806318160ddd1461032a57806323b872dd14610348578063313ce567146103785761023d565b806301e1d1141461024257806306fdde031461026057806307a2d13a1461027e578063095ea7b3146102ae575b600080fd5b61024a6107aa565b6040516102579190613f26565b60405180910390f35b6102686107f0565b6040516102759190613fd1565b60405180910390f35b61029860048036038101906102939190614024565b610882565b6040516102a59190613f26565b60405180910390f35b6102c860048036038101906102c391906140af565b610896565b6040516102d5919061410a565b60405180910390f35b6102f860048036038101906102f39190614024565b6108b9565b6040516103059190613f26565b60405180910390f35b610328600480360381019061032391906140af565b6108cd565b005b610332610c9f565b60405161033f9190613f26565b60405180910390f35b610362600480360381019061035d9190614125565b610ca9565b60405161036f919061410a565b60405180910390f35b610380610cd8565b60405161038d9190614194565b60405180910390f35b61039e610d12565b6040516103ab91906141be565b60405180910390f35b6103bc610d78565b005b6103d860048036038101906103d391906141d9565b610dee565b6040516103e59190613f26565b60405180910390f35b6103f6610e4f565b6040516104039190613f26565b60405180910390f35b61042660048036038101906104219190614024565b610e95565b6040516104339190613f26565b60405180910390f35b610444610ea9565b005b61044e611041565b60405161045b919061410a565b60405180910390f35b61046c611058565b005b61048860048036038101906104839190614206565b611121565b6040516104959190613f26565b60405180910390f35b6104b860048036038101906104b391906141d9565b61179d565b6040516104c59190613f26565b60405180910390f35b6104d66117e5565b005b6104e06117f9565b005b6104ea61186f565b6040516104f791906141be565b60405180910390f35b61051a60048036038101906105159190614024565b611899565b005b61053660048036038101906105319190614206565b61198e565b6040516105439190613f26565b60405180910390f35b61055461200a565b6040516105619190613fd1565b60405180910390f35b61057261209c565b60405161057f919061410a565b60405180910390f35b6105a2600480360381019061059d91906140af565b6120ef565b6040516105af919061410a565b60405180910390f35b6105d260048036038101906105cd9190614024565b612112565b6040516105df9190613f26565b60405180910390f35b61060260048036038101906105fd9190614246565b612126565b60405161060f9190613f26565b60405180910390f35b610632600480360381019061062d9190614246565b6126dc565b60405161063f9190613f26565b60405180910390f35b610662600480360381019061065d91906141d9565b612c92565b60405161066f9190613f26565b60405180910390f35b610692600480360381019061068d9190614024565b612cf3565b60405161069f9190613f26565b60405180910390f35b6106b0612d07565b005b6106cc60048036038101906106c791906141d9565b612dd0565b6040516106d99190613f26565b60405180910390f35b6106fc60048036038101906106f791906141d9565b612dec565b6040516107099190613f26565b60405180910390f35b61072c60048036038101906107279190614299565b612dfe565b6040516107399190613f26565b60405180910390f35b61075c60048036038101906107579190614024565b612e85565b6040516107699190613f26565b60405180910390f35b61078c60048036038101906107879190614024565b612e99565b005b6107a860048036038101906107a391906141d9565b613119565b005b60006107c0673da45eb56919ac0260c01b61319f565b6107d4674fa0b14c979c6b7f60c01b61319f565b6107e867f4edc89d781484d460c01b61319f565b600b54905090565b6060600380546107ff90614308565b80601f016020809104026020016040519081016040528092919081815260200182805461082b90614308565b80156108785780601f1061084d57610100808354040283529160200191610878565b820191906000526020600020905b81548152906001019060200180831161085b57829003601f168201915b5050505050905090565b600061088f8260006131a2565b9050919050565b6000806108a16131fb565b90506108ae818585613203565b600191505092915050565b60006108c6826001613215565b9050919050565b6108e167715624653bf483a060c01b61319f565b6108e961326e565b6108fd67db2b62791803af9960c01b61319f565b6109116797a3bd0ee76596d960c01b61319f565b6109196132f5565b61092d6748a763ca35da6ce160c01b61319f565b61094167017fdfc36635129c60c01b61319f565b610955675e461f0a87e51f0160c01b61319f565b61096967ed5fcbebc97c0c1860c01b61319f565b61097d6751e8c0873904bfd860c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036109ec576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109e390614385565b60405180910390fd5b6109ff669395853d8f3e4c60c01b61319f565b610a1367b37e68212e5cd74660c01b61319f565b610a2767b460642528ccc3cb60c01b61319f565b610a3b6746a1b3d1d54cf52160c01b61319f565b60008111610a7e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a75906143f1565b60405180910390fd5b610a9267bbd2db79cf55ee8260c01b61319f565b610aa6671a5dcb2905d78bde60c01b61319f565b610aba674bcc1c828c8e8a2060c01b61319f565b610ace674e1b20def8a5650f60c01b61319f565b600b54811115610b13576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b0a9061445d565b60405180910390fd5b610b2767e70b6a2867045a4c60c01b61319f565b610b3b67c731cc9d1eefaf1660c01b61319f565b80600b6000828254610b4d91906144ac565b92505081905550610b686773aed028834a23b660c01b61319f565b610b7c67c0b730ff8be07f0f60c01b61319f565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663a9059cbb83836040518363ffffffff1660e01b8152600401610bd99291906144e0565b6020604051808303816000875af1158015610bf8573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c1c9190614535565b50610c3167482973199d4cf02e60c01b61319f565b610c4567e01c45a045e0fa0060c01b61319f565b8173ffffffffffffffffffffffffffffffffffffffff167f272db152efde405127896d7f37a1fc863f84ee8f19c882e95722854fd09625a682604051610c8b9190613f26565b60405180910390a2610c9b61333b565b5050565b6000600254905090565b600080610cb46131fb565b9050610cc1858285613345565b610ccc8585856133d9565b60019150509392505050565b6000610ce26134cd565b7f0000000000000000000000000000000000000000000000000000000000000000610d0d9190614562565b905090565b6000610d28672799f9e3c0d51f2a60c01b61319f565b610d3c67efba52246800023460c01b61319f565b610d50676da08911bb34c9d760c01b61319f565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b610d8c679fe290ab0d311a3660c01b61319f565b610d9461326e565b610da8679d23450dd3d54e4b60c01b61319f565b610dbc67b07c371c0caa788160c01b61319f565b610dd0677070fa0f7f0156f860c01b61319f565b610de467573e296c04c2533f60c01b61319f565b610dec6134d2565b565b6000610e046716aa38c37d22712b60c01b61319f565b610e1867d6e32e7bf5011bb960c01b61319f565b610e2c675c3577b679a2d28960c01b61319f565b6001600b54600754610e3e91906144ac565b610e489190614597565b9050919050565b6000610e65672b55f0ed5a6ed3bc60c01b61319f565b610e796717967b5a279db88960c01b61319f565b610e8d674f2efec3770ff83d60c01b61319f565b600a54905090565b6000610ea28260006131a2565b9050919050565b610ebd676aebd8faf0ee8ece60c01b61319f565b610ec561326e565b610ed967e11818c2457397e960c01b61319f565b610eed67369b0a8e37b4fa6960c01b61319f565b610ef56132f5565b610f0967f6335686197c804560c01b61319f565b610f1d670412cd5ed9501dbb60c01b61319f565b610f3167cdbfe34c42476d5f60c01b61319f565b610f45672c19941ec023f2b060c01b61319f565b610f5967661e52a262eb633060c01b61319f565b600754600b5411610f9f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610f9690614617565b60405180910390fd5b610fb3670aa2135b2755aa6960c01b61319f565b610fc767cf202906e2cf06a960c01b61319f565b610fdb6761102ddbc74533a660c01b61319f565b610fe3610d78565b610ff7675faef630fafc31f860c01b61319f565b61100b6737ad57b48645b85d60c01b61319f565b7fb90297e612d54cca6f23d60092442eb63299f66ddbf94493c3d871747994a5b660405160405180910390a161103f61333b565b565b6000600560149054906101000a900460ff16905090565b61106c67fef78f11357c9c6a60c01b61319f565b61107461326e565b611088677c12bf65ac9b1c5a60c01b61319f565b61109c67688e0a318f315d7b60c01b61319f565b6110b067cdf6d2516c256e8760c01b61319f565b6000600960146101000a81548160ff0219169083151502179055506110df67227a77f25ae2ea7360c01b61319f565b6110f3675a832890e2bbb92660c01b61319f565b7f92157b8195c8c3ac00efedfa7044da4ff96d1ce98df0c0a14f62f0ae09caaaf660405160405180910390a1565b6000611137678dce5acd158d78fe60c01b61319f565b61113f6132f5565b61115367727212c33674bfe060c01b61319f565b61116767c8da80d344ea585b60c01b61319f565b61117b67da24d9656fdb734060c01b61319f565b61118f67369b6931b7a1790760c01b61319f565b6111a367fe992148f019e31160c01b61319f565b600015156111af611041565b1515146111f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111e890614683565b60405180910390fd5b61120567fe01e7e75f8c3d8860c01b61319f565b611219673ab7e6760a237c5560c01b61319f565b61122d678de1faf2a89b1a8b60c01b61319f565b61124167a1e7cc5babc36a3f60c01b61319f565b60001515600960149054906101000a900460ff16151514611297576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161128e906146ef565b60405180910390fd5b6112ab67064934273c814db360c01b61319f565b6112bf678bd1748f3cff894160c01b61319f565b6112d367d6b9abb27bf861d060c01b61319f565b6112e7673b6ea5c113f2b97660c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611356576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161134d9061475b565b60405180910390fd5b61136a670db97343e4e6ebb260c01b61319f565b61137e674c9bf710c7b0551960c01b61319f565b61139267318137e378ac70d060c01b61319f565b6113a667a3aadf2c22dabfed60c01b61319f565b600a548310156113eb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016113e2906147c7565b60405180910390fd5b6113ff671a93fd43a1f4612160c01b61319f565b611413670160b23c6dfae70b60c01b61319f565b61142767d6d00f7d68a5581f60c01b61319f565b61142f613535565b61144367bfd13b147d8804a360c01b61319f565b61145767aa9e3cef1fb31ffc60c01b61319f565b6000611461610c9f565b905061147767bdd98df6680d161160c01b61319f565b61148b672934a0c711e8a04460c01b61319f565b60006114a1674b5a173e67e0631960c01b61319f565b6114b5672058ad9f51dd8b6360c01b61319f565b600182036114ed576114d167424a9aa01d3bb20360c01b61319f565b6114e567e2e82f95b2e545d860c01b61319f565b849050611531565b61150167d5e4c9489ac4783f60c01b61319f565b61151567055bbacb0cad6b7460c01b61319f565b600b54828661152491906147e7565b61152e9190614858565b90505b611545674d3e13789815d71360c01b61319f565b611559676f7b5307b02e594360c01b61319f565b61156d67b5a03b20d485fbf160c01b61319f565b600081116115b0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115a7906148d5565b60405180910390fd5b6115c467daaaacab7e557fca60c01b61319f565b6115d867ab3045eb5b7aad9f60c01b61319f565b84600b60008282546115ea9190614597565b925050819055506116056793318cf8c0f13d1860c01b61319f565b61161967a8a55a39ece3127160c01b61319f565b611621610d12565b73ffffffffffffffffffffffffffffffffffffffff166323b872dd3330886040518463ffffffff1660e01b815260040161165d939291906148f5565b6020604051808303816000875af115801561167c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906116a09190614535565b506116b567af7ae5699856bc9e60c01b61319f565b6116c9674fbf1a8eb565fa7c60c01b61319f565b6116d384826136c0565b6116e767f5050a96af7c84fd60c01b61319f565b6116fb67221da15ed59d1f2660c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7878460405161175a92919061492c565b60405180910390a3611776675a7b3047a4113ea960c01b61319f565b61178a677e99736cd4148d9760c01b61319f565b809250505061179761333b565b92915050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6117ed61326e565b6117f76000613742565b565b61180d679c1550686099bc3f60c01b61319f565b61181561326e565b6118296746e2689b895a072960c01b61319f565b61183d67929aad1ffe550ab160c01b61319f565b61185167319378a5dab7666f60c01b61319f565b611865677561104260125b1d60c01b61319f565b61186d613808565b565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6118ad676689b70d6c1dbd2e60c01b61319f565b6118b561326e565b6118c9673e3020361b773a3960c01b61319f565b6118dd6798c40e31ea560e3660c01b61319f565b6118f167e161fec5af11e0f360c01b61319f565b611905677257a393324c407760c01b61319f565b611919678aed507ca843b5ae60c01b61319f565b6000811161195c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611953906149a1565b60405180910390fd5b61197067be62b946517b725560c01b61319f565b6119846733e3a88c46d9981760c01b61319f565b80600a8190555050565b60006119a46718611bc3b81f2a2760c01b61319f565b6119ac6132f5565b6119c067e59cf97a87e5f7be60c01b61319f565b6119d4676d6c0eac8d9b0d2960c01b61319f565b6119e86727c2d4b27023350760c01b61319f565b6119fc67f4c9a700de8780ec60c01b61319f565b611a1067cf4d6da3199c245a60c01b61319f565b60001515611a1c611041565b151514611a5e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611a5590614683565b60405180910390fd5b611a726726d38eeb4b564f4c60c01b61319f565b611a866769a32803023c27ee60c01b61319f565b611a9a67cf1683f49ac7096b60c01b61319f565b611aae67c6421a5dd205941260c01b61319f565b60001515600960149054906101000a900460ff16151514611b04576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611afb906146ef565b60405180910390fd5b611b186786f536a3e870103a60c01b61319f565b611b2c677e6629081064c5f860c01b61319f565b611b4067ffe26988401ab92360c01b61319f565b611b546719b96e00f0ceaa8060c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603611bc3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611bba9061475b565b60405180910390fd5b611bd7679b3966992567f4ec60c01b61319f565b611beb67ba72ec4847947c4160c01b61319f565b611bff6795a17bb40334435b60c01b61319f565b611c136741c32399315fdb2660c01b61319f565b60008311611c56576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611c4d90614a0d565b60405180910390fd5b611c6a679c9a77e7316956e960c01b61319f565b611c7e676cb043350d42e44360c01b61319f565b611c9267fe0a9fa731da6a1f60c01b61319f565b611c9a613535565b611cae67bb613d751a32382160c01b61319f565b611cc267c4f51360eaa148bf60c01b61319f565b6000611ccc610c9f565b9050611ce26734f1d5ff0a5dc18c60c01b61319f565b611cf667c23e8b24438d7ae060c01b61319f565b6000611d0c6731d2d29923089df460c01b61319f565b611d2067f8cd1508382e929260c01b61319f565b60018203611d5857611d3c6755cf0a484bb8343e60c01b61319f565b611d50673b503f10a4cc4e6f60c01b61319f565b849050611d9c565b611d6c67fe9708d48f6f966a60c01b61319f565b611d8067ac36cc0227ed810060c01b61319f565b81600b5486611d8f91906147e7565b611d999190614858565b90505b611db067af578ce1faf7a8e960c01b61319f565b611dc467d9e319f1379240ad60c01b61319f565b611dd867caad78d998c1db3a60c01b61319f565b600a54811015611e1d576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e1490614a9f565b60405180910390fd5b611e3167194995e08fe717ec60c01b61319f565b611e4567287bcb58bcfc6edc60c01b61319f565b80600b6000828254611e579190614597565b92505081905550611e7267f818a1e03fbeb1f660c01b61319f565b611e866796b5f326f404c09960c01b61319f565b611e8e610d12565b73ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b8152600401611eca939291906148f5565b6020604051808303816000875af1158015611ee9573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190611f0d9190614535565b50611f226704c281188fe84dd760c01b61319f565b611f3667f9e3397133df12fe60c01b61319f565b611f4084866136c0565b611f5467ae7be8a0d3d7cb7c60c01b61319f565b611f686766a7048561eab78260c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d78388604051611fc792919061492c565b60405180910390a3611fe3678d65f5871ff1ab9960c01b61319f565b611ff76739eee54c2ebbb65460c01b61319f565b809250505061200461333b565b92915050565b60606004805461201990614308565b80601f016020809104026020016040519081016040528092919081815260200182805461204590614308565b80156120925780601f1061206757610100808354040283529160200191612092565b820191906000526020600020905b81548152906001019060200180831161207557829003601f168201915b5050505050905090565b60006120b26759bfcd8caa2efe3d60c01b61319f565b6120c6670c6699f500cf02b060c01b61319f565b6120da67865ea0dc8218c67a60c01b61319f565b600960149054906101000a900460ff16905090565b6000806120fa6131fb565b90506121078185856133d9565b600191505092915050565b600061211f8260016131a2565b9050919050565b600061213c67f1963969eba0ce3c60c01b61319f565b6121446132f5565b6121586786989125fdb3710660c01b61319f565b61216c677eda50c092fd609560c01b61319f565b612180675aeafd8d487b34a060c01b61319f565b612194677872290444b3091160c01b61319f565b6121a867bbe1141a2030448060c01b61319f565b600015156121b4611041565b1515146121f6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016121ed90614683565b60405180910390fd5b61220a6705ba455121b76aac60c01b61319f565b61221e678c587426086e3ec260c01b61319f565b61223267524bf5aeb1a36b3f60c01b61319f565b612246677ea4339e5efed80060c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036122b5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016122ac9061475b565b60405180910390fd5b6122c967f0d4fe5c70d212ef60c01b61319f565b6122dd67af98be795736179b60c01b61319f565b6122f1672479f58ebfb45e7560c01b61319f565b61230567a128b41bfd86e22a60c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603612374576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161236b90614b0b565b60405180910390fd5b61238867aee0345c5933639b60c01b61319f565b61239c6786691d39d32af3c060c01b61319f565b6123b0673b13908b87ca4a5d60c01b61319f565b6123b8613535565b6123cc67ddc03313d468c0ea60c01b61319f565b6123e067fa703d8acd8fefe160c01b61319f565b60006123ea610c9f565b905061240067ca1de076201842fa60c01b61319f565b61241467a4f80f8f8380978660c01b61319f565b6000600b54828761242591906147e7565b61242f9190614858565b90506124456790ebbb94e12a89c460c01b61319f565b61245967fa60c6105d7344a160c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146124d8576124a067b87c38cc2e5bd39b60c01b61319f565b6124b4679cdd9228dd964c5d60c01b61319f565b6124c867a65d1fb54d72535760c01b61319f565b6124d3843383613345565b6124ed565b6124ec67bf9d63ec4188481460c01b61319f565b5b61250167484db5b4c196594760c01b61319f565b85600b600082825461251391906144ac565b9250508190555061252e67743128cd2dce6bc360c01b61319f565b61254267ed7e728e09230b5a60c01b61319f565b61254c848261386b565b61256067a85431a5303e149b60c01b61319f565b612574679be1d635048192e660c01b61319f565b61257c610d12565b73ffffffffffffffffffffffffffffffffffffffff1663a9059cbb86886040518363ffffffff1660e01b81526004016125b69291906144e0565b6020604051808303816000875af11580156125d5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906125f99190614535565b5061260e67f5557f3755e2fbd660c01b61319f565b612622677872dd5e0d300f9160c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167ffbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db898560405161269892919061492c565b60405180910390a46126b4672f95fe93695dd9e860c01b61319f565b6126c8670173ffe775244b1560c01b61319f565b80925050506126d561333b565b9392505050565b60006126f26789997c4ddda0ea1860c01b61319f565b6126fa6132f5565b61270e67689cf5575428e25f60c01b61319f565b61272267d187e2d69f1b4edc60c01b61319f565b61273667d22004c27dab9aee60c01b61319f565b61274a676ac0a7dd47b9d02360c01b61319f565b61275e673ce1afe0e2e499d360c01b61319f565b6000151561276a611041565b1515146127ac576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016127a390614683565b60405180910390fd5b6127c0673c71cd8620e4a5aa60c01b61319f565b6127d467c37eca26b162dddf60c01b61319f565b6127e86771d8c8515cdaf07960c01b61319f565b6127fc67b5f3cc954989271b60c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361286b576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016128629061475b565b60405180910390fd5b61287f675b3a4df0eb09c72d60c01b61319f565b612893678887c7eb62e0d4fd60c01b61319f565b6128a76717f779c3a943c37b60c01b61319f565b6128bb67c4ad6a5a7e1ed28360c01b61319f565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361292a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161292190614b0b565b60405180910390fd5b61293e6757ef2e279dbe23d260c01b61319f565b612952678f17628140a3731460c01b61319f565b612966677b102aba7db5ce1760c01b61319f565b61296e613535565b61298267751b35a1c05e3aa960c01b61319f565b61299667823febd30525261f60c01b61319f565b8173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614612a15576129dd67df6e8a1c4b8fb09d60c01b61319f565b6129f1677d83d785a4474cd660c01b61319f565b612a0567214b8ab35641a09160c01b61319f565b612a10823386613345565b612a2a565b612a2967a0fe603eb63b8e0e60c01b61319f565b5b612a3e67a3273c5f5f4a12b460c01b61319f565b612a5267e08792c4e99fedac60c01b61319f565b6000612a5c610c9f565b9050612a7267aa4460864a0cbfed60c01b61319f565b612a8667ddec4afc8985b5ca60c01b61319f565b600081600b5487612a9791906147e7565b612aa19190614858565b9050612ab76772964fa7c7d6f1ec60c01b61319f565b80600b6000828254612ac991906144ac565b92505081905550612ae467f893dbce7cb4328c60c01b61319f565b612af867bd3abd6a3f610ac860c01b61319f565b612b02848761386b565b612b1667584dcf0c0936b82760c01b61319f565b612b2a674b9ebbbedc771fde60c01b61319f565b612b32610d12565b73ffffffffffffffffffffffffffffffffffffffff1663a9059cbb86836040518363ffffffff1660e01b8152600401612b6c9291906144e0565b6020604051808303816000875af1158015612b8b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190612baf9190614535565b50612bc4676a62b6af4a759c1660c01b61319f565b612bd86769a59306de4a2d8a60c01b61319f565b8373ffffffffffffffffffffffffffffffffffffffff168573ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167ffbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db848a604051612c4e92919061492c565b60405180910390a4612c6a67f47e480afa630cde60c01b61319f565b612c7e67df0bcb6d07ac29d860c01b61319f565b8092505050612c8b61333b565b9392505050565b6000612ca8678258e6ba10b08c3f60c01b61319f565b612cbc6731b7fe43c5c0f8a260c01b61319f565b612cd067daf25828a3ddc39460c01b61319f565b6001600b54600854612ce291906144ac565b612cec9190614597565b9050919050565b6000612d00826000613215565b9050919050565b612d1b67c195f2babb6afa4a60c01b61319f565b612d2361326e565b612d3767ece5b3f8194801bb60c01b61319f565b612d4b674057a66c08572ffe60c01b61319f565b612d5f67f74d1c40be3cdf6f60c01b61319f565b6001600960146101000a81548160ff021916908315150217905550612d8e67cc73121d4f8c3eef60c01b61319f565b612da267cd5f7c48e51944d660c01b61319f565b7fa42716464c1db5dcbde8f45245f86811504bf01f15d4a375a9bd025fdbafe86060405160405180910390a1565b6000612de5612dde8361179d565b60006131a2565b9050919050565b6000612df78261179d565b9050919050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6000612e92826000613215565b9050919050565b612ead673eeb7400f1f19ea160c01b61319f565b612eb561326e565b612ec967984331f1ba60f04060c01b61319f565b612edd6739fde33abc811ce460c01b61319f565b612ee56132f5565b612ef9678951359378cabd0360c01b61319f565b612f0d679a18cee366d67e9c60c01b61319f565b612f21677e67446abafe949860c01b61319f565b612f3567ee7123af92091f0360c01b61319f565b612f4967c42ad7fd30697eab60c01b61319f565b60008111612f8c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401612f83906143f1565b60405180910390fd5b612fa0672dc3f5f99ac5943360c01b61319f565b612fb467a58d8b0462e473bc60c01b61319f565b612fc8671c321b77162855ca60c01b61319f565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166323b872dd3330846040518463ffffffff1660e01b8152600401613027939291906148f5565b6020604051808303816000875af1158015613046573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061306a9190614535565b5061307f678f5c83f05c5c329960c01b61319f565b80600b60008282546130919190614597565b925050819055506130ac6721a191bf21c4fb0160c01b61319f565b6130c0677b7bd7466f5f8c6460c01b61319f565b3373ffffffffffffffffffffffffffffffffffffffff167f5d8bc849764969eb1bcc6d0a2f55999d0167c1ccec240a4f39cf664ca9c4148e826040516131069190613f26565b60405180910390a261311661333b565b50565b61312161326e565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036131935760006040517f1e4fbdf700000000000000000000000000000000000000000000000000000000815260040161318a91906141be565b60405180910390fd5b61319c81613742565b50565b50565b60006131f360016131b16107aa565b6131bb9190614597565b6131c36134cd565b600a6131cf9190614c5e565b6131d7610c9f565b6131e19190614597565b84866138ed909392919063ffffffff16565b905092915050565b600033905090565b613210838383600161393c565b505050565b60006132666132226134cd565b600a61322e9190614c5e565b613236610c9f565b6132409190614597565b600161324a6107aa565b6132549190614597565b84866138ed909392919063ffffffff16565b905092915050565b6132766131fb565b73ffffffffffffffffffffffffffffffffffffffff1661329461186f565b73ffffffffffffffffffffffffffffffffffffffff16146132f3576132b76131fb565b6040517f118cdaa70000000000000000000000000000000000000000000000000000000081526004016132ea91906141be565b60405180910390fd5b565b600260065403613331576040517f3ee5aeb500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b6002600681905550565b6001600681905550565b60006133518484612dfe565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff81146133d357818110156133c3578281836040517ffb8f41b20000000000000000000000000000000000000000000000000000000081526004016133ba93929190614ca9565b60405180910390fd5b6133d28484848403600061393c565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361344b5760006040517f96c6fd1e00000000000000000000000000000000000000000000000000000000815260040161344291906141be565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036134bd5760006040517fec442f050000000000000000000000000000000000000000000000000000000081526004016134b491906141be565b60405180910390fd5b6134c8838383613b13565b505050565b600090565b6134da613d38565b6000600560146101000a81548160ff0219169083151502179055507f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa61351e6131fb565b60405161352b91906141be565b60405180910390a1565b613549675123f5a2520c05b260c01b61319f565b61355d67c9b35abd64b7c44d60c01b61319f565b61357167ff04984f5484ebb760c01b61319f565b600061357b610d12565b73ffffffffffffffffffffffffffffffffffffffff166370a08231306040518263ffffffff1660e01b81526004016135b391906141be565b602060405180830381865afa1580156135d0573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906135f49190614cf5565b905061360a6755dbe1b85bb030f860c01b61319f565b61361e6746e20d930f2ece7860c01b61319f565b600b548111156136415761363c67b1895c6d25fd657a60c01b61319f565b6136bd565b61365567f851db3b553c4ad860c01b61319f565b613669676a0c343d2d0a670260c01b61319f565b600b548110156136a75761368767aa6eb9335f2b269660c01b61319f565b61369b671bdb1c83a95b9bd760c01b61319f565b80600b819055506136bc565b6136bb6771a7692d85da729460c01b61319f565b5b5b50565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036137325760006040517fec442f0500000000000000000000000000000000000000000000000000000000815260040161372991906141be565b60405180910390fd5b61373e60008383613b13565b5050565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b613810613d78565b6001600560146101000a81548160ff0219169083151502179055507f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586138546131fb565b60405161386191906141be565b60405180910390a1565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036138dd5760006040517f96c6fd1e0000000000000000000000000000000000000000000000000000000081526004016138d491906141be565b60405180910390fd5b6138e982600083613b13565b5050565b600061391d6138fb83613db9565b801561391857506000848061391357613912614829565b5b868809115b613de7565b613928868686613df3565b6139329190614597565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036139ae5760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016139a591906141be565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603613a205760006040517f94280d62000000000000000000000000000000000000000000000000000000008152600401613a1791906141be565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508015613b0d578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051613b049190613f26565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603613b65578060026000828254613b599190614597565b92505081905550613c38565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015613bf1578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401613be893929190614ca9565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603613c815780600260008282540392505081905550613cce565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051613d2b9190613f26565b60405180910390a3505050565b613d40611041565b613d76576040517f8dfc202b00000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b613d80611041565b15613db7576040517fd93c066500000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b600060016002836003811115613dd257613dd1614d22565b5b613ddc9190614d51565b60ff16149050919050565b60008115159050919050565b6000808385029050600080198587098281108382030391505060008103613e2e57838281613e2457613e23614829565b5b0492505050613eda565b808411613e4e57613e4d613e486000861460126011613ee1565b613efb565b5b600084868809905082811182039150808303925060008560000386169050808604955080840493506001818260000304019050808302841793506000600287600302189050808702600203810290508087026002038102905080870260020381029050808702600203810290508087026002038102905080870260020381029050808502955050505050505b9392505050565b6000613eec84613de7565b82841802821890509392505050565b634e487b71600052806020526024601cfd5b6000819050919050565b613f2081613f0d565b82525050565b6000602082019050613f3b6000830184613f17565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015613f7b578082015181840152602081019050613f60565b60008484015250505050565b6000601f19601f8301169050919050565b6000613fa382613f41565b613fad8185613f4c565b9350613fbd818560208601613f5d565b613fc681613f87565b840191505092915050565b60006020820190508181036000830152613feb8184613f98565b905092915050565b600080fd5b61400181613f0d565b811461400c57600080fd5b50565b60008135905061401e81613ff8565b92915050565b60006020828403121561403a57614039613ff3565b5b60006140488482850161400f565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061407c82614051565b9050919050565b61408c81614071565b811461409757600080fd5b50565b6000813590506140a981614083565b92915050565b600080604083850312156140c6576140c5613ff3565b5b60006140d48582860161409a565b92505060206140e58582860161400f565b9150509250929050565b60008115159050919050565b614104816140ef565b82525050565b600060208201905061411f60008301846140fb565b92915050565b60008060006060848603121561413e5761413d613ff3565b5b600061414c8682870161409a565b935050602061415d8682870161409a565b925050604061416e8682870161400f565b9150509250925092565b600060ff82169050919050565b61418e81614178565b82525050565b60006020820190506141a96000830184614185565b92915050565b6141b881614071565b82525050565b60006020820190506141d360008301846141af565b92915050565b6000602082840312156141ef576141ee613ff3565b5b60006141fd8482850161409a565b91505092915050565b6000806040838503121561421d5761421c613ff3565b5b600061422b8582860161400f565b925050602061423c8582860161409a565b9150509250929050565b60008060006060848603121561425f5761425e613ff3565b5b600061426d8682870161400f565b935050602061427e8682870161409a565b925050604061428f8682870161409a565b9150509250925092565b600080604083850312156142b0576142af613ff3565b5b60006142be8582860161409a565b92505060206142cf8582860161409a565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061432057607f821691505b602082108103614333576143326142d9565b5b50919050565b7f496e76616c696420626f72726f77657220616464726573730000000000000000600082015250565b600061436f601883613f4c565b915061437a82614339565b602082019050919050565b6000602082019050818103600083015261439e81614362565b9050919050565b7f416d6f756e74206d75737420626520706f736974697665000000000000000000600082015250565b60006143db601783613f4c565b91506143e6826143a5565b602082019050919050565b6000602082019050818103600083015261440a816143ce565b9050919050565b7f496e73756666696369656e742066756e64730000000000000000000000000000600082015250565b6000614447601283613f4c565b915061445282614411565b602082019050919050565b600060208201905081810360008301526144768161443a565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b60006144b782613f0d565b91506144c283613f0d565b92508282039050818111156144da576144d961447d565b5b92915050565b60006040820190506144f560008301856141af565b6145026020830184613f17565b9392505050565b614512816140ef565b811461451d57600080fd5b50565b60008151905061452f81614509565b92915050565b60006020828403121561454b5761454a613ff3565b5b600061455984828501614520565b91505092915050565b600061456d82614178565b915061457883614178565b9250828201905060ff8111156145915761459061447d565b5b92915050565b60006145a282613f0d565b91506145ad83613f0d565b92508282019050808211156145c5576145c461447d565b5b92915050565b7f57616974696e6720666f7220626f72726f7765722066756e6473000000000000600082015250565b6000614601601a83613f4c565b915061460c826145cb565b602082019050919050565b60006020820190508181036000830152614630816145f4565b9050919050565b7f556e66696e6973686564204465616c0000000000000000000000000000000000600082015250565b600061466d600f83613f4c565b915061467882614637565b602082019050919050565b6000602082019050818103600083015261469c81614660565b9050919050565b7f466f7262696464656e0000000000000000000000000000000000000000000000600082015250565b60006146d9600983613f4c565b91506146e4826146a3565b602082019050919050565b60006020820190508181036000830152614708816146cc565b9050919050565b7f496e76616c696420726563656976657220616464726573730000000000000000600082015250565b6000614745601883613f4c565b91506147508261470f565b602082019050919050565b6000602082019050818103600083015261477481614738565b9050919050565b7f4465706f73697420616d6f756e742062656c6f77206d696e696d756d00000000600082015250565b60006147b1601c83613f4c565b91506147bc8261477b565b602082019050919050565b600060208201905081810360008301526147e0816147a4565b9050919050565b60006147f282613f0d565b91506147fd83613f0d565b925082820261480b81613f0d565b915082820484148315176148225761482161447d565b5b5092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b600061486382613f0d565b915061486e83613f0d565b92508261487e5761487d614829565b5b828204905092915050565b7f536861726520616d6f756e7420746f6f20736d616c6c00000000000000000000600082015250565b60006148bf601683613f4c565b91506148ca82614889565b602082019050919050565b600060208201905081810360008301526148ee816148b2565b9050919050565b600060608201905061490a60008301866141af565b61491760208301856141af565b6149246040830184613f17565b949350505050565b60006040820190506149416000830185613f17565b61494e6020830184613f17565b9392505050565b7f4d696e696d756d206465706f736974206d75737420626520706f736974697665600082015250565b600061498b602083613f4c565b915061499682614955565b602082019050919050565b600060208201905081810360008301526149ba8161497e565b9050919050565b7f536861726520616d6f756e74206d75737420626520706f736974697665000000600082015250565b60006149f7601d83613f4c565b9150614a02826149c1565b602082019050919050565b60006020820190508181036000830152614a26816149ea565b9050919050565b7f4571756976616c656e7420617373657420616d6f756e742062656c6f77206d6960008201527f6e696d756d000000000000000000000000000000000000000000000000000000602082015250565b6000614a89602583613f4c565b9150614a9482614a2d565b604082019050919050565b60006020820190508181036000830152614ab881614a7c565b9050919050565b7f496e76616c6964206f776e657220616464726573730000000000000000000000600082015250565b6000614af5601583613f4c565b9150614b0082614abf565b602082019050919050565b60006020820190508181036000830152614b2481614ae8565b9050919050565b60008160011c9050919050565b6000808291508390505b6001851115614b8257808604811115614b5e57614b5d61447d565b5b6001851615614b6d5780820291505b8081029050614b7b85614b2b565b9450614b42565b94509492505050565b600082614b9b5760019050614c57565b81614ba95760009050614c57565b8160018114614bbf5760028114614bc957614bf8565b6001915050614c57565b60ff841115614bdb57614bda61447d565b5b8360020a915084821115614bf257614bf161447d565b5b50614c57565b5060208310610133831016604e8410600b8410161715614c2d5782820a905083811115614c2857614c2761447d565b5b614c57565b614c3a8484846001614b38565b92509050818404811115614c5157614c5061447d565b5b81810290505b9392505050565b6000614c6982613f0d565b9150614c7483614178565b9250614ca17fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8484614b8b565b905092915050565b6000606082019050614cbe60008301866141af565b614ccb6020830185613f17565b614cd86040830184613f17565b949350505050565b600081519050614cef81613ff8565b92915050565b600060208284031215614d0b57614d0a613ff3565b5b6000614d1984828501614ce0565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6000614d5c82614178565b9150614d6783614178565b925082614d7757614d76614829565b5b82820690509291505056fea26469706673582212204c7c301bde56aad3f33020fbd084bc482b8f455dd2cf3a3ce58f9208f7d9e93c64736f6c63430008180033',
  linkReferences: {},
  deployedLinkReferences: {},
};
