import axios, { AxiosError } from "axios";

import axiosInstance from "src/config/axios";
import { IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import type { DealTradeDocumentCoverage } from "src/lib/trade-document-types";

import {
  DealStatus,
  ICreateShipmentParams,
  NftDealLogs,
  ShippingDetails,
} from "../interfaces/shipment";

export type AnalyzeDealDocumentsResult = {
  documents: Array<{
    fileName: string;
    detectedType: string;
    tradePdfClassification?: {
      detectedType: string;
      score: number;
      matchedKeywords: string[];
    };
    suggestedDescription: string;
  }>;
  suggestions: Record<string, string | number | undefined>;
  filledFields: string[];
  detectedFields?: Record<string, string>;
};

export type UploadDealCreationDocumentsResult = {
  documents: Array<{ id: string; description: string; url: string }>;
  detectedFields?: Record<string, string>;
  appliedFields?: string[];
  suggestions?: Record<string, string | number | undefined>;
};

export class ShipmentService {
  static async createShipment(shipmentData: ICreateShipmentParams): Promise<ShippingDetails> {
    const response = await axiosInstance.post("/deals", {
      ...shipmentData,
    });
    return response.data;
  }

  static async analyzeDealDocuments(files: File[]): Promise<AnalyzeDealDocumentsResult> {
    const formData = new FormData();
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const shouldNormalizePdfMime =
        extension === "pdf" && (!file.type || file.type === "application/octet-stream");
      const uploadFile = shouldNormalizePdfMime
        ? new File([file], file.name, { type: "application/pdf" })
        : file;
      formData.append("files", uploadFile, uploadFile.name);
    }
    const response = await axiosInstance.post("/deals/analyze-documents", formData);
    return response.data;
  }

  static async uploadDealCreationDocuments(
    dealId: string,
    files: File[],
  ): Promise<UploadDealCreationDocumentsResult> {
    const formData = new FormData();
    for (const file of files) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      const shouldNormalizePdfMime =
        extension === "pdf" && (!file.type || file.type === "application/octet-stream");
      const uploadFile = shouldNormalizePdfMime
        ? new File([file], file.name, { type: "application/pdf" })
        : file;
      formData.append("files", uploadFile, uploadFile.name);
    }
    const response = await axiosInstance.post(`/deals/${dealId}/creation-documents`, formData);
    return response.data;
  }

  static async getShipments(status: DealStatus): Promise<ShippingDetails[]> {
    const response = await axiosInstance.get(`/deals?status=${status}`);
    return response.data;
  }

  /** Single request for dashboard (confirmed + finished). */
  static async getDashboardShipments(): Promise<ShippingDetails[]> {
    const response = await axiosInstance.get("/deals", {
      params: { statuses: `${DealStatus.Confirmed},${DealStatus.Finished}` },
    });
    return response.data;
  }

  static async getShipmentDetails(dealId: string): Promise<ShippingDetails> {
    const response = await axiosInstance.get(`/deals/${dealId}`);
    return response.data;
  }

  static async getTradeDocumentCoverage(
    dealId: string,
  ): Promise<DealTradeDocumentCoverage> {
    const response = await axiosInstance.get(
      `/deals/${dealId}/trade-document-coverage`,
    );
    return response.data;
  }

  static async updateShipmentDealDetails(
    dealId: string,
    shipmentData:
      | ICreateShipmentParams
      | { confirm: boolean }
      | { cancel: boolean }
      | { currentMilestone: MilestoneEnum; signature: string }
      | { view: boolean }
      | { viewDocuments: boolean }
      | { isPublished: boolean }
      | { repaid: boolean },
  ): Promise<ShippingDetails> {
    const response = await axiosInstance.put(`/deals/${dealId}`, {
      ...shipmentData,
    });
    return response.data;
  }

  static async uploadDocToMilestone(
    file: {
      description: string;
      file: File;
      documentUploadMode?: "normal" | "payment" | "drawback";
    },
    dealId?: string,
    milestoneId?: string,
  ): Promise<{ id: string; description: string; url: string }> {
    const formData = new FormData();
    const extension = file.file.name.split(".").pop()?.toLowerCase();
    const shouldNormalizePdfMime =
      extension === "pdf" &&
      (!file.file.type || file.file.type === "application/octet-stream");
    const uploadFile = shouldNormalizePdfMime
      ? new File([file.file], file.file.name, { type: "application/pdf" })
      : file.file;

    formData.append("description", file.description);
    formData.append("file", uploadFile, uploadFile.name);
    formData.append("documentUploadMode", file.documentUploadMode ?? "normal");

    // Let the browser set multipart boundary automatically.
    const response = await axiosInstance.post(
      `/deals/${dealId}/milestones/${milestoneId}/docs`,
      formData,
    );

    return response.data;
  }

  static async deleteShipmentMilestoneDoc(
    dealId: string,
    milestoneId: string,
    docId: string,
  ): Promise<ShippingDetails> {
    const response = await axiosInstance.delete(`/deals/${dealId}/milestones/${milestoneId}/docs/${docId}`);
    return response.data;
  }

  static async markMilestoneDocumentAsSeen(
    dealId: string,
    milestoneId: string,
    docId: string,
  ): Promise<ShippingDetails> {
    const response = await axiosInstance.put(`/deals/${dealId}/milestones/${milestoneId}/docs/${docId}`, {
      view: true,
    });
    return response.data;
  }

  static async updateDocumentDescription(
    dealId: string,
    milestoneId: string,
    docId: string,
    description: string,
  ): Promise<IMilestoneDetails> {
    const response = await axiosInstance.put(`/deals/${dealId}/milestones/${milestoneId}/docs/${docId}`, {
      description,
    });
    return response.data;
  }

  static async updateDocumentVisibility(
    dealId: string,
    milestoneId: string,
    docId: string,
    publiclyVisible: boolean,
  ): Promise<IMilestoneDetails> {
    const response = await axiosInstance.put(`/deals/${dealId}/milestones/${milestoneId}/docs/${docId}`, {
      publiclyVisible,
    });
    return response.data;
  }

  static async getNftLogs(dealId: string): Promise<NftDealLogs[]> {
    const response = await axiosInstance.get(`/deals/${dealId}/logs`);
    return response.data;
  }
}
