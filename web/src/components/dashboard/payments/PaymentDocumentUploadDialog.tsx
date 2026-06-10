import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { CloudArrowUp } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import TMModal from 'src/components/common/modal';
import CancelBackButton from 'src/components/common/cancel-back-button';
import { PaymentsService } from 'src/controller/PaymentsAPI.service';
import { ShipmentService } from 'src/controller/ShipmentAPI.service';
import type { PaymentDocument } from 'src/interfaces/payment';
import { REQUIRED_TRADE_DOCUMENT_TYPES } from 'src/lib/trade-document-types';

interface PaymentDocumentUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    paymentId: string;
    dealId: string;
    onUploadComplete: () => void;
    existingDocuments?: PaymentDocument[];
}

const PaymentDocumentUploadDialog: React.FC<PaymentDocumentUploadDialogProps> = ({
    isOpen,
    onClose,
    paymentId,
    dealId,
    onUploadComplete,
    existingDocuments,
}) => {
    const { t } = useTranslation('payments');
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const { data: dealCoverage, isLoading: coverageLoading } = useQuery({
        queryKey: ['deal-trade-document-coverage', dealId],
        queryFn: () => ShipmentService.getTradeDocumentCoverage(dealId),
        enabled: isOpen && Boolean(dealId),
    });

    const docTypeLabel = (type: string) => {
        const keyMap: Record<string, string> = {
            'Commercial Invoice': 'docTypes.commercialInvoice',
            'Packing List': 'docTypes.packingList',
            'Bill of Lading or AWB': 'docTypes.billOfLading',
            'Phytosanitary Certificate': 'docTypes.phytosanitary',
            'Certificate of Origin': 'docTypes.certificateOfOrigin',
        };
        const key = keyMap[type];
        return key ? t(key) : type;
    };

    const isTypeOnPayment = (type: string) =>
        existingDocuments?.some((doc) => doc.documentType === type);

    const isTypeOnShipment = (type: string) => Boolean(dealCoverage?.onFile[type]);

    const isTypeSatisfied = (type: string) =>
        isTypeOnPayment(type) || isTypeOnShipment(type);

    const missingOnPaymentButOnShipment = useMemo(
        () =>
            REQUIRED_TRADE_DOCUMENT_TYPES.filter(
                (type) => !isTypeOnPayment(type) && isTypeOnShipment(type),
            ),
        [existingDocuments, dealCoverage],
    );

    const canSyncFromShipment = missingOnPaymentButOnShipment.length > 0;

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const validFiles: File[] = [];
            for (const file of acceptedFiles) {
                if (file.type !== 'application/pdf') {
                    toast.error(t('toasts.notPdf', { filename: file.name }));
                    continue;
                }
                if (file.size > 50 * 1024 * 1024) {
                    toast.error(t('toasts.tooLarge', { filename: file.name }));
                    continue;
                }
                validFiles.push(file);
            }

            if (validFiles.length === 0) {
                return;
            }

            setUploadedFiles((prev) => {
                const existingNames = new Set(prev.map((f) => f.name));
                const deduped = validFiles.filter((f) => !existingNames.has(f.name));
                return [...prev, ...deduped];
            });
        }
    }, [t]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 20,
    });

    const handleSyncFromShipment = async () => {
        try {
            setSyncing(true);
            await PaymentsService.syncPaymentTradeDocuments(paymentId, dealId);
            toast.success(t('toasts.syncSuccess'));
            onUploadComplete();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(
                err?.response?.data?.message || err?.message || t('toasts.syncFailed'),
            );
        } finally {
            setSyncing(false);
        }
    };

    const handleUpload = async () => {
        if (uploadedFiles.length === 0) {
            if (canSyncFromShipment) {
                await handleSyncFromShipment();
                return;
            }
            toast.error(t('toasts.selectFile'));
            return;
        }

        try {
            setUploading(true);
            await PaymentsService.uploadPaymentDocuments(paymentId, dealId, uploadedFiles, {
                documentUploadMode: 'payment',
            });
            toast.success(t('toasts.uploadSuccess'));
            setUploadedFiles([]);
            onUploadComplete();
            onClose();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(
                err?.response?.data?.message || err?.message || t('toasts.uploadFailed'),
            );
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setUploadedFiles([]);
        onClose();
    };

    if (!isOpen) return null;

    const primaryActionLabel =
        uploadedFiles.length > 0
            ? uploading
                ? t('uploading')
                : t('uploadDocuments')
            : canSyncFromShipment
              ? syncing
                  ? t('syncingFromShipment')
                  : t('attachFromShipment')
              : t('uploadDocuments');

    return (
        <TMModal
            open={isOpen}
            handleClose={handleClose}
            classOverrides="max-w-[600px]"
            showHeader
            headerText={t('uploadTitle')}
        >
            <div className="px-6 pb-6 pt-6 overflow-visible">
                <p className="mb-5 text-sm text-[#64748B]">{t('uploadHintDealLevel')}</p>

                <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-[#F9FAFB] px-5 py-4">
                    <p className="mb-3 text-sm font-medium text-[#0F172A]">
                        {t('requiredDocuments')}
                    </p>
                    {coverageLoading ? (
                        <p className="text-xs text-[#94A3B8]">{t('loadingCoverage')}</p>
                    ) : (
                        <ul className="space-y-2">
                            {REQUIRED_TRADE_DOCUMENT_TYPES.map((type) => {
                                const onPayment = isTypeOnPayment(type);
                                const onShipment = isTypeOnShipment(type);
                                const satisfied = isTypeSatisfied(type);

                                let statusLabel = t('status.pending');
                                if (onPayment) {
                                    statusLabel = t('status.uploaded');
                                } else if (onShipment) {
                                    statusLabel = t('status.onShipment');
                                }

                                return (
                                    <li
                                        key={type}
                                        className="flex items-center justify-between text-xs sm:text-sm"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                                                    satisfied
                                                        ? 'border-[#16A34A] bg-[#16A34A] text-white'
                                                        : 'border-[#CBD5E1] bg-white text-transparent'
                                                }`}
                                            >
                                                {satisfied ? '✓' : ''}
                                            </span>
                                            <span className="text-[#0F172A] font-normal">
                                                {docTypeLabel(type)}
                                            </span>
                                        </div>
                                        <span
                                            className={`text-xs ${
                                                satisfied ? 'text-[#16A34A]' : 'text-[#94A3B8]'
                                            }`}
                                        >
                                            {statusLabel}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {canSyncFromShipment && (
                    <div className="mb-4 rounded-xl border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-xs text-[#047857]">
                        {t('shipmentDocsAvailable')}
                    </div>
                )}

                <div className="mb-4">
                    <div
                        {...getRootProps()}
                        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                            isDragActive
                                ? 'border-tm-green bg-[#F0FDF4]'
                                : 'border-[#E2E8F0] bg-[#F9FAFB] hover:border-[#CBD5E1]'
                        }`}
                    >
                        <input {...getInputProps()} />
                        {uploadedFiles.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                                <CloudArrowUp size={48} className="text-tm-green" weight="duotone" />
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {t('filesSelected', { count: uploadedFiles.length, defaultValue: `${uploadedFiles.length} file(s) selected` })}
                                </p>
                                <div className="max-h-32 w-full overflow-auto rounded-md bg-white px-3 py-2 text-left text-xs text-[#475569]">
                                    {uploadedFiles.map((file) => (
                                        <div
                                            key={file.name}
                                            className="flex items-center justify-between gap-3 py-1"
                                        >
                                            <span className="truncate">{file.name}</span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setUploadedFiles((prev) =>
                                                        prev.filter((f) => f.name !== file.name),
                                                    );
                                                }}
                                                className="shrink-0 text-[#EF4444] hover:text-[#DC2626]"
                                            >
                                                {t('remove')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setUploadedFiles([]);
                                    }}
                                    className="mt-2 text-xs text-[#EF4444] hover:text-[#DC2626]"
                                >
                                    {t('clearAll')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <CloudArrowUp size={48} className="text-[#9CA3AF]" weight="duotone" />
                                <p className="text-sm text-[#64748B]">
                                    <span className="text-tm-green cursor-pointer hover:underline">
                                        {t('choose')}
                                    </span>{' '}
                                    {t('dragDropSuffix')}
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">{t('pdfMax')}</p>
                </div>

                <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#4B5563] flex gap-3">
                    <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#CBD5E1] text-[10px] text-[#6B7280]">
                        i
                    </span>
                    <p>{t('uploadInfoDealLevel')}</p>
                </div>

                <div className="flex justify-end gap-3">
                    <CancelBackButton type="button" onClick={handleClose}>
                        {t('cancel', { ns: 'common', defaultValue: 'Cancel' })}
                    </CancelBackButton>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={
                            (uploadedFiles.length === 0 && !canSyncFromShipment) ||
                            uploading ||
                            syncing
                        }
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${
                            (uploadedFiles.length === 0 && !canSyncFromShipment) ||
                            uploading ||
                            syncing
                                ? 'cursor-not-allowed bg-[#4E8C37]/50'
                                : 'bg-tm-green hover:bg-[#3A6A28]'
                        }`}
                    >
                        {primaryActionLabel}
                    </button>
                </div>
            </div>
        </TMModal>
    );
};

export default PaymentDocumentUploadDialog;
