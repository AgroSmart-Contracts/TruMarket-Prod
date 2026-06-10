//slice for basic UI functionalities
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppLocale, changeAppLocale, DEFAULT_LOCALE, readStoredLocale } from "src/lib/i18n";

import type { RootState } from "../lib/store";


// declaring the types for our state
export type UI = {
  isTermsAndConditionsChecked: boolean;
  locale: AppLocale;
};

const initialState: UI = {
  isTermsAndConditionsChecked: false,
  locale: DEFAULT_LOCALE,
};

export const UISlice = createSlice({
  name: "UI",
  initialState,
  reducers: {
    setTermsAndConditionsChecked: (state: UI, action: PayloadAction<{ state: boolean }>) => {
      state.isTermsAndConditionsChecked = action.payload.state;
    },
    setLocale: (state: UI, action: PayloadAction<AppLocale>) => {
      state.locale = action.payload;
      void changeAppLocale(action.payload);
    },
    hydrateLocale: (state: UI) => {
      state.locale = readStoredLocale();
    },
  },
});

// actions
export const { setTermsAndConditionsChecked, setLocale, hydrateLocale } = UISlice.actions;

// selectors
export const selectIsTermsAndConditionsChecked = (state: RootState) => state.UI.isTermsAndConditionsChecked;
export const selectLocale = (state: RootState) => state.UI.locale;
export default UISlice.reducer;
