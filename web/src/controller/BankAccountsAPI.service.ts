import axiosInstance from "src/config/axios";
import type { BankAccount, CreateBankAccountPayload, UpdateBankAccountPayload } from "src/interfaces/bankAccount";

export class BankAccountsService {
  static async list(): Promise<BankAccount[]> {
    const res = await axiosInstance.get("/bank-accounts");
    return res.data;
  }

  static async getById(id: string): Promise<BankAccount> {
    const res = await axiosInstance.get(`/bank-accounts/${id}`);
    return res.data;
  }

  static async create(payload: CreateBankAccountPayload): Promise<BankAccount> {
    const res = await axiosInstance.post("/bank-accounts", payload);
    return res.data;
  }

  static async update(id: string, payload: UpdateBankAccountPayload): Promise<BankAccount> {
    const res = await axiosInstance.put(`/bank-accounts/${id}`, payload);
    return res.data;
  }

  static async setDefault(id: string): Promise<BankAccount> {
    const res = await axiosInstance.post(`/bank-accounts/${id}/set-default`, {});
    return res.data;
  }
}

