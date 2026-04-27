import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';

const ReferEarnScreen = ({ navigation }: any) => {
  const referralCode = 'PRAMOD2025';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Use my referral code ${referralCode} and get ₹100 off on your first order! Download Atma Nirbhar Farm app now.`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🎁</Text>
          <Text style={styles.bannerTitle}>Earn ₹100 per Referral</Text>
          <Text style={styles.bannerText}>
            Share your code with friends and earn ₹100 when they make their first purchase
          </Text>
        </View>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>{referralCode}</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Text style={styles.shareButtonText}>Share Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.howItWorks}>
          <Text style={styles.sectionTitle}>How it Works</Text>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Share your referral code with friends</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>They sign up using your code</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>They make their first purchase</Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <Text style={styles.stepText}>You both get ₹100 in your wallet</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReferEarnScreen;

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
  banner: {
    backgroundColor: '#1E88E5',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerIcon: { fontSize: 60, marginBottom: 12 },
  bannerTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 8 },
  bannerText: { fontSize: 14, color: '#fff', textAlign: 'center', opacity: 0.9 },
  codeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  codeLabel: { fontSize: 14, color: '#666', marginBottom: 8 },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E88E5',
    letterSpacing: 2,
    marginBottom: 16,
  },
  shareButton: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  howItWorks: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 16 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: { fontSize: 14, fontWeight: '700', color: '#1E88E5' },
  stepText: { fontSize: 14, color: '#333', flex: 1 },
});
