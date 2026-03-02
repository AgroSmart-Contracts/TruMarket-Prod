import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import TMModal from 'src/components/common/modal';
import { useWeb3AuthContext } from 'src/context/web3-auth-context';
import EthereumRpc from 'src/lib/web3/evm.web3';
import { AuthService as AuthApiService } from 'src/controller/AuthAPI.service';
import type { UserProfileInfo } from 'src/interfaces/auth';
import { DepositStepper, getNextStepLabel } from './Stepper';
import { StepPaymentDetails } from './StepPaymentDetails';
import { StepCheckBank } from './StepCheckBank';
import { StepEnterBankDetails } from './StepEnterBankDetails';
import { StepConfirmBank } from './StepConfirmBank';
import { StepReviewPay } from './StepReviewPay';
import { clampMoneyString, isValidEmail } from './deposit-validators';
import type { PaymentDraft, PaymentStep } from './deposit-types';

interface DepositDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onDepositComplete?: () => void;
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

const DepositDialog: React.FC<DepositDialogProps> = ({
    isOpen,
    onClose,
    onDepositComplete,
}) => {
    const { web3authPnPInstance } = useWeb3AuthContext();
    const [step, setStep] = useState<PaymentStep>(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [supplierProfile, setSupplierProfile] = useState<UserProfileInfo | null>(null);
    const [isCheckingBank, setIsCheckingBank] = useState(false);
    const [draft, setDraft] = useState<PaymentDraft>(initialDraft);

    const [touched, setTouched] = useState({
        recipientEmail: false,
        amount: false,
    });
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setTouched({ recipientEmail: false, amount: false });
            setDraft(initialDraft);
            setSupplierProfile(null);
            setShowDetails(false);
        }
    }, [isOpen, web3authPnPInstance]);

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

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

    const canContinue =
        isValidEmail(draft.recipientEmail) &&
        Number(draft.amount) > 0 &&
        Number.isFinite(Number(draft.amount));

    const handleCheckSupplierBank = async () => {
        setIsCheckingBank(true);
        try {
            const profile = await AuthApiService.getUserByEmail({ email: draft.recipientEmail });
            if (!profile) {
                toast.error('Supplier not found. Please check the email address.');
                setIsCheckingBank(false);
                return;
            }
            setSupplierProfile(profile);
            updateDraft({ supplierProfile: profile });
            const hasBankDetails =
                !!profile.bankDetails &&
                !!profile.bankDetails.beneficiaryName &&
                !!profile.bankDetails.country &&
                !!profile.bankDetails.accountNumber;

            if (!hasBankDetails) {
                // Instead of showing error, proceed to enter bank details form
                setStep(3);
                setIsCheckingBank(false);
                return;
            }
            setStep(3);
        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error('Error checking supplier bank:', error);
            toast.error('Failed to check supplier bank details. Please try again.');
        } finally {
            setIsCheckingBank(false);
        }
    };

    const handleConfirmBankDetails = () => {
        setStep(4);
    };

    const handleBankDetailsEntered = () => {
        // Validate required fields
        const bankDetails = draft.recipientBankDetails;
        if (
            !bankDetails?.beneficiaryName?.trim() ||
            !bankDetails?.accountNumber?.trim() ||
            !bankDetails?.swiftCode?.trim()
        ) {
            toast.error('Please fill in all required bank details fields.');
            return;
        }
        setStep(4);
    };

    const handlePay = async () => {
        try {
            setIsProcessing(true);
            // TODO: Implement actual payment processing
            toast.success('Payment processed successfully!');
            onDepositComplete?.();
            onClose();
        } catch (error: any) {
            // eslint-disable-next-line no-console
            console.error('Payment error:', error);
            toast.error(error?.message || 'Failed to process payment.');
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setDraft(initialDraft);
        setIsProcessing(false);
        setSupplierProfile(null);
        setTouched({ recipientEmail: false, amount: false });
        setShowDetails(false);
        onClose();
    };

    if (!isOpen) return null;

    const nextStepLabel = getNextStepLabel(step);

    return (
        <TMModal
            open={isOpen}
            handleClose={handleClose}
            classOverrides="max-w-[720px]"
            showHeader
            headerText="Send payment"
        >
            <div className="px-6 pb-4 pt-[70px] sm:pt-[72px]">
                <DepositStepper step={step} />

                {/* Content */}
                <div className="pb-2 pt-1">
                    {step === 1 ? (
                        <StepPaymentDetails
                            draft={draft}
                            emailError={emailError}
                            amountError={amountError}
                            touchedEmail={touched.recipientEmail}
                            touchedAmount={touched.amount}
                            showDetails={showDetails}
                            onChangeDraft={updateDraft}
                            onBlurEmail={() =>
                                setTouched((t) => ({
                                    ...t,
                                    recipientEmail: true,
                                }))
                            }
                            onBlurAmount={() =>
                                setTouched((t) => ({
                                    ...t,
                                    amount: true,
                                }))
                            }
                            onToggleDetails={() => setShowDetails((prev) => !prev)}
                            onShowEscrowInfo={() =>
                                toast.info(
                                    'Escrow protection ensures funds are held securely until shipment confirmation.',
                                )
                            }
                            onAmountInput={(value) => updateDraft({ amount: clampMoneyString(value) })}
                        />
                    ) : step === 2 ? (
                        <StepCheckBank isCheckingBank={isCheckingBank} onCheckSupplierBank={handleCheckSupplierBank} />
                    ) : step === 3 ? (
                        supplierProfile?.bankDetails &&
                            supplierProfile.bankDetails.beneficiaryName &&
                            supplierProfile.bankDetails.accountNumber ? (
                            <StepConfirmBank supplierProfile={supplierProfile} />
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
                    ) : step === 4 ? (
                        <StepReviewPay draft={draft} />
                    ) : null}
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 px-6 pt-4 md:flex-row md:items-center md:justify-between">
                    <button
                        type="button"
                        onClick={step === 1 ? handleClose : () => setStep((s) => (Math.max(1, s - 1) as PaymentStep))}
                        className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 border border-[#E5E7EB] bg-white hover:bg-slate-50 md:w-auto"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                        {nextStepLabel ? (
                            <span className="text-xs font-medium text-slate-500 md:mr-2">{nextStepLabel}</span>
                        ) : null}

                        <button
                            type="button"
                            onClick={() => {
                                if (step === 1) {
                                    setTouched({ recipientEmail: true, amount: true });
                                    if (!canContinue) return;
                                    setStep(2);
                                } else if (step === 2) {
                                    // StepCheckBank auto-runs handleCheckSupplierBank
                                } else if (step === 3) {
                                    if (
                                        supplierProfile?.bankDetails?.beneficiaryName &&
                                        supplierProfile.bankDetails.accountNumber
                                    ) {
                                        handleConfirmBankDetails();
                                    } else {
                                        handleBankDetailsEntered();
                                    }
                                } else if (step === 4) {
                                    handlePay();
                                }
                            }}
                            disabled={
                                (step === 1 && !canContinue) ||
                                (step === 2 && isCheckingBank) ||
                                (step === 3 &&
                                    !supplierProfile?.bankDetails?.beneficiaryName &&
                                    (!draft.recipientBankDetails?.beneficiaryName?.trim() ||
                                        !draft.recipientBankDetails?.accountNumber?.trim() ||
                                        !draft.recipientBankDetails?.swiftCode?.trim())) ||
                                (step === 4 && isProcessing)
                            }
                            className={[
                                'rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition',
                                (step === 1 && !canContinue) ||
                                    (step === 2 && isCheckingBank) ||
                                    (step === 3 &&
                                        !supplierProfile?.bankDetails?.beneficiaryName &&
                                        (!draft.recipientBankDetails?.beneficiaryName?.trim() ||
                                            !draft.recipientBankDetails?.accountNumber?.trim() ||
                                            !draft.recipientBankDetails?.swiftCode?.trim())) ||
                                    (step === 4 && isProcessing)
                                    ? 'cursor-not-allowed bg-[#4E8C37]/50'
                                    : 'bg-[#4E8C37] hover:bg-[#3A6A28]',
                            ].join(' ')}
                        >
                            {step === 1
                                ? 'Continue'
                                : step === 2
                                    ? isCheckingBank
                                        ? 'Checking...'
                                        : 'Check Supplier Bank Details'
                                    : step === 3
                                        ? supplierProfile?.bankDetails?.beneficiaryName &&
                                            supplierProfile.bankDetails.country &&
                                            supplierProfile.bankDetails.accountNumber
                                            ? 'Confirm Bank Details'
                                            : 'Continue'
                                        : isProcessing
                                            ? 'Processing...'
                                            : 'Pay'}
                        </button>
                    </div>
                </div>
            </div>
        </TMModal>
    );
};

export default DepositDialog;

