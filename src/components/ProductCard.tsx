import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../context/CartContext';
import { colors, fonts, spacing, borderRadius } from '../theme';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

interface ProductVariant {
  id: number;
  label: string;
  weight: number;
  unit: string;
  buying_price: number;
  selling_price: number;
  discount_enabled: boolean;
  discount_type?: string;
  discount_value?: number;
  discount_amount?: number;
  effective_price: number;
  gst_percentage?: number;
  gst_amount?: number;
  price_after_discount: number;
  available_stock: number;
  is_default: boolean;
  is_in_stock: boolean;
}

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
  has_multiple_quantities?: boolean;
  display_price?: number;
  default_variant_id?: number;
  variants?: ProductVariant[];
}

const ProductCard = ({ product }: { product: Product }) => {
  const { cart, addToCart, increment, decrement, getCartItem } = useCart();

  // State for variant selection
  const hasVariants = product.has_multiple_quantities && product.variants && product.variants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [showVariantDropdown, setShowVariantDropdown] = useState(false);

  // Initialize selected variant
  useEffect(() => {
    if (hasVariants && product.variants) {
      const defaultVariant = product.variants.find(v => v.id === product.default_variant_id)
        || product.variants.find(v => v.is_default)
        || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product.id, hasVariants, product.variants, product.default_variant_id]);

  // Get cart item based on variant
  const cartItem = hasVariants && selectedVariant
    ? getCartItem(product.id, selectedVariant.id)
    : cart.find((i: any) => i.id === product.id && !i.variantId);

  // Get the display price (final price after discount)
  const getDisplayPrice = (): number => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.price_after_discount;
    }
    return product.final_price || product.selling_price || product.discount_price || product.price;
  };

  // Get the original price for comparison
  const getOriginalPrice = (): number => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.selling_price;
    }
    return product.price;
  };

  // Check if product has a discount
  const hasDiscount = (): boolean => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.discount_enabled && selectedVariant.discount_amount && selectedVariant.discount_amount > 0;
    }
    if (product.is_discounted) return true;
    const displayPrice = getDisplayPrice();
    const originalPrice = getOriginalPrice();
    return displayPrice < originalPrice;
  };

  // Get discount percentage
  const getDiscountPercent = (): string => {
    if (hasVariants && selectedVariant && selectedVariant.discount_enabled) {
      const percent = ((selectedVariant.selling_price - selectedVariant.price_after_discount) / selectedVariant.selling_price) * 100;
      if (percent > 0) return `${Math.round(percent)}% OFF`;
    }
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
    if (hasVariants && selectedVariant) {
      return selectedVariant.is_in_stock && selectedVariant.available_stock > 0;
    }
    if (product.is_in_stock !== undefined) return product.is_in_stock;
    if (product.stock !== undefined) return product.stock > 0;
    return true;
  };

  // Get product image
  const getProductImage = (): string => {
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    if (product.image && product.image.trim() !== '') {
      return product.image;
    }
    if (product.image_url && product.image_url.trim() !== '') {
      return product.image_url;
    }
    return PLACEHOLDER_IMAGE;
  };

  // Get weight and unit display string
  const getWeightUnit = (): string => {
    if (hasVariants && selectedVariant) {
      return selectedVariant.label;
    }
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

    if (hasVariants && selectedVariant) {
      addToCart({
        id: product.id,
        name: product.name,
        price: selectedVariant.price_after_discount,
        image: imageUrl,
        size: selectedVariant.label,
        variantId: selectedVariant.id,
        variantLabel: selectedVariant.label,
      });
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: displayPrice,
        image: imageUrl,
      });
    }
  };

  const handleIncrement = () => {
    if (hasVariants && selectedVariant) {
      increment(product.id, selectedVariant.id);
    } else {
      increment(product.id);
    }
  };

  const handleDecrement = () => {
    if (hasVariants && selectedVariant) {
      decrement(product.id, selectedVariant.id);
    } else {
      decrement(product.id);
    }
  };

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setShowVariantDropdown(false);
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

        {/* Variant Dropdown or Weight/Unit */}
        {hasVariants && product.variants && product.variants.length > 1 ? (
          <TouchableOpacity
            style={styles.variantSelector}
            onPress={() => setShowVariantDropdown(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.variantText} numberOfLines={1}>
              {selectedVariant?.label || 'Select'}
            </Text>
            <Icon name="chevron-down" size={16} color={colors.primary} />
          </TouchableOpacity>
        ) : weightUnit ? (
          <Text style={styles.weightUnit}>{weightUnit}</Text>
        ) : null}

        {/* Price Section */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{displayPrice}</Text>
          {showDiscount && displayPrice < originalPrice && (
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
              onPress={handleDecrement}
            >
              <Text style={styles.qtyText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.qty}>{cartItem.qty}</Text>

            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={handleIncrement}
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

      {/* Variant Selection Modal */}
      <Modal
        visible={showVariantDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVariantDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowVariantDropdown(false)}
        >
          <View style={styles.variantModal}>
            <View style={styles.variantModalHeader}>
              <Text style={styles.variantModalTitle}>Select Variant</Text>
              <TouchableOpacity onPress={() => setShowVariantDropdown(false)}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={product.variants}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.variantOption,
                    selectedVariant?.id === item.id && styles.variantOptionSelected,
                    !item.is_in_stock && styles.variantOptionDisabled,
                  ]}
                  onPress={() => item.is_in_stock && handleVariantSelect(item)}
                  disabled={!item.is_in_stock}
                >
                  <View style={styles.variantOptionLeft}>
                    <View style={[
                      styles.radioCircle,
                      selectedVariant?.id === item.id && styles.radioCircleSelected,
                    ]}>
                      {selectedVariant?.id === item.id && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <View>
                      <Text style={[
                        styles.variantOptionLabel,
                        !item.is_in_stock && styles.variantOptionLabelDisabled,
                      ]}>
                        {item.label}
                      </Text>
                      {!item.is_in_stock && (
                        <Text style={styles.outOfStockLabel}>Out of Stock</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.variantPriceContainer}>
                    <Text style={[
                      styles.variantPrice,
                      !item.is_in_stock && styles.variantPriceDisabled,
                    ]}>
                      ₹{item.price_after_discount}
                    </Text>
                    {item.discount_enabled && item.discount_amount > 0 && (
                      <Text style={styles.variantOriginalPrice}>
                        ₹{item.selling_price}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.variantDivider} />}
            />
          </View>
        </Pressable>
      </Modal>
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

  // Variant Selector
  variantSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: 4,
  },
  variantText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.primary,
    flex: 1,
  },

  // Variant Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  variantModal: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  variantModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  variantModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  variantOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
  },
  variantOptionSelected: {
    backgroundColor: '#F0FDF4',
  },
  variantOptionDisabled: {
    backgroundColor: '#F9FAFB',
    opacity: 0.7,
  },
  variantOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  variantOptionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  variantOptionLabelDisabled: {
    color: '#9CA3AF',
  },
  outOfStockLabel: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  variantPriceContainer: {
    alignItems: 'flex-end',
  },
  variantPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  variantPriceDisabled: {
    color: '#9CA3AF',
  },
  variantOriginalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  variantDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
});
