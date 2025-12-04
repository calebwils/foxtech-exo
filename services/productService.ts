
import { Product, ProductFilters, FetchResponse, SortField, SortOrder, NotificationRequest, Order, CartItem } from '../types';
import { MOCK_PRODUCTS } from '../constants';

// Internal mutable copy for shuffling without affecting the const export
let PRODUCTS_DB = [...MOCK_PRODUCTS];

/**
 * Shuffles the product database to simulate a fresh feed
 * Called when the app loads or user refreshes the storefront
 */
export const shuffleProducts = () => {
  for (let i = PRODUCTS_DB.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [PRODUCTS_DB[i], PRODUCTS_DB[j]] = [PRODUCTS_DB[j], PRODUCTS_DB[i]];
  }
};

// Mock storage for notifications
const MOCK_NOTIFICATIONS: NotificationRequest[] = [
  {
    id: 'REQ-8821',
    productId: 'IZ-1042',
    productName: 'Izito Ultra Drone',
    email: 'enterprise@logistics.com',
    requirements: 'Looking for 10 units for a fleet upgrade.',
    timestamp: Date.now() - 172800000, 
    status: 'pending'
  }
];

// Mock Orders with Logistics Data - Updated Locations for Route Testing
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-7701',
    customerName: 'Alice Freeman',
    email: 'alice.f@example.com',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 1 } as CartItem,
      { ...MOCK_PRODUCTS[2], quantity: 2 } as CartItem
    ],
    total: MOCK_PRODUCTS[0].price + (MOCK_PRODUCTS[2].price * 2),
    status: 'ready_for_pickup', 
    date: Date.now() - 3600000, 
    requirements: 'Fragile. Please handle with care.',
    paymentMethod: 'cash',
    deliveryPin: '4592', 
    pickupPin: '9921',
    sellerPhone: '+33 6 12 34 56 78',
    pickupLocation: {
      lat: 48.8566,
      lng: 2.3522,
      address: '12 Avenue de la Tech, Paris'
    },
    deliveryLocation: {
      lat: 48.8606,
      lng: 2.3376,
      address: '88 Rue de Rivoli, Paris'
    },
    isCourierApproved: false
  },
  {
    id: 'ORD-7702',
    customerName: 'Bob Wilson',
    email: 'bob.w@test.com',
    items: [
      { ...MOCK_PRODUCTS[4], quantity: 1 } as CartItem
    ],
    total: MOCK_PRODUCTS[4].price,
    status: 'picked_up', // Currently in transit
    date: Date.now() - 7200000,
    paymentMethod: 'fedapay',
    deliveryPin: '1234',
    pickupPin: '8812',
    sellerPhone: '+33 6 98 76 54 32',
    pickupLocation: {
      lat: 48.8737,
      lng: 2.3315,
      address: '45 Blvd Haussmann, Paris'
    },
    deliveryLocation: {
      lat: 48.8556,
      lng: 2.3065,
      address: '12 Rue Cler, Paris'
    },
    courierId: 'u-courier',
    courierName: 'Mike Delivery',
    courierVehicle: 'bike',
    currentCourierLat: 48.8650, // Somewhere between pickup and delivery
    currentCourierLng: 2.3200,
    isCourierApproved: true // Already processed
  },
  {
    id: 'ORD-7703',
    customerName: 'Charlie Davis',
    email: 'charlie@example.com',
    items: [
      { ...MOCK_PRODUCTS[5], quantity: 1 } as CartItem
    ],
    total: MOCK_PRODUCTS[5].price,
    status: 'ready_for_pickup', 
    date: Date.now() - 1800000, 
    requirements: '',
    paymentMethod: 'cash',
    deliveryPin: '9090', 
    pickupPin: '1122',
    sellerPhone: '+33 6 55 44 33 22',
    pickupLocation: {
      lat: 45.7640,
      lng: 4.8357,
      address: '10 Rue de la République, Lyon'
    },
    deliveryLocation: {
      lat: 45.7500,
      lng: 4.8500,
      address: '5 Place Bellecour, Lyon'
    },
    isCourierApproved: false
  }
];

/**
 * Simulates a backend API call with latency, filtering, sorting, and pagination.
 */
