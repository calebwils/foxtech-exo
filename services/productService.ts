import { Product, ProductFilters, FetchResponse, SortField, SortOrder } from '../types';
import { MOCK_PRODUCTS } from '../constants';

/**
 * Simulates a backend API call with latency, filtering, sorting, and pagination.
 * This replaces the Next.js API route for this SPA environment.
 */
export const fetchProducts = async (filters: ProductFilters): Promise<FetchResponse> => {
  // Simulate network latency (300-800ms)
  const latency = Math.floor(Math.random() * 500) + 300;
  await new Promise((resolve) => setTimeout(resolve, latency));

  let result = [...MOCK_PRODUCTS];

  // 1. Search (Full text on title/description)
  if (filters.q) {
    const query = filters.q.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
    );
  }

  // 2. Category Filter
  if (filters.category && filters.category !== 'All') {
    result = result.filter((p) => p.category === filters.category);
  }

  // 3. Sorting
  result.sort((a, b) => {
    let comparison = 0;
    if (filters.sort === SortField.PRICE) {
      comparison = a.price - b.price;
    } else {
      // Title sort
      comparison = a.title.localeCompare(b.title);
    }
    return filters.order === SortOrder.ASC ? comparison : -comparison;
  });

  // 4. Pagination
  const total = result.length;
  const totalPages = Math.ceil(total / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const paginatedData = result.slice(startIndex, endIndex);

  // 5. Simulating potential error for robustness testing (very rare)
  if (Math.random() > 0.995) {
    throw new Error("Internal Server Error (Simulation)");
  }

  return {
    data: paginatedData,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
  };
};