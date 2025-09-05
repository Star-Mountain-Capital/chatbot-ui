import { create } from 'zustand';

import * as slices from './slices';
import type { StoreSlice } from './types';

// Create store with optimized performance
export const useStore = create<StoreSlice>((...a) => ({
  ...slices.createChatSlice(...a),
  ...slices.createSessionSlice(...a),
  ...slices.createBusinessEntitiesSlice(...a)
}));