export const fetchProducts = async (filters: ProductFilters): Promise<FetchResponse> => {
  // Simulate network latency (faster for infinite scroll feel)
  const latency = Math.floor(Math.random() * 200) + 100;
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Use the internal shuffled/mutable DB
  let allMatches = [...PRODUCTS_DB];
  let hiddenMatches: Product[] = [];

  // --- SELLER FILTER (New) ---
  if (filters.sellerId) {
    allMatches = allMatches.filter(p => p.sellerId === filters.sellerId);
  }

  // --- STORE SEARCH (New) ---
  if (filters.storeQuery) {
    const storeQ = filters.storeQuery.toLowerCase();
    allMatches = allMatches.filter(p => p.sellerName.toLowerCase().includes(storeQ));
  }

  // 1. Search (Full text)
  if (filters.q) {
    const query = filters.q.toLowerCase();
    allMatches = allMatches.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
    );
  }

  // 2. Visibility
  let visibleResults = allMatches;
  if (!filters.showHidden) {
    visibleResults = allMatches.filter((p) => !p.hidden);
    if (filters.q) {
      hiddenMatches = allMatches.filter((p) => p.hidden);
    }
  }

  // 3. Category Filter
  if (filters.category && filters.category !== 'All') {
    visibleResults = visibleResults.filter((p) => p.category === filters.category);
  }

  // 4. Advanced Filters
  
  // Price Ranges
  if (filters.priceRange && filters.priceRange.length > 0) {
    visibleResults = visibleResults.filter(p => {
      return filters.priceRange.some(range => {
        if (range === '<10') return p.price < 10;
        if (range === '10-20') return p.price >= 10 && p.price <= 20;
        if (range === '20-50') return p.price >= 20 && p.price <= 50;
        if (range === '50-100') return p.price >= 50 && p.price <= 100;
        if (range === '100-200') return p.price >= 100 && p.price <= 200;
        if (range === '500-1000') return p.price >= 500 && p.price <= 1000;
        return false;
      });
    });
  }

  // Brands
  if (filters.brands && filters.brands.length > 0) {
    visibleResults = visibleResults.filter(p => filters.brands.includes(p.brand));
  }

  // Conditions
  if (filters.condition && filters.condition.length > 0) {
    visibleResults = visibleResults.filter(p => filters.condition.includes(p.condition));
  }

  // Ratings
  if (filters.minRating) {
    visibleResults = visibleResults.filter(p => p.rating >= filters.minRating!);
  }

  // Delivery
  if (filters.delivery && filters.delivery.length > 0) {
    visibleResults = visibleResults.filter(p => {
      if (filters.delivery.includes('free') && p.deliveryType === 'free') return true;
      if (filters.delivery.includes('express') && p.deliveryType === 'express') return true;
      // Mocking "Expédié par Izitobuy" as standard
      if (filters.delivery.includes('standard') && p.deliveryType === 'standard') return true; 
      return false;
    });
  }

  // Special Offers
  if (filters.specialOffers && filters.specialOffers.length > 0) {
    visibleResults = visibleResults.filter(p => {
      if (filters.specialOffers.includes('promo') && p.isPromo) return true;
      if (filters.specialOffers.includes('member') && p.isMemberOffer) return true;
      return false;
    });
  }

  // 5. Sorting
  // We only sort if it's NOT default/random, because PRODUCTS_DB is already shuffled
  if (filters.sort === SortField.PRICE || filters.sort === SortField.TITLE) {
    visibleResults.sort((a, b) => {
      let comparison = 0;
      if (filters.sort === SortField.PRICE) {
        comparison = a.price - b.price;
      } else {
        comparison = a.title.localeCompare(b.title);
      }
      return filters.order === SortOrder.ASC ? comparison : -comparison;
    });
  }

  // 6. Pagination
  const total = visibleResults.length;
  const totalPages = Math.ceil(total / filters.limit);
  const startIndex = (filters.page - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const paginatedData = visibleResults.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    hiddenMatches: hiddenMatches,
    total,
    page: filters.page,
    limit: filters.limit,
    totalPages,
  };
};

// ... Rest of CRUD operations remain similar but simpler for this context
export const addProduct = async (productData: any) => {
  const newProduct: Product = {
    id: `IZ-${Date.now()}`,
    ...productData,
    // Defaults if not provided by form
    rating: 0,
    stock: 50,
    hidden: false,
    brand: productData.brand || 'Generic',
    color: productData.color || 'black',
    condition: productData.condition || 'new',
    deliveryType: 'standard',
    isProSeller: true,
    isPromo: false,
    isMemberOffer: false,
    sellerId: productData.sellerId || 'u-seller', // Changed from u-123
    sellerName: productData.sellerName || 'Habas Store' // Changed from My Store
  };
  PRODUCTS_DB.unshift(newProduct);
  return newProduct;
};

