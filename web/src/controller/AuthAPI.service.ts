import axios, { AxiosError } from "axios";

import axiosInstance from "src/config/axios";
import { DesktopNotifications, EmailNotifications, UserProfileInfo } from "src/interfaces/auth";

export class AuthService {
  static async requestOTPtoAccount({ email }: { email: string }): Promise<{ email: string }> {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH0_API_URL}/passwordless/start`, {
      client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
      connection: "email",
      email: email,
      send: "code",
    });
    return response.data;
  }

  static async requestJWTtoAccount({ email, otp }: { email: string; otp: string }): Promise<{ id_token: string }> {
    console.log("before requestJWTtoAccount");
    const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH0_API_URL}/oauth/token`, {
      client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
      client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET,
      grant_type: "http://auth0.com/oauth/grant-type/passwordless/otp",
      realm: "email",
      username: email.trim(),
      scope: "openid profile email",
      redirect_uri: process.env.NEXT_PUBLIC_APP_URL,
      otp,
    });

    console.log("response", response.data);

    return response.data;
  }

  static async saveUser({
    web3authToken,
    accountType = "supplier",
    auth0Token,
  }: {
    web3authToken: string;
    accountType: string;
    auth0Token: string;
  }): Promise<{ token: string }> {
    const response = await axiosInstance.post("/auth/signup", {
      web3authToken,
      accountType,
      auth0Token,
    });
    return response.data;
  }

  static async loginUser({ web3authToken }: { web3authToken: string }): Promise<{ token: string }> {
    const response = await axiosInstance.post("/auth/login", {
      web3authToken,
    });
    return response.data;
  }

  static async getUserProfileInfo(): Promise<UserProfileInfo> {
    const response = await axiosInstance.get("/auth");
    return response.data;
  }

  static async changeNotificationsSettings({
    desktopNotifications,
    emailNotifications,
  }: {
    desktopNotifications?: any;
    emailNotifications?: any;
  }): Promise<{ desktopNotifications: DesktopNotifications; emailNotifications: EmailNotifications }> {
    const response = await axiosInstance.put("/auth/notifications-settings", {
      desktopNotifications,
      emailNotifications,
    });
    return response.data;
  }

  static async updateBankDetails({
    bankDetails,
  }: {
    bankDetails: NonNullable<UserProfileInfo["bankDetails"]>;
  }): Promise<UserProfileInfo> {
    const response = await axiosInstance.put("/auth/bank-details", {
      bankDetails,
    });
    return response.data;
  }

  static async checkUserExists({ email }: { email: string }): Promise<{ exists: boolean }> {
    const response = await axiosInstance.post("/auth/check-user-exists", {
      email,
    });
    return response.data;
  }

  static async getUserByEmail({ email }: { email: string }): Promise<UserProfileInfo | null> {
    const response = await axiosInstance.post("/auth/get-user-by-email", {
      email,
    });
    return response.data;
  }
}
