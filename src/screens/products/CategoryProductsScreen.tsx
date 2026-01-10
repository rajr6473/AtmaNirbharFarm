import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { products } from '../../utils/dummyData';
import ProductCard from '../../components/ProductCard';
import AppLayout from '../../components/AppLayout';

const CategoryProductsScreen = ({ route }: any) => {
  const { categoryId, categoryName } = route.params;
  const [search, setSearch] = useState('');

  const filtered = products.filter(
    p =>
      p.categoryId === categoryId &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <View style={styles.container}>
        <Text style={styles.title}>{categoryName}</Text>

        <TextInput
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          placeholderTextColor="#999"
        />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => <ProductCard product={item} />}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        />
      </View>
    </AppLayout>
  );
};

export default CategoryProductsScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    backgroundColor: '#F9FBF7',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 8,
    color: '#2E7D32',
  },

  search: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    fontSize: 14,
  },

  list: {
    paddingBottom: 16,
  },
});
