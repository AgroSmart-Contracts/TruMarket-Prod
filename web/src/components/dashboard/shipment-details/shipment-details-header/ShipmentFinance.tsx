import React, { useCallback, useEffect, useState } from "react";
import { Contract, ethers, formatEther, formatUnits, parseUnits } from "ethers";
import { Card } from "@mui/material";
import { Info } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { useWeb3AuthContext } from "src/context/web3-auth-context";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { DealStatus } from "src/interfaces/shipment";
import { dealChainEnv } from "src/lib/web3/deal-chain-env";
import { getDealChainProvider, getDealChainSigner } from "src/lib/web3/deal-chain-provider";

import DealVaultAbi from "./DealVault.abi";
import DealsManagerAbi from "./DealsManager.abi";
import Deposit from "./Deposit";
import ERC20Abi from "./ERC20.abi";

const dealsManagerAddress = dealChainEnv.dealsManagerAddress as "0x";
const erc20Address = dealChainEnv.usdcAddress as "0x";
const erc20Symbol = dealChainEnv.usdcSymbol;
const erc20Decimals = dealChainEnv.usdcDecimals;

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
  const { t } = useTranslation("shipment");
  const { privateKeyProvider } = useWeb3AuthContext();
  const { userInfo } = useUserInfo();
  const [amountFunded, setAmountFunded] = useState<string>("0");
  const [balance, setBalance] = useState<string>("0");
  const [balanceEth, setBalanceEth] = useState<string>("0");
  const [vault, setVault] = useState<Contract | null>(null);
  const [erc20, setErc20] = useState<Contract | null>(null);
  const [repayFunds, setRepayFunds] = useState<number>(Math.floor(requestFundAmount * 1.1));

  useEffect(() => {
    if (!vaultAddress || !privateKeyProvider) return;

    void (async () => {
      const provider = await getDealChainProvider(privateKeyProvider as any);
      setErc20(new ethers.Contract(erc20Address, ERC20Abi, provider));
      setVault(new ethers.Contract(vaultAddress, DealVaultAbi, provider));
    })();
  }, [vaultAddress, privateKeyProvider]);

  useEffect(() => {
    setRepayFunds(Math.floor(requestFundAmount * 1.1));
  }, [requestFundAmount]);

  const fetchFinanceData = useCallback(async () => {
    if (!userInfo || !vault || !erc20 || !privateKeyProvider) return;

    // TODO: as web3auth may not be initialized yet, we need to wait for it
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      const amountFunded = await vault.totalAssets();
      const balance = await erc20.balanceOf(userInfo.user.walletAddress);

      const provider = await getDealChainProvider(privateKeyProvider as any);

      const ethBalance = await provider.getBalance(userInfo.user.walletAddress);

      setAmountFunded(formatUnits(amountFunded, erc20Decimals));
      setBalance(formatUnits(balance, erc20Decimals));
      setBalanceEth(formatEther(ethBalance));
    } catch (error) {
      console.error("Error fetching finance data:", error);
    }
  }, [userInfo, vault, erc20, privateKeyProvider]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const handleDeposit = async (amount: number) => {
    if (!privateKeyProvider) return;

    const signer = await getDealChainSigner(privateKeyProvider as any);
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

  const isBorrower =
    Boolean(borrowerAddress) &&
    Boolean(userInfo?.user?.walletAddress) &&
    borrowerAddress.toLowerCase() === userInfo!.user.walletAddress.toLowerCase();

  const showFinishedActions = isBorrower && shipmentStatus === DealStatus.Finished && vault !== null;

  if (!showFinishedActions) {
    return null;
  }

  return (
    <Card className="bg-[#FFFFFF] w-full p-4 sm:p-6 border border-[#E2E8F0] shadow-[0_10px_25px_rgba(15,23,42,0.08)]" elevation={0}>
      <div className="bg-blue-100 border-blue-500 text-blue-700 mb-4 border-l-4 p-3 sm:p-4" role="alert">
        <Info size={16} className="mb-1" />
        {+amountFunded < repayFunds && (
          <p className="text-xs sm:text-sm">
            {t("finance.repayRequired", { amount: repayFunds.toFixed(2), symbol: erc20Symbol })}
          </p>
        )}
        {+amountFunded >= repayFunds && <p className="text-xs sm:text-sm">{t("finance.repayComplete")}</p>}
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
              {completing ? t("processing") : t("complete")}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ShipmentFinance;
