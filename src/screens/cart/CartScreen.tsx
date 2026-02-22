import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCart } from '../../context/CartContext';

const CartScreen = ({ navigation }: any) => {
  const { cart, increment, decrement, totalAmount } = useCart();

  const handleCheckout = () => {
    navigation.navigate('Checkout');
  };

  if (cart.length === 0) {
    return (
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Icon name="cart" size={24} color="#fff" />
            <Text style={styles.headerTitle}>My Cart</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="cart-outline" size={60} color="#9ca3af" />
          </View>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.getParent()?.navigate('Explore')}
          >
            <Icon name="magnify" size={20} color="#fff" />
            <Text style={styles.shopNowText}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="cart" size={24} color="#fff" />
          <Text style={styles.headerTitle}>My Cart ({cart.length} items)</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate('Explore')}
          style={styles.addMoreButton}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
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
    backgroundColor: '#F9FBF7',
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#2E7D32',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  addMoreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // EMPTY STATE
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
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shopNowText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
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
    backgroundColor: '#2E7D32',
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
    color: '#2E7D32',
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
    borderColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonInner: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#2E7D32',
  },
  deliveryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#2E7D32',
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
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
