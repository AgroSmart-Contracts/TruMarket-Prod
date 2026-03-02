import axios, { AxiosError } from "axios";

import axiosInstance from "src/config/axios";
import { IGetDealsParameters, User } from "src/interfaces/admin";
import { NftDealLogs, ShippingDetails } from "src/interfaces/shipment";

export class AdminService {
  static async getDeals({ offset, status, emailSearch }: IGetDealsParameters): Promise<{ data: ShippingDetails[] }> {
    const response = await axiosInstance.get(`/admin/deals`, {
      params: {
        status,
        offset,
        emailSearch,
      },
    });
    return response.data;
  }

  static async getUsers(): Promise<User[]> {
    const response = await axiosInstance.get(`/users`);
    return response.data;
  }

  static async deleteDeal({ dealId }: { dealId: string }): Promise<{ data: ShippingDetails[] }> {
    const response = await axiosInstance.delete(`/admin/deals/${dealId}`);
    return response.data;
  }

  static async getNftLogs(dealId: string): Promise<NftDealLogs[]> {
    const response = await axiosInstance.get(`/admin/${dealId}/logs`);
    return response.data;
  }
}
