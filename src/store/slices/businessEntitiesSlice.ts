import { StateCreator } from "zustand";

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
  
  addSelectedItem: (item) => set((state) => ({ 
    selectedItems: [...state.selectedItems, item] 
  })),
  
  removeSelectedItem: (itemId) => set((state) => ({
    selectedItems: state.selectedItems.filter(item => item.id !== itemId)
  })),
  
  toggleSelectedItem: (itemName, type) => {
    const { selectedItems } = get();
    const itemId = `${type}-${itemName}`;
    const existingIndex = selectedItems.findIndex(item => item.id === itemId);
    
    if (existingIndex >= 0) {
      // Remove item if already selected
      set((state) => ({
        selectedItems: state.selectedItems.filter((_, index) => index !== existingIndex)
      }));
    } else {
      // Add item if not selected
      set((state) => ({
        selectedItems: [...state.selectedItems, { id: itemId, name: itemName, type }]
      }));
    }
  },
  
  clearSelectedItems: () => set({ selectedItems: [] }),
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchBusinessEntities: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('http://172.173.148.66:8000/business-entities');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const entities = await response.json();
      set({ businessEntities: entities, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch business entities';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching business entities:', error);
    }
  },
}); 