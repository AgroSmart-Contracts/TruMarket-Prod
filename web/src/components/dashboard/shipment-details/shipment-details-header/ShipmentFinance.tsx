import React, { useCallback, useEffect, useState } from "react";
import { Contract, ethers, formatEther, formatUnits, parseUnits } from "ethers";
import { Card } from "@mui/material";
import { Info } from "@phosphor-icons/react";

import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { DealStatus } from "src/interfaces/shipment";

import DealVaultAbi from "./DealVault.abi";
import DealsManagerAbi from "./DealsManager.abi";
import Deposit from "./Deposit";
import ERC20Abi from "./ERC20.abi";

const dealsManagerAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as string as "0x";
const erc20Address = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS as string as "0x";
const erc20Symbol = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || "USDC";
const erc20Decimals = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS
  ? +process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS
  : 18;

interface ShipmentFinanceProps {
  vaultAddress: string;
  requestFundAmount: number;
  currentMilestone: number;
  nftID?: number;
  handleComplete: () => Promise<void>;
  shipmentStatus: DealStatus;
  borrowerAddress: string;
  completing: boolean;
}

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 30)}...${address.slice(-4)}`;
};

const ShipmentFinance: React.FC<ShipmentFinanceProps> = ({
  vaultAddress,
  requestFundAmount,
  currentMilestone,
  nftID,
  handleComplete,
  shipmentStatus,
  borrowerAddress,
  completing,
}) => {
  const { privateKeyProvider } = useWeb3AuthContext();
  const { userInfo } = useUserInfo();
  const [amountFunded, setAmountFunded] = useState<string>("0");
  const [balance, setBalance] = useState<string>("0");
  const [balanceEth, setBalanceEth] = useState<string>("0");
  const [vault, setVault] = useState<Contract | null>(null);
  const [erc20, setErc20] = useState<Contract | null>(null);
  const [repayFunds, setRepayFunds] = useState<number>(Math.floor(requestFundAmount * 1.1));

  useEffect(() => {
    if (!vaultAddress) return;

    const provider = new ethers.BrowserProvider(privateKeyProvider as any);

    setErc20(new ethers.Contract(erc20Address, ERC20Abi, provider));
    setVault(new ethers.Contract(vaultAddress, DealVaultAbi, provider));
  }, [vaultAddress]);

  useEffect(() => {
    setRepayFunds(Math.floor(requestFundAmount * 1.1));
  }, [requestFundAmount]);

  const fetchFinanceData = useCallback(async () => {
    if (!userInfo || !vault || !erc20) return;

    // TODO: as web3auth may not be initialized yet, we need to wait for it
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const amountFunded = await vault.totalAssets();
      const balance = await erc20.balanceOf(userInfo.user.walletAddress);

      const provider = new ethers.BrowserProvider(privateKeyProvider as any);

      const ethBalance = await provider.getBalance(userInfo.user.walletAddress);

      setAmountFunded(formatUnits(amountFunded, erc20Decimals));
      setBalance(formatUnits(balance, erc20Decimals));
      setBalanceEth(formatEther(ethBalance));
    } catch (error) {
      console.error("Error fetching finance data:", error);
    }
  }, [userInfo, vault, erc20]);

  useEffect(() => {
    fetchFinanceData();
  }, [userInfo, vault, erc20]);

  const handleDeposit = async (amount: number) => {
    if (!privateKeyProvider) return;

    const provider = new ethers.BrowserProvider(privateKeyProvider as any);
    const signer = await provider.getSigner();
    const signerErc20 = new ethers.Contract(erc20Address, ERC20Abi, signer);
    const dealsManager = new ethers.Contract(dealsManagerAddress, DealsManagerAbi, signer);

    // First approve the DealsManager to spend the tokens
    const approveTx = await signerErc20.approve(dealsManagerAddress, parseUnits("" + amount, erc20Decimals));
    await approveTx.wait();

    // Then call donateToDeal on the DealsManager
    const donateTx = await dealsManager.donateToDeal(nftID, parseUnits("" + amount, erc20Decimals));
    await donateTx.wait();

    fetchFinanceData();
  };

  const progressPercentage = (+amountFunded / +requestFundAmount) * 100;

  return (
    <Card className="bg-white w-full p-4 sm:p-6">
      <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4 border-b pb-4">
        <div className="text-gray-600 flex items-center gap-2">
          <span className="text-xs sm:text-sm">Total pool assets</span>
        </div>
        <div className="text-gray-900 text-2xl sm:text-3xl font-semibold">
          {erc20Symbol} {(+amountFunded).toFixed(2)}
        </div>
        {/* Progress bar */}
        <div>
          <div className="text-gray-600 mb-1 flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm">
            <span>{progressPercentage.toFixed(1)}% filled</span>
            <span className="sm:text-right">
              Target: {erc20Symbol} {requestFundAmount.toFixed(2)}
            </span>
          </div>
          <div className="bg-gray-200 h-2 w-full overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-[#2D3E57] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Vault Address */}
      <div className="bg-gray-50 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium text-sm sm:text-base">Vault Address</span>
        </div>
        <a
          href={`${process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER}/token/${vaultAddress}`}
          target="_blank"
          rel="noreferrer"
          className="bg-gray-100 rounded px-2 sm:px-3 py-1 font-mono text-xs sm:text-sm break-all sm:break-normal text-center sm:text-left hover:bg-gray-200 transition-colors"
          title={vaultAddress}
        >
          <span className="hidden sm:inline">{truncateAddress(vaultAddress)}</span>
          <span className="sm:hidden">{`${vaultAddress.slice(0, 10)}...${vaultAddress.slice(-4)}`}</span>
        </a>
      </div>

      {borrowerAddress &&
        userInfo &&
        userInfo.user &&
        userInfo.user.walletAddress &&
        borrowerAddress.toLowerCase() === userInfo.user.walletAddress.toLowerCase() && (
          <>
            {/* User Address */}
            <div className="bg-gray-50 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Borrower</span>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER}/address/${userInfo.user.walletAddress}`}
                target="_blank"
                rel="noreferrer"
                className="bg-gray-100 rounded px-2 sm:px-3 py-1 font-mono text-xs sm:text-sm break-all sm:break-normal text-center sm:text-left hover:bg-gray-200 transition-colors"
                title={userInfo.user.walletAddress}
              >
                <span className="hidden sm:inline">{truncateAddress(userInfo.user.walletAddress)}</span>
                <span className="sm:hidden">{`${userInfo.user.walletAddress.slice(0, 10)}...${userInfo.user.walletAddress.slice(-4)}`}</span>
              </a>
            </div>

            {/* Balance */}
            <div className="bg-gray-50 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium text-sm sm:text-base">Borrower Balance</span>
              </div>
              <span className="text-blue-600 font-mono font-medium text-sm sm:text-base text-center sm:text-right">
                {balance} {erc20Symbol}
              </span>
            </div>

            {shipmentStatus === DealStatus.Finished && vault !== null && (
              <div className="bg-tm-green-light">
                <div className="bg-blue-100 border-blue-500 text-blue-700 mb-4 border-l-4 p-3 sm:p-4" role="alert">
                  <Info size={16} className="mb-1" />
                  {+amountFunded < repayFunds && (
                    <p className="text-xs sm:text-sm">
                      Shipment is completed. You can repay the funds. {repayFunds.toFixed(2)} {erc20Symbol} should be
                      deposited in the pool before the shipment is completed.
                    </p>
                  )}
                  {+amountFunded >= repayFunds && (
                    <p className="text-xs sm:text-sm">
                      Shipment is completed. The required funds have been successfully repaid. Click
                      &quot;Complete&quot; to unlock the funds to be reclaimed by the investors.
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {currentMilestone === 7 && +amountFunded < repayFunds && (
                    <Deposit
                      walletBalance={+balance}
                      walletBalanceEth={+balanceEth}
                      poolCapacity={repayFunds}
                      deposit={handleDeposit}
                    />
                  )}

                  {currentMilestone === 7 && +amountFunded >= repayFunds && (
                    <div className="flex w-full justify-center">
                      <button
                        disabled={completing}
                        onClick={handleComplete}
                        className="my-4 sm:my-8 rounded bg-tm-green px-4 sm:px-6 py-2 sm:py-3 text-tm-white text-sm sm:text-base font-medium w-full sm:w-auto"
                      >
                        {completing ? "Processing..." : "Complete"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
    </Card>
  );
};

export default ShipmentFinance;
