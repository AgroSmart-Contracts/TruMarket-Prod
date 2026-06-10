import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { toast } from 'react-toastify';

import TMModal from 'src/components/common/modal';
import CancelBackButton from 'src/components/common/cancel-back-button';
import { useWeb3AuthContext } from 'src/context/web3-auth-context';
import { AuthService as AuthApiService } from 'src/controller/AuthAPI.service';
import type { UserProfileInfo } from 'src/interfaces/auth';
import { PaymentsService } from 'src/controller/PaymentsAPI.service';
import type { OsnFeeQuoteData } from 'src/interfaces/osnFeeQuote';
import type { PaymentProviderTransfer } from 'src/interfaces/payment';

import { PartAStepper, PartBStepper, getNextPartALabel } from './Stepper';
import { StepPaymentDetails } from './StepPaymentDetails';
import { StepEnterBankDetails } from './StepEnterBankDetails';
import { StepConfirmBank } from './StepConfirmBank';
import { StepReviewPay } from './StepReviewPay';
import { StepFees } from './StepFees';
import { clampMoneyString, isValidEmail } from './deposit-validators';
import type {
  DepositFlowPhase,
  PartAStep,
  PartBStep,
  PaymentDraft,
  SupplierBankUiMode,
} from './deposit-types';
import { PartBBeneficiaryStep, PartBSubmitTxStep, PartBPendingStep } from './PartBFlowSteps';

interface PayDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete?: () => void;
  defaultRecipientEmail?: string;
  dealId?: string;
  resumePayment?: {
    id: string;
    amount: number;
    currency: string;
    supplierEmail: string;
    feeQuote?: OsnFeeQuoteData;
  } | null;
}

const initialDraft: PaymentDraft = {
  recipientEmail: '',
  amount: '',
  currency: 'USD',
  invoiceNumber: '',
  description: '',
  supplierProfile: null,
  recipientBankDetails: null,
};

const partAStepDescription: Record<PartAStep, string> = {
  1: 'Enter the payment details to start creating the payment request.',
  2: 'Load the fee quote from TruMarket and confirm the amounts before continuing.',
  3: 'Confirm the supplier bank details. If none exist, you can enter them here.',
  4: 'Final review before creating the payment request.',
};

const partBStepDescription: Record<PartBStep, string> = {
  1: '',
  2: 'After you send the money from your bank app, submit the transaction number you received.',
  3: 'The transaction number was submitted and provider confirmation is still pending.',
};

/** Admin-dashboard throws when on-ramp general `active` is off. */
function isOnrampFeeInactiveError(message: string | null): boolean {
  if (!message) return false;
  return /not marked active/i.test(message);
}

