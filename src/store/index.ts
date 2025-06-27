import { create } from "zustand";
import { StoreSlice } from "./types";
import { createChatSlice } from "./slices/chatSlice";

// Create store with optimized performance
export const useStore = create<StoreSlice>((...a) => ({
  ...createChatSlice(...a),
}));
