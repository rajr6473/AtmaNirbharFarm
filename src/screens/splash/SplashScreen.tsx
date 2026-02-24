import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const taglineFadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
    Animated.sequence([
      // Logo fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Brand name fade in
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // Tagline fade in
      Animated.timing(taglineFadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for the glow ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A3C34" />

      {/* Background gradient layers */}
      <View style={styles.gradientLayer1} />
      <View style={styles.gradientLayer2} />
      <View style={styles.gradientLayer3} />

      {/* Decorative Background Elements */}
      <View style={styles.decorativeLeafTopLeft}>
        <Icon name="leaf" size={100} color="rgba(196, 169, 98, 0.08)" style={{ transform: [{ rotate: '-45deg' }] }} />
      </View>
      <View style={styles.decorativeLeafTopRight}>
        <Icon name="leaf" size={80} color="rgba(196, 169, 98, 0.06)" style={{ transform: [{ rotate: '30deg' }] }} />
      </View>
      <View style={styles.decorativeLeafBottomLeft}>
        <Icon name="leaf" size={120} color="rgba(196, 169, 98, 0.05)" style={{ transform: [{ rotate: '60deg' }] }} />
      </View>
      <View style={styles.decorativeLeafBottomRight}>
        <Icon name="leaf" size={90} color="rgba(196, 169, 98, 0.07)" style={{ transform: [{ rotate: '135deg' }] }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Pulsing Glow Ring */}
        <Animated.View
          style={[
            styles.glowRingOuter,
            {
              opacity: fadeAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.glowRing,
            {
              opacity: fadeAnim,
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
          <View style={styles.logoCircle}>
            <Icon name="leaf" size={55} color="#C4A962" />
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Animated.Text
          style={[
            styles.brandName,
            {
              opacity: textFadeAnim,
              transform: [
                {
                  translateY: textFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          DHANVANTARI
        </Animated.Text>

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
                    outputRange: [15, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.tagline}>Pure</Text>
          <View style={styles.taglineDot} />
          <Text style={styles.tagline}>Organic</Text>
          <View style={styles.taglineDot} />
          <Text style={styles.tagline}>Natural</Text>
        </Animated.View>
      </View>

      {/* Bottom Decorative Line */}
      <Animated.View
        style={[
          styles.bottomDecoration,
          { opacity: taglineFadeAnim },
        ]}
      >
        <View style={styles.decorativeLine} />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A3C34',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: '#1A3C34',
  },
  gradientLayer2: {
    position: 'absolute',
    top: height * 0.25,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: '#2D5A4A',
    opacity: 0.4,
  },
  gradientLayer3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
    backgroundColor: '#1A3C34',
  },
  decorativeLeafTopLeft: {
    position: 'absolute',
    top: 80,
    left: -10,
  },
  decorativeLeafTopRight: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  decorativeLeafBottomLeft: {
    position: 'absolute',
    bottom: 100,
    left: -30,
  },
  decorativeLeafBottomRight: {
    position: 'absolute',
    bottom: 80,
    right: -10,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  glowRingOuter: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(196, 169, 98, 0.15)',
    backgroundColor: 'rgba(196, 169, 98, 0.03)',
    top: -30,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(196, 169, 98, 0.25)',
    backgroundColor: 'rgba(196, 169, 98, 0.05)',
    top: -10,
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(45, 90, 74, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(196, 169, 98, 0.5)',
    shadowColor: '#C4A962',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 15,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 10,
    marginTop: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
    fontWeight: '400',
  },
  taglineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C4A962',
    marginHorizontal: 14,
  },
  bottomDecoration: {
    position: 'absolute',
    bottom: 70,
  },
  decorativeLine: {
    width: 70,
    height: 3,
    backgroundColor: 'rgba(196, 169, 98, 0.5)',
    borderRadius: 2,
  },
});
