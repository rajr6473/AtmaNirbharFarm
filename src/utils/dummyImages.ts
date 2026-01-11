/**
 * Dummy/Fallback images for categories and products
 * These are used when API doesn't provide images
 */

// Category-specific dummy images from Unsplash
export const categoryDummyImages: Record<string, string> = {
  // Dairy & Milk Products
  'dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
  'dairy & milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
  'dairy & milk products': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',

  // Vegetables
  'vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  'veggies': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  'fresh vegetables': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',

  // Fruits
  'fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
  'fresh fruits': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',

  // Organic
  'organic': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
  'organic products': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',

  // Grains & Cereals
  'grains': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  'cereals': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',

  // Spices
  'spices': 'https://images.unsplash.com/photo-1596040033229-a0b13b1b0d1a?w=400',
  'herbs': 'https://images.unsplash.com/photo-1596040033229-a0b13b1b0d1a?w=400',

  // Bakery
  'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
  'bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',

  // Beverages
  'beverages': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  'drinks': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
  'juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',

  // Snacks
  'snacks': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
};

// Product-specific dummy images
export const productDummyImages: Record<string, string> = {
  // Milk products
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400',
  'whole milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',
  'skim milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400',

  // Dairy products
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  'curd': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400',
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
  'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400',
  'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',

  // Vegetables
  'tomato': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400',
  'onion': 'https://images.unsplash.com/photo-1587049352846-4a222e784129?w=400',
  'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
  'cabbage': 'https://images.unsplash.com/photo-1594282040026-d3dbe4e46f19?w=400',
  'spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
  'broccoli': 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400',

  // Fruits
  'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
  'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400',
  'orange': 'https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400',
  'mango': 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=400',
  'grape': 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=400',
  'strawberry': 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400',

  // Grains
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400',
  'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400',

  // Default fallback
  'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
};

/**
 * Get dummy image for a category based on its name
 */
export const getCategoryDummyImage = (categoryName: string): string => {
  if (!categoryName) return categoryDummyImages['default'];

  const normalizedName = categoryName.toLowerCase().trim();

  // Try exact match first
  if (categoryDummyImages[normalizedName]) {
    return categoryDummyImages[normalizedName];
  }

  // Try partial match
  for (const [key, value] of Object.entries(categoryDummyImages)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }

  return categoryDummyImages['default'];
};

/**
 * Get dummy image for a product based on its name
 */
export const getProductDummyImage = (productName: string): string => {
  if (!productName) return productDummyImages['default'];

  const normalizedName = productName.toLowerCase().trim();

  // Try exact match first
  if (productDummyImages[normalizedName]) {
    return productDummyImages[normalizedName];
  }

  // Try partial match (check if product name contains any keyword)
  for (const [key, value] of Object.entries(productDummyImages)) {
    if (normalizedName.includes(key)) {
      return value;
    }
  }

  return productDummyImages['default'];
};

/**
 * Get image URL with fallback
 * Returns API image if available, otherwise returns dummy image
 */
export const getImageWithFallback = (
  apiImage: string | undefined | null,
  fallbackImage: string
): string => {
  // Check if API image exists and is valid
  if (apiImage && apiImage.trim() !== '') {
    return apiImage;
  }

  return fallbackImage;
};
