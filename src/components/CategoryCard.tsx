import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  name: string;
  image: string;
}

const CategoryCard = ({ name, image }: Props) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: image }} style={styles.image} />
      <Text style={styles.text}>{name}</Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;

const styles = StyleSheet.create({
  card: {
    width: 120,
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: '#fff',
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 80,
  },
  text: {
    padding: 8,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2E7D32',
  },
});
