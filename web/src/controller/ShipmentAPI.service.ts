import axios, { AxiosError } from "axios";

import axiosInstance from "src/config/axios";
import { IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";

import {
  DealStatus,
  ICreateShipmentParams,
  IMilestoneStatusInfo,
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

    formData.append("description", file.description);
    formData.append("file", file.file);

    const response = await axiosInstance.post(`/deals/${dealId}/milestones/${milestoneId}/docs`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

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

  static async updateMilestoneStatus(
    dealId: string,
    milestoneId: string,
    milestoneStatusInfo: IMilestoneStatusInfo,
  ): Promise<IMilestoneDetails> {
    const response = await axiosInstance.put(`/deals/${dealId}/milestones/${milestoneId}`, {
      ...milestoneStatusInfo,
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
