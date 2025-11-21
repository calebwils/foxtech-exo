import { Product } from './types';

// Helper to generate deterministic mock data
const generateProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Drones', 'Wearables', 'Smart Home', 'Photography'];
  const adjectives = ['Pro', 'Ultra', 'Max', 'Lite', 'X', 'Air', 'Nano', 'Quantum'];
  const nouns = ['Drone', 'Camera', 'Watch', 'Sensor', 'Hub', 'Display', 'Module', 'Bot'];

  return Array.from({ length: count }).map((_, index) => {
    const category = categories[index % categories.length];
    const adj = adjectives[index % adjectives.length];
    const noun = nouns[(index * 2) % nouns.length];
    
    // Use consistent random-like logic for deterministic generation
    const priceBase = ((index * 17) % 900) + 50; 
    
    return {
      id: `FX-${1000 + index}`,
      title: `Foxtech ${adj} ${noun} ${index + 1}`,
      description: `High-performance ${category.toLowerCase()} device featuring advanced ${adj.toLowerCase()} technology. Perfect for professionals and enthusiasts alike.`,
      price: priceBase + 0.99,
      category: category,
      imageUrl: `https://picsum.photos/400/300?random=${index}`,
      rating: 3 + ((index % 20) / 10),
      stock: (index * 3) % 50
    };
  });
};

export const MOCK_PRODUCTS: Product[] = generateProducts(120); // 120 items to ensure pagination is needed

export const CATEGORIES = ['All', 'Electronics', 'Drones', 'Wearables', 'Smart Home', 'Photography'];