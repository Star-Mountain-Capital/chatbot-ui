import type { StateCreator } from 'zustand';

interface BusinessEntity {
  id: string;
  name: string;
}

interface SelectedItem {
  id: string;
  name: string;
  type: string;
}

interface BusinessEntitiesState {
  businessEntities: Record<string, BusinessEntity[]>;
  selectedItems: SelectedItem[];
  isLoading: boolean;
  error: string | null;
}

interface BusinessEntitiesActions {
  setBusinessEntities: (entities: Record<string, BusinessEntity[]>) => void;
  setSelectedItems: (selectedItems: SelectedItem[]) => void;
  addSelectedItem: (item: SelectedItem) => void;
  removeSelectedItem: (itemId: string) => void;
  toggleSelectedItem: (itemName: string, type: string) => void;
  clearSelectedItems: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export type BusinessEntitiesSlice = BusinessEntitiesState &
  BusinessEntitiesActions;

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

  setBusinessEntities: entities => {
    set({ businessEntities: entities });
  },
  setSelectedItems: selectedItems => {
    set({ selectedItems });
  },
  addSelectedItem: item => {
    const currentItems = get().selectedItems;
    if (!currentItems.find(existing => existing.id === item.id)) {
      set({ selectedItems: [...currentItems, item] });
    }
  },
  removeSelectedItem: itemId => {
    const currentItems = get().selectedItems;
    set({ selectedItems: currentItems.filter(item => item.id !== itemId) });
  },
  toggleSelectedItem: (itemName, type) => {
    const currentItems = get().selectedItems;
    const itemId = `${itemName}-${type}`;
    const existingIndex = currentItems.findIndex(item => item.id === itemId);

    if (existingIndex >= 0) {
      // Remove if exists
      set({
        selectedItems: currentItems.filter(
          (_, index) => index !== existingIndex
        )
      });
    } else {
      // Add if doesn't exist
      set({
        selectedItems: [...currentItems, { id: itemId, name: itemName, type }]
      });
    }
  },
  clearSelectedItems: () => {
    set({ selectedItems: [] });
  },
  setLoading: isLoading => {
    set({ isLoading });
  },
  setError: error => {
    set({ error });
  }
});
