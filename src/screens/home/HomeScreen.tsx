import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { categories } from '../../utils/dummyData';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const banners = [
  {
    id: 1,
    title: 'Fresh produce sourced\non delivery day',
    sub: 'No storage • No stock',
    image:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    bg: '#FFD54F',
  },
  {
    id: 2,
    title: '100% Fresh Vegetables',
    sub: 'Direct from farmers',
    image:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600',
    bg: '#C8E6C9',
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const bannerRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  // 🔁 AUTO SLIDE
  useEffect(() => {
    const interval = setInterval(() => {
      const next = (index + 1) % banners.length;
      setIndex(next);
      bannerRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [index]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🌿 HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>🌿 Dhanvantri Farm</Text>
          <Text style={styles.tagline}>
            Fresh • Local • Delivered Next Day
          </Text>
        </View>
      </View>

      {/* 🎯 AUTO SLIDING BANNERS */}
      <FlatList
        ref={bannerRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(
            e.nativeEvent.contentOffset.x / width
          );
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.banner, { backgroundColor: item.bg }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSub}>{item.sub}</Text>
            </View>

            <Image
              source={{ uri: item.image }}
              style={styles.bannerImage}
              resizeMode="contain"
            />
          </View>
        )}
      />

      {/* 🔹 DOT INDICATOR */}
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              index === i && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* ℹ️ INFO STRIP */}
      <View style={styles.infoStrip}>
        <Text style={styles.infoText}>
          🥬 Fresh from farms • 🚚 Next day delivery • 💯 Quality assured
        </Text>
      </View>

      {/* 🟩 CATEGORY HEADER */}
      <View style={styles.categoryHeader}>
        <Text style={styles.categoryHeaderText}>TOP CATEGORIES</Text>
      </View>

      {/* 🟩 CATEGORY GRID */}
      <FlatList
        data={categories}
        numColumns={2}
        scrollEnabled={false}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
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
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="contain"
            />
            <Text style={styles.text}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </ScrollView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF7',
  },

  /* HEADER */
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
  },
  tagline: {
    fontSize: 13,
    color: '#666',
  },

  /* BANNER */
  banner: {
    width: width - 32,
    height: 160,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: '#444',
  },
  bannerImage: {
    width: 90,
    height: 90,
    marginLeft: 10,
  },

  /* DOTS */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2E7D32',
  },

  /* INFO STRIP */
  infoStrip: {
    backgroundColor: '#2E7D32',
    margin: 16,
    padding: 10,
    borderRadius: 12,
  },
  infoText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 13,
  },

  /* CATEGORY */
  categoryHeader: {
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  categoryHeaderText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '800',
    fontSize: 14,
  },

  card: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 8,
    borderRadius: 14,
    elevation: 4,
    padding: 10,
    alignItems: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#2E7D32',
    fontSize: 13,
  },
});
