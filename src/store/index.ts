import { create } from "zustand";
import { StoreSlice } from "./types";
import { createChatSlice } from "./slices/chatSlice";
import { createSessionSlice } from "./slices/sessionSlice";

// Create store with optimized performance
export const useStore = create<StoreSlice>((...a) => ({
  ...createChatSlice(...a),
  ...createSessionSlice(...a),
}));
