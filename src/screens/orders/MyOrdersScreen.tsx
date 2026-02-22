import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  pincode: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface Pagination {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

const MyOrdersScreen = () => {
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('=== Fetching Orders ===');
      setLoading(true);

      const response = await api.get('/ecommerce/orders');
      const data = await response.json();

      console.log('=== Orders API Response ===');
      console.log('Response Status:', response.status);
      console.log('Data:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Handle different response structures
        let ordersData: Order[] = [];
        if (Array.isArray(data.data)) {
          ordersData = data.data;
        } else if (data.data?.orders) {
          ordersData = data.data.orders;
        } else if (data.orders) {
          ordersData = data.orders;
        }

        const paginationData = data.data?.pagination || data.pagination || null;

        console.log('Orders count:', ordersData.length);
        setOrders(ordersData);
        setPagination(paginationData);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return '#16a34a';
      case 'pending':
      case 'processing':
        return '#f59e0b';
      case 'confirmed':
      case 'shipped':
        return '#2563eb';
      case 'cancelled':
      case 'failed':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'processing':
        return 'progress-clock';
      case 'confirmed':
        return 'clipboard-check-outline';
      case 'shipped':
        return 'truck-delivery';
      case 'cancelled':
      case 'failed':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatPaymentMethod = (method: string): string => {
    if (method === 'cash_on_delivery' || method === 'cod') return 'COD';
    if (method === 'online') return 'Online';
    return method;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard} activeOpacity={0.8}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderIdContainer}>
          <Icon name="receipt" size={18} color="#2E7D32" />
          <Text style={styles.orderNumber}>#{item.order_number || item.id}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) }]}>
          <Icon name={getStatusIcon(item.order_status)} size={14} color="#fff" />
          <Text style={styles.statusText}>{item.order_status}</Text>
        </View>
      </View>

      {/* Order Date & Amount */}
      <View style={styles.orderMeta}>
        <View style={styles.metaItem}>
          <Icon name="calendar" size={16} color="#6b7280" />
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="currency-inr" size={16} color="#2E7D32" />
          <Text style={styles.totalAmount}>₹{item.total_amount}</Text>
        </View>
      </View>

      {/* Order Items */}
      {item.order_items && item.order_items.length > 0 ? (
        <View style={styles.itemsContainer}>
          {item.order_items.slice(0, 3).map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemDot} />
              <Text style={styles.itemName} numberOfLines={1}>{orderItem.product_name}</Text>
              <Text style={styles.itemQty}>×{orderItem.quantity}</Text>
              <Text style={styles.itemPrice}>₹{orderItem.total_price || orderItem.price * orderItem.quantity}</Text>
            </View>
          ))}
          {item.order_items.length > 3 ? (
            <Text style={styles.moreItems}>+{item.order_items.length - 3} more items</Text>
          ) : null}
        </View>
      ) : null}

      {/* Order Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.paymentInfo}>
          <Icon
            name={item.payment_method === 'cod' || item.payment_method === 'cash_on_delivery' ? 'cash' : 'credit-card'}
            size={16}
            color="#6b7280"
          />
          <Text style={styles.paymentText}>{formatPaymentMethod(item.payment_method)}</Text>
        </View>
        {item.delivery_address ? (
          <View style={styles.addressInfo}>
            <Icon name="map-marker-outline" size={16} color="#6b7280" />
            <Text style={styles.addressText} numberOfLines={1}>{item.delivery_address}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="package-variant" size={60} color="#9ca3af" />
      </View>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyText}>
        You haven't placed any orders yet.{'\n'}
        Start shopping to see your orders here!
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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading orders...</Text>
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
        <Text style={styles.headerTitle}>My Orders</Text>
        {pagination && pagination.total_count > 0 ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pagination.total_count}</Text>
          </View>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={orders.length === 0 ? styles.emptyListContainer : styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
      />
    </View>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF7',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },

  // List
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyListContainer: {
    flex: 1,
  },

  // Order Card
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Order Meta
  orderMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
  },

  // Order Items
  itemsContainer: {
    marginTop: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 6,
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2E7D32',
    marginRight: 10,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },
  itemQty: {
    fontSize: 13,
    color: '#6b7280',
    marginHorizontal: 8,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  moreItems: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 8,
  },

  // Order Footer
  orderFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentText: {
    fontSize: 13,
    color: '#6b7280',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: '#9ca3af',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
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
    color: '#111',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
