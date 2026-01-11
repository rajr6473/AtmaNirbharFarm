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
      console.log('Response OK:', response.ok);
      console.log('Data Success:', data.success);
      console.log('Full Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        const ordersData = data.data?.orders || [];
        const paginationData = data.data?.pagination || null;

        console.log('Orders count:', ordersData.length);
        console.log('Pagination:', paginationData);
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
        return '#4CAF50';
      case 'pending':
      case 'processing':
        return '#FF9800';
      case 'confirmed':
        return '#2196F3';
      case 'cancelled':
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getPaymentStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'success':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      default:
        return '#9E9E9E';
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
    if (method === 'cash_on_delivery') return 'Cash on Delivery';
    if (method === 'online') return 'Online Payment';
    return method;
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      {/* Order Header */}
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.order_number || item.id}</Text>
          <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.order_status) }]}>
          <Text style={styles.statusText}>{item.order_status}</Text>
        </View>
      </View>

      {/* Order Details */}
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Amount:</Text>
          <Text style={styles.detailValue}>₹{item.total_amount}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment:</Text>
          <Text style={[styles.detailValue, { color: getPaymentStatusColor(item.payment_status) }]}>
            {formatPaymentMethod(item.payment_method)} - {item.payment_status}
          </Text>
        </View>

        {item.order_items && item.order_items.length > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>
              {item.order_items.length} item{item.order_items.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {item.delivery_address && (
          <View style={styles.addressContainer}>
            <Text style={styles.detailLabel}>Delivery Address:</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {item.delivery_address}
            </Text>
          </View>
        )}
      </View>

      {/* Order Items List */}
      {item.order_items && item.order_items.length > 0 && (
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsTitle}>Order Items:</Text>
          {item.order_items.map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{orderItem.product_name}</Text>
              <Text style={styles.itemQty}>×{orderItem.quantity}</Text>
              <Text style={styles.itemPrice}>₹{orderItem.total_price}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={styles.emptyTitle}>No Orders Yet</Text>
      <Text style={styles.emptyText}>
        You haven't placed any orders yet.{'\n'}
        Start shopping to see your orders here!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        {pagination && pagination.total_count > 0 && (
          <Text style={styles.headerSubtitle}>
            {pagination.total_count} order{pagination.total_count > 1 ? 's' : ''}
          </Text>
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
            colors={['#4285F4']}
            tintColor="#4285F4"
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
    backgroundColor: '#FAFAFA',
  },

  // Loading State
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

  // Header
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },

  // List
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flex: 1,
  },

  // Order Card
  orderCard: {
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

  // Order Header
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Order Details
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  addressContainer: {
    marginTop: 8,
  },
  addressText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    lineHeight: 18,
  },

  // Order Items
  itemsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 6,
    marginBottom: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  itemQty: {
    fontSize: 13,
    color: '#666',
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
