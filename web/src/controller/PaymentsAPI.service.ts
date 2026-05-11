import axiosInstance from "src/config/axios";
import type { OsnFeeQuoteData } from "src/interfaces/osnFeeQuote";
import { Payment, PaymentProviderTransfer } from "src/interfaces/payment";

export class PaymentsService {
  /** Proxies admin-dashboard internal fee quote; see `OsnFeeQuoteData` contract. */
  static async requestOsnFeeQuote(body: {
    amount: number;
    currency: string;
    partner?: string;
    promoCode?: string;
  }): Promise<OsnFeeQuoteData> {
    const response = await axiosInstance.post<OsnFeeQuoteData>(`/payments/osn/fee-quote`, body);
    return response.data;
  }

  static async createPayment(dealId: string, paymentData: {
    amount: number;
    currency: string;
    supplierEmail: string;
    invoiceNumber?: string;
    description?: string;
    dueDate?: Date;
    method?: Payment["method"];
    feeQuote?: OsnFeeQuoteData;
  }): Promise<Payment> {
    const response = await axiosInstance.post(`/deals/${dealId}/payments`, paymentData);
    return response.data;
  }

  static async getPayments(dealId: string): Promise<Payment[]> {
    const response = await axiosInstance.get(`/deals/${dealId}/payments`);
    return response.data;
  }

  static async createOsnMintRequest(paymentId: string): Promise<PaymentProviderTransfer> {
    // Backend performs OSN mint create + immediate approval in one server-side flow.
    const response = await axiosInstance.post(`/payments/${paymentId}/osn/mint-request`, {});
    return response.data;
  }

  static async getPaymentTransfers(paymentId: string): Promise<PaymentProviderTransfer[]> {
    const response = await axiosInstance.get(`/payments/${paymentId}/transfers`);
    return response.data;
  }

  static async submitTransferBankTxNumber(
    transferId: string,
    bankTxNumber: string,
  ): Promise<PaymentProviderTransfer> {
    const response = await axiosInstance.post(`/transfers/${transferId}/bank-tx-number`, {
      bankTxNumber,
    });
    return response.data;
  }

  static async uploadPaymentDocuments(
    paymentId: string,
    dealId: string,
    files: File[]
  ): Promise<Payment> {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));

    const response = await axiosInstance.post(
      `/deals/${dealId}/payments/${paymentId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }
}
