import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const FAQsScreen = ({ navigation }: any) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I track my booking?',
      a: 'You can track your booking from the "My Bookings" section in your account.',
    },
    {
      q: 'What is your delivery time?',
      a: 'We deliver fresh products every morning between 4:00 AM to 7:00 AM.',
    },
    {
      q: 'How can I cancel my order?',
      a: 'You can cancel your order before 9:00 PM on the previous day.',
    },
    {
      q: 'Do you offer organic products?',
      a: 'Yes, all our products are 100% organic and sourced directly from farmers.',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqCard}
            onPress={() => setExpanded(expanded === index ? null : index)}
          >
            <View style={styles.question}>
              <Text style={styles.questionText}>{faq.q}</Text>
              <Text style={styles.icon}>{expanded === index ? '−' : '+'}</Text>
            </View>
            {expanded === index && (
              <Text style={styles.answer}>{faq.a}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default FAQsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1A3C34',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backIcon: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 16 },
  faqCard: {
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
  question: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionText: { fontSize: 15, fontWeight: '600', color: '#000', flex: 1 },
  icon: { fontSize: 24, color: '#2D5A4A', marginLeft: 12 },
  answer: { fontSize: 14, color: '#666', marginTop: 12, lineHeight: 20 },
});
