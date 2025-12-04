
import { Product } from './types';

export const CATEGORIES = [
  'All', 
  'Informatique', 
  'Bagage - sac', 
  'Hygiène et beauté', 
  'Déco - linge', 
  'Auto - moto'
];

const BRANDS = ['TechGiant', 'IzitoGear', 'LuxeLife', 'AutoPro', 'SoundMax', 'Visionary', 'Samsung'];
const COLORS = ['black', 'white', 'blue', 'red', 'silver', 'gold'];

// Custom Product from Amazon Request
const CUSTOM_PRODUCT: Product = {
  id: 'IZ-PROJ-SAM-001',
  title: "Samsung The Freestyle 2nd Gen - Smart Portable Projector (2023 Edition)",
  description: "Transform your world into a screen with the Izitobuy Edition of The Freestyle 2nd Gen. This compact, smart projector delivers 1080p Full HD resolution with 360° premium sound. Features instant setup, Gaming Hub, IoT Hub, and complete smart TV capabilities (Tizen 7.0). Perfect for gaming, movies, or outdoor entertainment on a screen up to 100 inches.",
  price: 439.00,
  originalPrice: 484.04,
  category: 'Informatique',
  imageUrl: "https://m.media-amazon.com/images/I/41yv7DX8NeL._AC_SX679_.jpg",
  images: [
    "https://m.media-amazon.com/images/I/41yv7DX8NeL._AC_SX679_.jpg",
    "https://m.media-amazon.com/images/I/31D0SuLf-kL.jpg", // High res strip
    "https://m.media-amazon.com/images/I/313fXamM+cL.jpg",
    "https://m.media-amazon.com/images/I/31Guq8Ca2gL.jpg",
    "https://m.media-amazon.com/images/I/31OKfymV7aL.jpg",
    "https://m.media-amazon.com/images/I/21tMPGKkKWL.jpg",
    "https://m.media-amazon.com/images/I/310ec8ms2bL.jpg"
  ],
  rating: 4.1,
  stock: 18,
  hidden: false,
  brand: 'Samsung',
  color: 'white',
  condition: 'new',
  deliveryType: 'free',
  isProSeller: true,
  isPromo: true,
  isMemberOffer: false,
  sellerId: 'u-seller', // Assigned to the main Habas Store
  sellerName: 'Habas Store'
};

// Helper to generate deterministic mock data
const generateProducts = (count: number): Product[] => {
  const adjectives = ['Pro', 'Ultra', 'Max', 'Lite', 'X', 'Air', 'Nano', 'Quantum'];
  const nouns = ['Drone', 'Camera', 'Watch', 'Sensor', 'Hub', 'Display', 'Module', 'Bot'];
  const sellerNames = ['TechWorld', 'GadgetHub', 'BestDeals', 'ElectroCity', 'MyStore'];

  return Array.from({ length: count }).map((_, index) => {
    // Skip 'All' for random assignment
    const category = CATEGORIES[1 + (index % (CATEGORIES.length - 1))];
    const adj = adjectives[index % adjectives.length];
    const noun = nouns[(index * 2) % nouns.length];
    
    // Use consistent random-like logic for deterministic generation
    const priceBase = ((index * 17) % 900) + 15; 
    const isPromo = index % 7 === 0;
    const price = priceBase + 0.99;
    const originalPrice = isPromo ? price * 1.25 : undefined; // 25% markup for promo items
    
    // Assign some products to the "current user" (u-seller) so the dashboard isn't empty
    const isMyProduct = index % 5 === 0; 
    
    return {
      id: `IZ-${1000 + index}`,
      title: `Izito ${adj} ${noun} ${index + 1}`,
      description: `Experience the pinnacle of ${category.toLowerCase()} innovation. This High-performance ${adj.toLowerCase()} ${noun} features advanced AI integration, durable materials, and industry-leading battery life. Perfect for professionals and enthusiasts alike.`,
      price: price,
      originalPrice: originalPrice,
      category: category,
      imageUrl: `https://picsum.photos/600/400?random=${index}`,
      images: [
        `https://picsum.photos/600/400?random=${index}`,
        `https://picsum.photos/600/400?random=${index + 100}`,
        `https://picsum.photos/600/400?random=${index + 200}`,
        `https://picsum.photos/600/400?random=${index + 300}`,
      ],
      rating: 1 + ((index * 7) % 40) / 10, // 1.0 to 5.0
      stock: (index * 3) % 50,
      hidden: false,
      
      // New Mock Data
      brand: BRANDS[index % BRANDS.length],
      color: COLORS[index % COLORS.length],
      condition: index % 5 === 0 ? 'used' : 'new', // 20% used
      deliveryType: index % 3 === 0 ? 'free' : index % 3 === 1 ? 'express' : 'standard',
      isProSeller: index % 2 === 0,
      isPromo: isPromo,
      isMemberOffer: index % 9 === 0,
      sellerId: isMyProduct ? 'u-seller' : `seller-${index % 5}`,
      sellerName: isMyProduct ? 'Habas Store' : sellerNames[index % sellerNames.length]
    };
  });
};

export const MOCK_PRODUCTS: Product[] = [
  CUSTOM_PRODUCT, // Add custom product at the top
  ...generateProducts(120)
]; // 120 items to ensure pagination is needed
