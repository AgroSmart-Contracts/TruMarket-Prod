import { countryOrigins } from "src/lib/static";
import type { ICreateShipmentParams } from "src/interfaces/shipment";

export type DealFieldSuggestions = {
  name?: string;
  description?: string;
  quantity?: number;
  offerUnitPrice?: number;
  totalValue?: number;
  investmentAmount?: number;
  variety?: string;
  quality?: string;
  presentation?: string;
  size?: string;
  origin?: string;
  destination?: string;
  portOfOrigin?: string;
  portOfDestination?: string;
  transport?: "sea_freight" | "by_air";
  shippingStartDate?: string;
  expectedShippingEndDate?: string;
  buyerCompanyName?: string;
  buyerCompanyCountry?: string;
  buyerCompanyTaxId?: string;
  supplierCompanyName?: string;
  supplierCompanyCountry?: string;
  supplierCompanyTaxId?: string;
};

/** Form fields updated from PDFs when preferFromDocuments is true (name is never overwritten). */
const DOCUMENT_OVERWRITE_FORM_FIELDS = new Set([
  "name",
  "description",
  "quantity",
  "offerUnitPrice",
  "investmentAmount",
  "variety",
  "quality",
  "presentation",
  "size",
  "port_origin",
  "port_destination",
  "transport",
  "shippingStartDate",
  "expectedShippingEndDate",
  "origin",
  "destination",
]);

function isEmpty(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (typeof value === "object" && "value" in (value as object)) {
    return !(value as { value?: string }).value;
  }
  return false;
}

/** Parse YYYY-MM-DD as local calendar date (avoids UTC off-by-one). */
function parseDealDateFromIso(isoDate: string): Date | undefined {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return undefined;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function countryOption(name?: string): { label: string; value: string } | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase();
  const match = countryOrigins.find(
    (c) => c.label.toLowerCase() === lower || c.value.toLowerCase() === lower,
  );
  return match ?? { label: name, value: name };
}

/** Returns Redux field updates; with preferFromDocuments, overwrites wizard values from PDFs. */
export function buildSuggestionUpdates(
  formValues: Record<string, unknown>,
  suggestions: DealFieldSuggestions,
  options?: { preferFromDocuments?: boolean },
): { field: string; value: unknown }[] {
  const preferFromDocuments = options?.preferFromDocuments === true;
  const updates: { field: string; value: unknown }[] = [];

  const maybe = (field: string, value: unknown) => {
    if (value === undefined || value === null || value === "") return;
    if (preferFromDocuments && DOCUMENT_OVERWRITE_FORM_FIELDS.has(field)) {
      updates.push({ field, value });
      return;
    }
    if (isEmpty(formValues[field])) {
      updates.push({ field, value });
    }
  };

  const shipmentAmount =
    suggestions.investmentAmount ??
    suggestions.totalValue ??
    (suggestions.quantity != null &&
    suggestions.offerUnitPrice != null &&
    suggestions.quantity > 0
      ? Math.round(suggestions.quantity * suggestions.offerUnitPrice * 100) / 100
      : undefined);

  if (suggestions.name && preferFromDocuments) {
    maybe("name", suggestions.name);
  }

  maybe("description", suggestions.description);
  maybe("quantity", suggestions.quantity != null ? String(suggestions.quantity) : undefined);
  maybe(
    "offerUnitPrice",
    suggestions.offerUnitPrice != null ? String(suggestions.offerUnitPrice) : undefined,
  );
  maybe(
    "investmentAmount",
    shipmentAmount != null ? String(shipmentAmount) : undefined,
  );
  maybe("variety", suggestions.variety);
  maybe("quality", suggestions.quality ? { label: suggestions.quality, value: suggestions.quality } : undefined);
  maybe("presentation", suggestions.presentation);
  maybe("size", suggestions.size);
  maybe("port_origin", suggestions.portOfOrigin);
  maybe("port_destination", suggestions.portOfDestination);
  maybe("transport", suggestions.transport);
  maybe("shippingStartDate", suggestions.shippingStartDate);
  maybe("expectedShippingEndDate", suggestions.expectedShippingEndDate);

  const origin = countryOption(suggestions.origin);
  const destination = countryOption(suggestions.destination);
  if (origin) {
    if (preferFromDocuments || isEmpty(formValues.origin)) {
      updates.push({ field: "origin", value: origin });
    }
  }
  if (destination) {
    if (preferFromDocuments || isEmpty(formValues.destination)) {
      updates.push({ field: "destination", value: destination });
    }
  }

  return updates;
}

