import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import {
  isShipmentDetailTab,
  type ShipmentDetailTab,
} from "src/lib/shipment-details-tabs";

const DEFAULT_TAB: ShipmentDetailTab = "payments";

export function useShipmentDetailTab() {
  const router = useRouter();
  const { query } = router;
  const [activeTab, setActiveTab] = useState<ShipmentDetailTab>(DEFAULT_TAB);

  useEffect(() => {
    const tab = typeof query.tab === "string" ? query.tab : undefined;
    if (tab && isShipmentDetailTab(tab)) {
      setActiveTab(tab);
    }
  }, [query.tab]);

  const selectTab = useCallback((tab: ShipmentDetailTab) => {
    setActiveTab(tab);
  }, []);

  const goToDrawbackTab = useCallback(() => {
    setActiveTab("drawback");
    void router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: "drawback" } },
      undefined,
      { shallow: true },
    );
    requestAnimationFrame(() => {
      document.getElementById("shipment-details-tabs")?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [router]);

  return { activeTab, selectTab, goToDrawbackTab };
}
