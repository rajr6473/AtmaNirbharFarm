import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

// Placeholder image for categories
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400';

interface Category {
  id: number;
  name: string;
  image?: string;
  image_url?: string;
  description?: string;
  products_count?: number;
}

const AllCategoriesScreen = () => {
  const navigation = useNavigation<any>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setError(null);
      const response = await api.get('/ecommerce/categories');
      const data = await response.json();

      if (response.ok && data.success) {
        let categoriesData = [];
        if (Array.isArray(data.data)) {
          categoriesData = data.data;
        } else if (data.data?.categories) {
          categoriesData = data.data.categories;
        }
        setCategories(categoriesData);
      } else {
        setError(data.message || 'Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
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
      'dry fruits': 'fruit-grapes',
      'beverages': 'cup-water',
      'snacks': 'cookie',
      'pickles': 'food-variant',
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
    const colors = [
      '#FEF3C7', // Amber
      '#DCFCE7', // Green
      '#FEE2E2', // Red
      '#E0E7FF', // Indigo
      '#FCE7F3', // Pink
      '#CFFAFE', // Cyan
      '#FED7AA', // Orange
      '#DDD6FE', // Violet
    ];
    return colors[index % colors.length];
  };

  // Full screen loader
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="view-grid" size={50} color="#2E7D32" />
          </View>
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
          <Text style={styles.loaderText}>Loading categories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Categories</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E7D32']} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={60} color="#dc2626" />
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
              <Icon name="refresh" size={20} color="#fff" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="package-variant" size={60} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Categories</Text>
            <Text style={styles.emptyText}>Categories will appear here once available</Text>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>
              {categories.length} categories available
            </Text>
            <View style={styles.grid}>
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, { backgroundColor: getCategoryColor(index) }]}
                  onPress={() =>
                    navigation.navigate('CategoryProducts', {
                      categoryId: category.id,
                      categoryName: category.name,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.categoryIconContainer}>
                    {category.image || category.image_url ? (
                      <Image
                        source={{ uri: category.image || category.image_url }}
                        style={styles.categoryImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon name={getCategoryIcon(category.name)} size={40} color="#2E7D32" />
                    )}
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    {category.name}
                  </Text>
                  {category.products_count !== undefined && (
                    <Text style={styles.productCount}>
                      {category.products_count} items
                    </Text>
                  )}
                  <View style={styles.arrowContainer}>
                    <Icon name="chevron-right" size={20} color="#2E7D32" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

export default AllCategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spacing.base,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.primaryLight,
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
  },

  // Content
  scrollContent: {
    padding: spacing.base,
  },
  countText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryCard: {
    width: CARD_WIDTH,
    marginHorizontal: 8,
    marginBottom: spacing.base,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '80%',
    height: '80%',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  arrowContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    fontSize: fonts.sizes.md,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
});
