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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../utils/api';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');

// Promotional Banners
const banners = [
  {
    id: 1,
    tag: 'LIMITED OFFER',
    title: 'Subscribe &\nSave 20%',
    subtitle: 'On all monthly plans\nPause anytime, no lock-in',
    buttonText: 'Grab Offer',
    gradient: ['#FF6B35', '#F7931E'],
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400',
  },
  {
    id: 2,
    tag: 'NEW ARRIVAL',
    title: 'Fresh Organic\nVegetables',
    subtitle: 'Farm to table\nDaily fresh delivery',
    buttonText: 'Shop Now',
    gradient: ['#2E7D32', '#4CAF50'],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
  },
  {
    id: 3,
    tag: 'BEST SELLER',
    title: 'A2 Desi Ghee\nPure & Natural',
    subtitle: 'Traditional bilona method\n100% authentic',
    buttonText: 'Order Now',
    gradient: ['#D4A574', '#B8860B'],
    image: 'https://images.unsplash.com/photo-1631209121750-a9f656d28f5d?w=400',
  },
];

// Feature highlights
const features = [
  { id: 1, icon: 'leaf', title: '100% Organic', color: '#2E7D32' },
  { id: 2, icon: 'truck-fast', title: 'Fast Delivery', color: '#1976D2' },
  { id: 3, icon: 'shield-check', title: 'Quality Check', color: '#7B1FA2' },
  { id: 4, icon: 'cash-refund', title: 'Easy Returns', color: '#F57C00' },
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
  image?: string;
  image_url?: string;
  unit?: string;
  description?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { addToCart } = useCart();
  const bannerRef = useRef<FlatList>(null);
  const [bannerIndex, setBannerIndex] = useState(0);
  const [userName, setUserName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserData();
    fetchData();
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
      const categoriesResponse = await api.get('/ecommerce/categories');
      const categoriesData = await categoriesResponse.json();

      if (categoriesResponse.ok && categoriesData.success) {
        let cats = [];
        if (Array.isArray(categoriesData.data)) {
          cats = categoriesData.data;
        } else if (categoriesData.data?.categories) {
          cats = categoriesData.data.categories;
        }
        setCategories(cats);
      }

      // Fetch featured products
      const productsResponse = await api.get('/ecommerce/products?limit=6');
      const productsData = await productsResponse.json();

      if (productsResponse.ok && productsData.success) {
        let prods = [];
        if (Array.isArray(productsData.data)) {
          prods = productsData.data;
        } else if (productsData.data?.products) {
          prods = productsData.data.products;
        }
        setFeaturedProducts(prods.slice(0, 6));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Network error. Please try again.');
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
      'spices': 'shaker',
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

  const getCategoryColor = (index: number): string => {
    const colors = ['#E8F5E9', '#FFF3E0', '#E3F2FD', '#FCE4EC', '#F3E5F5', '#E0F7FA', '#FFF8E1', '#F1F8E9'];
    return colors[index % colors.length];
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.image_url || '',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const renderBanner = ({ item, index }: { item: typeof banners[0]; index: number }) => (
    <View style={styles.bannerWrapper}>
      <View style={[styles.bannerCard, { backgroundColor: item.gradient[0] }]}>
        <View style={styles.bannerContent}>
          <View style={styles.bannerTag}>
            <Icon name="lightning-bolt" size={12} color={item.gradient[0]} />
            <Text style={[styles.bannerTagText, { color: item.gradient[0] }]}>{item.tag}</Text>
          </View>
          <Text style={styles.bannerTitle}>{item.title}</Text>
          <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
          <TouchableOpacity
            style={styles.bannerButton}
            onPress={() => navigation.getParent()?.navigate('Subscribe')}
          >
            <Text style={[styles.bannerButtonText, { color: item.gradient[0] }]}>{item.buttonText}</Text>
            <Icon name="arrow-right" size={16} color={item.gradient[0]} />
          </TouchableOpacity>
        </View>
        <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
        <View style={styles.bannerOverlay} />
      </View>
    </View>
  );

  const renderCategory = ({ item, index }: { item: Category; index: number }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() =>
        navigation.navigate('CategoryProducts', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
      activeOpacity={0.7}
    >
      <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(index) }]}>
        {item.image || item.image_url ? (
          <Image
            source={{ uri: item.image || item.image_url }}
            style={styles.categoryImage}
            resizeMode="contain"
          />
        ) : (
          <Icon name={getCategoryIcon(item.name)} size={28} color="#2E7D32" />
        )}
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('Subscription', { product: item })}
    >
      <View style={styles.productImageContainer}>
        {item.image || item.image_url ? (
          <Image
            source={{ uri: item.image || item.image_url }}
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.productPlaceholder}>
            <Icon name="image-outline" size={40} color="#d1d5db" />
          </View>
        )}
        {item.mrp && item.mrp > item.price ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round(((item.mrp - item.price) / item.mrp) * 100)}% OFF
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.unit ? <Text style={styles.productUnit}>{item.unit}</Text> : null}
        <View style={styles.productPriceRow}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.mrp && item.mrp > item.price ? (
            <Text style={styles.productMrp}>₹{item.mrp}</Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={() => handleAddToCart(item)}
      >
        <Icon name="plus" size={18} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Full screen loader
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="leaf" size={50} color="#2E7D32" />
          </View>
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
          <Text style={styles.loaderText}>Loading fresh goodness...</Text>
          <Text style={styles.loaderSubtext}>Please wait while we fetch the best for you</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Icon name="account" size={24} color="#2E7D32" />
              </View>
              <View>
                <Text style={styles.greetingText}>{getGreeting()}</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('MyOrders')}
              >
                <Icon name="bell-outline" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => navigation.getParent()?.navigate('Explore')}
            activeOpacity={0.8}
          >
            <Icon name="magnify" size={22} color="#9ca3af" />
            <Text style={styles.searchPlaceholder}>Search for products, brands...</Text>
          </TouchableOpacity>
        </View>

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
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
              setBannerIndex(newIndex);
            }}
            contentContainerStyle={styles.bannerList}
            snapToInterval={width - 32}
            decelerationRate="fast"
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

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature.id} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
                <Icon name={feature.icon} size={20} color={feature.color} />
              </View>
              <Text style={styles.featureText}>{feature.title}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#E8F5E9' }]}
            onPress={() => navigation.getParent()?.navigate('Subscribe')}
          >
            <Icon name="calendar-sync" size={28} color="#2E7D32" />
            <View style={styles.quickActionTextContainer}>
              <Text style={styles.quickActionTitle}>My Subscriptions</Text>
              <Text style={styles.quickActionSubtitle}>Manage your plans</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#2E7D32" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionCard, { backgroundColor: '#FFF3E0' }]}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <Icon name="package-variant" size={28} color="#F57C00" />
            <View style={styles.quickActionTextContainer}>
              <Text style={styles.quickActionTitle}>Track Orders</Text>
              <Text style={styles.quickActionSubtitle}>View order status</Text>
            </View>
            <Icon name="chevron-right" size={24} color="#F57C00" />
          </TouchableOpacity>
        </View>

        {/* Shop by Category */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Icon name="apps" size={22} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Shop by Category</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllCategories')}
            >
              <Text style={styles.seeAllText}>See All</Text>
              <Icon name="arrow-right" size={16} color="#2E7D32" />
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
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="package-variant" size={40} color="#9ca3af" />
              <Text style={styles.emptyText}>No categories available</Text>
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
        {featuredProducts.length > 0 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="star" size={22} color="#F59E0B" />
                <Text style={styles.sectionTitle}>Featured Products</Text>
              </View>
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.getParent()?.navigate('Explore')}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <Icon name="arrow-right" size={16} color="#2E7D32" />
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
        ) : null}

        {/* Subscription Promo */}
        <View style={styles.promoContainer}>
          <View style={styles.promoCard}>
            <View style={styles.promoContent}>
              <View style={styles.promoIconContainer}>
                <Icon name="calendar-clock" size={32} color="#2E7D32" />
              </View>
              <Text style={styles.promoTitle}>Subscribe & Save</Text>
              <Text style={styles.promoSubtitle}>
                Get fresh products delivered daily, weekly or monthly at discounted prices
              </Text>
              <TouchableOpacity
                style={styles.promoButton}
                onPress={() => navigation.getParent()?.navigate('Subscribe')}
              >
                <Text style={styles.promoButtonText}>Start Subscription</Text>
                <Icon name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.promoDecoration}>
              <Icon name="leaf" size={80} color="rgba(46, 125, 50, 0.1)" />
            </View>
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.whyChooseContainer}>
          <Text style={styles.whyChooseTitle}>Why Choose Dhanvantri Naturals?</Text>
          <View style={styles.whyChooseGrid}>
            <View style={styles.whyChooseItem}>
              <View style={[styles.whyChooseIcon, { backgroundColor: '#E8F5E9' }]}>
                <Icon name="sprout" size={24} color="#2E7D32" />
              </View>
              <Text style={styles.whyChooseItemTitle}>100% Organic</Text>
              <Text style={styles.whyChooseItemText}>Certified organic products</Text>
            </View>
            <View style={styles.whyChooseItem}>
              <View style={[styles.whyChooseIcon, { backgroundColor: '#FFF3E0' }]}>
                <Icon name="farm" size={24} color="#F57C00" />
              </View>
              <Text style={styles.whyChooseItemTitle}>Farm Fresh</Text>
              <Text style={styles.whyChooseItemText}>Direct from farmers</Text>
            </View>
            <View style={styles.whyChooseItem}>
              <View style={[styles.whyChooseIcon, { backgroundColor: '#E3F2FD' }]}>
                <Icon name="truck-delivery-outline" size={24} color="#1976D2" />
              </View>
              <Text style={styles.whyChooseItemTitle}>Fast Delivery</Text>
              <Text style={styles.whyChooseItemText}>Same day delivery</Text>
            </View>
            <View style={styles.whyChooseItem}>
              <View style={[styles.whyChooseIcon, { backgroundColor: '#FCE4EC' }]}>
                <Icon name="heart-outline" size={24} color="#E91E63" />
              </View>
              <Text style={styles.whyChooseItemTitle}>Made with Love</Text>
              <Text style={styles.whyChooseItemText}>Quality assured</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;

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
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  greetingText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#9ca3af',
  },

  // Banner
  bannerSection: {
    marginTop: 16,
  },
  bannerList: {
    paddingHorizontal: 16,
  },
  bannerWrapper: {
    width: width - 32,
    paddingRight: 0,
  },
  bannerCard: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  bannerTagText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 28,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    lineHeight: 18,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 14,
    gap: 6,
  },
  bannerButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bannerImage: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 180,
    height: 180,
    opacity: 0.3,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#2E7D32',
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 12,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  quickActionTextContainer: {
    flex: 1,
    marginLeft: 14,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },

  // Section
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 14,
    width: 80,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  categoryImage: {
    width: '70%',
    height: '70%',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
  },

  // Products
  productsContainer: {
    paddingHorizontal: 16,
  },
  productCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  productImageContainer: {
    height: 120,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '80%',
    height: '80%',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
    lineHeight: 18,
    minHeight: 36,
  },
  productUnit: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  productPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },
  productMrp: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Promo
  promoContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  promoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  promoContent: {
    zIndex: 1,
  },
  promoIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  promoDecoration: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    opacity: 0.5,
  },

  // Why Choose Us
  whyChooseContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  whyChooseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  whyChooseIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  whyChooseItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  whyChooseItemText: {
    fontSize: 12,
    color: '#6b7280',
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
});
