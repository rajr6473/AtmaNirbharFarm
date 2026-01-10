import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
// import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const AppHeader = ({ showBack = false }: { showBack?: boolean }) => {
  const navigation = useNavigation<any>();
//   const { isLoggedIn } = useAuth();
  const { cart } = useCart();   // ✅ GET CART

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const goToCart = () => {
    if (true) {  
      navigation.navigate('Cart');
    } else {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  };

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 20 }} />
      )}

      <Text style={styles.title}>🌿 Dhanvantri Farm</Text>

      <TouchableOpacity onPress={goToCart} style={styles.cartWrapper}>
        <Text style={styles.cart}>🛒</Text>

        {cartCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
  },
  cartWrapper: {
    position: 'relative',
  },
  cart: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  back: {
    fontSize: 20,
  },
});
