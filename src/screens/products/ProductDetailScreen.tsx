import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../../context/CartContext';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

interface ProductImage {
  url?: string;
  image_url?: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  mrp?: number;
  final_price?: number;
  selling_price?: number;
  discount_price?: number | null;
  discount_percentage?: string | number;
  is_discounted?: boolean;
  image?: string;
  image_url?: string;
  images?: string[] | ProductImage[];
  size?: string;
  weight?: number;
  unit?: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  stock?: number;
  is_in_stock?: boolean;
  stock_status?: string;
  sku?: string;
  brand?: string;
  benefits?: string[];
  ingredients?: string;
  how_to_use?: string;
  storage_instructions?: string;
}

const ProductDetailScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { productId } = route.params;
  const { cart, addToCart, increment, decrement, cartItemCount } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/v1/mobile/ecommerce/products/${productId}`);

      if (!response.ok) {
        setError('Failed to load product details');
        return;
      }

      const data = await response.json();
      console.log('Product Detail API Response:', JSON.stringify(data, null, 2));

      if (data.success) {
        const productData = data.data?.product || data.data || data.product;
        setProduct(productData);
      } else {
        setError(data.message || 'Failed to load product details');
      }
    } catch (err) {
      console.error('Error fetching product details:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProductImages = (prod: Product): string[] => {
    const images: string[] = [];

    if (prod.images && prod.images.length > 0) {
      prod.images.forEach((img) => {
        if (typeof img === 'string' && img.trim() !== '') {
          images.push(img);
        } else if (typeof img === 'object') {
          const url = img.url || img.image_url;
          if (url) images.push(url);
        }
      });
    }

    if (images.length === 0) {
      if (prod.image && prod.image.trim() !== '') images.push(prod.image);
      else if (prod.image_url && prod.image_url.trim() !== '') images.push(prod.image_url);
      else images.push(PLACEHOLDER_IMAGE);
    }

    return images;
  };

  const getProductPrice = (prod: Product): number => {
    return prod.final_price || prod.selling_price || prod.discount_price || prod.price;
  };

  const getOriginalPrice = (prod: Product): number => {
    return prod.mrp || prod.price;
  };

  const getProductUnit = (prod: Product): string => {
    if (prod.unit) return prod.unit;
    if (prod.weight) return `${prod.weight}kg`;
    if (prod.size) return prod.size;
    return '';
  };

  const hasDiscount = (prod: Product): boolean => {
    if (prod.is_discounted) return true;
    const displayPrice = getProductPrice(prod);
    const originalPrice = getOriginalPrice(prod);
    return displayPrice < originalPrice;
  };

  const getDiscountPercent = (prod: Product): number => {
    if (prod.discount_percentage) {
      const percent = typeof prod.discount_percentage === 'string'
        ? parseFloat(prod.discount_percentage)
        : prod.discount_percentage;
      if (percent > 0) return Math.round(percent);
    }
    const displayPrice = getProductPrice(prod);
    const originalPrice = getOriginalPrice(prod);
    if (displayPrice < originalPrice) {
      return Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
    return 0;
  };

  const isInStock = (prod: Product): boolean => {
    if (prod.is_in_stock !== undefined) return prod.is_in_stock;
    if (prod.stock !== undefined) return prod.stock > 0;
    return true;
  };

  const cartItem = product ? cart.find((i: any) => i.id === product.id) : null;
  const quantity = cartItem ? cartItem.qty : 0;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading product details...</Text>
        </View>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#dc2626" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProductDetails}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const images = getProductImages(product);
  const price = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);
  const unit = getProductUnit(product);
  const showDiscount = hasDiscount(product);
  const discountPercent = getDiscountPercent(product);
  const inStock = isInStock(product);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Cart')}>
          <Icon name="cart-outline" size={24} color="#fff" />
          {cartItemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Gallery */}
        <View style={styles.imageSection}>
          {/* Main Image */}
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: images[selectedImageIndex] }}
              style={styles.mainImage}
              resizeMode="contain"
            />

            {/* Discount Badge */}
            {showDiscount && discountPercent > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{discountPercent}% OFF</Text>
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

            {/* Wishlist Button */}
            <TouchableOpacity style={styles.wishlistButton}>
              <Icon name="heart-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailContainer}
            >
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    selectedImageIndex === index && styles.thumbnailSelected,
                  ]}
                  onPress={() => setSelectedImageIndex(index)}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.infoSection}>
          {/* Category */}
          {product.category_name && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category_name}</Text>
            </View>
          )}

          {/* Product Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Unit/Weight */}
          {unit && <Text style={styles.productUnit}>{unit}</Text>}

          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>₹{price}</Text>
            {showDiscount && (
              <>
                <Text style={styles.originalPrice}>₹{originalPrice}</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>Save ₹{originalPrice - price}</Text>
                </View>
              </>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockSection}>
            <Icon
              name={inStock ? 'check-circle' : 'close-circle'}
              size={18}
              color={inStock ? '#16a34a' : '#dc2626'}
            />
            <Text style={[styles.stockText, { color: inStock ? '#16a34a' : '#dc2626' }]}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </Text>
          </View>

          {/* Description */}
          {product.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Benefits */}
          {product.benefits && product.benefits.length > 0 && (
            <View style={styles.benefitsSection}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              {product.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check" size={16} color={colors.primary} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Ingredients */}
          {product.ingredients && (
            <View style={styles.infoBlock}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <Text style={styles.infoText}>{product.ingredients}</Text>
            </View>
          )}

          {/* How to Use */}
          {product.how_to_use && (
            <View style={styles.infoBlock}>
              <Text style={styles.sectionTitle}>How to Use</Text>
              <Text style={styles.infoText}>{product.how_to_use}</Text>
            </View>
          )}

          {/* Storage Instructions */}
          {product.storage_instructions && (
            <View style={styles.infoBlock}>
              <Text style={styles.sectionTitle}>Storage Instructions</Text>
              <Text style={styles.infoText}>{product.storage_instructions}</Text>
            </View>
          )}

          {/* SKU & Brand */}
          <View style={styles.metaSection}>
            {product.sku && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SKU:</Text>
                <Text style={styles.metaValue}>{product.sku}</Text>
              </View>
            )}
            {product.brand && (
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>Brand:</Text>
                <Text style={styles.metaValue}>{product.brand}</Text>
              </View>
            )}
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {!inStock ? (
          <TouchableOpacity style={styles.notifyButton}>
            <Icon name="bell-outline" size={20} color="#6b7280" />
            <Text style={styles.notifyButtonText}>Notify When Available</Text>
          </TouchableOpacity>
        ) : quantity === 0 ? (
          <>
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() =>
                addToCart({
                  id: product.id,
                  name: product.name,
                  price: price,
                  image: images[0],
                  size: unit,
                })
              }
            >
              <Icon name="cart-plus" size={22} color="#fff" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() =>
                navigation.navigate('Subscription', {
                  productId: product.id,
                  productName: product.name,
                  productImage: images[0],
                })
              }
            >
              <Icon name="calendar-check" size={22} color={colors.primary} />
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.qtyControlLarge}>
              <TouchableOpacity
                style={styles.qtyButtonLarge}
                onPress={() => decrement(product.id)}
              >
                <Icon name="minus" size={24} color={colors.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyTextLarge}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyButtonLarge}
                onPress={() => increment(product.id)}
              >
                <Icon name="plus" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.subscribeButton}
              onPress={() =>
                navigation.navigate('Subscription', {
                  productId: product.id,
                  productName: product.name,
                  productImage: images[0],
                })
              }
            >
              <Icon name="calendar-check" size={22} color={colors.primary} />
              <Text style={styles.subscribeText}>Subscribe</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spacing.base,
    fontSize: fonts.sizes.lg,
    color: colors.primary,
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 50,
    paddingBottom: spacing.base,
    backgroundColor: colors.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: fonts.sizes.xl,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#dc2626',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Image Section
  imageSection: {
    backgroundColor: '#fff',
    paddingBottom: 16,
  },
  mainImageContainer: {
    width: width,
    height: width * 0.85,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mainImage: {
    width: '80%',
    height: '80%',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  discountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
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
    backgroundColor: '#dc2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  wishlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnailContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    marginRight: 10,
  },
  thumbnailSelected: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Info Section
  infoSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  categoryBadge: {
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 32,
    marginBottom: 6,
  },
  productUnit: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 10,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  saveBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  stockSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 24,
  },
  benefitsSection: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  benefitText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  infoBlock: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
  },
  metaSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#6b7280',
    width: 80,
  },
  metaValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 30,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  subscribeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: 8,
  },
  subscribeText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  notifyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  notifyButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  qtyControlLarge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    borderRadius: 14,
    paddingVertical: 8,
  },
  qtyButtonLarge: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyTextLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    minWidth: 40,
    textAlign: 'center',
  },
});
