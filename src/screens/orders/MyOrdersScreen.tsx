import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../utils/api';
import { colors, shadows } from '../../theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface Order {
  id: number;
  order_number: string;
  order_status: string;
  total_amount: number;
  delivery_address: string;
  notes?: string;
  created_at: string;
  order_items?: OrderItem[];
}

const MyBookingsScreen = () => {
  const navigation = useNavigation<any>();

  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    fetchOrders(1, true);
  }, []);

  const fetchOrders = async (pageNumber: number, initial = false) => {
    try {
      if (initial) setLoading(true);
      else setLoadingMore(true);

      const response = await api.get(
        `/ecommerce/bookings?page=${pageNumber}`
      );
      const data = await response.json();

      if (response.ok && data.success && data.data?.bookings) {
        const mapped = data.data.bookings.map((booking: any) => ({
          id: booking.id,
          order_number: booking.booking_number,
          order_status: booking.status,
          total_amount: booking.total_amount,
          delivery_address: booking.delivery_address,
          notes: booking.notes,
          created_at: booking.created_at,
          order_items: booking.items?.map((item: any) => ({
            id: item.id,
            product_name: item.product_name,
            quantity: item.quantity,
            total_price: item.total,
          })),
        }));

        setOrders(prev =>
          pageNumber === 1 ? mapped : [...prev, ...mapped]
        );

        setHasNextPage(data.data.pagination?.has_next_page);
        setPage(pageNumber);
      }
    } catch (err) {
      console.log('Error fetching bookings:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasNextPage) {
      fetchOrders(page + 1);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(1, true);
  };

  const toggleExpand = (id: number) => {
    LayoutAnimation.easeInEaseOut();
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatStatus = (status: string) =>
    status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ordered_and_delivery_pending':
        return '#FFA726';
      case 'delivered':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const renderItem = ({ item }: { item: Order }) => {
    const isExpanded = expandedOrderId === item.id;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => toggleExpand(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>#{item.order_number}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.order_status) },
            ]}
          >
            <Text style={styles.statusText}>
              {formatStatus(item.order_status)}
            </Text>
          </View>
        </View>

        <Text style={styles.date}>{formatDate(item.created_at)}</Text>

        {!isExpanded &&
          item.order_items?.slice(0, 2).map(product => (
            <Text key={product.id} style={styles.itemPreview}>
              • {product.product_name} x{product.quantity}
            </Text>
          ))}

        {isExpanded && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Items</Text>
            {item.order_items?.map(product => (
              <View key={product.id} style={styles.itemRow}>
                <Text>{product.product_name} x{product.quantity}</Text>
                <Text>₹{product.total_price}</Text>
              </View>
            ))}

            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.address}>{item.delivery_address}</Text>

            {item.notes ? (
              <>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={styles.address}>{item.notes}</Text>
              </>
            ) : null}

            <View style={styles.divider} />
            <View style={styles.footerRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.total}>₹{item.total_amount}</Text>
            </View>
          </>
        )}

        <View style={styles.expandContainer}>
          <Text style={styles.expandText}>
            {isExpanded ? '▲ Collapse' : '▼ Tap to expand'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
      />
    </View>
  );
};

export default MyBookingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },

  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...shadows.md,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  orderNumber: { fontWeight: 'bold', fontSize: 14 },

  date: { fontSize: 12, color: '#888', marginBottom: 8 },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  statusText: { color: '#fff', fontSize: 11 },

  itemPreview: { fontSize: 13, marginBottom: 4 },

  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },

  sectionTitle: { fontWeight: '600', marginBottom: 6 },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  address: { color: '#555', lineHeight: 20 },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabel: { fontWeight: '600' },

  total: { fontWeight: 'bold', fontSize: 16 },

  expandContainer: { alignItems: 'center', marginTop: 8 },

  expandText: { fontSize: 12, color: colors.primary },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});