const PayDialog: React.FC<PayDialogProps> = ({
  isOpen,
  onClose,
  onPaymentComplete,
  defaultRecipientEmail,
  dealId,
  resumePayment,
}) => {
  const { web3authPnPInstance } = useWeb3AuthContext();
  const [phase, setPhase] = useState<DepositFlowPhase>('partA');
  const [partAStep, setPartAStep] = useState<PartAStep>(1);
  const [partBStep, setPartBStep] = useState<PartBStep>(1);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);
  const [isLoadingSupplier, setIsLoadingSupplier] = useState(false);
  const [isLoadingResumeTransfer, setIsLoadingResumeTransfer] = useState(false);

  const [supplierProfile, setSupplierProfile] = useState<UserProfileInfo | null>(null);
  const [supplierBankMode, setSupplierBankMode] = useState<SupplierBankUiMode>('linked');

  const [activeTransfer, setActiveTransfer] = useState<PaymentProviderTransfer | null>(null);

  const [partBSummary, setPartBSummary] = useState<{
    amount: number;
    currency: string;
    email: string;
    feeQuote: OsnFeeQuoteData | null;
  }>({ amount: 0, currency: 'USD', email: '', feeQuote: null });

  const [feeQuote, setFeeQuote] = useState<OsnFeeQuoteData | null>(null);
  const [feeQuoteFetchedKey, setFeeQuoteFetchedKey] = useState<string | null>(null);
  const [feeQuoteLoading, setFeeQuoteLoading] = useState(false);
  const [feeQuoteError, setFeeQuoteError] = useState<string | null>(null);
  const [feeQuoteRetryNonce, setFeeQuoteRetryNonce] = useState(0);

  const [bankTxNumber, setBankTxNumber] = useState('');
  const [bankTxTouched, setBankTxTouched] = useState(false);

  const [draft, setDraft] = useState<PaymentDraft>(initialDraft);

  const [touched, setTouched] = useState({
    recipientEmail: false,
    amount: false,
  });

  const resetAll = useCallback(() => {
    setPhase('partA');
    setPartAStep(1);
    setPartBStep(1);
    setIsProcessing(false);
    setIsSubmittingTx(false);
    setIsLoadingSupplier(false);
    setIsLoadingResumeTransfer(false);
    setSupplierProfile(null);
    setSupplierBankMode('linked');
    setActiveTransfer(null);
    setPartBSummary({ amount: 0, currency: 'USD', email: '', feeQuote: null });
    setFeeQuote(null);
    setFeeQuoteFetchedKey(null);
    setFeeQuoteLoading(false);
    setFeeQuoteError(null);
    setFeeQuoteRetryNonce(0);
    setBankTxNumber('');
    setBankTxTouched(false);
    setDraft(initialDraft);
    setTouched({ recipientEmail: false, amount: false });
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetAll();
      setDraft({
        ...initialDraft,
        recipientEmail: defaultRecipientEmail || '',
      });
    }
  }, [isOpen, defaultRecipientEmail, resetAll, web3authPnPInstance]);

  useEffect(() => {
    if (!isOpen || !resumePayment?.id) return;
    let cancelled = false;
    setIsLoadingResumeTransfer(true);
    void PaymentsService.getPaymentTransfers(resumePayment.id)
      .then((list) => {
        if (cancelled) return;
        const latest = list?.[0] ?? null;
        setActiveTransfer(latest);
        const submittedBankTx = latest?.bankTxNumber?.trim() || '';
        setBankTxNumber(submittedBankTx);
        setPartBStep(submittedBankTx ? 3 : 1);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        // eslint-disable-next-line no-console
        console.error('Failed to load payment transfer for resume', error);
        setActiveTransfer(null);
        toast.error('Could not load transfer details. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setIsLoadingResumeTransfer(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, resumePayment?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const loadSupplierForStep3 = useCallback(async () => {
    if (!draft.recipientEmail.trim()) {
      toast.error('Recipient email is missing.');
      return;
    }
    setIsLoadingSupplier(true);
    try {
      const profile = await AuthApiService.getUserByEmail({ email: draft.recipientEmail });
      if (!profile) {
        toast.error('Supplier not found. Please check the email address.');
        setSupplierProfile(null);
        setSupplierBankMode('manual');
        return;
      }
      setSupplierProfile(profile);
      const hasBanks = !!profile.bankAccounts?.length;
      setSupplierBankMode(hasBanks ? 'linked' : 'manual');
      setDraft((d) => ({ ...d, supplierProfile: profile }));
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error loading supplier', error);
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        toast.error('Session expired. Please sign in again.');
      } else {
        toast.error('Failed to load supplier. Please try again.');
      }
      setSupplierProfile(null);
      setSupplierBankMode('manual');
    } finally {
      setIsLoadingSupplier(false);
    }
  }, [draft.recipientEmail]);

  useEffect(() => {
    if (!isOpen || phase !== 'partA' || partAStep !== 3) return;
    if (supplierProfile || isLoadingSupplier) return;
    void loadSupplierForStep3();
  }, [isOpen, phase, partAStep, supplierProfile, isLoadingSupplier, loadSupplierForStep3]);

  const updateDraft = (update: Partial<PaymentDraft>) => {
    setDraft((prev) => ({
      ...prev,
      ...update,
    }));
  };

  const emailError = useMemo(() => {
    if (!touched.recipientEmail) return '';
    if (!draft.recipientEmail.trim()) return 'Recipient email is required.';
    if (!isValidEmail(draft.recipientEmail)) return 'Enter a valid email address.';
    return '';
  }, [draft.recipientEmail, touched.recipientEmail]);

  const amountError = useMemo(() => {
    if (!touched.amount) return '';
    const n = Number(draft.amount);
    if (!draft.amount.trim()) return 'Amount is required.';
    if (!Number.isFinite(n) || n <= 0) return 'Amount must be greater than 0.';
    return '';
  }, [draft.amount, touched.amount]);

  const canContinueStep1 =
    isValidEmail(draft.recipientEmail) &&
    Number(draft.amount) > 0 &&
    Number.isFinite(Number(draft.amount));

  const paymentNumeric = Number((draft.amount || '0').toString().replace(/,/g, ''));
  const quoteKey = useMemo(
    () => `${paymentNumeric}|${draft.currency}|OSN`,
    [paymentNumeric, draft.currency],
  );
  const feeQuoteValid =
    !!feeQuote && feeQuoteFetchedKey === quoteKey && !feeQuoteLoading && !feeQuoteError;
  const feeInactiveNoQuoteFlowAllowed =
    !feeQuoteLoading && isOnrampFeeInactiveError(feeQuoteError) && !feeQuote;

  const handleRetryFeeQuote = useCallback(() => {
    setFeeQuote(null);
    setFeeQuoteFetchedKey(null);
    setFeeQuoteError(null);
    setFeeQuoteRetryNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!isOpen || phase !== 'partA' || partAStep !== 2) return;
    if (!Number.isFinite(paymentNumeric) || paymentNumeric <= 0 || !draft.currency?.trim()) {
      setFeeQuote(null);
      setFeeQuoteFetchedKey(null);
      setFeeQuoteError('Amount and currency are required.');
      setFeeQuoteLoading(false);
      return;
    }
    if (feeQuoteFetchedKey === quoteKey) {
      setFeeQuoteLoading(false);
      return;
    }
    let cancelled = false;
    setFeeQuote(null);
    setFeeQuoteError(null);
    setFeeQuoteLoading(true);
    void PaymentsService.requestOsnFeeQuote({
      amount: paymentNumeric,
      currency: draft.currency,
      partner: 'OSN',
    })
      .then((data) => {
        if (cancelled) return;
        setFeeQuote(data);
        setFeeQuoteFetchedKey(quoteKey);
        setFeeQuoteLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setFeeQuote(null);
        setFeeQuoteFetchedKey(null);
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        setFeeQuoteError(
          e?.response?.data?.message || e?.message || 'Failed to load fee quote. Please try again.',
        );
        setFeeQuoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    phase,
    partAStep,
    paymentNumeric,
    draft.currency,
    quoteKey,
    feeQuoteFetchedKey,
    feeQuoteRetryNonce,
  ]);

  const linkedBankReady =
    !!supplierProfile?.bankAccounts?.length && supplierBankMode === 'linked';

  const manualBankValid = (() => {
    const b = draft.recipientBankDetails;
    return (
      !!b?.accountHolderName?.trim() &&
      !!b?.countryCode?.trim() &&
      !!b?.bankName?.trim() &&
      !!b?.accountNumber?.trim() &&
      !!b?.swiftBic?.trim()
    );
  })();

  const supplierStepValid = linkedBankReady || (supplierBankMode === 'manual' && manualBankValid);

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleCreatePaymentRequest = async () => {
    if (!dealId) {
      toast.error('Deal ID is required to create payment.');
      return;
    }
    if (!feeQuoteValid && !feeInactiveNoQuoteFlowAllowed) {
      toast.error('Fee quote is missing or out of date. Go back to the fees step and confirm.');
      return;
    }
    setIsProcessing(true);
    let createdPaymentId: string | null = null;
    try {
      const payment = await PaymentsService.createPayment(dealId, {
        amount: paymentNumeric,
        currency: draft.currency,
        supplierEmail: draft.recipientEmail,
        invoiceNumber: draft.invoiceNumber || undefined,
        description: draft.description || undefined,
        method: 'BANK_TRANSFER',
        feeQuote: feeQuoteValid ? feeQuote : undefined,
      });
      createdPaymentId = payment.id;
      // Refresh shipment/payments list immediately after creation so UI reflects new row without page reload.
      onPaymentComplete?.();
      toast.success('Payment request created successfully.');
      handleClose();
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Create / mint error', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create payment or OSN mint request.';
      toast.error(msg);
      if (createdPaymentId) {
        toast.info(
          'A local payment may exist without an OSN transfer. Refresh the page or contact support if this persists.',
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitBankTx = async () => {
    setBankTxTouched(true);
    if (!bankTxNumber.trim()) {
      toast.error('Enter the bank transaction number.');
      return;
    }
    const tid = activeTransfer?.id;
    if (!tid) {
      toast.error('Missing transfer. Refresh and try again.');
      return;
    }
    setIsSubmittingTx(true);
    try {
      const updated = await PaymentsService.submitTransferBankTxNumber(tid, bankTxNumber.trim());
      setActiveTransfer(updated);
      setPartBStep(3);
      // Refresh table immediately after submit so actions/labels update in the background.
      onPaymentComplete?.();
      toast.success('Transaction number submitted.');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      toast.error(err?.response?.data?.message || err?.message || 'Failed to submit transaction number.');
    } finally {
      setIsSubmittingTx(false);
    }
  };

  const goBackPartA = () => {
    if (partAStep <= 1) {
      handleClose();
      return;
    }
    setPartAStep((s) => (s - 1) as PartAStep);
  };

  const goBackPartB = () => {
    if (partBStep <= 1) {
      if (
        typeof window !== 'undefined' &&
        !window.confirm('Leave deposit instructions? You can reopen this payment from the shipment.')
      ) {
        return;
      }
      handleClose();
      return;
    }
    setPartBStep((s) => (s - 1) as PartBStep);
  };

  const modalSubtitle =
    phase === 'partA'
      ? ''
      : partBStep === 1
        ? 'Send the fiat transfer using the beneficiary bank details returned for this payment'
        : partBStep === 2
          ? 'Submit the local bank transaction number to confirm the OSN payment'
          : 'The transaction number was submitted and the provider confirmation is still pending';

  if (!isOpen) return null;

  const nextPartALabel = phase === 'partA' ? getNextPartALabel(partAStep) : '';
  return (
    <TMModal
      open={isOpen}
      handleClose={handleClose}
      classOverrides="max-w-[720px] w-full max-h-[min(96vh,100dvh)] flex min-h-0 flex-col overflow-hidden"
      showHeader
      headerContent={
        <>
          <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white">
            <Image src="/assets/agropay.jpeg" alt="" fill sizes="32px" className="object-contain" />
          </div>
          <p className="m-0 text-base sm:text-[18px] font-bold leading-[1.1em] text-tm-black-80">
            Pay with AgroPay
          </p>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-3 pt-[70px] sm:px-6 sm:pb-4 sm:pt-[72px]">
          {modalSubtitle ? (
            <p className="mb-3 text-sm text-slate-600">{modalSubtitle}</p>
          ) : null}

          <div className="mt-2 sm:mt-3">
            {phase === 'partA' ? <PartAStepper step={partAStep} /> : <PartBStepper step={partBStep} />}
          </div>

          {phase === 'partA'
            ? partAStepDescription[partAStep] && (
              <p className="mb-3 text-xs text-slate-600">{partAStepDescription[partAStep]}</p>
            )
            : partBStepDescription[partBStep] && (
              <p className="mb-3 text-xs text-slate-600">{partBStepDescription[partBStep]}</p>
            )}

          <div className="pb-2 pt-1">
            {phase === 'partB' && isLoadingResumeTransfer ? (
              <div className="flex flex-col items-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4E8C37] border-t-transparent" />
                <p className="mt-3 text-sm text-slate-600">Loading transfer details…</p>
              </div>
            ) : null}
            {phase === 'partA' ? (
              <>
                {partAStep === 1 ? (
                  <StepPaymentDetails
                    draft={draft}
                    emailError={emailError}
                    amountError={amountError}
                    touchedEmail={touched.recipientEmail}
                    touchedAmount={touched.amount}
                    onChangeDraft={updateDraft}
                    onBlurEmail={() => setTouched((t) => ({ ...t, recipientEmail: true }))}
                    onBlurAmount={() => setTouched((t) => ({ ...t, amount: true }))}
                    onShowEscrowInfo={() =>
                      toast.info('Escrow protection ensures funds are held securely until shipment confirmation.')
                    }
                    onAmountInput={(value) => updateDraft({ amount: clampMoneyString(value) })}
                  />
                ) : partAStep === 2 ? (
                  <StepFees
                    draft={draft}
                    quote={feeQuote}
                    loading={feeQuoteLoading}
                    error={feeQuoteError}
                    quoteKey={quoteKey}
                    fetchedKey={feeQuoteFetchedKey}
                    onRetry={handleRetryFeeQuote}
                  />
                ) : partAStep === 3 ? (
                  isLoadingSupplier ? (
                    <div className="flex flex-col items-center py-10">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4E8C37] border-t-transparent" />
                      <p className="mt-3 text-sm text-slate-600">Loading supplier bank details…</p>
                    </div>
                  ) : linkedBankReady ? (
                    <StepConfirmBank
                      supplierProfile={supplierProfile}
                      onUseDifferentBank={() => {
                        setSupplierBankMode('manual');
                        updateDraft({
                          recipientBankDetails: draft.recipientBankDetails || {},
                        });
                      }}
                    />
                  ) : (
                    <StepEnterBankDetails
                      bankDetails={draft.recipientBankDetails || {}}
                      onChange={(details) =>
                        updateDraft({
                          recipientBankDetails: {
                            ...(draft.recipientBankDetails || {}),
                            ...details,
                          },
                        })
                      }
                    />
                  )
                ) : (
                  <StepReviewPay
                    draft={draft}
                    quote={feeQuote}
                    quoteKey={quoteKey}
                    fetchedKey={feeQuoteFetchedKey}
                    feeError={feeQuoteError}
                  />
                )}
              </>
            ) : activeTransfer && !isLoadingResumeTransfer ? (
              <>
                {partBStep === 1 ? (
                  <PartBBeneficiaryStep
                    transfer={activeTransfer}
                    paymentAmount={partBSummary.amount}
                    paymentCurrency={partBSummary.currency}
                    confirmedFeeQuote={partBSummary.feeQuote}
                  />
                ) : partBStep === 2 ? (
                  <PartBSubmitTxStep
                    transfer={activeTransfer}
                    paymentAmount={partBSummary.amount}
                    paymentCurrency={partBSummary.currency}
                    confirmedFeeQuote={partBSummary.feeQuote}
                    bankTxNumber={bankTxNumber}
                    onChangeBankTxNumber={setBankTxNumber}
                    touched={bankTxTouched}
                  />
                ) : (
                  <PartBPendingStep
                    transfer={activeTransfer}
                    paymentAmount={partBSummary.amount}
                    paymentCurrency={partBSummary.currency}
                    confirmedFeeQuote={partBSummary.feeQuote}
                    bankTxNumber={bankTxNumber}
                  />
                )}
              </>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                No transfer data is available. Close this dialog and open a payment that has an OSN transfer,
                or refresh the page.
              </div>
            )}
          </div>
        </div>

        <div
          className="flex shrink-0 flex-col gap-2 bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-4"
          style={{ borderTop: '1px solid #E5E7EB' }}
        >
          <CancelBackButton
            type="button"
            onClick={
              phase === 'partA'
                ? partAStep === 1
                  ? handleClose
                  : goBackPartA
                : partBStep === 3
                  ? handleClose
                  : goBackPartB
            }
            disabled={isLoadingResumeTransfer}
          >
            {phase === 'partA' ? (partAStep === 1 ? 'Cancel' : 'Back') : partBStep === 3 ? 'Close' : 'Back'}
          </CancelBackButton>

          <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
            {phase === 'partA' && nextPartALabel && partAStep < 4 ? (
              <span className="text-xs font-medium text-slate-500 md:mr-2">{nextPartALabel}</span>
            ) : null}

            {phase === 'partA' ? (
              <button
                type="button"
                onClick={() => {
                  if (partAStep === 1) {
                    setTouched({ recipientEmail: true, amount: true });
                    if (!canContinueStep1) return;
                    setPartAStep(2);
                  } else if (partAStep === 2) {
                    if (!feeQuoteValid && !feeInactiveNoQuoteFlowAllowed) {
                      toast.error('Confirm the fee quote before continuing.');
                      return;
                    }
                    setPartAStep(3);
                  } else if (partAStep === 3) {
                    if (!supplierStepValid) {
                      toast.error('Confirm or complete supplier bank details.');
                      return;
                    }
                    setPartAStep(4);
                  } else {
                    void handleCreatePaymentRequest();
                  }
                }}
                disabled={
                  (partAStep === 1 && !canContinueStep1) ||
                  (partAStep === 2 && ((!feeQuoteValid && !feeInactiveNoQuoteFlowAllowed) || feeQuoteLoading)) ||
                  (partAStep === 3 && (isLoadingSupplier || !supplierStepValid)) ||
                  (partAStep === 4 &&
                    (isProcessing || (!feeQuoteValid && !feeInactiveNoQuoteFlowAllowed)))
                }
                className={[
                  'rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition',
                  (partAStep === 1 && !canContinueStep1) ||
                    (partAStep === 2 &&
                      ((!feeQuoteValid && !feeInactiveNoQuoteFlowAllowed) || feeQuoteLoading)) ||
                    (partAStep === 3 && (isLoadingSupplier || !supplierStepValid)) ||
                    (partAStep === 4 &&
                      (isProcessing || (!feeQuoteValid && !feeInactiveNoQuoteFlowAllowed)))
                    ? 'cursor-not-allowed bg-[#4E8C37]/50'
                    : 'bg-[#4E8C37] hover:bg-[#3A6A28]',
                ].join(' ')}
              >
                {partAStep === 1
                  ? 'Continue'
                  : partAStep === 2
                    ? 'Confirm fees'
                    : partAStep === 3
                      ? 'Confirm supplier bank'
                      : isProcessing
                        ? 'Creating…'
                        : 'Create payment request'}
              </button>
            ) : partBStep === 1 ? (
              <button
                type="button"
                onClick={() => setPartBStep(2)}
                disabled={!activeTransfer || isLoadingResumeTransfer}
                className="rounded-xl bg-[#4E8C37] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3A6A28] disabled:cursor-not-allowed disabled:bg-[#4E8C37]/50"
              >
                I&apos;ve sent the bank transfer
              </button>
            ) : partBStep === 2 ? (
              <button
                type="button"
                onClick={() => void handleSubmitBankTx()}
                disabled={isSubmittingTx || isLoadingResumeTransfer}
                className="rounded-xl bg-[#4E8C37] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3A6A28] disabled:cursor-not-allowed disabled:bg-[#4E8C37]/50"
              >
                {isSubmittingTx ? 'Submitting…' : 'Submit transaction number'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onPaymentComplete?.();
                  handleClose();
                }}
                className="rounded-xl bg-[#4E8C37] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#3A6A28]"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </TMModal>
  );
};

export default PayDialog;
