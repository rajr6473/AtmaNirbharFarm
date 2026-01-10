import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useCart } from '../context/CartContext';

const CARD_WIDTH = (Dimensions.get('window').width - 48) / 2;

const ProductCard = ({ product }: any) => {
  const { cart, addToCart, increment, decrement } = useCart();
  const cartItem = cart.find((i: any) => i.id === product.id);

  return (
    <View style={styles.card}>
  {/* IMAGE */}
  <View style={styles.imageWrap}>
    <Image
      source={{ uri: product.image }}
      style={styles.image}
      resizeMode="contain"
    />
  </View>

  {/* CONTENT */}
  <View style={styles.content}>
    <Text numberOfLines={2} style={styles.name}>
      {product.name}
    </Text>

    <Text style={styles.price}>₹{product.price}</Text>

    {cartItem ? (
      <View style={styles.qtyRow}>
        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => decrement(product.id)}
        >
          <Text style={styles.qtyText}>−</Text>
        </TouchableOpacity>

        <Text style={styles.qty}>{cartItem.qty}</Text>

        <TouchableOpacity
          style={styles.qtyBtn}
          onPress={() => increment(product.id)}
        >
          <Text style={styles.qtyText}>+</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => addToCart(product)}
      >
        <Text style={styles.addText}>ADD</Text>
      </TouchableOpacity>
    )}
  </View>
</View>

  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
  width: CARD_WIDTH,
  backgroundColor: '#fff',
  borderRadius: 16,
  margin: 8,
  elevation: 4,
  overflow: 'hidden', // keep this
},

imageWrap: {
  width: '100%',
  aspectRatio: 1,
  backgroundColor: '#F1F8E9',
  justifyContent: 'center',
  alignItems: 'center',
},

image: {
  width: '85%',
  height: '85%',
},

content: {
  paddingHorizontal: 12,   // ✅ FIXES CUT TEXT
  paddingTop: 8,
  paddingBottom: 12,
},

name: {
  fontSize: 14,
  fontWeight: '600',
  color: '#2E7D32',
  marginBottom: 4,
},

price: {
  fontSize: 14,
  fontWeight: '700',
  color: '#000',
  marginBottom: 8,
},

addBtn: {
  backgroundColor: '#2E7D32',
  paddingVertical: 6,
  borderRadius: 14,
  alignItems: 'center',
},

addText: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 12,
},

qtyRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

qtyBtn: {
  width: 30,
  height: 30,
  borderRadius: 8,
  backgroundColor: '#2E7D32',
  alignItems: 'center',
  justifyContent: 'center',
},

qtyText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '700',
},

qty: {
  fontSize: 14,
  fontWeight: '700',
  color: '#000',
},

});
