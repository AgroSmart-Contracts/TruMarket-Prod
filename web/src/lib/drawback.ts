import moment from "moment";

import { AccountTypeEnum } from "src/interfaces/global";
import type { DrawbackRequirementRow, DrawbackValidationResult } from "src/lib/drawback-requirements";
import { DealStatus, type ShippingDetails } from "src/interfaces/shipment";

export type DrawbackClaimRiskLevel = "low" | "medium" | "high";

export type DrawbackClaimStatus =
  | "not_started"
  | "has_error_in_data"
  | "primarily_accepted"
  | "pending_tax_approval";

/** Default claim risk before validations escalate it (never medium by default). */
export const DEFAULT_DRAWBACK_CLAIM_RISK: DrawbackClaimRiskLevel = "low";

const CRITICAL_DRAWBACK_REQUIREMENTS = new Set([
  "swornDeclarationImportedInputs",
  "rawMaterialTransportGuide",
  "packagingContract",
  "processingMaquilaInvoice",
  "commercialExportInvoice",
  "exportTransportDocument",
  "customsDeclarationDam",
]);

/** Peru export drawback: up to 3% of FOB / invoice value recoverable via SUNAT. */
export const DRAWBACK_RECOVERY_RATE = 0.03;

/** Claim / apply for drawback must be completed within this many days after the deal ends. */
export const DRAWBACK_CLAIM_DAYS_AFTER_DEAL_END = 60;

export function dealEndDate(
  deal: Pick<ShippingDetails, "expectedShippingEndDate" | "shippingStartDate">,
): string | undefined {
  return deal.expectedShippingEndDate || deal.shippingStartDate;
}

export function drawbackClaimDeadlineMoment(dealEndIso?: string): moment.Moment | null {
  if (!dealEndIso) return null;
  const end = moment(dealEndIso);
  if (!end.isValid()) return null;
  return end.clone().add(DRAWBACK_CLAIM_DAYS_AFTER_DEAL_END, "days");
}

/** Calendar days remaining to claim drawback (0 if the window has closed). */
export function daysUntilDrawbackDeadline(dealEndIso?: string): number | null {
  const deadline = drawbackClaimDeadlineMoment(dealEndIso);
  if (!deadline) return null;
  return Math.max(0, deadline.diff(moment(), "days"));
}

export function dealFobValue(deal: Pick<ShippingDetails, "totalValue" | "quantity" | "offerUnitPrice" | "investmentAmount">): number {
  const total = Number(deal.totalValue);
  if (total > 0) return total;
  const qty = Number(deal.quantity) || 0;
  const unit = Number(deal.offerUnitPrice) || 0;
  if (qty > 0 && unit > 0) return qty * unit;
  return Number(deal.investmentAmount) || 0;
}

export function drawbackRecoveryAmount(fobValue: number): number {
  if (!Number.isFinite(fobValue) || fobValue <= 0) return 0;
  return Math.round(fobValue * DRAWBACK_RECOVERY_RATE);
}

export function isDrawbackEligible(deal: ShippingDetails): boolean {
  return (
    (deal.status === DealStatus.Confirmed || deal.status === DealStatus.Finished) &&
    dealFobValue(deal) > 0
  );
}

/** Drawback UI and uploads are supplier-only (Peru export recovery workflow). */
export function canAccessDrawback(accountType?: AccountTypeEnum): boolean {
  return accountType === AccountTypeEnum.SUPPLIER;
}

/** Eligible deal still inside the SUNAT claim window (days left to claim > 0). */
export function isDrawbackClaimable(deal: ShippingDetails): boolean {
  if (!isDrawbackEligible(deal)) return false;
  const daysLeft = daysUntilDrawbackDeadline(dealEndDate(deal));
  return daysLeft != null && daysLeft > 0;
}

const REQUIRED_DRAWBACK_IDS = new Set([
  "swornDeclarationImportedInputs",
  "rawMaterialTransportGuide",
  "packagingContract",
  "processingMaquilaInvoice",
  "customsDeclarationDam",
  "commercialExportInvoice",
  "exportTransportDocument",
]);

