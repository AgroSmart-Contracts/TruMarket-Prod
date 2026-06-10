import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import enAccount from "src/locales/en/account.json";
import enAdmin from "src/locales/en/admin.json";
import enAuth from "src/locales/en/auth.json";
import enCommon from "src/locales/en/common.json";
import enDashboard from "src/locales/en/dashboard.json";
import enDocuments from "src/locales/en/documents.json";
import enPayments from "src/locales/en/payments.json";
import enShipment from "src/locales/en/shipment.json";
import esAccount from "src/locales/es/account.json";
import esAdmin from "src/locales/es/admin.json";
import esAuth from "src/locales/es/auth.json";
import esCommon from "src/locales/es/common.json";
import esDashboard from "src/locales/es/dashboard.json";
import esDocuments from "src/locales/es/documents.json";
import esPayments from "src/locales/es/payments.json";
import esShipment from "src/locales/es/shipment.json";

export const APP_LOCALES = ["en", "es"] as const;
export type AppLocale = (typeof APP_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = "en";
export const LOCALE_STORAGE_KEY = "trumarket-locale";

export const isAppLocale = (value: string): value is AppLocale =>
  APP_LOCALES.includes(value as AppLocale);

export const readStoredLocale = (): AppLocale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored && isAppLocale(stored) ? stored : DEFAULT_LOCALE;
};

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    shipment: enShipment,
    account: enAccount,
    admin: enAdmin,
    payments: enPayments,
    documents: enDocuments,
  },
  es: {
    common: esCommon,
    auth: esAuth,
    dashboard: esDashboard,
    shipment: esShipment,
    account: esAccount,
    admin: esAdmin,
    payments: esPayments,
    documents: esDocuments,
  },
} as const;

const i18nInitOptions: InitOptions = {
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: "common",
  ns: ["common", "auth", "dashboard", "shipment", "account", "admin", "payments", "documents"],
  interpolation: { escapeValue: false },
  compatibilityJSON: "v4",
  react: { useSuspense: false },
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init(i18nInitOptions);
}

export const changeAppLocale = async (locale: AppLocale): Promise<void> => {
  await i18n.changeLanguage(locale);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
};

export default i18n;
