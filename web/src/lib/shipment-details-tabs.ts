const SHIPMENT_DETAIL_TABS = ["payments", "documents", "activity", "drawback"] as const;

export type ShipmentDetailTab = (typeof SHIPMENT_DETAIL_TABS)[number];

export function isShipmentDetailTab(value: string): value is ShipmentDetailTab {
  return (SHIPMENT_DETAIL_TABS as readonly string[]).includes(value);
}

export function shipmentDetailTabsForAccount(isSupplier: boolean): ShipmentDetailTab[] {
  if (isSupplier) return [...SHIPMENT_DETAIL_TABS];
  return SHIPMENT_DETAIL_TABS.filter((tab) => tab !== "drawback");
}

export function shipmentDetailTabClass(active: boolean): string {
  return active
    ? "border-b-2 border-tm-green pb-3 font-semibold text-tm-green transition-colors"
    : "pb-3 text-[#64748B] transition-colors hover:text-[#0F172A]";
}
