import React, { useState } from 'react';
import { isAddress } from 'ethers';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { toast } from 'react-toastify';

import TMModal from 'src/components/common/modal';
import { Field, FieldContent, FieldDescription, FieldLabel } from 'src/components/ui/field';
import { Input } from 'src/components/ui/input';
import { useWeb3AuthContext } from 'src/context/web3-auth-context';
import EthereumRpc from 'src/lib/web3/evm.web3';

interface WithdrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: string;
  onWithdrawComplete?: () => void;
}

const investmentTokenSymbol =
  process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_SYMBOL || 'TOKEN';

const WithdrawDialog: React.FC<WithdrawDialogProps> = ({
  isOpen,
  onClose,
  maxAmount,
  onWithdrawComplete,
}) => {
  const { web3authPnPInstance } = useWeb3AuthContext();
  const [selectedMethod, setSelectedMethod] = useState<'wallet' | 'bank' | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    setSelectedMethod(null);
    setAmount('');
    setToAddress('');
    setIsProcessing(false);
    onClose();
  };

  const handleWithdraw = async () => {
    try {
      setIsProcessing(true);

      if (!amount || Number(amount) <= 0) {
        toast.error('Please enter a valid amount to withdraw.');
        return;
      }

      if (parseFloat(amount) > parseFloat(maxAmount)) {
        toast.error(`Amount cannot exceed your balance of ${maxAmount} ${investmentTokenSymbol}`);
        return;
      }

      if (!toAddress || !isAddress(toAddress)) {
        toast.error('Please enter a valid destination wallet address.');
        return;
      }

      const tokenAddress = process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_CONTRACT_ADDRESS;
      const decimals = Number(process.env.NEXT_PUBLIC_INVESTMENT_TOKEN_DECIMALS || '6');

      if (!tokenAddress) {
        toast.error('Investment token contract address is not configured.');
        return;
      }

      if (!web3authPnPInstance.provider) {
        toast.error('Wallet not connected. Please ensure you are logged in.');
        return;
      }

      const ethereumRpc = new EthereumRpc();
      const provider = web3authPnPInstance.provider as EthereumPrivateKeyProvider;
      const accounts = await ethereumRpc.getAccounts();
      const fromAddress = (accounts as string[])[0];

      // Create the transfer function data
      const amountInWei = (parseFloat(amount) * Math.pow(10, decimals)).toString(16);
      const data = `0xa9059cbb000000000000000000000000${toAddress.slice(2)}${amountInWei.padStart(64, '0')}`;

      const txHash = await ethereumRpc.sendData(tokenAddress, data);
      await ethereumRpc.waitForTransaction(txHash);

      toast.success(`Withdrawal of ${amount} ${investmentTokenSymbol} submitted.`);
      onWithdrawComplete?.();
      handleClose();
    } catch (error: any) {
      console.error('Withdraw error:', error);
      if (error?.code === 4001) {
        toast.error('Withdrawal cancelled in wallet.');
      } else {
        toast.error(error?.message || 'Failed to initiate withdrawal.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <TMModal
      open={isOpen}
      handleClose={handleClose}
      classOverrides="max-w-[600px]"
      showHeader={true}
      headerText="Withdraw Funds"
    >
      <div className="px-6 pb-4 pt-[70px] sm:pt-[72px]">
        {!selectedMethod ? (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setSelectedMethod('wallet')}
              className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#4E8C37] disabled:opacity-60"
              disabled={isProcessing}
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">Blockchain wallet</span>
                <span className="text-xs font-medium text-slate-500">
                  Withdraw {investmentTokenSymbol} from your profile wallet to another address.
                </span>
              </div>
            </button>

            <button
              type="button"
              className="w-full cursor-not-allowed rounded-2xl border border-dashed border-[#E5E7EB] bg-white p-4 text-left opacity-60"
              disabled
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800">Bank account (coming soon)</span>
                <span className="text-xs font-medium text-slate-500">
                  Withdrawals directly to a bank account will be available in a future update.
                </span>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field className="gap-0">
              <FieldLabel className="text-[13px] text-tm-black-80">
                Amount to withdraw ({investmentTokenSymbol})
              </FieldLabel>
              <FieldContent className="gap-0">
                <Input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`0.0 ${investmentTokenSymbol}`}
                  className="mt-2 h-auto w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#4E8C37]"
                />
              </FieldContent>
              <FieldDescription className="ml-1 text-xs text-[#9CA3AF]">
                Available: {maxAmount} {investmentTokenSymbol}
              </FieldDescription>
            </Field>

            <Field className="gap-0">
              <FieldLabel className="text-[13px] text-tm-black-80">
                Destination wallet address
              </FieldLabel>
              <FieldContent className="gap-0">
                <Input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-2 h-auto w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#4E8C37]"
                />
              </FieldContent>
            </Field>

            <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
              <button
                type="button"
                onClick={() => setSelectedMethod(null)}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 border border-[#E5E7EB] bg-white hover:bg-slate-50 md:w-auto"
                disabled={isProcessing}
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isProcessing}
                className={[
                  'rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition',
                  isProcessing ? 'cursor-not-allowed bg-[#4E8C37]/50' : 'bg-[#4E8C37] hover:bg-[#3A6A28]',
                ].join(' ')}
              >
                {isProcessing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        )}
      </div>
    </TMModal>
  );
};

export default WithdrawDialog;
