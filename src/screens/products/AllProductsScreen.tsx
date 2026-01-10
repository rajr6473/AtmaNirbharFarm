import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import { products } from '../../utils/dummyData';
import ProductCard from '../../components/ProductCard';
import AppLayout from '../../components/AppLayout';

const AllProductsScreen = () => {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <TextInput
          placeholder="Search products..."
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />

        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </AppLayout>
  );
};

export default AllProductsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#F9FBF7',
  },

  search: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },

  list: {
    paddingBottom: 16,
  },
});
