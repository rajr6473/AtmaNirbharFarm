import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  LayoutAnimation,
  UIManager,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const { width } = Dimensions.get('window');

interface BookingItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: string;
  price: number;
  total: number;
}

interface Booking {
  id: number;
  booking_number: string;
  booking_date: string;
  status: string;
  payment_status: string | null;
  payment_method: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes: string | null;
  invoice_number: string | null;
  created_at: string;
  items: BookingItem[];
}

const STATUS_FILTERS = [
  { key: 'all', label: 'All', icon: 'format-list-bulleted' },
  { key: 'ordered_and_delivery_pending', label: 'Pending', icon: 'clock-outline' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'truck-delivery' },
  { key: 'delivered', label: 'Delivered', icon: 'check-circle' },
  { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'ordered_and_delivery_pending':
      return { color: '#f59e0b', bgColor: '#fef3c7', icon: 'clock-outline', label: 'Pending' };
    case 'out_for_delivery':
      return { color: '#3b82f6', bgColor: '#dbeafe', icon: 'truck-delivery', label: 'Out for Delivery' };
    case 'delivered':
      return { color: '#10b981', bgColor: '#d1fae5', icon: 'check-circle', label: 'Delivered' };
    case 'cancelled':
      return { color: '#ef4444', bgColor: '#fee2e2', icon: 'close-circle', label: 'Cancelled' };
    case 'processing':
      return { color: '#8b5cf6', bgColor: '#ede9fe', icon: 'cog', label: 'Processing' };
    default:
      return { color: '#6b7280', bgColor: '#f3f4f6', icon: 'information', label: status.replace(/_/g, ' ') };
  }
};

