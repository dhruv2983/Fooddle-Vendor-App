import { create } from 'zustand';
import { apiService, ApiError } from '@/api/api';
import { MenuItem, CreateMenuItemRequest, UpdateMenuItemRequest, MenuCategory, MenuStats } from '@/types/menu';
import { MenuFilters } from '@/config/api';

interface MenuState {
  menu: MenuItem[];
  categories: MenuCategory[];
  menuStats: MenuStats | null;
  currentItem: MenuItem | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    hasNext: boolean;
    total: number;
  };
  
  // Actions
  fetchMenu: (filters?: MenuFilters, append?: boolean) => Promise<{ hasNext: boolean }>;
  fetchMenuItem: (id: string) => Promise<void>;
  createMenuItem: (data: CreateMenuItemRequest) => Promise<void>;
  updateMenuItem: (id: string, data: UpdateMenuItemRequest) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  toggleMenuItemVisibility: (id: string, visible: boolean) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchMenuStats: () => Promise<void>;
  clearError: () => void;
  refreshMenu: () => Promise<void>;
  loadMoreMenu: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menu: [],
  categories: [],
  menuStats: null,
  currentItem: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    hasNext: true,
    total: 0,
  },
  
  fetchMenu: async (filters, append = false) => {
    set({ isLoading: true, error: null });
    try {
      const page = append ? get().pagination.page + 1 : 1;
      const paginatedFilters = { ...filters, page };
      const response = await apiService.getMenu(paginatedFilters);
      
      // Log the raw response to debug API structure
      console.log('Menu API Response:', response);
      
      let menu: MenuItem[] = [];
      
      // Handle different API response formats
      if (Array.isArray(response)) {
        menu = response;
      } else if (response && typeof response === 'object') {
        // Handle paginated response with data property
        if (Array.isArray(response.data)) {
          menu = response.data;
        } else if (Array.isArray(response.results)) {
          menu = response.results;
        } else {
          console.warn('Unexpected menu API response format:', response);
          menu = [];
        }
      }
      
      // Validate and clean menu items
      const validMenu = menu.filter(item => {
        if (!item || typeof item !== 'object' || !item.id) {
          console.warn('Invalid menu item filtered out:', item);
          return false;
        }
        return true;
      }).map(item => ({
        ...item,
        // Ensure price and mrp are properly handled
        price: typeof item.price === 'string' ? item.price : String(item.price || 0),
        mrp: item.mrp ? (typeof item.mrp === 'string' ? item.mrp : String(item.mrp)) : undefined,
      }));
      
      // Handle pagination metadata
      const hasNext = validMenu.length === (paginatedFilters.per_page || 20);
      
      set(state => ({
        menu: append ? [...state.menu, ...validMenu] : validMenu,
        isLoading: false,
        pagination: {
          page,
          hasNext,
          total: append ? state.pagination.total + validMenu.length : validMenu.length,
        }
      }));
      
      return { hasNext };
    } catch (error) {
      console.error('Menu fetch error:', error);
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch menu', isLoading: false });
      }
      return { hasNext: false };
    }
  },
  
  fetchMenuItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const item = await apiService.getMenuItem(id);
      set({ currentItem: item, isLoading: false });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to fetch menu item', isLoading: false });
      }
    }
  },
  
  createMenuItem: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newItem = await apiService.createMenuItem(data);
      set((state) => ({
        menu: [...state.menu, newItem],
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to create menu item', isLoading: false });
      }
    }
  },
  
  updateMenuItem: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      console.log('Updating menu item:', id, data);
      const updatedItem = await apiService.updateMenuItem(id, data);
      console.log('Updated menu item response:', updatedItem);
      
      // Ensure the updated item has proper format
      const formattedItem = {
        ...updatedItem,
        price: typeof updatedItem.price === 'string' ? updatedItem.price : String(updatedItem.price || 0),
        mrp: updatedItem.mrp ? (typeof updatedItem.mrp === 'string' ? updatedItem.mrp : String(updatedItem.mrp)) : undefined,
      };
      
      set((state) => ({
        menu: state.menu.map((item) => 
          item.id === parseInt(id) ? formattedItem : item
        ),
        currentItem: state.currentItem?.id === parseInt(id) ? formattedItem : state.currentItem,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Menu update error:', error);
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to update menu item', isLoading: false });
      }
      throw error; // Re-throw to handle in UI
    }
  },
  
  deleteMenuItem: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteMenuItem(id);
      set((state) => ({
        menu: state.menu.filter((item) => item.id !== parseInt(id)),
        currentItem: state.currentItem?.id === parseInt(id) ? null : state.currentItem,
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to delete menu item', isLoading: false });
      }
    }
  },
  
  toggleMenuItemVisibility: async (id, visible) => {
    set({ isLoading: true, error: null });
    try {
      const updatedItem = await apiService.toggleMenuItemVisibility(id, visible);
      set((state) => ({
        menu: state.menu.map((item) => 
          item.id === parseInt(id) ? updatedItem : item
        ),
        currentItem: state.currentItem?.id === parseInt(id) ? updatedItem : state.currentItem,
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to toggle menu item visibility', isLoading: false });
      }
    }
  },
  
  fetchCategories: async () => {
    try {
      const categories = await apiService.getMenuCategories();
      set({ categories });
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message });
      } else {
        set({ error: 'Failed to fetch categories' });
      }
    }
  },
  
  fetchMenuStats: async () => {
    // Menu stats removed - not needed
    console.log('Menu stats feature disabled');
  },
  
  clearError: () => {
    set({ error: null });
  },
  
  refreshMenu: async () => {
    await get().fetchMenu();
  },
  
  loadMoreMenu: async () => {
    if (get().pagination.hasNext && !get().isLoading) {
      await get().fetchMenu(undefined, true);
    }
  },
  
  refreshAll: async () => {
    // Fetch all data in parallel to avoid duplicate calls
    await Promise.all([
      get().fetchMenu(),
      get().fetchCategories(),
    ]);
  },
}));
