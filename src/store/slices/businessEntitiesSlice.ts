import { StateCreator } from "zustand";
import { fetchBusinessEntitiesFromApi } from "@/services/businessEntitiesService";

export interface BusinessEntity {
  id: string;
  name: string;
  type: string;
  // Add other properties as needed based on your API response
}

export interface SelectedItem {
  id: string;
  name: string;
  type: string;
}

export interface BusinessEntitiesState {
  businessEntities: Record<string, BusinessEntity[]>;
  selectedItems: SelectedItem[];
  isLoading: boolean;
  error: string | null;
}

export interface BusinessEntitiesActions {
  setBusinessEntities: (entities: Record<string, BusinessEntity[]>) => void;
  setSelectedItems: (selectedItems: SelectedItem[]) => void;
  addSelectedItem: (item: SelectedItem) => void;
  removeSelectedItem: (itemId: string) => void;
  toggleSelectedItem: (itemName: string, type: string) => void;
  clearSelectedItems: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchBusinessEntities: () => Promise<void>;
}

export type BusinessEntitiesSlice = BusinessEntitiesState & BusinessEntitiesActions;

export const createBusinessEntitiesSlice: StateCreator<
  BusinessEntitiesSlice,
  [],
  [],
  BusinessEntitiesSlice
> = (set, get) => ({
  businessEntities: {},
  selectedItems: [],
  isLoading: false,
  error: null,

  setBusinessEntities: (entities) => set({ businessEntities: entities }),
  setSelectedItems: (selectedItems) => set({ selectedItems }),
  addSelectedItem: (item) => {
    const currentItems = get().selectedItems;
    if (!currentItems.find(existing => existing.id === item.id)) {
      set({ selectedItems: [...currentItems, item] });
    }
  },
  removeSelectedItem: (itemId) => {
    const currentItems = get().selectedItems;
    set({ selectedItems: currentItems.filter(item => item.id !== itemId) });
  },
  toggleSelectedItem: (itemName, type) => {
    const currentItems = get().selectedItems;
    const itemId = `${itemName}-${type}`;
    const existingIndex = currentItems.findIndex(item => item.id === itemId);
    
    if (existingIndex >= 0) {
      // Remove if exists
      set({ selectedItems: currentItems.filter((_, index) => index !== existingIndex) });
    } else {
      // Add if doesn't exist
      set({ selectedItems: [...currentItems, { id: itemId, name: itemName, type }] });
    }
  },
  clearSelectedItems: () => set({ selectedItems: [] }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchBusinessEntities: async () => {
    set({ isLoading: true, error: null });
    try {
      const entities = await fetchBusinessEntitiesFromApi();
      set({ businessEntities: entities, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch business entities';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching business entities:', error);
    }
  },
}); 