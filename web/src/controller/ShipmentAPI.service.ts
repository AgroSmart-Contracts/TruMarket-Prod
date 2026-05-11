import axios, { AxiosError } from "axios";

import axiosInstance from "src/config/axios";
import { IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";

import {
  DealStatus,
  ICreateShipmentParams,
  NftDealLogs,
  ShippingDetails,
} from "../interfaces/shipment";

export class ShipmentService {
  static async createShipment(shipmentData: ICreateShipmentParams): Promise<{ token: string }> {
    const response = await axiosInstance.post("/deals", {
      ...shipmentData,
    });
    return response.data;
  }

  static async getShipments(status: DealStatus): Promise<ShippingDetails[]> {
    const response = await axiosInstance.get(`/deals?status=${status}`);
    return response.data;
  }

  static async getShipmentDetails(dealId: string): Promise<ShippingDetails> {
    const response = await axiosInstance.get(`/deals/${dealId}`);
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
