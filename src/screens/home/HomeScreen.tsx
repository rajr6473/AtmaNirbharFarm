import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Animated,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../utils/api';
import { useCart } from '../../context/CartContext';
import { colors, fonts, spacing, borderRadius, shadows } from '../../theme';

const { width, height } = Dimensions.get('window');

// Placeholder images for categories and products
const PLACEHOLDER_IMAGES = {
  category: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
  product: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
};

// Dummy banners - will come from API later
const banners = [
  {
    id: 1,
    tag: 'LIMITED TIME OFFER',
    title: 'Subscribe & Save 20%',
    subtitle: 'On all recurring monthly plans',
    buttonText: 'Claim Now',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    bgColor: '#2D5A4A',
  },
  {
    id: 2,
    tag: 'NEW ARRIVAL',
    title: 'Fresh Organic Vegetables',
    subtitle: 'Farm to table, daily fresh',
    buttonText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    bgColor: '#1A5D3A',
  },
  {
    id: 3,
    tag: 'BEST SELLER',
    title: 'A2 Desi Ghee',
    subtitle: 'Traditional bilona method',
    buttonText: 'Order Now',
    image: 'https://images.unsplash.com/photo-1631209121750-a9f656d28f5d?w=800',
    bgColor: '#8B6914',
  },
  {
    id: 4,
    tag: 'HEALTHY CHOICE',
    title: 'Organic Honey',
    subtitle: '100% pure & natural',
    buttonText: 'Buy Now',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
    bgColor: '#B45309',
  },
];

interface Category {
  id: number;
  name: string;
  image?: string;
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
  is_in_stock?: boolean;
  stock?: number;
  image?: string;
  image_url?: string;
  images?: string[];
  unit?: string;
  description?: string;
}

// Helper function to get category image - prioritize image_url from API
const getCategoryImage = (category: Category): string => {
  if (category.image_url && category.image_url.trim() !== '') return category.image_url;
  if (category.image && category.image.trim() !== '') return category.image;
  return PLACEHOLDER_IMAGES.category;
};

// Helper function to get product image
const getProductImage = (product: Product): string => {
  if (product.images && product.images.length > 0 && product.images[0]) {
    return product.images[0];
  }
  if (product.image && product.image.trim() !== '') return product.image;
  if (product.image_url && product.image_url.trim() !== '') return product.image_url;
  return PLACEHOLDER_IMAGES.product;
};

// Helper function to get display price
const getDisplayPrice = (product: Product): number => {
  return product.final_price || product.selling_price || product.discount_price || product.price;
};

// Helper function to check if product has discount
const hasDiscount = (product: Product): boolean => {
  if (product.is_discounted) return true;
  const displayPrice = getDisplayPrice(product);
  return displayPrice < product.price;
};

