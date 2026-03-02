import { ADAPTER_STATUS } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import React, { useCallback, useEffect, useState } from "react";
import { Info, Warning } from "@phosphor-icons/react";

import Loading from "src/components/common/loading";
import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { UserProfileInfo } from "src/interfaces/auth";
import EthereumRpc from "src/lib/web3/evm.web3";

import WithdrawModal from "./WithdrawModal";
import { AuthService as AuthApiService } from "src/controller/AuthAPI.service";

interface UserInfoProps {
  userProfileInfo?: UserProfileInfo;
}

const UserInfo: React.FC<UserInfoProps> = ({ userProfileInfo }) => {
  const { web3authPnPInstance, isPnPInitialized, initPnP, web3authSfa } = useWeb3AuthContext();
  const [balance, setBalance] = useState<string>("");
  const [tokenBalance, setTokenBalance] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawType, setWithdrawType] = useState<"ETH" | "TOKEN">("ETH");

  const userDetails = [
    {
      label: "Account Type",
      value: `${userProfileInfo?.accountType}`,
    },
    {
      label: "E-mail address",
      value: `${userProfileInfo?.email}`,
    },
    {
      label: "Web3 wallet address",
      value: `${userProfileInfo?.walletAddress}`,
    },
  ];

  const handleWithdraw = async (amount: string, toAddress: string) => {
    if (!web3authPnPInstance.provider) {
      throw new Error("Provider not initialized");
    }

    const ethereumRpc = new EthereumRpc();

    const provider = web3authPnPInstance.provider as EthereumPrivateKeyProvider;
    const accounts = await ethereumRpc.getAccounts();
    const fromAddress = (accounts as string[])[0];

    if (withdrawType === "ETH") {
      try {
        const txHash = await ethereumRpc.sendEth(toAddress, amount);
        console.log('txHash', txHash)
        await ethereumRpc.waitForTransaction(txHash)
      } catch (err) {
        console.log('failed to send eth', err)
      }
    } else {
      // Token transfer
      const tokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;
      if (!tokenAddress) {
        throw new Error("Token address not configured");
      }

      // Create the transfer function data
      const amountInWei = (parseFloat(amount) * Math.pow(10, +(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || 18))).toString(16);
      const data = `0xa9059cbb000000000000000000000000${toAddress.slice(2)}${amountInWei.padStart(64, '0')}`;

      try {
        const txHash = await ethereumRpc.sendData(tokenAddress, data);
        console.log('txHash', txHash)
        await ethereumRpc.waitForTransaction(txHash)
      } catch (err) {
        console.log('failed to send investing token', err)
      }
    }

    // Refresh balances after withdrawal
    await fetchBalances();
  };

  const fetchBalances = useCallback(async () => {
    try {
      setIsLoading(true);
      if (web3authSfa.status !== ADAPTER_STATUS.CONNECTED) {
        return;
      }

      const ethereumRpc = new EthereumRpc();

      const balance = await ethereumRpc.getBalance()
      const balanceInEth = parseInt(balance as string, 10) / Math.pow(10, 18);
      setBalance(balanceInEth.toFixed(6).toString());



      if (!web3authPnPInstance.provider) {
        return;
      }

      const provider = web3authPnPInstance.provider as EthereumPrivateKeyProvider;
      const accounts = await ethereumRpc.getAccounts();



      // Get ERC20 token balance
      const tokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;
      if (tokenAddress) {
        const data = `0x70a08231000000000000000000000000${(accounts as string[])[0].slice(2)}`;
        const result = await provider.request({
          method: "eth_call",
          params: [
            {
              to: tokenAddress,
              data: data,
            },
            "latest",
          ],
        });
        if (result != '0x') {
          const tokenBalanceInWei = parseInt(result as string, 16);
          const tokenBalanceFormatted = (tokenBalanceInWei / Math.pow(10, +(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || 18))).toFixed(6);
          setTokenBalance(tokenBalanceFormatted);
        } else {
          setTokenBalance("0.000000");
        }
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isPnPInitialized]);

  useEffect(() => {
    if (isPnPInitialized) {
      fetchBalances();
    } else {
      initPnP();
    }
  }, [isPnPInitialized]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex flex-col gap-[10px]">
        {userDetails.map((detail, i) => (
          <div key={i} className="flex items-center justify-between text-[13px] leading-[1.2em]">
            <p className="w-[40%] flex-shrink-0 font-normal text-tm-black-80">{detail.label}:</p>
            <p className="flex-1 font-bold text-tm-black-80">{detail.value}</p>
          </div>
        ))}
        {balance && (
          <div className="flex items-center justify-between text-[13px] leading-[1.2em]">
            <p className="w-[40%] flex-shrink-0 font-normal text-tm-black-80">Balance:</p>
            <div className="flex flex-1 items-center gap-2">
              <p className="font-bold text-tm-black-80">{balance} ETH</p>
              <button
                onClick={() => {
                  setWithdrawType("ETH");
                  setIsWithdrawModalOpen(true);
                }}
                disabled={!balance || Number(balance) <= 0}
                className="px-2  text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        )}
        {tokenBalance && (
          <div className="flex items-center justify-between text-[13px] leading-[1.2em]">
            <p className="w-[40%] flex-shrink-0 font-normal text-tm-black-80">Token Balance:</p>
            <div className="flex flex-1 items-center gap-2">
              <p className="font-bold text-tm-black-80">
                {tokenBalance} {process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || "TRU"}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setWithdrawType("TOKEN");
                    setIsWithdrawModalOpen(true);
                  }}
                  disabled={!balance || Number(balance) <= 0}
                  className={`px-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 ${!balance || Number(balance) <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  Withdraw
                </button>
                <div className="relative group">
                  {balance && Number(balance) > 0 ? (
                    <Info size={16} className="text-blue-600" weight="fill" />
                  ) : (
                    <Warning size={16} className="text-yellow-500" weight="fill" />
                  )}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity" style={{ backgroundColor: "white" }}>
                    {balance && Number(balance) > 0
                      ? "ETH is required for transaction fees"
                      : "You need ETH in your wallet for transaction fees"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onWithdraw={handleWithdraw}
        maxAmount={withdrawType === "ETH" ? balance : tokenBalance}
        tokenSymbol={withdrawType === "ETH" ? "ETH" : (process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || "TRU")}
      />
    </div>
  );
};

export default UserInfo;
