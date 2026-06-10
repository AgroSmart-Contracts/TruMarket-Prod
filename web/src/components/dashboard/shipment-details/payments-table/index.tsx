import React from "react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import Loading from "src/components/common/loading";
import { PaymentsService } from "src/controller/PaymentsAPI.service";
import { Payment, PaymentStatus } from "src/interfaces/payment";
import { CurrencyFormatter } from "src/lib/helpers";

interface PaymentsTableProps {
    dealId: string;
    isBuyer: boolean;
    onAddPaymentClick: () => void;
    onUploadDocumentsClick: (paymentId: string, existingDocuments?: Payment["paymentDocuments"]) => void;
    refetchKey?: number;
}

const PaymentsTable: React.FC<PaymentsTableProps> = ({
    dealId,
    isBuyer,
    onAddPaymentClick,
    onUploadDocumentsClick,
    refetchKey,
}) => {
    const { t } = useTranslation(["payments", "shipment", "common"]);

    const {
        data: payments = [],
        isLoading: isPaymentsLoading,
    } = useQuery({
        queryKey: ["payments", dealId, refetchKey],
        queryFn: () => PaymentsService.getPayments(dealId),
        enabled: Boolean(dealId),
    });

    const getStatusBadge = (status: PaymentStatus) => {
        const baseClasses =
            "inline-flex items-center justify-center rounded-full px-3 py-[6px] text-[13px] font-semibold whitespace-nowrap border";

        const statusKey: Record<PaymentStatus, string> = {
            [PaymentStatus.PaymentRequested]: "status.requested",
            [PaymentStatus.InProgress]: "status.inProgress",
            [PaymentStatus.VerifyingDocuments]: "status.verifying",
            [PaymentStatus.Completed]: "status.completed",
            [PaymentStatus.Failed]: "status.failed",
        };

        const labelKey = statusKey[status];
        const label = labelKey ? t(labelKey, { ns: "payments" }) : t("status.unknown", { ns: "payments" });

        const colorClasses: Record<PaymentStatus, string> = {
            [PaymentStatus.PaymentRequested]: "bg-[#FFF4E5] text-[#B76A15] border-[#F5D7A1]",
            [PaymentStatus.InProgress]: "bg-[#E8F0FE] text-[#365FCB] border-[#C9D7F6]",
            [PaymentStatus.VerifyingDocuments]: "bg-[#FFF6E0] text-[#8A5A14] border-[#E9D49B]",
            [PaymentStatus.Completed]: "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]",
            [PaymentStatus.Failed]: "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]",
        };

        return (
            <span className={`${baseClasses} ${colorClasses[status] ?? "bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]"}`}>
                {label}
            </span>
        );
    };

    const getActionButton = (payment: Payment) => {
        if (payment.status === PaymentStatus.PaymentRequested) {
            if (!isBuyer) {
                return (
                    <button
                        type="button"
                        onClick={() => onUploadDocumentsClick(payment.id, payment.paymentDocuments)}
                        className="rounded-full bg-tm-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-tm-primary-dark"
                    >
                        {t("uploadDocuments", { ns: "shipment" })}
                    </button>
                );
            }
            return (
                <span className="text-xs text-[#6F809B]">{t("actions.supplierUploading", { ns: "payments" })}</span>
            );
        }

        if (payment.status === PaymentStatus.InProgress) {
            if (!isBuyer) {
                return (
                    <button
                        type="button"
                        onClick={() => onUploadDocumentsClick(payment.id, payment.paymentDocuments)}
                        className="rounded-full bg-tm-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-tm-primary-dark"
                    >
                        {t("uploadDocuments", { ns: "shipment" })}
                    </button>
                );
            }
            return (
                <span className="text-xs text-[#6F809B]">{t("actions.supplierUploading", { ns: "payments" })}</span>
            );
        }

        if (payment.status === PaymentStatus.VerifyingDocuments) {
            return (
                <span className="text-xs text-[#6F809B]">
                    {isBuyer
                        ? t("actions.documentsUnderReview", { ns: "payments" })
                        : t("actions.awaitingVerification", { ns: "payments" })}
                </span>
            );
        }

        return (
            <span className="text-xs text-[#94A3B8]">-</span>
        );
    };

    if (isPaymentsLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loading />
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="rounded-lg border border-[#E5EAF2] bg-[#FFFFFF] p-8 text-center">
                <p className="text-sm text-[#6F809B]">
                    {isBuyer ? t("noPaymentsBuyer", { ns: "payments" }) : t("noPayments", { ns: "payments" })}
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-[#E5EAF2] bg-[#FFFFFF]">
            <div className="space-y-3 p-3 md:hidden">
                {payments.map((payment: Payment) => (
                    <div key={payment.id} className="rounded-xl border border-[#E5EAF2] bg-white p-3">
                        <div className="mb-2 flex items-start justify-between gap-3">
                            <div>
                                <p className="text-xs text-[#6F809B]">#{payment.sequence || '-'}</p>
                                <p className="text-sm font-semibold text-[#0F172A]">
                                    {CurrencyFormatter(payment.amount)}
                                </p>
                            </div>
                            <div className="shrink-0">{getStatusBadge(payment.status)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                            <div>
                                <p className="text-[#94A3B8]">{t("labels.dueDate", { ns: "shipment" })}</p>
                                <p className="text-[#16233B]">
                                    {payment.dueDate ? moment(payment.dueDate).format('MMM DD YYYY') : '-'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[#94A3B8]">{t("labels.method", { ns: "shipment" })}</p>
                                <p className="break-words font-medium text-[#16233B]">{payment.method || t("agroPay", { ns: "payments" })}</p>
                            </div>
                        </div>
                        <div className="mt-3 border-t border-[#EDF1F6] pt-3 text-right text-xs text-[#6F809B]">
                            {getActionButton(payment)}
                        </div>
                    </div>
                ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full table-fixed bg-[#FFFFFF] text-sm">
                    <thead className="bg-[#F8FAFC]">
                        <tr>
                            <th className="w-[60px] px-4 py-3 text-left text-xs font-semibold text-[#6F809B]">#</th>
                            <th className="w-[120px] px-4 py-3 text-left text-xs font-semibold text-[#6F809B]">{t("labels.dueDate", { ns: "shipment" })}</th>
                            <th className="w-[140px] px-4 py-3 text-left text-xs font-semibold text-[#6F809B]">{t("labels.amount", { ns: "shipment" })}</th>
                            <th className="w-[260px] px-4 py-3 text-left text-xs font-semibold text-[#6F809B]">{t("labels.method", { ns: "shipment" })}</th>
                            <th className="w-[200px] px-4 py-3 text-left text-xs font-semibold text-[#6F809B]">{t("labels.status", { ns: "shipment" })}</th>
                            <th className="w-[240px] px-4 py-3 text-right text-xs font-semibold text-[#6F809B]">{t("labels.actions", { ns: "shipment" })}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EDF1F6]">
                        {payments.map((payment: Payment) => (
                            <tr key={payment.id} className="h-16 hover:bg-[#F4F7FB]">
                                <td className="px-4 py-4 text-xs text-[#6F809B]">#{payment.sequence || '-'}</td>
                                <td className="px-4 py-4 text-xs text-[#16233B]">
                                    {payment.dueDate ? moment(payment.dueDate).format('MMM DD YYYY') : '-'}
                                </td>
                                <td className="px-4 py-4 text-xs font-semibold text-[#0F172A]">
                                    {CurrencyFormatter(payment.amount)}
                                </td>
                                <td className="px-4 py-4 text-xs">
                                    <div className="flex flex-col">
                                        <span className="break-words text-xs font-medium text-[#16233B]">
                                            {payment.method || t("agroPay", { ns: "payments" })}
                                        </span>
                                        <span className="text-[11px] text-[#94A3B8]">{t("bankTransfer", { ns: "payments" })}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-xs align-middle">
                                    <div className="flex items-center">{getStatusBadge(payment.status)}</div>
                                </td>
                                <td className="px-4 py-4 text-right text-xs text-[#6F809B]">{getActionButton(payment)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsTable;
