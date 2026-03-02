import axios from "axios";
import { toast } from "react-toastify";
import moment from "moment";

import { ShippingDetails, AgreementPartyInfo } from "src/interfaces/shipment";

import CountryList from "./country-list.json";

export function uiConsole(...args: any[]): void {
  if (typeof window !== "undefined") {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
    console.log(...args);
  }
}

export const checkWeb3AuthInstance = (web3authSfa: any) => {
  if (!web3authSfa) {
    uiConsole("Web3Auth not initialized yet");
    return;
  }
};

export const parseToken = (token: any) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");
    return JSON.parse(atob(base64 || ""));
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const CurrencyFormatter = (amount: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(amount);
};

export const truncateContractAddress = (address?: string) => {
  if (address) {
    const truncateRegex = /^(0x[a-zA-Z0-9]{4})[a-zA-Z0-9]+([a-zA-Z0-9]{4})$/;
    const match = address.match(truncateRegex);
    if (match) {
      return `${match[1]}…${match[2]}`;
    }
  }
};

export const handleOTP = async (email: string, action: any) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/request-otp`, {
      params: {
        email: email.trim(),
      },
    });

    toast.success(response.data.message);
    action();
  } catch (err: any) {
    toast.error(err?.response?.data?.error);
  }
};

export const handleRequestAuth0JWT = async (
  email: string,
  otp: string,
  action: (authOJWT: string) => Promise<void>,
) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_APP_URL}/api/verify`, {
      params: {
        email,
        otp,
      },
    });

    if (response.data.authOJWT) {
      await action(response.data.authOJWT);
    }
  } catch (err: any) {
    toast.error(err?.response?.data?.error);
  }
};

export const checkMetaMaskExtension = () => {
  const windowInst = window as any;
  if (!windowInst.ethereum && !windowInst.ethereum?.isMetaMask) {
    return toast.error("Metamask is not installed!");
  }
};

export const calculateTranchPercentageSum = (obj: any, keysToIgnore?: string[]) => {
  let sum = 0;
  for (const key in obj) {
    // eslint-disable-next-line
    if (obj.hasOwnProperty(key) && !keysToIgnore?.includes(key)) {
      sum += +obj[key];
    }
  }
  return sum;
};

export const getFileExtension = (url: string) => {
  return url.split(".").pop() as string;
};

export const normalizeShipmentAgreementDetailsData = (apiData: ShippingDetails, isBuyer: boolean) => {
  const milestoneMapping: { [key: number]: string } = {};

  apiData.milestones.forEach((milestone, index) => {
    milestoneMapping[index] = milestone.fundsDistribution?.toString() || "";
  });

  // Create the normalized data object
  const normalizedData = {
    ...apiData,
    name: apiData.name,
    variety: apiData.variety,
    quality: apiData.quality,
    presentation: apiData.presentation,
    quantity: apiData.quantity,
    offerUnitPrice: apiData.offerUnitPrice,
    totalValue: apiData.totalValue,
    transport: apiData.transport || "",
    email: isBuyer ? apiData.proposalSupplierEmail : apiData.proposalBuyerEmail,
    origin: apiData.origin,
    portOfOriginCity: apiData.portOfOrigin,
    destination: apiData.destination,
    buyerConfirmed: apiData.buyerConfirmed,
    supplierConfirmed: apiData.supplierConfirmed,
    portOfDestinationCity: apiData.portOfDestination,
    shippingStartDate: moment(apiData.shippingStartDate).format("YYYY-MM-DD"),
    description: apiData.description || "",
    production_and_fields: milestoneMapping[0],
    packaging_and_process: milestoneMapping[1],
    finished_product_and_storage: milestoneMapping[2],
    transport_to_port_of_origin: milestoneMapping[3],
    port_of_origin: milestoneMapping[4],
    transit: milestoneMapping[5],
    port_of_destination: milestoneMapping[6],
    addresseeCountry: isBuyer ? apiData.supplierCompany.country : apiData.buyerCompany.country,
    addresseeCompanyName: isBuyer ? apiData.supplierCompany.name : apiData.buyerCompany.name,
    addresseeTaxId: isBuyer ? apiData.supplierCompany.taxId : apiData.buyerCompany.taxId,
    addresseeParticipants: isBuyer
      ? arrayToCommaSeparatedString(getAgreementPartyEmailArray(apiData.suppliers))
      : arrayToCommaSeparatedString(getAgreementPartyEmailArray(apiData.buyers)),
    companyName: isBuyer ? apiData.buyerCompany.name : apiData.supplierCompany.name,
    taxId: isBuyer ? apiData.buyerCompany.taxId : apiData.supplierCompany.taxId,
    country: isBuyer ? apiData.buyerCompany.country : apiData.supplierCompany.country,
    participants: isBuyer
      ? arrayToCommaSeparatedString(getAgreementPartyEmailArray(apiData.buyers))
      : arrayToCommaSeparatedString(getAgreementPartyEmailArray(apiData.suppliers)),
  };

  return normalizedData;
};

export const normalizeField = (field: { label: string; value: string }) => field?.value;

export const milestoneDescriptions = [
  "production_and_fields",
  "packaging_and_process",
  "finished_product_and_storage",
  "transport_to_port_of_origin",
  "port_of_origin",
  "transit",
  "port_of_destination",
];

export const getCountryCode = (countryName: string) => {
  return CountryList.find((country) => country.name === countryName)?.code;
};

export const hasDocsWithLength = (milestones: any[]) => {
  return milestones.some((item) => item.docs.length > 0);
};

export const arrayToCommaSeparatedString = (arr: string[]) => {
  return arr.join(",");
};

export const commaSeparatedStringToArray = (arr: string) => {
  return arr.split(/[\s,]+/).map((item) => item.trim());
};

export const checkIfUserConfirmedAgreement = (agreementPartyInfo: AgreementPartyInfo[], userId: string) => {
  return agreementPartyInfo.find((user) => user.id === userId)?.approved;
};

export const checkHowManyUserApprovedAgreement = (agreementPartyInfo: AgreementPartyInfo[]) => {
  return agreementPartyInfo?.reduce((count, item) => {
    return count + (item.approved === true ? 1 : 0);
  }, 0);
};

export const isApprovedByAllUser = (agreementPartyInfo: AgreementPartyInfo[]) => {
  return agreementPartyInfo?.every((item) => item.approved === true);
};

export const getAgreementPartyEmailArray = (agreementPartyInfo: AgreementPartyInfo[]) => {
  return agreementPartyInfo.map((supplier) => supplier.email);
};

export const CopyToClipBoard = async (text: any, notificationText: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(notificationText);
    return true;
  } catch (err: any) {
    console.error("Async: Could not copy text: ", err);
    toast.error(err.toString());
    return false;
  }
};

export const openInNewTab = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

// Helper function to safely convert to number
export const safeNumber = (value: any): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Helper function to safely get string value
export const safeString = (value: any): string => {
  return value ? String(value) : "";
};