const MyBookingsScreen = () => {
  const navigation = useNavigation<any>();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings(1, true);
  }, []);

  useEffect(() => {
    filterBookings();
  }, [selectedFilter, bookings]);

  const filterBookings = () => {
    if (selectedFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === selectedFilter));
    }
  };

  const fetchBookings = async (pageNumber: number, initial = false) => {
    try {
      if (initial) setLoading(true);
      else setLoadingMore(true);
      setError(null);

      const response = await api.get(`/api/v1/mobile/ecommerce/bookings?page=${pageNumber}`);

      if (!response.ok) {
        setError('Failed to load bookings');
        return;
      }

      const data = await response.json();
      console.log('Bookings Response:', JSON.stringify(data, null, 2));

      if (data.success && data.data?.bookings) {
        const newBookings = data.data.bookings;

        setBookings(prev =>
          pageNumber === 1 ? newBookings : [...prev, ...newBookings]
        );

        setHasNextPage(data.data.pagination?.has_next_page || false);
        setPage(pageNumber);
      }
    } catch (err) {
      console.log('Error fetching bookings:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchBookings(page + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(1, true);
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedBookingId(expandedBookingId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFilterCount = (filterKey: string) => {
    if (filterKey === 'all') return bookings.length;
    return bookings.filter(b => b.status === filterKey).length;
  };

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const isExpanded = expandedBookingId === item.id;
    const statusConfig = getStatusConfig(item.status);
    const itemCount = item.items?.length || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.bookingInfo}>
            <View style={styles.bookingNumberContainer}>
              <Icon name="receipt" size={16} color={colors.primary} />
              <Text style={styles.bookingNumber}>{item.booking_number}</Text>
            </View>
            <Text style={styles.bookingDate}>
              {formatDate(item.created_at)} at {formatTime(item.created_at)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
            <Icon name={statusConfig.icon} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Items Preview */}
        <View style={styles.itemsPreview}>
          <Icon name="package-variant" size={18} color="#9ca3af" />
          <Text style={styles.itemsPreviewText}>
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </Text>
          {!isExpanded && item.items?.slice(0, 2).map((product, index) => (
            <Text key={product.id} style={styles.itemPreviewName} numberOfLines={1}>
              {index === 0 ? ' - ' : ', '}{product.product_name}
            </Text>
          ))}
          {!isExpanded && itemCount > 2 && (
            <Text style={styles.moreItems}>+{itemCount - 2} more</Text>
          )}
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            {/* Order Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {item.items?.map((product) => (
                <View key={product.id} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <View style={styles.itemDot} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{product.product_name}</Text>
                      <Text style={styles.itemSku}>SKU: {product.product_sku}</Text>
                    </View>
                  </View>
                  <View style={styles.itemRight}>
                    <Text style={styles.itemQty}>x{parseFloat(product.quantity)}</Text>
                    <Text style={styles.itemPrice}>₹{product.total}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Delivery Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Delivery Details</Text>
              <View style={styles.detailRow}>
                <Icon name="map-marker" size={18} color="#6b7280" />
                <Text style={styles.detailText}>{item.delivery_address}</Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="phone" size={18} color="#6b7280" />
                <Text style={styles.detailText}>{item.customer_phone}</Text>
              </View>
              {item.notes && (
                <View style={styles.detailRow}>
                  <Icon name="note-text" size={18} color="#6b7280" />
                  <Text style={styles.detailText}>{item.notes}</Text>
                </View>
              )}
            </View>

            {/* Price Summary */}
            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Subtotal</Text>
                <Text style={styles.priceValue}>₹{item.subtotal}</Text>
              </View>
              {item.tax_amount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Tax</Text>
                  <Text style={styles.priceValue}>₹{item.tax_amount}</Text>
                </View>
              )}
              {item.discount_amount > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Discount</Text>
                  <Text style={[styles.priceValue, { color: '#10b981' }]}>-₹{item.discount_amount}</Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{item.total_amount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Expand/Collapse Indicator */}
        <View style={styles.expandIndicator}>
          <Icon
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#9ca3af"
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="package-variant-closed" size={60} color="#d1d5db" />
      </View>
      <Text style={styles.emptyTitle}>No Bookings Found</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all'
          ? "You haven't placed any orders yet."
          : `No ${STATUS_FILTERS.find(f => f.key === selectedFilter)?.label.toLowerCase()} bookings.`}
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => navigation.getParent()?.navigate('Explore')}
      >
        <Icon name="shopping" size={20} color="#fff" />
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && page === 1) {
    return (
      <View style={styles.loaderContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading your bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Icon name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="shopping" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="clock-outline" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>
            {bookings.filter(b => b.status === 'ordered_and_delivery_pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color="#10b981" />
          <Text style={styles.statValue}>
            {bookings.filter(b => b.status === 'delivered').length}
          </Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterContent}
      >
        {STATUS_FILTERS.map((filter) => {
          const isSelected = selectedFilter === filter.key;
          const count = getFilterCount(filter.key);
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterTab, isSelected && styles.filterTabSelected]}
              onPress={() => setSelectedFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.filterTabText, isSelected && styles.filterTabTextSelected]}
                numberOfLines={1}
              >
                {filter.label}
              </Text>
              <View style={[styles.filterBadge, isSelected && styles.filterBadgeSelected]}>
                <Text style={[styles.filterBadgeText, isSelected && styles.filterBadgeTextSelected]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bookings List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={50} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchBookings(1, true)}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBookingCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
            ) : null
          }
        />
      )}
    </View>
  );
};

export default MyBookingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loaderContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },

  // Filters
  filterScrollView: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 56,
  },
  filterContent: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    height: 36,
  },
  filterTabSelected: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  filterTabTextSelected: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#d1d5db',
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeSelected: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4b5563',
  },
  filterBadgeTextSelected: {
    color: '#fff',
  },

  // List
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  bookingNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  bookingDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Items Preview
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  itemsPreviewText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
  },
  itemPreviewName: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  moreItems: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Expanded Content
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
    marginLeft: 4,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 12,
    marginLeft: -5,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  itemSku: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemQty: {
    fontSize: 12,
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },

  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
  },

  // Price Summary
  priceSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  priceValue: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },

  // Expand Indicator
  expandIndicator: {
    alignItems: 'center',
    paddingTop: 8,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Loader
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6b7280',
  },
});
