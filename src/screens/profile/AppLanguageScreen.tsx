import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const AppLanguageScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState('English');

  const languages = ['English', 'हिंदी (Hindi)', 'ಕನ್ನಡ (Kannada)', 'తెలుగు (Telugu)', 'தமிழ் (Tamil)'];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={styles.langCard}
            onPress={() => setSelected(lang)}
          >
            <Text style={styles.langText}>{lang}</Text>
            <View style={styles.radio}>
              {selected === lang && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default AppLanguageScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
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
  backIcon: { fontSize: 24, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { flex: 1, padding: 16 },
  langCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  langText: { fontSize: 16, color: '#000' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E88E5',
  },
});
