import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDeliveryCart } from '../../context/DeliveryCartContext';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';

interface Product {
  id: number;
  name: string;
  price: number;
  final_price?: number;
  selling_price?: number;
  discount_price?: number | null;
  discount_percentage?: string | number;
  is_discounted?: boolean;
  image?: string;
  image_url?: string;
  images?: string[] | Array<{ url?: string; image_url?: string }>;
  size?: string;
  weight?: number;
  unit?: string;
  description?: string;
  category_id?: number;
  stock?: number;
  is_in_stock?: boolean;
  stock_status?: string;
}

const DeliveryAllProductsScreen = () => {
  const navigation = useNavigation<any>();
  const { cart, addToCart, increment, decrement, cartItemCount } = useDeliveryCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductImage = (product: Product): string => {
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
        return firstImage;
      } else if (typeof firstImage === 'object') {
        return firstImage.url || firstImage.image_url || PLACEHOLDER_IMAGE;
      }
    }
    if (product.image && product.image.trim() !== '') return product.image;
    if (product.image_url && product.image_url.trim() !== '') return product.image_url;
    return PLACEHOLDER_IMAGE;
  };

  const getProductPrice = (product: Product): number => {
    return product.final_price || product.selling_price || product.discount_price || product.price;
  };

  const getProductUnit = (product: Product): string => {
    if (product.weight && product.unit) {
      return `${product.weight} ${product.unit}`;
    }
    if (product.weight) return `${product.weight}`;
    if (product.unit) return product.unit;
    if (product.size) return product.size;
    return '';
  };

  const hasDiscount = (product: Product): boolean => {
    if (product.is_discounted) return true;
    const displayPrice = getProductPrice(product);
    return displayPrice < product.price;
  };

  const getDiscountPercent = (product: Product): string => {
    if (product.discount_percentage) {
      const percent = typeof product.discount_percentage === 'string'
        ? parseFloat(product.discount_percentage)
        : product.discount_percentage;
      if (percent > 0) return `${Math.round(percent)}% OFF`;
    }
    const displayPrice = getProductPrice(product);
    if (displayPrice < product.price) {
      const percent = ((product.price - displayPrice) / product.price) * 100;
      return `${Math.round(percent)}% OFF`;
    }
    return '';
  };

  const isInStock = (product: Product): boolean => {
    if (product.is_in_stock !== undefined) return product.is_in_stock;
    if (product.stock !== undefined) return product.stock > 0;
    return true;
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (products.length === 0) {
        fetchProducts();
      }
    }, [products.length])
  );

  // Filter products based on search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredProducts(products);
    } else {
      const searchTerm = search.toLowerCase();
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          (p.description && p.description.toLowerCase().includes(searchTerm))
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

  const fetchProducts = async () => {
    try {
      setError(null);
      const response = await api.get('/api/v1/mobile/delivery/products');

      if (!response.ok) {
        setError('Failed to load products. Please try again.');
        return;
      }

      const data = await response.json();
      console.log('Delivery Products Response:', JSON.stringify(data, null, 2));

      if (data.success) {
        let productsData: Product[] = [];
        if (Array.isArray(data.data)) {
          productsData = data.data;
        } else if (data.data?.products) {
          productsData = data.data.products;
        } else if (data.products) {
          productsData = data.products;
        }
        setProducts(productsData);
        setFilteredProducts(productsData);
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching delivery products:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const cartItem = selectedProduct ? cart.find((i: any) => i.id === selectedProduct.id) : null;
  const quantity = cartItem ? cartItem.qty : 0;

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = getProductImage(item);
    const price = getProductPrice(item);
    const unit = getProductUnit(item);
    const cartProduct = cart.find((c: any) => c.id === item.id);
    const qty = cartProduct ? cartProduct.qty : 0;
    const showDiscount = hasDiscount(item);
    const discountPercent = getDiscountPercent(item);
    const inStock = isInStock(item);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.8}
      >
        {/* Discount Badge */}
        {showDiscount && discountPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}</Text>
          </View>
        ) : null}

        <View style={styles.productImageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />

          {/* Out of Stock Overlay */}
          {!inStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.heartButton}>
          <Icon name="heart-outline" size={18} color="#9ca3af" />
        </TouchableOpacity>

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        {unit ? <Text style={styles.productUnit}>{unit}</Text> : null}

        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>₹{price}</Text>
            {showDiscount && (
              <Text style={styles.originalPrice}>₹{item.price}</Text>
            )}
          </View>

          {!inStock ? (
            <View style={styles.outOfStockBtn}>
              <Text style={styles.outOfStockBtnText}>N/A</Text>
            </View>
          ) : qty === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: price,
                  image: imageUrl,
                  size: unit,
                })
              }
            >
              <Icon name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity onPress={() => decrement(item.id)} style={styles.qtyButton}>
                <Icon name="minus" size={14} color="#7C3AED" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity onPress={() => increment(item.id)} style={styles.qtyButton}>
                <Icon name="plus" size={14} color="#7C3AED" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Full screen loader - Premium Design
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconOuter}>
            <View style={styles.loaderIconMiddle}>
              <View style={styles.loaderIconInner}>
                <Icon name="shopping" size={40} color="#fff" />
              </View>
            </View>
          </View>
          <ActivityIndicator size="large" color="#7C3AED" style={{ marginTop: 24 }} />
          <Text style={styles.loaderText}>Loading Products</Text>
          <Text style={styles.loaderSubtext}>Please wait while we fetch the catalog...</Text>
          <View style={styles.loadingDots}>
            <View style={[styles.loadingDot, { opacity: 0.4 }]} />
            <View style={[styles.loadingDot, { opacity: 0.7 }]} />
            <View style={[styles.loadingDot, { opacity: 1 }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="package-variant" size={24} color="#fff" />
          <Text style={styles.headerTitle}>All Products</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('DeliveryCart')}
        >
          <Icon name="cart-outline" size={24} color="#fff" />
          {cartItemCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={22} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Icon name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {search
            ? `${filteredProducts.length} results for "${search}"`
            : `${products.length} products available`}
        </Text>
      </View>

      {/* Products Grid */}
      {error ? (
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <Icon name="alert-circle" size={50} color="#dc2626" />
          </View>
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="magnify-close" size={50} color="#9ca3af" />
          </View>
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>
            {search ? `No results for "${search}"` : 'No products available'}
          </Text>
          {search ? (
            <TouchableOpacity style={styles.clearSearchButton} onPress={() => setSearch('')}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7C3AED']} />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 240,
            offset: 240 * Math.floor(index / 2),
            index,
          })}
        />
      )}

      {/* Product Detail Modal */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={handleCloseModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={handleCloseModal} />
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProduct && (
                <>
                  <View style={styles.modalHeader}>
                    <View style={styles.modalImageContainer}>
                      {getProductImage(selectedProduct) ? (
                        <Image
                          source={{ uri: getProductImage(selectedProduct)! }}
                          style={styles.modalImage}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.modalImagePlaceholder}>
                          <Icon name="image-outline" size={60} color="#d1d5db" />
                        </View>
                      )}
                    </View>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={handleCloseModal}>
                      <Icon name="close" size={24} color="#374151" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <Text style={styles.modalProductName}>{selectedProduct.name}</Text>
                    <Text style={styles.modalProductUnit}>{getProductUnit(selectedProduct)}</Text>

                    <View style={styles.modalPriceRow}>
                      <Text style={styles.modalPrice}>₹{getProductPrice(selectedProduct)}</Text>
                      {hasDiscount(selectedProduct) && (
                        <Text style={styles.modalOriginalPrice}>₹{selectedProduct.price}</Text>
                      )}
                      {hasDiscount(selectedProduct) && getDiscountPercent(selectedProduct) && (
                        <View style={styles.modalDiscountBadge}>
                          <Text style={styles.modalDiscountText}>{getDiscountPercent(selectedProduct)}</Text>
                        </View>
                      )}
                    </View>

                    {!isInStock(selectedProduct) && (
                      <View style={styles.modalOutOfStock}>
                        <Icon name="alert-circle" size={18} color="#dc2626" />
                        <Text style={styles.modalOutOfStockText}>Currently Out of Stock</Text>
                      </View>
                    )}

                    {selectedProduct.description ? (
                      <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                    ) : null}

                    <View style={styles.modalActions}>
                      {!isInStock(selectedProduct) ? (
                        <View style={styles.modalOutOfStockButton}>
                          <Icon name="bell-outline" size={20} color="#6b7280" />
                          <Text style={styles.modalOutOfStockButtonText}>Not Available</Text>
                        </View>
                      ) : quantity === 0 ? (
                        <TouchableOpacity
                          style={styles.modalAddButton}
                          onPress={() =>
                            addToCart({
                              id: selectedProduct.id,
                              name: selectedProduct.name,
                              price: getProductPrice(selectedProduct),
                              image: getProductImage(selectedProduct),
                              size: getProductUnit(selectedProduct),
                            })
                          }
                        >
                          <Icon name="cart-plus" size={20} color="#fff" />
                          <Text style={styles.modalAddButtonText}>Add to Cart</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.modalQtyControl}>
                          <TouchableOpacity
                            style={styles.modalQtyButton}
                            onPress={() => decrement(selectedProduct.id)}
                          >
                            <Icon name="minus" size={20} color="#7C3AED" />
                          </TouchableOpacity>
                          <Text style={styles.modalQtyText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.modalQtyButton}
                            onPress={() => increment(selectedProduct.id)}
                          >
                            <Icon name="plus" size={20} color="#7C3AED" />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => navigation.navigate('DeliveryCart')}
          activeOpacity={0.9}
        >
          <View style={styles.floatingCartContent}>
            <View style={styles.floatingCartLeft}>
              <View style={styles.floatingCartIconContainer}>
                <Icon name="cart" size={22} color="#fff" />
              </View>
              <Text style={styles.floatingCartText}>
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingCartViewText}>View Cart</Text>
              <Icon name="chevron-right" size={20} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DeliveryAllProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loader - Premium Design
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
    padding: 40,
  },
  loaderIconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderIconMiddle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E9D5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderIconInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spacing.lg,
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: '#7C3AED',
  },
  loaderSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.base,
    backgroundColor: '#7C3AED',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  cartButton: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },

  // Search
  searchContainer: {
    padding: spacing.base,
    backgroundColor: colors.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111',
  },

  // Results Header
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Products Grid
  productsGrid: {
    padding: 12,
    paddingBottom: 100,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  productImageContainer: {
    width: '100%',
    height: 100,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  heartButton: {
    position: 'absolute',
    top: 80,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
    minHeight: 36,
  },
  productUnit: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: '#7C3AED',
  },
  originalPrice: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: fonts.weights.bold,
  },
  outOfStockBtn: {
    backgroundColor: colors.gray300,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  outOfStockBtnText: {
    color: colors.gray600,
    fontSize: 11,
    fontWeight: fonts.weights.semibold,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  qtyButton: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: '#7C3AED',
    minWidth: 20,
    textAlign: 'center',
  },

  // Error & Empty States
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#dc2626',
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
    backgroundColor: '#7C3AED',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  clearSearchButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#7C3AED',
    fontWeight: fonts.weights.semibold,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalImageContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '80%',
    height: '80%',
  },
  modalImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    padding: 20,
  },
  modalProductName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  modalProductUnit: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  modalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalPrice: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: '#7C3AED',
  },
  modalOriginalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 12,
  },
  modalDiscountBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  modalDiscountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: fonts.weights.bold,
  },
  modalOutOfStock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  modalOutOfStockText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: fonts.weights.semibold,
  },
  modalOutOfStockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray200,
    paddingVertical: 14,
    borderRadius: borderRadius.base,
    gap: 8,
  },
  modalOutOfStockButtonText: {
    color: colors.gray600,
    fontWeight: fonts.weights.semibold,
    fontSize: fonts.sizes.md,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  modalAddButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 14,
    borderRadius: borderRadius.base,
    gap: 8,
  },
  modalAddButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes.lg,
  },
  modalQtyControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 12,
    gap: 16,
  },
  modalQtyButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalQtyText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: '#7C3AED',
  },

  // Floating Cart Button
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  floatingCartContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  floatingCartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingCartViewText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
