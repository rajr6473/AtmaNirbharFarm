import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { colors, fonts, spacing, borderRadius } from '../theme';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price?: number | null;
  final_price?: number;
  selling_price?: number;
  discount_percentage?: number | string;
  is_discounted?: boolean;
  is_in_stock?: boolean;
  stock_status?: string;
  stock?: number;
  image?: string;
  images?: string[];
  image_url?: string;
  weight?: number | string;
  unit?: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const { cart, addToCart, increment, decrement } = useCart();
  const cartItem = cart.find((i: any) => i.id === product.id);

  // Get the display price (final price after discount)
  const getDisplayPrice = (): number => {
    return product.final_price || product.selling_price || product.discount_price || product.price;
  };

  // Get the original price for comparison
  const getOriginalPrice = (): number => {
    return product.price;
  };

  // Check if product has a discount
  const hasDiscount = (): boolean => {
    if (product.is_discounted) return true;
    const displayPrice = getDisplayPrice();
    const originalPrice = getOriginalPrice();
    return displayPrice < originalPrice;
  };

  // Get discount percentage
  const getDiscountPercent = (): string => {
    if (product.discount_percentage) {
      const percent = typeof product.discount_percentage === 'string'
        ? parseFloat(product.discount_percentage)
        : product.discount_percentage;
      return `${Math.round(percent)}% OFF`;
    }
    const displayPrice = getDisplayPrice();
    const originalPrice = getOriginalPrice();
    if (displayPrice < originalPrice) {
      const percent = ((originalPrice - displayPrice) / originalPrice) * 100;
      return `${Math.round(percent)}% OFF`;
    }
    return '';
  };

  // Check if product is in stock
  const isInStock = (): boolean => {
    if (product.is_in_stock !== undefined) return product.is_in_stock;
    if (product.stock !== undefined) return product.stock > 0;
    return true; // Default to in stock if not specified
  };

  // Get product image
  const getProductImage = (): string => {
    // Check for images array first
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    // Then check for single image field
    if (product.image && product.image.trim() !== '') {
      return product.image;
    }
    // Then check for image_url
    if (product.image_url && product.image_url.trim() !== '') {
      return product.image_url;
    }
    // Return placeholder
    return PLACEHOLDER_IMAGE;
  };

  // Get weight and unit display string
  const getWeightUnit = (): string => {
    if (product.weight && product.unit) {
      return `${product.weight} ${product.unit}`;
    }
    if (product.weight) {
      return `${product.weight}`;
    }
    if (product.unit) {
      return product.unit;
    }
    return '';
  };

  const displayPrice = getDisplayPrice();
  const originalPrice = getOriginalPrice();
  const showDiscount = hasDiscount();
  const discountPercent = getDiscountPercent();
  const inStock = isInStock();
  const imageUrl = getProductImage();
  const weightUnit = getWeightUnit();

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image: imageUrl,
    });
  };

  return (
    <View style={styles.card}>
      {/* IMAGE */}
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Discount Badge */}
        {showDiscount && discountPercent && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{discountPercent}</Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {!inStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          </View>
        )}
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.name}>
          {product.name}
        </Text>

        {/* Weight/Unit */}
        {weightUnit ? (
          <Text style={styles.weightUnit}>{weightUnit}</Text>
        ) : null}

        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{displayPrice}</Text>
          {showDiscount && (
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
          )}
        </View>

        {/* Cart Controls or Add Button */}
        {!inStock ? (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockBtnText}>Out of Stock</Text>
          </View>
        ) : cartItem ? (
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => decrement(product.id)}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{cartItem.qty}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => increment(product.id)}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleAddToCart}
          >
            <Text style={styles.addText}>ADD</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    margin: spacing.sm,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },

  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F1F8E9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  image: {
    width: '85%',
    height: '85%',
  },

  // Discount Badge
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: fonts.weights.bold,
  },

  // Out of Stock Overlay
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  outOfStockText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: fonts.weights.bold,
  },

  content: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },

  name: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.primaryLight,
    marginBottom: 2,
  },

  weightUnit: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginBottom: 4,
  },

  // Price Container
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  originalPrice: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.medium,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },

  // Add Button
  addBtn: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
  },
  addText: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes.sm,
  },

  // Out of Stock Button
  outOfStockBtn: {
    backgroundColor: colors.gray300,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: 'center',
  },
  outOfStockBtnText: {
    color: colors.gray600,
    fontWeight: fonts.weights.semibold,
    fontSize: 11,
  },

  // Quantity Controls
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: fonts.weights.bold,
  },
  qty: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
});
