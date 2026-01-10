import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useCart } from '../../context/CartContext';
import AppLayout from '../../components/AppLayout';

const CheckoutScreen = ({ navigation }: any) => {
  // use a single call to useCart and cast to any so calling clearCart (if present) won't error
  const { totalAmount, clearCart } = useCart() as any;
  const [payment, setPayment] = useState<'COD' | 'ONLINE'>('COD');
  const [success, setSuccess] = useState(false);


  const placeOrder = () => {
  setSuccess(true);

  setTimeout(() => {
    clearCart();
    setSuccess(false);
    navigation.navigate('Tabs', {
      screen: 'Orders',
    });
  }, 3000);
};


  return (
    <AppLayout>
    <View style={styles.container}>
      <Text style={styles.section}>Delivery Address</Text>
      <TextInput
        placeholder="Enter full address"
        style={styles.input}
        multiline
      />

      <Text style={styles.section}>Payment Method</Text>

      <TouchableOpacity
        style={styles.radioRow}
        onPress={() => setPayment('COD')}
      >
        <Text style={styles.radio}>{payment === 'COD' ? '🔘' : '⚪'}</Text>
        <Text>Cash on Delivery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.radioRow}
        onPress={() => setPayment('ONLINE')}
      >
        <Text style={styles.radio}>{payment === 'ONLINE' ? '🔘' : '⚪'}</Text>
        <Text>Online Payment</Text>
      </TouchableOpacity>

      <View style={styles.summary}>
        <Text style={styles.total}>Total Payable: ₹{totalAmount}</Text>
      </View>

      <TouchableOpacity style={styles.placeBtn} onPress={placeOrder}>
        <Text style={styles.placeText}>Place Order</Text>
      </TouchableOpacity>

      {/* SUCCESS POPUP */}
      <Modal transparent visible={success}>
        <View style={styles.modal}>
          <View style={styles.popup}>
            <Text style={styles.success}>✅ Order Placed!</Text>
            <Text>Redirecting to My Orders...</Text>
          </View>
        </View>
      </Modal>
    </View>
    </AppLayout>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FBF7' },
  section: { fontSize: 18, fontWeight: '600', marginVertical: 10 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },

  radioRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  radio: { fontSize: 18, marginRight: 10 },

  summary: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  total: { fontSize: 18, fontWeight: '700' },

  placeBtn: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  placeText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  success: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
});
