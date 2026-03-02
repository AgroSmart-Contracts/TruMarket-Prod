import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../lib/store";

// declaring the types for our state
export type ShipmentAgreementData = {
  formValues: {
    [key: string]: string;
  };
};

const initialState: ShipmentAgreementData = {
  formValues: {},
};

export const shipmentAgreementSlice = createSlice({
  name: "shipmentAgreement",
  initialState,
  reducers: {
    cloneShipmentAgreementState: (
      state: ShipmentAgreementData,
      action: PayloadAction<{ shipment: { [key: string]: string } }>,
    ) => {
      return { ...state, formValues: action.payload.shipment };
    },
    resetShipmentAgreementState: (state: ShipmentAgreementData) => {
      state = initialState;
      return state;
    },
    setShipmentAgreementState: (state: ShipmentAgreementData, action: PayloadAction<{ field: string; value: any }>) => {
      const { field, value } = action.payload;
      state.formValues[field] = value;
    },
  },
});

// actions
export const { resetShipmentAgreementState, setShipmentAgreementState, cloneShipmentAgreementState } =
  shipmentAgreementSlice.actions;

// selectors
export const selectShipmentAgreementState = (state: RootState) => state.shipmentAgreement.formValues;

export default shipmentAgreementSlice.reducer;
