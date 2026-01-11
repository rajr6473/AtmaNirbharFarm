import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { api } from '../../utils/api';
import { getCategoryDummyImage, getProductDummyImage, getImageWithFallback } from '../../utils/dummyImages';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount_price?: number;
  selling_price?: number;
  final_price?: number;
  discount_percentage?: string;
  stock?: number;
  sku?: string;
  weight?: number;
  images?: Array<{url?: string; image_url?: string}>;
  category?: {
    id: number;
    name: string;
  };
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
  const navigation = useNavigation();
  const { cart, addToCart, increment, decrement } = useCart();
  const [selectedCategory, setSelectedCategory] = useState(categoryId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentCategory = categories.find(c => c.id === selectedCategory) || { id: categoryId, name: categoryName };

  // Helper functions to get image URLs
  // Using dummy images for now - switch to API images later
  const getCategoryImageUrl = (category: Category): string => {
    // For now, return dummy image only
    return getCategoryDummyImage(category.name);

    // TODO: Later, uncomment below to use API images with fallback
    // const apiImage = category.image || category.image_url || '';
    // const dummyImage = getCategoryDummyImage(category.name);
    // return getImageWithFallback(apiImage, dummyImage);
  };

  const getProductImageUrl = (product: Product): string => {
    // For now, return dummy image only
    return getProductDummyImage(product.name);

    // TODO: Later, uncomment below to use API images with fallback
    // let apiImage = '';
    // if (product.images && product.images.length > 0) {
    //   apiImage = product.images[0].url || product.images[0].image_url || '';
    // }
    // const dummyImage = getProductDummyImage(product.name);
    // return getImageWithFallback(apiImage, dummyImage);
  };

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory]);

  // Filter products based on search
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await api.get('/ecommerce/categories');
      const data = await response.json();

      console.log('=== Categories API Response ===');
      console.log('Categories Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        let categoriesData = [];
        if (Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data.data && Array.isArray(data.data.categories)) {
          categoriesData = data.data.categories;
        } else if (data.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        }

        setCategories(categoriesData);
        console.log('Categories loaded:', categoriesData.length);
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

      const response = await api.get(`/ecommerce/categories/${catId}/products`);
      const data = await response.json();

      console.log('=== Category Products API Response ===');
      console.log('Category ID:', catId);
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Data Success:', data.success);
      console.log('Full Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Products are nested in data.data.products
        const productsData = data.data?.products || [];
        console.log('=== Products Data ===');
        console.log('Products Count:', productsData.length);
        console.log('Products Array:', JSON.stringify(productsData, null, 2));
        if (productsData.length > 0) {
          console.log('First Product:', JSON.stringify(productsData[0], null, 2));
        }

        setProducts(productsData);
        setFilteredProducts(productsData);
        console.log('Products state updated with', productsData.length, 'items');
      } else {
        setError(data.message || 'Failed to load products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
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

  if (loading && products.length === 0) {
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentCategory.name}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        {showSearch ? (
          <TextInput
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            placeholderTextColor="#999"
            autoFocus
          />
        ) : (
          <Text style={styles.headerTitle}>All Categories</Text>
        )}

        <TouchableOpacity
          onPress={() => {
            setShowSearch(!showSearch);
            if (showSearch) {
              setSearch('');
            }
          }}
          style={styles.searchButton}
        >
          <Text style={styles.searchIcon}>{showSearch ? '✕' : '🔍'}</Text>
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL CATEGORY TABS */}
      {loadingCategories ? (
        <View style={styles.categoriesLoadingContainer}>
          <ActivityIndicator size="small" color="#4285F4" />
        </View>
      ) : categories.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryTab}
              onPress={() => setSelectedCategory(category.id)}
            >
              <View style={[
                styles.categoryImageContainer,
                selectedCategory === category.id && styles.selectedCategoryImage
              ]}>
                {getCategoryImageUrl(category) ? (
                  <Image
                    source={{ uri: getCategoryImageUrl(category) }}
                    style={styles.categoryTabImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.categoryPlaceholder}>
                    <Text style={styles.categoryPlaceholderText}>🏷️</Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
              {selectedCategory === category.id && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {/* SECTION HEADER */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{currentCategory?.name} Products</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareIcon}>🔗</Text>
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCTS LIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            {getProductImageUrl(item) ? (
              <Image
                source={{ uri: getProductImageUrl(item) }}
                style={styles.productImage}
                resizeMode="contain"
                onError={(e) => {
                  console.log('Image failed to load for product:', item.name, getProductImageUrl(item));
                }}
              />
            ) : (
              <View style={[styles.productImage, styles.productPlaceholder]}>
                <Text style={styles.productPlaceholderText}>🖼️</Text>
              </View>
            )}

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productSize}>
                {item.weight ? `${item.weight}kg` : (item.stock_status || 'In Stock')}
              </Text>
              <Text style={styles.productPrice}>₹{item.final_price || item.price}</Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.buyOnceButton}
                  onPress={() => handleBuyOnce(item)}
                >
                  <Text style={styles.buyOnceText}>Buy Once</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.subscribeButton}>
                  <Text style={styles.subscribeText}>Subscribe</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.shareIconButton}>
              <Text style={styles.shareIconText}>🔗</Text>
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsList}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found</Text>
        }
      />

      {/* PRODUCT DETAIL MODAL */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCloseModal}
          />

          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedProduct && (
                <>
                  {/* NEW BADGE */}
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>

                  {/* PRODUCT HEADER */}
                  <View style={styles.modalHeader}>
                    {getProductImageUrl(selectedProduct) ? (
                      <Image
                        source={{ uri: getProductImageUrl(selectedProduct) }}
                        style={styles.modalProductImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={[styles.modalProductImage, styles.productPlaceholder]}>
                        <Text style={styles.productPlaceholderText}>🖼️</Text>
                      </View>
                    )}

                    <View style={styles.modalProductInfo}>
                      <Text style={styles.modalProductName}>
                        {selectedProduct.name}
                      </Text>

                      <Text style={styles.deliveryInfo}>
                        Order by <Text style={styles.deliveryTime}>09:00 PM today</Text> and get
                        delivery by <Text style={styles.deliveryTime}>12 January 04:00-07:00 AM</Text>
                      </Text>
                    </View>
                  </View>

                  {/* PRICE AND ADD SECTION */}
                  <View style={styles.priceSection}>
                    <View>
                      <Text style={styles.modalPrice}>
                        ₹{quantity > 0 ? (selectedProduct.final_price || selectedProduct.price) * quantity : (selectedProduct.final_price || selectedProduct.price)}
                      </Text>
                      <Text style={styles.modalSize}>
                        {selectedProduct.weight ? `${selectedProduct.weight}kg` : (selectedProduct.stock_status || 'In Stock')}
                        {quantity > 0 && <Text style={styles.unitPrice}> (₹{selectedProduct.final_price || selectedProduct.price} each)</Text>}
                      </Text>
                    </View>

                    {quantity === 0 ? (
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => addToCart({
                          id: selectedProduct.id,
                          name: selectedProduct.name,
                          price: selectedProduct.final_price || selectedProduct.price,
                          image: getProductImageUrl(selectedProduct) || '',
                          size: selectedProduct.weight ? `${selectedProduct.weight}kg` : undefined,
                        })}
                      >
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => decrement(selectedProduct.id)}
                        >
                          <Text style={styles.quantityButtonText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.quantityText}>{quantity}</Text>

                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() => increment(selectedProduct.id)}
                        >
                          <Text style={styles.quantityButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* DELIVERY SLOT */}
                  <View style={styles.deliverySlotSection}>
                    <View style={styles.deliverySlotHeader}>
                      <View style={styles.radioButton}>
                        <View style={styles.radioButtonInner} />
                      </View>
                      <Text style={styles.deliverySlotTitle}>Delivery Slot</Text>
                    </View>

                    <Text style={styles.deliverySlotTime}>12th Jan 04:00-07:00 AM</Text>
                  </View>

                  {/* DELIVERY ADDRESS */}
                  <View style={styles.deliveryAddressSection}>
                    <Text style={styles.deliveryAddressTitle}>Delivery to Home</Text>
                    <Text style={styles.deliveryAddress}>
                      Flat: 1st. A cross road, 1, 1, , , 305, vidyanagar, girinagr, 1st A cross, near balaji bliss apprtment, shritui sangeeta vidyalaya, 560085
                    </Text>
                  </View>

                  {/* ACTION BUTTONS */}
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.continueShoppingButton}
                      onPress={handleCloseModal}
                    >
                      <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.goToCartButton}
                      onPress={() => {
                        handleCloseModal();
                        navigation.navigate('Cart' as never);
                      }}
                    >
                      <Text style={styles.goToCartText}>🛒 Go to Cart</Text>
                    </TouchableOpacity>
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
    backgroundColor: '#FAFAFA',
  },

  // LOADING STATES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  categoriesLoadingContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginRight: 40,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 8,
  },

  // CATEGORY TABS
  categoryScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  categoryTab: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 4,
    marginBottom: 6,
  },
  selectedCategoryImage: {
    borderColor: '#4285F4',
  },
  categoryTabImage: {
    width: '100%',
    height: '100%',
    borderRadius: 26,
  },
  categoryTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 80,
  },
  selectedCategoryText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  selectedIndicator: {
    height: 3,
    width: 30,
    backgroundColor: '#4285F4',
    borderRadius: 2,
    marginTop: 4,
  },
  categoryPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 26,
  },
  categoryPlaceholderText: {
    fontSize: 24,
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  shareIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  shareText: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '600',
  },

  // PRODUCTS
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  productPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productPlaceholderText: {
    fontSize: 32,
    color: '#ccc',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  buyOnceButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4285F4',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyOnceText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 13,
  },
  subscribeButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  subscribeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  shareIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    borderRadius: 20,
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  shareIconText: {
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 40,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  newBadge: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    borderRadius: 4,
    margin: 16,
    marginBottom: 0,
  },
  newBadgeText: {
    color: '#C67C4E',
    fontWeight: '600',
    fontSize: 14,
  },
  modalHeader: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
  },
  modalProductImage: {
    width: 100,
    height: 100,
    marginRight: 16,
  },
  modalProductInfo: {
    flex: 1,
  },
  modalProductName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  deliveryInfo: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  deliveryTime: {
    fontWeight: '700',
    color: '#000',
  },
  priceSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalPrice: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  modalSize: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  unitPrice: {
    fontSize: 13,
    color: '#999',
  },
  addButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    minWidth: 30,
    textAlign: 'center',
  },
  deliverySlotSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  deliverySlotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
  deliverySlotTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  deliverySlotTime: {
    fontSize: 16,
    color: '#4285F4',
    fontWeight: '600',
    marginLeft: 28,
  },
  deliveryAddressSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  deliveryAddressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  continueShoppingButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueShoppingText: {
    color: '#4285F4',
    fontWeight: '600',
    fontSize: 14,
  },
  goToCartButton: {
    flex: 1,
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  goToCartText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
