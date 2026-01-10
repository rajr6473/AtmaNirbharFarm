import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { categories } from '../../utils/dummyData';
import { useNavigation } from '@react-navigation/native';
// import AppLayout from '../../components/AppLayout';

const HomeScreen = () => {
  const navigation = useNavigation<any>();

  return (
    // <AppLayout>
    <View style={styles.container}>
      <Text style={styles.title}>Top Categories</Text>

      <FlatList
        data={categories}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('CategoryProducts', {
                categoryId: item.id,
                categoryName: item.name,
              })
            }
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
    // </AppLayout>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FBF7' },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 100 },
  text: {
    padding: 8,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2E7D32',
  },
});
