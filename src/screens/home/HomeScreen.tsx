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
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';
import { getCategoryDummyImage, getImageWithFallback } from '../../utils/dummyImages';

const { width } = Dimensions.get('window');

const banners = [
  {
    id: 1,
    label: 'Introducing',
    title: 'Farm Fresh\nOrganic Vegetables',
    buttonText: 'Order Now',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    bg: '#FAF7F2',
  },
  {
    id: 2,
    label: 'New Arrival',
    title: 'Premium Quality\nFresh Fruits',
    buttonText: 'Shop Now',
    image:
      'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
    bg: '#F5F9F5',
  },
  {
    id: 3,
    label: 'Special Offer',
    title: 'Organic Dairy\nProducts',
    buttonText: 'Explore',
    image:
      'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
    bg: '#FFF8F0',
  },
];

interface Category {
  id: number;
  name: string;
  image?: string;
  image_url?: string;
  imageUrl?: string;
  photo?: string;
  picture?: string;
}

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const bannerRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get image URL from category
  // Using dummy images for now - switch to API images later
  const getImageUrl = (category: Category): string => {
    // For now, return dummy image only
    return getCategoryDummyImage(category.name);

    // TODO: Later, uncomment below to use API images with fallback
    // const apiImage = category.image || category.image_url || category.imageUrl || category.photo || category.picture || '';
    // const dummyImage = getCategoryDummyImage(category.name);
    // return getImageWithFallback(apiImage, dummyImage);
  };

  // 🔁 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (index + 1) % banners.length;
      setIndex(next);
      bannerRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  // 📥 FETCH CATEGORIES
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/ecommerce/categories');
      const data = await response.json();

      console.log('=== Categories API Response ===');
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Data Success:', data.success);
      console.log('Full Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Handle different possible data structures
        let categoriesData = [];

        if (Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data.data && Array.isArray(data.data.categories)) {
          categoriesData = data.data.categories;
        } else if (data.categories && Array.isArray(data.categories)) {
          categoriesData = data.categories;
        } else {
          categoriesData = [];
        }

        console.log('=== Categories Data ===');
        console.log('Raw data.data type:', typeof data.data);
        console.log('Is data.data array?:', Array.isArray(data.data));
        console.log('Categories Count:', categoriesData.length);
        console.log('Categories Array:', JSON.stringify(categoriesData, null, 2));
        if (categoriesData.length > 0) {
          console.log('First Category:', JSON.stringify(categoriesData[0], null, 2));
        }

        setCategories(categoriesData);
        console.log('Categories state updated with', categoriesData.length, 'items');
      } else {
        setError(data.message || 'Failed to load categories');
        Alert.alert('Error', data.message || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Network error. Please try again.');
      Alert.alert('Network Error', 'Unable to load categories. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🌿 HEADER */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
          <View>
            <Text style={styles.brandName}>Dhanvantri Farm</Text>
            <Text style={styles.brandSubtitle}>Organic</Text>
          </View>
        </View>
      </View>

      {/* 🎯 AUTO SLIDING BANNERS */}
      <FlatList
        ref={bannerRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.banner, { backgroundColor: item.bg }]}>
            <Image
              source={{ uri: item.image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />

            <View style={styles.bannerContent}>
              <Text style={styles.bannerLabel}>{item.label}</Text>
              <Text style={styles.bannerTitle}>{item.title}</Text>

              <TouchableOpacity style={styles.orderButton}>
                <Text style={styles.orderButtonText}>{item.buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* 🔹 DOT INDICATOR */}
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* ℹ️ INFO STRIP */}
      {/* <View style={styles.infoStrip}>
        <Text style={styles.infoText}>
          🥬 Fresh from farms • 🚚 Next day delivery • 💯 Quality assured
        </Text>
      </View> */}

      {/* 🟩 CATEGORY HEADER */}
      <View style={styles.categoryHeaderContainer}>
        <Text style={styles.categoryHeaderText}>All Categories</Text>
      </View>

      {/* 🟩 CATEGORY GRID */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : categories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No categories available</Text>
        </View>
      ) : (
        <View style={styles.categoryGrid}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate('CategoryProducts', {
                  categoryId: item.id,
                  categoryName: item.name,
                })
              }
            >
              <View style={styles.cardContent}>
                {getImageUrl(item) ? (
                  <Image
                    source={{ uri: getImageUrl(item) }}
                    style={styles.categoryImage}
                    resizeMode="contain"
                    onError={(error) => {
                      console.log(`Image failed to load for ${item.name}:`, getImageUrl(item), error.nativeEvent.error);
                    }}
                    onLoad={() => {
                      console.log(`Image loaded successfully for ${item.name}:`, getImageUrl(item));
                    }}
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.placeholderText}>🖼️</Text>
                    <Text style={styles.placeholderSubtext}>No Image</Text>
                  </View>
                )}
              </View>
              <Text style={styles.categoryText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF7',
  },

  /* HEADER */
  header: {
    padding: 16,
    paddingTop: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoEmoji: {
    fontSize: 24,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 2,
  },

  /* BANNER */
  banner: {
    width: width - 32,
    height: 180,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bannerImage: {
    width: '45%',
    height: '100%',
  },
  bannerContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D3A1A',
    marginBottom: 12,
    lineHeight: 24,
  },
  orderButton: {
    backgroundColor: '#6D3F1A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  /* DOTS */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D0D0D0',
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#2E7D32',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  /* INFO STRIP */
  infoStrip: {
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 10,
    borderRadius: 12,
  },
  infoText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },

  /* CATEGORY */
  categoryHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  categoryHeaderText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingBottom: 20,
  },

  card: {
    width: '31%',
    backgroundColor: '#fff',
    margin: '1.16%',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  cardContent: {
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryText: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    lineHeight: 16,
  },

  /* LOADING, ERROR, EMPTY STATES */
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#ccc',
  },
  placeholderSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});
