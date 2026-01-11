import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useCart } from '../../context/CartContext';

const CartScreen = ({ navigation }: any) => {
  const { cart, increment, decrement, totalAmount } = useCart();

  // 🔐 TEMP AUTH FLAG (replace later with AuthContext)
  const isLoggedIn = true; // ❗ change to true after login

  const handleCheckout = () => {
    if (isLoggedIn) {
      navigation.navigate('Checkout');
    } else {
      Alert.alert(
        'Login Required',
        'Please login or register to proceed to checkout',
        [
          {
            text: 'Go to Profile',
            onPress: () => navigation.navigate('Tabs', {
              screen: 'Profile',
            }),
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Cart</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopNowText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart ({cart.length} items)</Text>
        <View style={styles.backButton} />
      </View>

      {/* CART ITEMS */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.itemsContainer}>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />

              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.productSize}>{item.size || '500ml'}</Text>

                <View style={styles.priceQtyRow}>
                  <Text style={styles.productPrice}>₹{item.price * item.qty}</Text>

                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => decrement(item.id)}
                    >
                      <Text style={styles.quantityButtonText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item.qty}</Text>

                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => increment(item.id)}
                    >
                      <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* BILL DETAILS */}
        <View style={styles.billSection}>
          <Text style={styles.billTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{totalAmount}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            <Text style={styles.billValueFree}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>To Pay</Text>
            <Text style={styles.billTotalValue}>₹{totalAmount}</Text>
          </View>
        </View>

        {/* DELIVERY INFO */}
        <View style={styles.deliverySection}>
          <View style={styles.deliveryHeader}>
            <View style={styles.radioButton}>
              <View style={styles.radioButtonInner} />
            </View>
            <Text style={styles.deliveryTitle}>Delivery Slot</Text>
          </View>
          <Text style={styles.deliveryTime}>12th Jan 04:00-07:00 AM</Text>

          <Text style={styles.deliveryAddressTitle}>Delivery to Home</Text>
          <Text style={styles.deliveryAddress}>
            Flat: 1st. A cross road, 1, 1, , , 305, vidyanagar, girinagr, 1st A cross, near balaji bliss apprtment, shritui sangeeta vidyalaya, 560085
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* CHECKOUT FOOTER */}
      <View style={styles.checkoutFooter}>
        <View>
          <Text style={styles.footerTotalLabel}>Total Amount</Text>
          <Text style={styles.footerTotalValue}>₹{totalAmount}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  // EMPTY STATE
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
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // CART ITEMS
  scrollView: {
    flex: 1,
  },
  itemsContainer: {
    padding: 16,
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productSize: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  priceQtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },

  // BILL SECTION
  billSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 14,
    color: '#666',
  },
  billValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  billValueFree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  billTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  billTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },

  // DELIVERY SECTION
  deliverySection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  deliveryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#4285F4',
    fontWeight: '600',
    marginLeft: 26,
    marginBottom: 16,
  },
  deliveryAddressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  deliveryAddress: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  // CHECKOUT FOOTER
  checkoutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerTotalLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
