import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { IMilestoneDetails, MilestoneApprovalStatus, MilestoneEnum, MilestoneStatus } from "src/interfaces/global";

import type { RootState } from "../lib/store";

// declaring the types for our state
export type ShipmentDetails = {
  currentMileStone: MilestoneEnum;
  milestoneDetails: IMilestoneDetails[] | [];
};

const initialState: ShipmentDetails = {
  currentMileStone: MilestoneEnum.M,
  milestoneDetails: [],
};

export const shipmentDetailsSlice = createSlice({
  name: "shipmentDetails",
  initialState,
  reducers: {
    setShipmentDetailsCurrentMilestone: (
      state: ShipmentDetails,
      action: PayloadAction<{ currentMilestone: MilestoneEnum }>,
    ) => {
      state.currentMileStone = action.payload.currentMilestone;
    },

    setMilestoneDetails: (state: ShipmentDetails, action: PayloadAction<IMilestoneDetails[]>) => {
      state.milestoneDetails = action.payload;
    },
  },
});

// actions
export const { setShipmentDetailsCurrentMilestone, setMilestoneDetails } = shipmentDetailsSlice.actions;

// selectors
export const selectShipmentDetailsCurrentMilestone = (state: RootState) => state.shipmentDetails.currentMileStone;
export const selectMilestoneDetails = (state: RootState) => state.shipmentDetails.milestoneDetails;
export default shipmentDetailsSlice.reducer;
