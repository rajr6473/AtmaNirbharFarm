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

// Default banners - used as fallback if API fails
const DEFAULT_BANNERS = [
  {
    id: 1,
    tag: 'BIG SUMMER SALE',
    title: 'Up to 50% OFF',
    subtitle: 'On all organic products',
    buttonText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
    bgColor: '#10B981', // Green
  },
  {
    id: 2,
    tag: 'NEW ARRIVAL',
    title: 'Fresh Organic Vegetables',
    subtitle: 'Farm to table, daily fresh',
    buttonText: 'Shop Now',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    bgColor: '#8B5CF6', // Purple
  },
  {
    id: 3,
    tag: 'BEST SELLER',
    title: 'A2 Desi Ghee',
    subtitle: 'Traditional bilona method',
    buttonText: 'Order Now',
    image: 'https://images.unsplash.com/photo-1631209121750-a9f656d28f5d?w=800',
    bgColor: '#F59E0B', // Amber
  },
  {
    id: 4,
    tag: 'HEALTHY CHOICE',
    title: 'Organic Honey',
    subtitle: '100% pure & natural',
    buttonText: 'Buy Now',
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
    bgColor: '#3B82F6', // Blue
  },
];

interface Banner {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  buttonText: string;
  image: string;
  bgColor: string;
}

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
  const { cart, cartItemCount, addToCart, increment, decrement } = useCart();
  const bannerRef = useRef<FlatList>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>(DEFAULT_BANNERS);
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
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      const next = (bannerIndex + 1) % banners.length;
      setBannerIndex(next);
      bannerRef.current?.scrollToIndex({ index: next, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [bannerIndex, banners.length]);

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

      // Fetch banners
      const bannersResponse = await api.get('/api/v1/mobile/banners');
      if (bannersResponse.ok) {
        const bannersData = await bannersResponse.json();
        console.log('Banners Response:', JSON.stringify(bannersData, null, 2));
        if (bannersData.success) {
          let bannersList = [];
          if (Array.isArray(bannersData.data)) {
            bannersList = bannersData.data;
          } else if (bannersData.data?.banners) {
            bannersList = bannersData.data.banners;
          }
          if (bannersList.length > 0) {
            setBanners(bannersList);
          }
        }
      }

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

  const renderBanner = ({ item, index }: { item: Banner; index: number }) => (
    <View style={styles.bannerWrapper}>
      <View style={[styles.bannerCard, { backgroundColor: item.bgColor }]}>
        {/* Background Image */}
        <Image
          source={{ uri: item.image }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.bannerOverlay} />

        {/* Decorative Elements */}
        <View style={styles.bannerDecoration}>
          <View style={styles.bannerCircle1} />
          <View style={styles.bannerCircle2} />
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
            <Icon name="arrow-right" size={16} color={colors.primary} />
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
                  <Icon name="minus" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{qty}</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    increment(item.id);
                  }}
                  style={styles.qtyButton}
                >
                  <Icon name="plus" size={14} color={colors.primary} />
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
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="leaf" size={50} color={colors.white} />
          </View>
          <ActivityIndicator size="large" color={colors.white} style={{ marginTop: 24 }} />
          <Text style={styles.loaderText}>Loading fresh goodness...</Text>
        </View>
      </View>
    );
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get user initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        bounces={true}
      >
        {/* Hero Header Section with Banner Inside */}
        <View style={styles.heroSection}>
          {/* Decorative Elements */}
          <View style={styles.heroDecorations}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
            <View style={styles.decorCircle3} />
          </View>

          {/* Top Header Row - Avatar, Greeting, Cart */}
          <View style={styles.header}>
            <View style={styles.headerLeftSection}>
              {/* User Avatar */}
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>{getInitials(userName)}</Text>
              </View>
              {/* Greeting & Name */}
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.headerUserName} numberOfLines={1}>{userName.toUpperCase()}</Text>
              </View>
            </View>

            {/* Cart Button */}
            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => navigation.getParent()?.navigate('Cart')}
            >
              <Icon name="cart-outline" size={22} color={colors.white} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartItemCount > 99 ? '99+' : cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Banner Carousel Inside Header */}
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
              snapToInterval={width - 40}
              decelerationRate="fast"
              getItemLayout={(data, index) => ({
                length: width - 40,
                offset: (width - 40) * index,
                index,
              })}
            />

            {/* Banner Dots Inside Banner Area */}
            <View style={styles.dotsContainer}>
              {banners.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, bannerIndex === i && styles.activeDot]}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>
          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate('Explore')}
            activeOpacity={0.8}
          >
            <Icon name="magnify" size={20} color={colors.gray500} />
            <Text style={styles.searchPlaceholder}>Search products...</Text>
          </TouchableOpacity>

          {/* Quick Category Icons */}
          {/* <View style={styles.quickCategorySection}>
            <View style={styles.quickCategoryRow}>
              <TouchableOpacity style={styles.quickCategoryItem}>
                <View style={[styles.quickCategoryIcon, { backgroundColor: colors.purpleTint20 }]}>
                  <Icon name="food-apple" size={24} color={colors.primary} />
                </View>
                <Text style={styles.quickCategoryText}>Grocery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCategoryItem}>
                <View style={[styles.quickCategoryIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Icon name="lightning-bolt" size={24} color="#3B82F6" />
                </View>
                <Text style={styles.quickCategoryText}>Electronics</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCategoryItem}>
                <View style={[styles.quickCategoryIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="heart-pulse" size={24} color="#EF4444" />
                </View>
                <Text style={styles.quickCategoryText}>Health</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickCategoryItem}>
                <View style={[styles.quickCategoryIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Icon name="home" size={24} color="#10B981" />
                </View>
                <Text style={styles.quickCategoryText}>Home</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          {/* Shop by Category */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('AllCategories')}
              >
                <Text style={styles.seeAllText}>View All</Text>
                <Icon name="arrow-right" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle-outline" size={40} color={colors.error} />
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

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Products</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigation.getParent()?.navigate('Explore')}
                >
                  <Text style={styles.seeAllText}>View All</Text>
                  <Icon name="arrow-right" size={14} color={colors.primary} />
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
              onPress={() => navigation.navigate('MyOrders')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: colors.purpleTint20 }]}>
                <Icon name="package-variant" size={24} color={colors.primary} />
              </View>
              <View style={styles.quickActionText}>
                <Text style={styles.quickActionTitle}>My Bookings</Text>
                <Text style={styles.quickActionSubtitle}>View & track orders</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>

          {/* Why Choose Us */}
          <View style={styles.whyChooseSection}>
            <Text style={styles.whyChooseTitle}>Why Choose Dhanvantari?</Text>
            <View style={styles.whyChooseGrid}>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: colors.purpleTint20 }]}>
                  <Icon name="sprout" size={22} color={colors.primary} />
                </View>
                <Text style={styles.whyChooseItemTitle}>100% Organic</Text>
                <Text style={styles.whyChooseItemText}>Certified products</Text>
              </View>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#DBEAFE' }]}>
                  <Icon name="truck-delivery" size={22} color="#3B82F6" />
                </View>
                <Text style={styles.whyChooseItemTitle}>Fast Delivery</Text>
                <Text style={styles.whyChooseItemText}>Same day delivery</Text>
              </View>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="heart" size={22} color="#EF4444" />
                </View>
                <Text style={styles.whyChooseItemTitle}>Made with Love</Text>
                <Text style={styles.whyChooseItemText}>Quality assured</Text>
              </View>
              <View style={styles.whyChooseItem}>
                <View style={[styles.whyChooseIcon, { backgroundColor: '#D1FAE5' }]}>
                  <Icon name="shield-check" size={22} color="#10B981" />
                </View>
                <Text style={styles.whyChooseItemTitle}>Quality Check</Text>
                <Text style={styles.whyChooseItemText}>Lab tested</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Wave Decoration */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavWave} />
      </View>
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
    backgroundColor: colors.primaryLight,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },

  // Hero Section - Contains Header + Banner
  heroSection: {
    backgroundColor: colors.primaryLight,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  heroDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 100,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Header - Avatar + Greeting + Cart
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.warning,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  greetingContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginBottom: 1,
  },
  headerUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.3,
  },
  cartButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },

  // Banner Carousel - Inside Header
  bannerSection: {
    marginTop: 4,
    overflow: 'hidden',
  },
  bannerList: {
    paddingLeft: 0,
  },
  bannerWrapper: {
    width: width - 40,
    paddingRight: 0,
  },

  // Content Area
  contentArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 16,
  },

  // Search Bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: colors.gray400,
  },
  bannerCard: {
    width: width - 40,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.success,
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
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  bannerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bannerCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -15,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    justifyContent: 'center',
    zIndex: 2,
  },
  bannerTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 6,
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  dot: {
    width: 20,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 3,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.white,
  },

  // Quick Category Section
  quickCategorySection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  quickCategoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickCategoryItem: {
    alignItems: 'center',
    width: (width - 80) / 4,
  },
  quickCategoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Section
  sectionContainer: {
    marginTop: 20,
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
    color: colors.textPrimary,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Categories - Card Style like Products
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 14,
  },
  categoryCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.md,
  },
  categoryImageContainer: {
    height: 110,
    backgroundColor: colors.purpleTint10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryIconOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(124, 58, 237, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
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
    backgroundColor: colors.white,
    borderRadius: 18,
    overflow: 'hidden',
    ...shadows.md,
  },
  productImageContainer: {
    height: 140,
    backgroundColor: colors.purpleTint10,
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
    backgroundColor: colors.primary,
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
    backgroundColor: '#EF4444',
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
  productInfo: {
    padding: 14,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 19,
    minHeight: 38,
  },
  productUnit: {
    fontSize: 12,
    color: colors.textMuted,
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
    color: colors.primary,
  },
  productMrp: {
    fontSize: 12,
    color: colors.gray400,
    textDecorationLine: 'line-through',
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purpleTint20,
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
    color: colors.primary,
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
    backgroundColor: colors.error,
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
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 16,
    ...shadows.md,
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
    color: colors.textPrimary,
  },
  quickActionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
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
    color: colors.textPrimary,
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
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...shadows.sm,
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
    color: colors.textPrimary,
    marginBottom: 4,
  },
  whyChooseItemText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Error & Empty
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Bottom Nav Wave
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0,
  },
  bottomNavWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.purpleTint20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
