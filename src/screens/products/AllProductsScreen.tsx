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
import { useCart } from '../../context/CartContext';
import { api } from '../../utils/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Product {
  id: number;
  name: string;
  price: number;
  final_price?: number;
  selling_price?: number;
  discount_price?: number;
  discount_percentage?: string;
  image?: string;
  image_url?: string;
  images?: Array<{ url?: string; image_url?: string }>;
  size?: string;
  weight?: number;
  unit?: string;
  description?: string;
  category_id?: number;
  stock?: number;
  is_in_stock?: boolean;
  stock_status?: string;
}

const AllProductsScreen = () => {
  const navigation = useNavigation<any>();
  const { cart, addToCart, increment, decrement, cartItemCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProductImage = (product: Product): string | null => {
    if (product.image) return product.image;
    if (product.image_url) return product.image_url;
    if (product.images && product.images.length > 0) {
      return product.images[0].url || product.images[0].image_url || null;
    }
    return null;
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
      const response = await api.get('/ecommerce/products');
      const data = await response.json();

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
    fetchProducts();
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

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUrl = getProductImage(item);
    const price = getProductPrice(item);
    const unit = getProductUnit(item);
    const cartProduct = cart.find((c: any) => c.id === item.id);
    const qty = cartProduct ? cartProduct.qty : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleBuyOnce(item)}
        activeOpacity={0.8}
      >
        {item.discount_percentage ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount_percentage}% OFF</Text>
          </View>
        ) : null}

        <View style={styles.productImageContainer}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />
          ) : (
            <View style={styles.productImagePlaceholder}>
              <Icon name="image-outline" size={40} color="#d1d5db" />
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
          <Text style={styles.productPrice}>₹{price}</Text>
          {qty === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() =>
                addToCart({
                  id: item.id,
                  name: item.name,
                  price: price,
                  image: imageUrl || '',
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

  // Full screen loader
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="shopping" size={50} color="#2E7D32" />
          </View>
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
          <Text style={styles.loaderText}>Loading products...</Text>
          <Text style={styles.loaderSubtext}>Please wait</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="magnify" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Explore Products</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Cart')}>
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
            : `${products.length} products`}
        </Text>
      </View>

      {/* Products Grid */}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={60} color="#dc2626" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="magnify-close" size={60} color="#9ca3af" />
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
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
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
                      {selectedProduct.price !== getProductPrice(selectedProduct) ? (
                        <Text style={styles.modalOriginalPrice}>₹{selectedProduct.price}</Text>
                      ) : null}
                    </View>

                    {selectedProduct.description ? (
                      <Text style={styles.modalDescription}>{selectedProduct.description}</Text>
                    ) : null}

                    <View style={styles.modalActions}>
                      {quantity === 0 ? (
                        <TouchableOpacity
                          style={styles.modalAddButton}
                          onPress={() =>
                            addToCart({
                              id: selectedProduct.id,
                              name: selectedProduct.name,
                              price: getProductPrice(selectedProduct),
                              image: getProductImage(selectedProduct) || '',
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

export default AllProductsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF7',
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: '#F9FBF7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loaderIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  loaderSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#2E7D32',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
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

  // Search
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
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
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
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
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#2E7D32',
    fontWeight: '600',
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
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  modalOriginalPrice: {
    fontSize: 16,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 12,
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
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalAddButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalQtyControl: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  subscribeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
    gap: 8,
  },
  subscribeButtonText: {
    color: '#2E7D32',
    fontWeight: '700',
    fontSize: 16,
  },
});