/** Compare form values with PDF suggestions; returns human-readable mismatches. */
export function findSuggestionMismatches(
  formValues: Record<string, unknown>,
  suggestions: DealFieldSuggestions,
): string[] {
  const mismatches: string[] = [];
  const qty = Number(formValues.quantity);
  const price = Number(formValues.offerUnitPrice);
  if (
    suggestions.quantity != null &&
    !isEmpty(formValues.quantity) &&
    Math.abs(qty - suggestions.quantity) > Math.max(1, qty * 0.05)
  ) {
    mismatches.push(`quantity (form: ${qty}, document: ${suggestions.quantity})`);
  }
  if (
    suggestions.offerUnitPrice != null &&
    !isEmpty(formValues.offerUnitPrice) &&
    Math.abs(price - suggestions.offerUnitPrice) > Math.max(0.01, price * 0.05)
  ) {
    mismatches.push(
      `unit price (form: ${price}, document: ${suggestions.offerUnitPrice})`,
    );
  }
  return mismatches;
}

/**
 * Apply merged PDF suggestions onto the POST /deals body so the shipment is created with
 * extracted values even if the wizard Redux state was stale or the user skipped re-analysis.
 */
export function mergeSuggestionsIntoCreatePayload(
  payload: ICreateShipmentParams,
  suggestions: DealFieldSuggestions,
): ICreateShipmentParams {
  const next = { ...payload };

  if (suggestions.description) next.description = suggestions.description;
  if (suggestions.quantity != null && suggestions.quantity > 0) {
    next.quantity = String(suggestions.quantity);
  }
  if (suggestions.offerUnitPrice != null && suggestions.offerUnitPrice > 0) {
    next.offerUnitPrice = String(suggestions.offerUnitPrice);
  }
  const amount =
    suggestions.investmentAmount ??
    suggestions.totalValue ??
    (suggestions.quantity != null &&
    suggestions.offerUnitPrice != null &&
    suggestions.quantity > 0
      ? Math.round(suggestions.quantity * suggestions.offerUnitPrice * 100) / 100
      : undefined);
  if (amount != null && amount > 0) next.investmentAmount = amount;
  if (suggestions.variety) next.variety = suggestions.variety;
  if (suggestions.quality) next.quality = suggestions.quality;
  if (suggestions.presentation) next.presentation = suggestions.presentation;
  if (suggestions.size) next.size = suggestions.size;
  if (suggestions.portOfOrigin) next.portOfOrigin = suggestions.portOfOrigin;
  if (suggestions.portOfDestination) next.portOfDestination = suggestions.portOfDestination;
  if (suggestions.transport) next.transport = suggestions.transport;
  if (suggestions.shippingStartDate) {
    const parsed = parseDealDateFromIso(suggestions.shippingStartDate);
    if (parsed) next.shippingStartDate = parsed;
  }
  if (suggestions.expectedShippingEndDate) {
    const parsed = parseDealDateFromIso(suggestions.expectedShippingEndDate);
    if (parsed) next.expectedShippingEndDate = parsed;
  }
  if (suggestions.origin) next.origin = suggestions.origin;
  if (suggestions.destination) next.destination = suggestions.destination;

  if (
    suggestions.buyerCompanyName ||
    suggestions.buyerCompanyCountry ||
    suggestions.buyerCompanyTaxId
  ) {
    next.buyerCompany = {
      name: suggestions.buyerCompanyName ?? next.buyerCompany?.name ?? "",
      country: suggestions.buyerCompanyCountry ?? next.buyerCompany?.country ?? "",
      taxId: suggestions.buyerCompanyTaxId ?? next.buyerCompany?.taxId ?? "",
    };
  }
  if (
    suggestions.supplierCompanyName ||
    suggestions.supplierCompanyCountry ||
    suggestions.supplierCompanyTaxId
  ) {
    next.supplierCompany = {
      name: suggestions.supplierCompanyName ?? next.supplierCompany?.name ?? "",
      country: suggestions.supplierCompanyCountry ?? next.supplierCompany?.country ?? "",
      taxId: suggestions.supplierCompanyTaxId ?? next.supplierCompany?.taxId ?? "",
    };
  }

  return next;
}