/** User-facing claim status for the summary strip (replaces claim risk). */
export function resolveDrawbackClaimStatus(
  requirements: DrawbackRequirementRow[],
  validation: DrawbackValidationResult,
): DrawbackClaimStatus {
  const requiredRows = requirements.filter((r) => REQUIRED_DRAWBACK_IDS.has(r.id));
  const hasAnyRequiredOnFile = requiredRows.some((r) => r.status !== "missing");

  if (!hasAnyRequiredOnFile) {
    return "not_started";
  }

  const hasBlockingIssue =
    validation.primaryDecision === "rejected" ||
    validation.primaryDecision === "incomplete" ||
    validation.finalDecision === "rejected" ||
    validation.findings.some((f) => f.severity === "hard_stop" || f.severity === "fail");

  if (hasBlockingIssue) {
    return "has_error_in_data";
  }

  if (validation.finalDecision === "pending_admin") {
    return "pending_tax_approval";
  }

  if (validation.primaryDecision === "accepted") {
    return "primarily_accepted";
  }

  return "has_error_in_data";
}

/**
 * Overall SUNAT claim risk from requirement coverage and deadline pressure.
 * Pending/on-file documents do not raise risk; missing docs do, with low as the baseline.
 */
export function computeDrawbackClaimRiskLevel(
  requirements: DrawbackRequirementRow[],
  daysUntilDeadline: number | null,
  validation?: Pick<
    DrawbackValidationResult,
    "primaryDecision" | "rejectionCodes" | "findings"
  >,
): DrawbackClaimRiskLevel {
  if (validation?.findings?.some((f) => f.severity === "hard_stop")) {
    return "high";
  }
  if (validation?.primaryDecision === "rejected") {
    return "high";
  }

  const missing = requirements.filter((r) => r.status === "missing");
  if (missing.length === 0) {
    return DEFAULT_DRAWBACK_CLAIM_RISK;
  }

  const criticalMissing = missing.some((r) => CRITICAL_DRAWBACK_REQUIREMENTS.has(r.id));
  const urgent = daysUntilDeadline != null && daysUntilDeadline <= 14;

  if (urgent && criticalMissing) return "high";
  if (missing.length >= 2) return "high";
  if (missing.length === 1 && criticalMissing && daysUntilDeadline != null && daysUntilDeadline <= 30) {
    return "medium";
  }

  return DEFAULT_DRAWBACK_CLAIM_RISK;
}

/** Short subtitle for the claim risk summary card. */
export function getDrawbackClaimRiskSubtitle(
  risk: DrawbackClaimRiskLevel,
  requirements: DrawbackRequirementRow[],
  validation?: Pick<DrawbackValidationResult, "primaryDecision">,
): string {
  if (validation?.primaryDecision === "rejected") {
    return "drawback.summaryStrip.riskReasonRejected";
  }

  const missing = requirements.filter((r) => r.status === "missing");
  if (risk === "high") {
    return missing.length > 0
      ? "drawback.summaryStrip.riskReasonHigh"
      : "drawback.summaryStrip.riskReasonHighDeadline";
  }
  if (risk === "medium") {
    return "drawback.summaryStrip.riskReasonMedium";
  }
  if (missing.length === 0) {
    return "drawback.summaryStrip.riskReasonLow";
  }
  return "drawback.summaryStrip.riskReasonLowPartial";
}

export type DrawbackSummary = {
  totalRecovery: number;
  eligibleCount: number;
  firstEligibleDealId?: string;
};

export function summarizeDrawbackRecovery(deals: ShippingDetails[]): DrawbackSummary {
  const claimable = deals.filter(isDrawbackClaimable);
  const confirmed = claimable.filter((d) => d.status === DealStatus.Confirmed);
  const totalRecovery = claimable.reduce((sum, d) => sum + drawbackRecoveryAmount(dealFobValue(d)), 0);

  return {
    totalRecovery,
    eligibleCount: claimable.length,
    firstEligibleDealId: confirmed[0]?.id ?? claimable[0]?.id,
  };
}
