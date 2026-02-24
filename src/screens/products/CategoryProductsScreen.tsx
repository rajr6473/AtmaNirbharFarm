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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../../context/CartContext';
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

interface Category {
  id: number;
  name: string;
  image?: string;
  image_url?: string;
}

const CategoryProductsScreen = ({ route }: any) => {
  const { categoryId, categoryName } = route.params;
  const navigation = useNavigation<any>();
  const { cart, addToCart, increment, decrement, cartItemCount } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(categoryId);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>(categoryName);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductImage = (product: Product): string => {
    // Check for images array first (can be array of strings or objects)
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'string' && firstImage.trim() !== '') {
        return firstImage;
      } else if (typeof firstImage === 'object') {
        return firstImage.url || firstImage.image_url || PLACEHOLDER_IMAGE;
      }
    }
    // Then check for single image fields
    if (product.image && product.image.trim() !== '') return product.image;
    if (product.image_url && product.image_url.trim() !== '') return product.image_url;
    return PLACEHOLDER_IMAGE;
  };

  const getCategoryImage = (category: Category): string | null => {
    return category.image || category.image_url || null;
  };

  const getProductPrice = (product: Product): number => {
    return product.final_price || product.selling_price || product.discount_price || product.price;
  };

  const getProductUnit = (product: Product): string => {
    if (product.unit) return product.unit;
    if (product.weight) return `${product.weight}kg`;
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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetchProducts(selectedCategoryId);
    }
  }, [selectedCategoryId]);

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

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/ecommerce/categories');
      const data = await response.json();

      if (response.ok && data.success) {
        let categoriesData: Category[] = [];
        if (Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data.data?.categories) {
          categoriesData = data.data.categories;
        }
        setCategories(categoriesData);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async (catId: number) => {
    try {
      setLoading(true);
      setError(null);

      // Use the correct API endpoint with category_id query parameter
      const response = await api.get(`/ecommerce/products?category_id=${catId}`);
      const data = await response.json();

      console.log('Category Products API Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
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
      console.error('Error fetching products:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts(selectedCategoryId);
  };

  const handleCategoryChange = (category: Category) => {
    setSelectedCategoryId(category.id);
    setSelectedCategoryName(category.name);
    setSearch('');
  };

  const handleBuyOnce = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  const cartItem = selectedProduct ? cart.find((i: any) => i.id === selectedProduct.id) : null;
  const quantity = cartItem ? cartItem.qty : 0;

  const renderCategoryTab = ({ item }: { item: Category }) => {
    const isSelected = item.id === selectedCategoryId;
    const imageUrl = getCategoryImage(item);

    return (
      <TouchableOpacity
        style={styles.categoryTab}
        onPress={() => handleCategoryChange(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryImageWrapper, isSelected && styles.categoryImageWrapperSelected]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.categoryTabImage} resizeMode="cover" />
          ) : (
            <View style={styles.categoryPlaceholder}>
              <Icon name="tag" size={20} color={isSelected ? '#2E7D32' : '#9ca3af'} />
            </View>
          )}
        </View>
        <Text style={[styles.categoryTabText, isSelected && styles.categoryTabTextSelected]} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

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
        onPress={() => handleBuyOnce(item)}
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
                <Icon name="minus" size={14} color="#2E7D32" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity onPress={() => increment(item.id)} style={styles.qtyButton}>
                <Icon name="plus" size={14} color="#2E7D32" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Full screen loader for initial load
  if (loading && products.length === 0 && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCategoryName}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loaderText}>Loading products...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedCategoryName}</Text>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Cart')}>
          <Icon name="cart-outline" size={24} color="#fff" />
          {cartItemCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Category Tabs */}
      {!loadingCategories && categories.length > 0 ? (
        <View style={styles.categoriesWrapper}>
          <FlatList
            data={categories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>
      ) : null}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="magnify" size={22} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search in ${selectedCategoryName}...`}
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
            : `${products.length} products in ${selectedCategoryName}`}
        </Text>
      </View>

      {/* Products Grid */}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#dc2626" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts(selectedCategoryId)}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant" size={60} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No Products Found</Text>
          <Text style={styles.emptyText}>
            {search ? `No results for "${search}"` : `No products in ${selectedCategoryName}`}
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
          }
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
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
                          <Text style={styles.modalOutOfStockButtonText}>Notify When Available</Text>
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
                            <Icon name="minus" size={20} color="#2E7D32" />
                          </TouchableOpacity>
                          <Text style={styles.modalQtyText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.modalQtyButton}
                            onPress={() => increment(selectedProduct.id)}
                          >
                            <Icon name="plus" size={20} color="#2E7D32" />
                          </TouchableOpacity>
                        </View>
                      )}

                      {isInStock(selectedProduct) && (
                        <TouchableOpacity
                          style={styles.subscribeButton}
                          onPress={() => {
                            handleCloseModal();
                            navigation.navigate('Subscription', {
                              productId: selectedProduct.id,
                              productName: selectedProduct.name,
                              productImage: getProductImage(selectedProduct),
                            });
                          }}
                        >
                          <Icon name="calendar-check" size={20} color="#2E7D32" />
                          <Text style={styles.subscribeButtonText}>Subscribe</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CategoryProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spacing.base,
    fontSize: fonts.sizes.lg,
    color: colors.primaryLight,
    fontWeight: fonts.weights.semibold,
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
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
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
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
    flex: 1,
    textAlign: 'center',
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

  // Category Tabs
  categoriesWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoriesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryTab: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  categoryImageWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  categoryImageWrapperSelected: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
  },
  categoryTabImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTabText: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  categoryTabTextSelected: {
    color: colors.primaryLight,
    fontWeight: fonts.weights.semibold,
  },

  // Search
  searchContainer: {
    padding: spacing.md,
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
    paddingHorizontal: spacing.base,
    paddingVertical: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  resultsCount: {
    fontSize: 13,
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
  productImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.primaryLight,
  },
  originalPrice: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  // Out of Stock styles
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
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
    color: colors.primaryLight,
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
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
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    borderRadius: 8,
  },
  clearSearchText: {
    color: colors.primaryLight,
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
    color: colors.primaryLight,
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
    backgroundColor: colors.primary,
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
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
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
    color: colors.primaryLight,
  },
  subscribeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    borderRadius: borderRadius.base,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    gap: 8,
  },
  subscribeButtonText: {
    color: colors.primaryLight,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes.lg,
  },
});
