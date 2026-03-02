import React, { useEffect, useState } from "react";
import ErrorMessage from "./ErrorMessage";

interface Props {
  walletBalance: number;
  walletBalanceEth: number;
  poolCapacity: number;
  deposit: (amount: number) => Promise<void>;
}

const Deposit: React.FC<Props> = ({ walletBalance, walletBalanceEth, poolCapacity, deposit }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Simulate wallet and pool constraints
  const minDeposit = 1;

  const handleMaxClick = () => {
    // Set to the lower of wallet balance or remaining pool capacity
    const maxAmount = Math.min(walletBalance, poolCapacity);
    setAmount(maxAmount.toString());
  };

  const handleDeposit = async (e: any) => {
    setLoading(true);
    setDepositError(null);
    try {
      await deposit(Number(amount));
    } catch (err) {
      console.error(err);
      setDepositError("Failed submitting deposit. Please try again.");
    }
    setLoading(false);
  };

  const getErrorMessage = () => {
    const numAmount = Number(amount);
    if (walletBalanceEth === 0) return "Insufficient ETH balance";
    if (!amount) return null;
    if (isNaN(numAmount)) return "Please enter a valid number";
    if (numAmount > walletBalance) return "Insufficient wallet balance";
    if (numAmount > poolCapacity) return "Exceeds amount required to pay back";
    if (numAmount < minDeposit) return `Minimum deposit is ${minDeposit} USDC`;
    return null;
  };

  useEffect(() => {
    setError(getErrorMessage());
  }, [amount, walletBalanceEth]);

  const isValid = amount && !error;

  return (
    <div className="bg-gray-50  w-full space-y-4 rounded-lg p-3">
      <div className="text-gray-600 mb-6 flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Balance:</span>
          <span>{walletBalance} USDC</span>
          <span>{walletBalanceEth} ETH</span>
        </div>
      </div>

      <div className="flex w-full flex-col rounded-lg">
        <div className="flex w-full items-center  gap-2">
          <input
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`bg-white  w-full  flex-1 rounded-md px-3 py-2 focus:outline-none ${error ? "border-red-500 focus:ring-red-500" : ""
              }`}
          />
          <button
            className="text-blue-600 hover:text-blue-700 ml-2 px-4 py-1 text-sm font-medium"
            onClick={handleMaxClick}
          >
            MAX
          </button>
        </div>
        <div className="mb-4 mt-1 flex w-full items-center justify-between">
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div className="text-xs">Min. Deposit: {minDeposit} USDC</div>
        </div>
        <button
          className={`mb-4 w-full rounded bg-tm-green py-2 text-tm-white ${!isValid || loading ? "cursor-not-allowed opacity-50" : ""
            }`}
          disabled={!isValid || loading}
          onClick={handleDeposit}
        >
          {loading ? "Processing..." : <span className="flex items-center justify-center">Deposit</span>}
        </button>
        {depositError && <ErrorMessage>{depositError}</ErrorMessage>}
      </div>
    </div>
  );
};

export default Deposit;