// Helper function to check if product is in stock
const isInStock = (product: Product): boolean => {
  if (product.is_in_stock !== undefined) return product.is_in_stock;
  if (product.stock !== undefined) return product.stock > 0;
  return true;
};

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { cart, addToCart, increment, decrement } = useCart();
  const bannerRef = useRef<FlatList>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    fetchData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Auto slide banners
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (bannerIndex + 1) % banners.length;
      setBannerIndex(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerIndex]);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      setUserName(name || 'User');
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchData = async () => {
    try {
      setError(null);

      // Fetch categories
      const categoriesResponse = await api.get('/api/v1/mobile/ecommerce/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        console.log('Categories Response:', JSON.stringify(categoriesData, null, 2));
        if (categoriesData.success) {
          let cats = [];
          if (Array.isArray(categoriesData.data)) {
            cats = categoriesData.data;
          } else if (categoriesData.data?.categories) {
            cats = categoriesData.data.categories;
          }
          setCategories(cats);
        }
      }

      // Fetch featured products
      const featuredResponse = await api.get('/api/v1/mobile/ecommerce/featured_products');
      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        console.log('Featured Products Response:', JSON.stringify(featuredData, null, 2));
        if (featuredData.success) {
          let prods = [];
          if (Array.isArray(featuredData.data)) {
            prods = featuredData.data;
          } else if (featuredData.data?.products) {
            prods = featuredData.data.products;
          }
          setFeaturedProducts(prods);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getCategoryIcon = (name: string): string => {
    const iconMap: { [key: string]: string } = {
      'dairy': 'cup',
      'milk': 'cup',
      'grains': 'barley',
      'rice': 'barley',
      'spices': 'chili-mild',
      'oils': 'bottle-tonic',
      'ghee': 'bottle-tonic',
      'vegetables': 'carrot',
      'fruits': 'apple',
      'pulses': 'seed',
      'flour': 'grain',
      'honey': 'beehive-outline',
      'jaggery': 'cube',
      'nuts': 'peanut',
      'default': 'food-apple',
    };

    const lowerName = name.toLowerCase();
    for (const key in iconMap) {
      if (lowerName.includes(key)) {
        return iconMap[key];
      }
    }
    return iconMap['default'];
  };

  const handleAddToCart = (product: Product) => {
    if (!isInStock(product)) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: getDisplayPrice(product),
      image: getProductImage(product),
    });
  };

  const renderBanner = ({ item, index }: { item: typeof banners[0]; index: number }) => (
    <View style={styles.bannerWrapper}>
      <View style={[styles.bannerCard, { backgroundColor: item.bgColor }]}>
        {/* Background Image */}
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />

        {/* Decorative Leaves */}
        <View style={styles.bannerDecoration}>
          <Icon name="leaf" size={80} color="rgba(255,255,255,0.1)" style={{ transform: [{ rotate: '45deg' }] }} />
        </View>

        {/* Content */}
        <View style={styles.bannerContent}>
          <View style={styles.bannerTag}>
            <Text style={styles.bannerTagText}>{item.tag}</Text>
          </View>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation.getParent()?.navigate('Subscribe')}
          >
            <Text style={styles.bannerButtonText}>{item.buttonText}</Text>
            <Icon name="arrow-right" size={16} color="#1A3C34" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCategory = ({ item, index }: { item: Category; index: number }) => {
    const imageUrl = getCategoryImage(item);
    const hasRealImage = (item.image_url && item.image_url.trim() !== '') || (item.image && item.image.trim() !== '');

    return (
      <TouchableOpacity
        style={styles.categoryCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CategoryProducts', {
          categoryId: item.id,
          categoryName: item.name,
        })}
      >
        <View style={styles.categoryImageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
          {/* Overlay with icon if using placeholder */}
          {!hasRealImage && (
            <View style={styles.categoryIconOverlay}>
              <Icon name={getCategoryIcon(item.name)} size={36} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => {
    const isHot = index === 1;
    const imageUrl = getProductImage(item);
    const displayPrice = getDisplayPrice(item);
    const showDiscount = hasDiscount(item);
    const inStock = isInStock(item);
    const cartItem = cart.find((c: any) => c.id === item.id);
    const qty = cartItem ? cartItem.qty : 0;

    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
      >
        <View style={styles.productImageContainer}>
          <View style={styles.productBadges}>
            <View style={styles.organicBadge}>
              <Text style={styles.organicBadgeText}>ORGANIC</Text>
            </View>
            {isHot && (
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>HOT</Text>
              </View>
            )}
          </View>

          <Image
            source={{ uri: imageUrl }}
            style={styles.productImage}
            resizeMode="contain"
          />

          {/* Out of Stock Overlay */}
          {!inStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Out of Stock</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          {item.unit && <Text style={styles.productUnit}>{item.unit}</Text>}

          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>₹{displayPrice}</Text>
              {showDiscount && (
                <Text style={styles.productMrp}>₹{item.price}</Text>
              )}
            </View>
            {!inStock ? (
              <View style={styles.outOfStockBtn}>
                <Text style={styles.outOfStockBtnText}>N/A</Text>
              </View>
            ) : qty === 0 ? (
              <TouchableOpacity
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleAddToCart(item);
                }}
              >
                <Icon name="plus" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyControl}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    decrement(item.id);
                  }}
                  style={styles.qtyButton}
                >
                  <Icon name="minus" size={14} color="#2E7D32" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    increment(item.id);
                  }}
                  style={styles.qtyButton}
                >
                  <Icon name="plus" size={14} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Premium Loading Screen
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1A3C34" />
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="leaf" size={50} color="#C4A962" />
          </View>
          <ActivityIndicator size="large" color="#C4A962" style={{ marginTop: 24 }} />
          <Text style={styles.loaderText}>Loading fresh goodness...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C34" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#C4A962']}
            tintColor="#C4A962"
          />
        }
        bounces={true}
      >
        {/* Hero Header Section */}
        <View style={styles.heroSection}>
          {/* Decorative Elements */}
          <View style={styles.heroDecorations}>
            <Icon name="leaf" size={120} color="rgba(255,255,255,0.03)" style={styles.decorLeaf1} />
            <Icon name="leaf" size={80} color="rgba(255,255,255,0.02)" style={styles.decorLeaf2} />
          </View>

          {/* Header with Welcome and Name */}
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <TouchableOpacity style={styles.avatarButton}>
              <Text style={styles.avatarEmoji}>🌿</Text>
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate('Explore')}
            activeOpacity={0.8}
          >
            <Icon name="magnify" size={20} color="rgba(255,255,255,0.5)" />
            <Text style={styles.searchPlaceholder}>Search organic products...</Text>
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Banner Carousel */}
          <View style={styles.bannerSection}>
            <FlatList
              ref={bannerRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderBanner}
              onMomentumScrollEnd={(e) => {
                const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                setBannerIndex(newIndex);
              }}
              contentContainerStyle={styles.bannerList}
              snapToInterval={width - 40}
              decelerationRate="fast"
              getItemLayout={(data, index) => ({
                length: width - 40,
                offset: (width - 40) * index,
                index,
              })}
            />

            {/* Banner Dots */}
            <View style={styles.dotsContainer}>
              {banners.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, bannerIndex === i && styles.activeDot]}
                />
              ))}
            </View>
          </View>

          {/* Shop by Category */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('AllCategories')}
              >
                <Text style={styles.seeAllText}>View All</Text>
                <Icon name="arrow-right" size={14} color="#2D5A4A" />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={40} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCategory}
                contentContainerStyle={styles.categoriesContainer}
              />
            )}
          </View>

          {/* Trending Products */}
          {featuredProducts.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Products</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigation.getParent()?.navigate('Explore')}
                >
                  <Text style={styles.seeAllText}>View All</Text>
                  <Icon name="arrow-right" size={14} color="#2D5A4A" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={featuredProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderProduct}
                contentContainerStyle={styles.productsContainer}
              />
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.getParent()?.navigate('Subscribe')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="calendar-sync" size={24} color="#2D5A4A" />
              </View>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>My Subscriptions</Text>
                <Text style={styles.quickActionSubtitle}>Manage your plans</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate('MyOrders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Icon name="package-variant" size={24} color="#B45309" />
              </View>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>My Bookings</Text>
                <Text style={styles.quickActionSubtitle}>View & track orders</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Why Choose Us */}
          <View style={styles.whyChooseSection}>
            <Text style={styles.whyChooseTitle}>Why Choose Dhanvantari?</Text>
            <View style={styles.whyChooseGrid}>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#E8F5E9' }]}>
                  <Icon name="sprout" size={22} color="#2D5A4A" />
                </View>
                <Text style={styles.whyChooseItemTitle}>100% Organic</Text>
                <Text style={styles.whyChooseItemText}>Certified products</Text>
              </View>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="truck-delivery" size={22} color="#B45309" />
                </View>
                <Text style={styles.whyChooseItemTitle}>Fast Delivery</Text>
                <Text style={styles.whyChooseItemText}>Same day delivery</Text>
              </View>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="heart" size={22} color="#DC2626" />
                </View>
                <Text style={styles.whyChooseItemTitle}>Made with Love</Text>
                <Text style={styles.whyChooseItemText}>Quality assured</Text>
              </View>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#E0E7FF' }]}>
                  <Icon name="shield-check" size={22} color="#4F46E5" />
                </View>
                <Text style={styles.whyChooseItemTitle}>Quality Check</Text>
                <Text style={styles.whyChooseItemText}>Lab tested</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.primary,
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
    backgroundColor: 'rgba(196, 169, 98, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(196, 169, 98, 0.3)',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },

  // Hero Section
  heroSection: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorLeaf1: {
    position: 'absolute',
    top: -20,
    right: -30,
    transform: [{ rotate: '45deg' }],
  },
  decorLeaf2: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    transform: [{ rotate: '-30deg' }],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 2,
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  avatarButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: 'rgba(255,255,255,0.5)',
  },
  filterButton: {
    backgroundColor: '#C4A962',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A3C34',
  },

  // Content Area
  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: -1,
  },

  // Banner Carousel
  bannerSection: {
    marginTop: 20,
  },
  bannerList: {
    paddingHorizontal: 20,
  },
  bannerWrapper: {
    width: width - 40,
  },
  bannerCard: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bannerDecoration: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C4A962',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3C34',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#2D5A4A',
  },

  // Section
  sectionContainer: {
    marginTop: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C34',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D5A4A',
  },

  // Categories - Card Style like Products
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },
  categoryCard: {
    width: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryImageContainer: {
    height: 110,
    backgroundColor: '#F8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
  },
  categoryIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(45, 90, 74, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3C34',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  // Products
  productsContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },
  productCard: {
    width: 165,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: '#F8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  organicBadge: {
    backgroundColor: '#2D5A4A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  organicBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  hotBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  hotBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  productImage: {
    width: '75%',
    height: '75%',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3C34',
    lineHeight: 19,
    minHeight: 38,
  },
  productUnit: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D5A4A',
  },
  productMrp: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2D5A4A',
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
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
    minWidth: 22,
    textAlign: 'center',
  },
  // Out of Stock styles
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  outOfStockBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  outOfStockBtn: {
    backgroundColor: colors.gray300,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  outOfStockBtnText: {
    color: colors.gray600,
    fontSize: 12,
    fontWeight: '600',
  },

  // Quick Actions
  quickActionsSection: {
    paddingHorizontal: 20,
    marginTop: 28,
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    flex: 1,
    marginLeft: 14,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A3C34',
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // Why Choose Us
  whyChooseSection: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  whyChooseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A3C34',
    marginBottom: 16,
    textAlign: 'center',
  },
  whyChooseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  whyChooseItem: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  whyChooseIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  whyChooseItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A3C34',
    marginBottom: 4,
  },
  whyChooseItemText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Error & Empty
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2D5A4A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
