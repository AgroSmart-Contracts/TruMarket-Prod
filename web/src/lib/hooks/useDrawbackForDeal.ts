import { useMemo } from "react";

import { AccountTypeEnum } from "src/interfaces/global";
import type { Payment } from "src/interfaces/payment";
import type { ShippingDetails } from "src/interfaces/shipment";
import {
  buildDrawbackRequirementRows,
  collectDrawbackDocuments,
  evaluateDrawbackValidation,
  type DrawbackValidationResult,
  type DrawbackRequirementRow,
} from "src/lib/drawback-requirements";
import {
  computeDrawbackClaimRiskLevel,
  DEFAULT_DRAWBACK_CLAIM_RISK,
  dealEndDate,
  daysUntilDrawbackDeadline,
  canAccessDrawback,
  dealFobValue,
  isDrawbackEligible,
  type DrawbackClaimRiskLevel,
} from "src/lib/drawback";

export function useDrawbackForDeal(
  shipment: ShippingDetails | undefined,
  payments: Payment[],
  accountType?: AccountTypeEnum,
): {
  requirements: DrawbackRequirementRow[];
  claimRisk: DrawbackClaimRiskLevel;
  eligible: boolean;
  validation: DrawbackValidationResult;
} {
  const documents = useMemo(() => {
    if (!shipment) return [];
    return collectDrawbackDocuments(shipment.milestones ?? [], payments);
  }, [shipment, payments]);

  const requirements = useMemo(() => {
    return buildDrawbackRequirementRows(documents);
  }, [documents]);

  const validation = useMemo(() => {
    if (!shipment) {
      return evaluateDrawbackValidation([], [], [], [], 0);
    }
    return evaluateDrawbackValidation(
      requirements,
      documents,
      shipment.milestones ?? [],
      payments,
      dealFobValue(shipment),
    );
  }, [shipment, requirements, documents, payments]);

  const claimRisk = useMemo(() => {
    if (!shipment) return DEFAULT_DRAWBACK_CLAIM_RISK;
    return computeDrawbackClaimRiskLevel(
      requirements,
      daysUntilDrawbackDeadline(dealEndDate(shipment)),
      validation,
    );
  }, [shipment, requirements, validation]);

  const eligible = Boolean(
    shipment && isDrawbackEligible(shipment) && canAccessDrawback(accountType),
  );

  return { requirements, claimRisk, eligible, validation };
}
