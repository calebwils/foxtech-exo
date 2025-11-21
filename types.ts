export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  rating: number;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export enum SortField {
  TITLE = 'title',
  PRICE = 'price',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface ProductFilters {
  q: string;
  category: string;
  sort: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export interface FetchResponse {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: number;
}