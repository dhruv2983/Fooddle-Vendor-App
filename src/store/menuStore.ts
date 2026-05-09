import { create } from 'zustand';
import { apiService, ApiError } from '@/api/api';
import { MenuItem, MenuVariant, CreateMenuItemRequest, UpdateMenuItemRequest, UpdateVariantRequest, MenuCategory } from '@/types/menu';
import { MenuFilters } from '@/config/api';
import { log } from '@/utils/logger';

interface MenuState {
  menu: MenuItem[];
  categories: MenuCategory[];
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
  updateVariant: (productId: string, variantId: string, data: UpdateVariantRequest) => Promise<void>;
  toggleVariantVisibility: (productId: string, variantId: string, is_available: boolean) => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearError: () => void;
  refreshMenu: () => Promise<void>;
  loadMoreMenu: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menu: [],
  categories: [],
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
      log.debug('Menu API Response:', response);
      
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
          log.warn('Unexpected menu API response format:', response);
          menu = [];
        }
      }
      
      // Validate and clean products
      const validMenu = menu.filter(item => {
        if (!item || typeof item !== 'object' || !item.id) {
          log.warn('Invalid menu item filtered out:', item);
          return false;
        }
        return true;
      }).map(item => ({
        ...item,
        variants: Array.isArray(item.variants) ? item.variants : [],
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
      log.error('Menu fetch error', error);
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
      log.debug('Updating menu item:', id, data);
      const updatedItem = await apiService.updateMenuItem(id, data);
      log.debug('Updated menu item response:', updatedItem);
      
      // Ensure the updated item has proper format
      set((state) => ({
        menu: state.menu.map((item) =>
          item.id === parseInt(id) ? { ...updatedItem, variants: Array.isArray(updatedItem.variants) ? updatedItem.variants : item.variants } : item
        ),
        currentItem: state.currentItem?.id === parseInt(id) ? updatedItem : state.currentItem,
        isLoading: false,
      }));
    } catch (error) {
      log.error('Menu update error', error);
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
  
  updateVariant: async (productId, variantId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedVariant = await apiService.updateVariant(variantId, data);
      set((state) => ({
        menu: state.menu.map((product) =>
          product.id === parseInt(productId)
            ? { ...product, variants: product.variants.map(v => v.id === parseInt(variantId) ? updatedVariant : v) }
            : product
        ),
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to update variant', isLoading: false });
      }
      throw error;
    }
  },

  toggleVariantVisibility: async (productId, variantId, is_available) => {
    set({ isLoading: true, error: null });
    try {
      const updatedVariant = await apiService.toggleVariantVisibility(productId, variantId, is_available);
      set((state) => ({
        menu: state.menu.map((product) =>
          product.id === parseInt(productId)
            ? { ...product, variants: product.variants.map(v => v.id === parseInt(variantId) ? updatedVariant : v) }
            : product
        ),
        isLoading: false,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: 'Failed to toggle variant visibility', isLoading: false });
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
    await get().fetchMenu();
  },
}));