export const updateProduct = async (product: Product) => {
  const index = PRODUCTS_DB.findIndex(p => p.id === product.id);
  if (index !== -1) {
    PRODUCTS_DB[index] = product;
  }
};

// Helper functions for CRM and Orders
export const saveNotificationRequest = async (req: any) => {
   MOCK_NOTIFICATIONS.unshift({ ...req, id: `N-${Date.now()}`, timestamp: Date.now(), status: 'pending' });
};

export const getNotifications = async () => MOCK_NOTIFICATIONS;
export const updateNotificationStatus = async (id: string, status: any) => {
    const n = MOCK_NOTIFICATIONS.find(x => x.id === id);
    if (n) n.status = status;
};

export const getOrders = async () => MOCK_ORDERS;

// Seller Action: Mark Ready for Pickup
export const markOrderReady = async (id: string) => {
    const o = MOCK_ORDERS.find(x => x.id === id);
    if (o) o.status = 'ready_for_pickup';
};

export const createOrder = async (data: any) => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // NEW: Orders start as unapproved for courier pickup
    MOCK_ORDERS.unshift({ 
        ...data, 
        id: `ORD-${Date.now().toString().slice(-4)}`, 
        status: 'pending_processing', 
        date: Date.now(),
        deliveryPin: pin, // Secret PIN for customer
        pickupPin: pickupPin, // PIN for courier-seller handshake
        sellerPhone: '+33 1 99 88 77 66',
        pickupLocation: {
            lat: 48.8566,
            lng: 2.3522,
            address: '12 Avenue de la Tech, Paris (Warehouse)'
        },
        deliveryLocation: {
            lat: 48.8606,
            lng: 2.3376,
            address: '15 Rue de la Paix, Paris'
        },
        isCourierApproved: false // Initial state
    });
    return MOCK_ORDERS[0];
};

// --- COURIER ACTIONS ---

// 1. Lookup Job by Code (Order ID) to preview - kept for reference but UI changed
export const previewJobByCode = async (code: string) => {
    // Simulate scan delay
    await new Promise(r => setTimeout(r, 500));
    return MOCK_ORDERS.find(o => o.id === code && o.status === 'ready_for_pickup');
};

// 2. Courier accepts a job
export const acceptDeliveryJob = async (orderId: string, courier: { id: string, name: string, vehicle: string }) => {
    const o = MOCK_ORDERS.find(x => x.id === orderId);
    if (o) {
        o.status = 'courier_assigned';
        o.courierId = courier.id;
        o.courierName = courier.name;
        o.courierVehicle = courier.vehicle;
        o.isCourierApproved = false; // Reset/Ensure false until customer approves
        
        // Initialize Courier Position at Pickup
        o.currentCourierLat = o.pickupLocation.lat - 0.01; 
        o.currentCourierLng = o.pickupLocation.lng - 0.01;
    }
};

// NEW: Customer approves the courier
export const approveCourierJob = async (orderId: string) => {
    const o = MOCK_ORDERS.find(x => x.id === orderId);
    if (o && o.status === 'courier_assigned') {
        o.isCourierApproved = true;
        // In a real app, this would trigger a push notification to the Seller
        console.log(`Notification sent to Seller: Courier ${o.courierName} approved by Customer for Order ${o.id}`);
    }
};

// 3. Courier picks up item (Handshake with Seller)
export const confirmPickup = async (orderId: string) => {
    const o = MOCK_ORDERS.find(x => x.id === orderId);
    if (o) o.status = 'picked_up';
};

// 4. Courier delivers item (Handshake with Buyer)
export const completeDelivery = async (orderId: string, pinInput: string): Promise<boolean> => {
    const o = MOCK_ORDERS.find(x => x.id === orderId);
    if (o && o.deliveryPin === pinInput) {
        o.status = 'delivered';
        return true;
    }
    return false;
};

// 5. Update Courier Location (Simulation)
export const updateCourierPosition = async (orderId: string, lat: number, lng: number) => {
    const o = MOCK_ORDERS.find(x => x.id === orderId);
    if (o) {
        o.currentCourierLat = lat;
        o.currentCourierLng = lng;
    }
};