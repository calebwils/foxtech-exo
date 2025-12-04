
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, ProductFilters, SortField, SortOrder, FetchResponse, NotificationRequest, Order, CartItem } from '../types';
import { 
  fetchProducts, 
  addProduct as apiAddProduct, 
  updateProduct as apiUpdateProduct, 
  saveNotificationRequest,
  getNotifications as apiGetNotifications,
  updateNotificationStatus as apiUpdateNotificationStatus,
  getOrders as apiGetOrders,
  markOrderReady as apiDispatchOrder,
  createOrder as apiCreateOrder,
  shuffleProducts // Import shuffle function
} from '../services/productService';
import { useAuth } from '../contexts/AuthContext';

interface UseProductsReturn {
  products: Product[];
  hiddenMatches: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  filters: ProductFilters;
  notifications: NotificationRequest[];
  notificationsLoading: boolean;
  orders: Order[];
  ordersLoading: boolean;
  setQuery: (q: string) => void;
  setStoreQuery: (q: string) => void;
  setCategory: (category: string) => void;
  setSort: (field: SortField, order: SortOrder) => void;
  setPage: (page: number) => void;
  setShowHidden: (show: boolean) => void;
  setSellerFilter: (sellerId: string | undefined) => void;
  toggleFilter: (type: keyof ProductFilters, value: string | number) => void;
  refresh: () => void;
  resetFilters: () => void;
  addProduct: (productData: any) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  submitNotification: (productId: string, productName: string, email: string, requirements: string) => Promise<void>;
  loadNotifications: () => Promise<void>;
  markNotificationAsSent: (id: string) => Promise<void>;
  loadOrders: () => Promise<void>;
  handleDispatchOrder: (id: string) => Promise<void>;
  checkout: (customerName: string, email: string, items: CartItem[], total: number, requirements?: string, paymentMethod?: string, paymentPhoneNumber?: string) => Promise<void>;
}

const DEFAULT_FILTERS: ProductFilters = {
  q: '',
  storeQuery: '',
  category: 'All',
  sort: SortField.TITLE, // Will be overridden by random shuffle initially if desired
  order: SortOrder.ASC,
  page: 1,
  limit: 12,
  showHidden: false,
  priceRange: [],
  brands: [],
  colors: [],
  condition: [],
  delivery: [],
  minRating: null,
  specialOffers: [],
  isProSeller: false,
  sellerId: undefined
};

export const useProducts = (): UseProductsReturn => {
  const { user } = useAuth();
  const [filters, setFiltersState] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [hiddenMatches, setHiddenMatches] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<NotificationRequest[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  
  // Track if we should append or replace
  const isMounted = useRef(false);

  // Initial Shuffle on Mount
  useEffect(() => {
    shuffleProducts();
  }, []);

  const loadData = useCallback(async (isLoadMore: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response: FetchResponse = await fetchProducts(filters);
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...response.data]);
        // Deduplicate hidden matches if needed, though usually they come from search
        setHiddenMatches(response.hiddenMatches || []); 
      } else {
        setProducts(response.data);
        setHiddenMatches(response.hiddenMatches || []);
      }
      
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Effect to load data when filters change
  useEffect(() => {
    // Determine if this is a "Load More" (page > 1) or a "New Filter" (page === 1)
    const isLoadMore = filters.page > 1;
    loadData(isLoadMore);
  }, [filters, loadData]); 

  const setQuery = useCallback((q: string) => {
    setFiltersState((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const setStoreQuery = useCallback((storeQuery: string) => {
    setFiltersState((prev) => ({ ...prev, storeQuery, page: 1 }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFiltersState((prev) => ({ ...prev, category, page: 1 }));
  }, []);

  const setSort = useCallback((field: SortField, order: SortOrder) => {
    setFiltersState((prev) => ({ ...prev, sort: field, order, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const setShowHidden = useCallback((show: boolean) => {
    setFiltersState((prev) => ({ ...prev, showHidden: show, page: 1 }));
  }, []);

  const setSellerFilter = useCallback((sellerId: string | undefined) => {
    setFiltersState((prev) => ({ ...prev, sellerId, page: 1 }));
  }, []);

  const toggleFilter = useCallback((type: keyof ProductFilters, value: string | number) => {
    setFiltersState((prev) => {
      const current = prev[type];
      if (Array.isArray(current)) {
        // Toggle in array
        const val = String(value);
        const exists = current.includes(val);
        return {
          ...prev,
          page: 1,
          [type]: exists 
            ? current.filter(item => item !== val)
            : [...current, val]
        };
      } else if (type === 'minRating') {
         return { ...prev, page: 1, minRating: value as number };
      }
      return prev;
    });
  }, []);

  const resetFilters = useCallback(() => {
    // When resetting, we shuffle again to give a fresh look
    shuffleProducts();
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const refresh = useCallback(() => {
    // Explicit refresh should also shuffle to give new content
    if (filters.page === 1) {
        shuffleProducts();
    }
    loadData(filters.page > 1);
  }, [loadData, filters.page]);

  // Pass-through functions for API
  const addProduct = async (data: any) => { 
    await apiAddProduct({ 
      ...data, 
      sellerId: user?.id, 
      sellerName: user?.storeName || user?.name 
    }); 
    loadData(false); 
  };
  
  const updateProduct = async (p: Product) => { await apiUpdateProduct(p); loadData(false); };
  const submitNotification = async (pId: string, pName: string, email: string, req: string) => { await saveNotificationRequest({ productId: pId, productName: pName, email, requirements: req }); };
  const loadNotifications = async () => { setNotificationsLoading(true); setNotifications(await apiGetNotifications()); setNotificationsLoading(false); };
  const markNotificationAsSent = async (id: string) => { await apiUpdateNotificationStatus(id, 'notified'); loadNotifications(); };
  const loadOrders = async () => { setOrdersLoading(true); setOrders(await apiGetOrders()); setOrdersLoading(false); };
  const handleDispatchOrder = async (id: string) => { await apiDispatchOrder(id); loadOrders(); };
  const checkout = async (name: string, email: string, items: any[], total: number, req?: string, paymentMethod?: string, paymentPhoneNumber?: string) => { 
    await apiCreateOrder({ 
      customerName: name, 
      email, 
      items, 
      total, 
      requirements: req,
      paymentMethod,
      paymentPhoneNumber 
    }); 
  };

  return {
    products, hiddenMatches, loading, error, total, totalPages, filters,
    notifications, notificationsLoading, orders, ordersLoading,
    setQuery, setStoreQuery, setCategory, setSort, setPage, setShowHidden, setSellerFilter, toggleFilter, resetFilters,
    refresh, addProduct, updateProduct, submitNotification, loadNotifications,
    markNotificationAsSent, loadOrders, handleDispatchOrder, checkout
  };
};
