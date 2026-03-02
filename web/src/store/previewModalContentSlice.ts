import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../lib/store";

// declaring the types for our state
export type PreviewModalContent = {
  modalContent: {
    url: string;
    id?: string;
    description: string;
    publiclyVisible: boolean;
  };
};

const initialState: PreviewModalContent = {
  modalContent: {
    url: "",
    id: "",
    description: "",
    publiclyVisible: false,
  },
};

export const previewModalContentSlice = createSlice({
  name: "previewModalContent",
  initialState,
  reducers: {
    setPreviewModalContent: (
      state: PreviewModalContent,
      action: PayloadAction<{ url: string; id?: string; description: string; publiclyVisible: boolean }>,
    ) => {
      state.modalContent = action.payload;
    },
    setPreviewModalDescription: (state: PreviewModalContent, action: PayloadAction<{ description: string }>) => {
      state.modalContent.description = action.payload.description;
    },
  },
});

// actions
export const { setPreviewModalContent, setPreviewModalDescription } = previewModalContentSlice.actions;

// selectors
export const selectPreviewModalContent = (state: RootState) => state.previewModalContent.modalContent;

export default previewModalContentSlice.reducer;
