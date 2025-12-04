
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number; // For discount calculation
  category: string;
  imageUrl: string;
  images?: string[]; // Gallery
  rating: number;
  stock: number;
  hidden: boolean;
  // New fields for advanced filtering
  brand: string;
  color: string;
  condition: 'new' | 'used';
  deliveryType: 'standard' | 'express' | 'free';
  isProSeller: boolean;
  isPromo: boolean;
  isMemberOffer: boolean;
  sourceUrl?: string;
  // Multi-vendor fields
  sellerId: string;
  sellerName: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'seller' | 'admin' | 'courier';
  storeName?: string;
  vehicleType?: 'bike' | 'car' | 'van'; // Specific for couriers
  profileImage?: string; // URL to profile photo
  
  // Verification & Profile
  isProfileComplete: boolean;
  isVerified: boolean;
}

export type DeliveryStatus = 'pending_processing' | 'ready_for_pickup' | 'courier_assigned' | 'picked_up' | 'delivered';

export interface GeoCoordinate {
  lat: number;
  lng: number;
  address: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  items: CartItem[];
  total: number;
  date: number;
  requirements?: string;
  paymentMethod?: 'cash' | 'fedapay';
  paymentPhoneNumber?: string; 
  transactionId?: string;
  
  // Delivery Logistics
  status: DeliveryStatus; 
  deliveryPin: string; // Code Customer gives to Courier to confirm delivery (Secret until approval/delivery)
  pickupPin: string; // Code Courier/Seller use to handshake at pickup
  
  // Locations & Contact
  pickupLocation: GeoCoordinate;
  deliveryLocation: GeoCoordinate;
  sellerPhone: string; // For Courier to contact Seller
  
  // Courier Info
  courierId?: string;
  courierName?: string;
  courierVehicle?: string;
  courierPhone?: string;
  isCourierApproved: boolean; // NEW: Customer must approve courier before pickup
  
  // Live Tracking
  currentCourierLat?: number;
  currentCourierLng?: number;
}

export interface NotificationRequest {
  id: string;
  productId: string;
  productName: string;
  email: string;
  requirements: string;
  timestamp: number;
  status: 'pending' | 'notified';
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
  storeQuery: string; // New field for searching by store name
  category: string; // specific category selection
  sort: SortField;
  order: SortOrder;
  page: number;
  limit: number;
  showHidden?: boolean;
  // Advanced Filters
  priceRange: string[];
  brands: string[];
  colors: string[];
  condition: string[];
  delivery: string[];
  minRating: number | null;
  specialOffers: string[];
  isProSeller?: boolean;
  // Seller Filter
  sellerId?: string;
}

export interface FetchResponse {
  data: Product[];
  hiddenMatches: Product[]; 
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: number;
}