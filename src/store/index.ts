import { create } from "zustand";
import { StoreSlice } from "./types";
import * as slices from "./slices";

// Create store with optimized performance
export const useStore = create<StoreSlice>((...a) => ({
  ...slices.createChatSlice(...a),
  ...slices.createSessionSlice(...a),
  ...slices.createBusinessEntitiesSlice(...a),
}));
