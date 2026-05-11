import React, { useCallback, useEffect, useState } from "react";
import { Contract, ethers, formatEther, formatUnits, parseUnits } from "ethers";
import { Card } from "@mui/material";
import { Info, CaretDown } from "@phosphor-icons/react";

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
  const [showVaultDetails, setShowVaultDetails] = useState<boolean>(false);

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

  return (
    <Card className="bg-[#FFFFFF] w-full p-4 sm:p-6 border border-[#E2E8F0] shadow-[0_10px_25px_rgba(15,23,42,0.08)]" elevation={0}>
      {/* Vault Details - Collapsible Section */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-200 hover:border-[#D1D5DB]">
        <button
          type="button"
          onClick={() => setShowVaultDetails(!showVaultDetails)}
          className="flex w-full items-center justify-between p-4 text-left transition-colors duration-200 hover:bg-[#F9FAFB] rounded-2xl"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-900">Vault details</span>
            <span className="text-xs text-gray-600">Address, borrower, and balance information</span>
          </div>
          <CaretDown
            size={20}
            weight="bold"
            className={`text-gray-600 transition-transform duration-300 ease-in-out flex-shrink-0 ${showVaultDetails ? "rotate-180" : "rotate-0"
              }`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${showVaultDetails ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-4 pb-4 space-y-2.5 pt-1">
            {/* Vault Address */}
            <div className="flex flex-col gap-1.5 py-2.5 px-3 rounded-lg hover:bg-[#F9FAFB] transition-colors duration-150">
              <span className="text-xs sm:text-sm text-gray-600 font-medium">Vault Address</span>
              <a
                href={`${process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER}/token/${vaultAddress}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs sm:text-sm text-gray-900 hover:text-[#4E8C37] transition-colors duration-150 break-all group"
                title={vaultAddress}
              >
                <span className="group-hover:underline">{truncateAddress(vaultAddress)}</span>
              </a>
            </div>

            {borrowerAddress &&
              userInfo &&
              userInfo.user &&
              userInfo.user.walletAddress &&
              borrowerAddress.toLowerCase() === userInfo.user.walletAddress.toLowerCase() && (
                <>
                  {/* User Address */}
                  <div className="flex flex-col gap-1.5 py-2.5 px-3 rounded-lg hover:bg-[#F9FAFB] transition-colors duration-150">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Borrower</span>
                    <a
                      href={`${process.env.NEXT_PUBLIC_BLOCKCHAIN_EXPLORER}/address/${userInfo.user.walletAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs sm:text-sm text-gray-900 hover:text-[#4E8C37] transition-colors duration-150 break-all group"
                      title={userInfo.user.walletAddress}
                    >
                      <span className="group-hover:underline">{truncateAddress(userInfo.user.walletAddress)}</span>
                    </a>
                  </div>

                  {/* Balance */}
                  <div className="flex flex-col gap-1.5 py-2.5 px-3 rounded-lg hover:bg-[#F9FAFB] transition-colors duration-150">
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">Borrower Balance</span>
                    <span className="font-mono text-xs sm:text-sm text-gray-900 font-medium">
                      {balance} {erc20Symbol}
                    </span>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>

      {borrowerAddress &&
        userInfo &&
        userInfo.user &&
        userInfo.user.walletAddress &&
        borrowerAddress.toLowerCase() === userInfo.user.walletAddress.toLowerCase() && (
          <>

            {shipmentStatus === DealStatus.Finished && vault !== null && (
              <div className="mt-4">
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
