import type { BankAccount } from "src/interfaces/bankAccount";

export function formatAccountLabel(a: BankAccount): string {
  return a.nickname?.trim() || `${a.bankName} ${a.currencyCode}`;
}

export function formatDetails(a: BankAccount): string {
  const last4 = a.accountLast4 ? `•••• ${a.accountLast4}` : "••••";
  const country = a.countryCode ? ` · ${a.countryCode}` : "";
  return `${a.bankName} · ${a.currencyCode} · ${last4}${country}`;
}

