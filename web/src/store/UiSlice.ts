//slice for basic UI functionalities
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../lib/store";

// declaring the types for our state
export type UI = {
  isTermsAndConditionsChecked: boolean;
};

const initialState: UI = {
  isTermsAndConditionsChecked: false,
};

export const UISlice = createSlice({
  name: "UI",
  initialState,
  reducers: {
    setTermsAndConditionsChecked: (state: UI, action: PayloadAction<{ state: boolean }>) => {
      state.isTermsAndConditionsChecked = action.payload.state;
    },
  },
});

// actions
export const { setTermsAndConditionsChecked } = UISlice.actions;

// selectors
export const selectIsTermsAndConditionsChecked = (state: RootState) => state.UI.isTermsAndConditionsChecked;
export default UISlice.reducer;
