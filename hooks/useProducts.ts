import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters, SortField, SortOrder, FetchResponse } from '../types';
import { fetchProducts } from '../services/productService';

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  filters: ProductFilters;
  setQuery: (q: string) => void;
  setCategory: (category: string) => void;
  setSort: (field: SortField, order: SortOrder) => void;
  setPage: (page: number) => void;
  refresh: () => void;
}

const DEFAULT_FILTERS: ProductFilters = {
  q: '',
  category: 'All',
  sort: SortField.TITLE,
  order: SortOrder.ASC,
  page: 1,
  limit: 12, // Grid of 3x4 or 4x3
};

export const useProducts = (): UseProductsReturn => {
  const [filters, setFiltersState] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Execute the fetch
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: FetchResponse = await fetchProducts(filters);
      setProducts(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Effect triggers on filter changes
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // Strict dependency on filters object

  // State Setters - Reset page to 1 when filtering changes (Search, Category, Sort)
  
  const setQuery = useCallback((q: string) => {
    setFiltersState((prev) => ({ ...prev, q, page: 1 }));
  }, []);

  const setCategory = useCallback((category: string) => {
    setFiltersState((prev) => ({ ...prev, category, page: 1 }));
  }, []);

  const setSort = useCallback((field: SortField, order: SortOrder) => {
    setFiltersState((prev) => ({ ...prev, sort: field, order, page: 1 }));
  }, []);

  // Do NOT reset page to 1 when changing page
  const setPage = useCallback((page: number) => {
    setFiltersState((prev) => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    products,
    loading,
    error,
    total,
    totalPages,
    filters,
    setQuery,
    setCategory,
    setSort,
    setPage,
    refresh
  };
};