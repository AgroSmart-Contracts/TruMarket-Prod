import type { DealFieldSuggestions } from "./apply-suggestions";

export type DetectedFieldRow = { key: string; label: string; value: string };

const LABELS: Record<string, string> = {
  description: "Description",
  quantity: "Quantity (units)",
  offerUnitPrice: "Unit price",
  totalValue: "Invoice total",
  investmentAmount: "Shipment amount",
  variety: "Variety",
  quality: "Quality",
  presentation: "Presentation",
  size: "Pack size",
  origin: "Origin country",
  destination: "Destination country",
  portOfOrigin: "Port of origin",
  portOfDestination: "Port of destination",
  transport: "Transport",
  shippingStartDate: "Departure date",
  expectedShippingEndDate: "Arrival date",
  buyerCompanyName: "Buyer name",
  buyerCompanyCountry: "Buyer country",
  buyerCompanyTaxId: "Buyer tax ID",
  supplierCompanyName: "Supplier name",
  supplierCompanyCountry: "Supplier country",
  supplierCompanyTaxId: "Supplier tax ID",
};

export function formatDetectedFields(
  suggestions: DealFieldSuggestions,
): DetectedFieldRow[] {
  const rows: DetectedFieldRow[] = [];

  for (const [key, raw] of Object.entries(suggestions)) {
    if (key === "name") continue;
    if (raw === undefined || raw === null || raw === "") continue;
    const label = LABELS[key] ?? key;
    const value =
      key === "transport"
        ? raw === "by_air"
          ? "Air"
          : raw === "sea_freight"
            ? "Sea"
            : String(raw)
        : String(raw);
    rows.push({ key, label, value });
  }

  return rows;
}
