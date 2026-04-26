import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Image,
} from 'react-native';
import { colors } from '../../theme';

const { width, height } = Dimensions.get('window');

const logoImage = require('../../assets/images/dhanvantri_logo.png');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0.8)).current;
  const ringScale2 = useRef(new Animated.Value(0.8)).current;
  const ringOpacity1 = useRef(new Animated.Value(0.6)).current;
  const ringOpacity2 = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // Main content animations
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      // Brand name fade in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Tagline fade in
      Animated.timing(taglineFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Elegant ring animations
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale1, {
            toValue: 1.15,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale1, {
            toValue: 0.8,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity1, {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity1, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ringScale2, {
            toValue: 1.25,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(ringScale2, {
            toValue: 0.8,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(ringOpacity2, {
            toValue: 0.1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity2, {
            toValue: 0.4,
            duration: 2500,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Premium gradient background */}
      <View style={styles.gradientOverlay} />

      {/* Subtle pattern overlay */}
      <View style={styles.patternOverlay}>
        {[...Array(20)].map((_, i) => (
          <View key={i} style={[styles.patternDot, {
            left: (i % 5) * (width / 4),
            top: Math.floor(i / 5) * (height / 4),
          }]} />
        ))}
      </View>

      {/* Elegant decorative elements */}
      <View style={styles.decorTop}>
        <View style={styles.decorLine1} />
        <View style={styles.decorLine2} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated rings */}
        <Animated.View
          style={[
            styles.ring1,
            {
              opacity: ringOpacity1,
              transform: [{ scale: ringScale1 }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring2,
            {
              opacity: ringOpacity2,
              transform: [{ scale: ringScale2 }],
            },
          ]}
        />

        {/* Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Image
            source={logoImage}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Tagline */}
        <Animated.View
          style={[
            styles.taglineContainer,
            {
              opacity: taglineFadeAnim,
              transform: [
                {
                  translateY: taglineFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.taglineLine} />
          <Text style={styles.tagline}>Pure & Organic</Text>
          <View style={styles.taglineLine} />
        </Animated.View>
      </View>

      {/* Bottom Decoration */}
      <Animated.View
        style={[
          styles.bottomDecoration,
          { opacity: taglineFadeAnim },
        ]}
      >
        <View style={styles.decorativeDandelion}>
          <View style={styles.dandelionStem} />
          <View style={styles.dandelionHead}>
            {[...Array(8)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dandelionSeed,
                  { transform: [{ rotate: `${i * 45}deg` }] },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FAFAFA',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  decorTop: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  decorLine1: {
    width: 40,
    height: 2,
    backgroundColor: '#1A1A1A',
    marginBottom: 8,
  },
  decorLine2: {
    width: 20,
    height: 2,
    backgroundColor: colors.primary,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  ring1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  ring2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 280,
    height: 280,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  taglineLine: {
    width: 30,
    height: 1,
    backgroundColor: '#CCCCCC',
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '400',
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
  },
  decorativeDandelion: {
    alignItems: 'center',
  },
  dandelionStem: {
    width: 1,
    height: 30,
    backgroundColor: '#CCCCCC',
  },
  dandelionHead: {
    position: 'absolute',
    bottom: 25,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dandelionSeed: {
    position: 'absolute',
    width: 1,
    height: 10,
    backgroundColor: '#CCCCCC',
    transformOrigin: 'center bottom',
  },
});
