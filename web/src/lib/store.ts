import { configureStore } from "@reduxjs/toolkit";
import { createWrapper } from "next-redux-wrapper";

import UiSlice from "src/store/UiSlice";
import shipmentAgreementSlice from "src/store/createShipmentAgreementSlice";
import previewModalContentSlice from "src/store/previewModalContentSlice";
import shipmentDetailsSlice from "src/store/shipmentDetailsSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      shipmentAgreement: shipmentAgreementSlice,
      previewModalContent: previewModalContentSlice,
      shipmentDetails: shipmentDetailsSlice,
      UI: UiSlice,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const wrapper = createWrapper(makeStore, { debug: false });
