import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const orders = [
  { id: 1, amount: 240, status: 'Delivered' },
  { id: 2, amount: 180, status: 'Pending' },
];

const MyOrdersScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text>Amount: ₹{item.amount}</Text>
            <Text
              style={[
                styles.status,
                { color: item.status === 'Delivered' ? 'green' : 'orange' },
              ]}
            >
              {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

export default MyOrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF7', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    elevation: 4,
    marginBottom: 12,
  },
  orderId: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  status: { fontWeight: '600', marginTop: 4 },
});
