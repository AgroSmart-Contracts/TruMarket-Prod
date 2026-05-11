import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { CloudArrowUp } from '@phosphor-icons/react';

import TMModal from 'src/components/common/modal';
import { PaymentsService } from 'src/controller/PaymentsAPI.service';
import type { PaymentDocument } from 'src/interfaces/payment';

interface PaymentDocumentUploadDialogProps {
    isOpen: boolean;
    onClose: () => void;
    paymentId: string;
    dealId: string;
    onUploadComplete: () => void;
    existingDocuments?: PaymentDocument[];
}

const DOCUMENT_TYPES = [
    'Commercial Invoice',
    'Packing List',
    'Bill of Lading or AWB',
    'Phytosanitary Certificate',
    'Certificate of Origin',
];

const PaymentDocumentUploadDialog: React.FC<PaymentDocumentUploadDialogProps> = ({
    isOpen,
    onClose,
    paymentId,
    dealId,
    onUploadComplete,
    existingDocuments,
}) => {
    const [uploading, setUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const validFiles: File[] = [];
            for (const file of acceptedFiles) {
                // Check if PDF
                if (file.type !== 'application/pdf') {
                    toast.error(`"${file.name}" is not a PDF file`);
                    continue;
                }
                // Check file size (50 MB max)
                if (file.size > 50 * 1024 * 1024) {
                    toast.error(`"${file.name}" exceeds 50 MB`);
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
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
        },
        maxFiles: 20,
    });

    const handleUpload = async () => {
        if (uploadedFiles.length === 0) {
            toast.error('Please select at least one file to upload');
            return;
        }

        try {
            setUploading(true);
            await PaymentsService.uploadPaymentDocuments(paymentId, dealId, uploadedFiles);
            const replacing = existingDocuments && existingDocuments.length > 0;
            toast.success(replacing ? 'Documents uploaded and updated successfully.' : 'Documents uploaded successfully!');
            setUploadedFiles([]);
            onUploadComplete();
            onClose();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || 'Failed to upload document');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setUploadedFiles([]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <TMModal
            open={isOpen}
            handleClose={handleClose}
            classOverrides="max-w-[600px]"
            showHeader
            headerText="Upload Payment Documents"
        >
            <div className="px-6 pb-6 pt-6 overflow-visible">
                <p className="mb-5 text-sm text-[#64748B]">
                    Please upload documents related to this payment for verification.
                </p>

                {/* Required documents checklist */}
                <div className="mb-6 rounded-2xl border border-[#E2E8F0] bg-[#F9FAFB] px-5 py-4">
                    <p className="mb-3 text-sm font-medium text-[#0F172A]">
                        Required documents
                    </p>
                    <ul className="space-y-2">
                        {DOCUMENT_TYPES.map((type) => {
                            const isUploaded = existingDocuments?.some(
                                (doc) => doc.documentType === type,
                            );

                            return (
                                <li key={type} className="flex items-center justify-between text-xs sm:text-sm">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] ${
                                                isUploaded
                                                    ? 'border-[#16A34A] bg-[#16A34A] text-white'
                                                    : 'border-[#CBD5E1] bg-white text-transparent'
                                            }`}
                                        >
                                            {isUploaded ? '✓' : ''}
                                        </span>
                                        <span className="text-[#0F172A] font-normal">
                                            {type}
                                        </span>
                                    </div>
                                    <span
                                        className={`text-xs ${
                                            isUploaded ? 'text-[#16A34A]' : 'text-[#94A3B8]'
                                        }`}
                                    >
                                        {isUploaded ? 'Uploaded' : 'Pending'}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                {/* File Upload Area */}
                <div className="mb-4">
                    <div
                        {...getRootProps()}
                        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive
                            ? 'border-tm-green bg-[#F0FDF4]'
                            : 'border-[#E2E8F0] bg-[#F9FAFB] hover:border-[#CBD5E1]'
                            }`}
                    >
                        <input {...getInputProps()} />
                        {uploadedFiles.length > 0 ? (
                            <div className="flex flex-col items-center gap-2">
                                <CloudArrowUp size={48} className="text-tm-green" weight="duotone" />
                                <p className="text-sm font-medium text-[#0F172A]">
                                    {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''} selected
                                </p>
                                <div className="max-h-32 w-full overflow-auto rounded-md bg-white px-3 py-2 text-left text-xs text-[#475569]">
                                    {uploadedFiles.map((file) => (
                                        <div key={file.name} className="flex items-center justify-between gap-3 py-1">
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
                                                Remove
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
                                    Clear all
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <CloudArrowUp size={48} className="text-[#9CA3AF]" weight="duotone" />
                                <p className="text-sm text-[#64748B]">
                                    <span className="text-tm-green cursor-pointer hover:underline">Choose</span> or drag
                                    and drop
                                </p>
                            </div>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-[#64748B]">PDF (max 50 MB)</p>
                </div>

                {/* Info note */}
                <div className="mb-4 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-xs text-[#4B5563] flex gap-3">
                    <span className="mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#CBD5E1] text-[10px] text-[#6B7280]">
                        i
                    </span>
                    <p>
                        You can upload multiple files at once. Document categories are detected automatically by the
                        backend.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-xl border border-[#E5E7EB] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploadedFiles.length === 0 || uploading}
                        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition ${uploadedFiles.length === 0 || uploading
                            ? 'cursor-not-allowed bg-[#4E8C37]/50'
                            : 'bg-tm-green hover:bg-[#3A6A28]'
                            }`}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </TMModal>
    );
};

export default PaymentDocumentUploadDialog;
