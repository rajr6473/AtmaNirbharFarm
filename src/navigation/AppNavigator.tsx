import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, StyleSheet, Text, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';

// Splash Screen
import SplashScreen from '../screens/splash/SplashScreen';

// Home screens
import HomeScreen from '../screens/home/HomeScreen';
import DeliveryHomeScreen from '../screens/delivery/DeliveryHomeScreen';

// Product screens
import AllProductsScreen from '../screens/products/AllProductsScreen';
import CategoryProductsScreen from '../screens/products/CategoryProductsScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import AllCategoriesScreen from '../screens/categories/AllCategoriesScreen';

// Cart screens
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';

// Order screens
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';

// Profile screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import TransactionsScreen from '../screens/profile/TransactionsScreen';
import MonthlyBillScreen from '../screens/profile/MonthlyBillScreen';
import FAQsScreen from '../screens/profile/FAQsScreen';
import ContactUsScreen from '../screens/profile/ContactUsScreen';
import ReferEarnScreen from '../screens/profile/ReferEarnScreen';
import AppLanguageScreen from '../screens/profile/AppLanguageScreen';
import DeliveryPreferencesScreen from '../screens/profile/DeliveryPreferencesScreen';
import AddressRequestsScreen from '../screens/profile/AddressRequestsScreen';
import TermsConditionsScreen from '../screens/profile/TermsConditionsScreen';
import PrivacyPolicyScreen from '../screens/profile/PrivacyPolicyScreen';
import DeleteAccountScreen from '../screens/profile/DeleteAccountScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Subscription screens
import MySubscriptionsScreen from '../screens/subscriptions/MySubscriptionsScreen';
import SubscriptionScreen from '../screens/subscriptions/SubscriptionScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack (nested inside tab)
const HomeStack = createNativeStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <HomeStack.Screen name="AllCategories" component={AllCategoriesScreen} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      {/* <HomeStack.Screen name="Subscription" component={SubscriptionScreen} /> */}
      <HomeStack.Screen name="MyOrders" component={MyOrdersScreen} />
    </HomeStack.Navigator>
  );
}

// Explore Stack (nested inside tab)
const ExploreStack = createNativeStackNavigator();
function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={{ headerShown: false }}>
      <ExploreStack.Screen name="ExploreMain" component={AllProductsScreen} />
      <ExploreStack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <ExploreStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      {/* <ExploreStack.Screen name="Subscription" component={SubscriptionScreen} /> */}
    </ExploreStack.Navigator>
  );
}

// Cart Stack (nested inside tab)
const CartStack = createNativeStackNavigator();
function CartStackScreen() {
  return (
    <CartStack.Navigator screenOptions={{ headerShown: false }}>
      <CartStack.Screen name="CartMain" component={CartScreen} />
      <CartStack.Screen name="Checkout" component={CheckoutScreen} />
    </CartStack.Navigator>
  );
}

// Subscribe Stack (nested inside tab)
const SubscribeStack = createNativeStackNavigator();
function SubscribeStackScreen() {
  return (
    <SubscribeStack.Navigator screenOptions={{ headerShown: false }}>
      <SubscribeStack.Screen name="SubscribeMain" component={MySubscriptionsScreen} />
      {/* <SubscribeStack.Screen name="Subscription" component={SubscriptionScreen} /> */}
    </SubscribeStack.Navigator>
  );
}

// Profile Stack (nested inside tab)
const ProfileStack = createNativeStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="MyOrders" component={MyOrdersScreen} />
      <ProfileStack.Screen name="Transactions" component={TransactionsScreen} />
      <ProfileStack.Screen name="MonthlyBill" component={MonthlyBillScreen} />
      <ProfileStack.Screen name="FAQs" component={FAQsScreen} />
      <ProfileStack.Screen name="ContactUs" component={ContactUsScreen} />
      <ProfileStack.Screen name="ReferEarn" component={ReferEarnScreen} />
      <ProfileStack.Screen name="AppLanguage" component={AppLanguageScreen} />
      <ProfileStack.Screen name="DeliveryPreferences" component={DeliveryPreferencesScreen} />
      <ProfileStack.Screen name="AddressRequests" component={AddressRequestsScreen} />
      <ProfileStack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <ProfileStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <ProfileStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </ProfileStack.Navigator>
  );
}

// Customer Bottom Tabs
function CustomerTabs() {
  const { cartItemCount } = useCart();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: Math.max(insets.bottom, 6),
          height: 60 + Math.max(insets.bottom - 6, 0),
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'home';

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'magnify' : 'magnify';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Subscribe':
              iconName = focused ? 'calendar-check' : 'calendar-check-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStackScreen}
        options={{ tabBarLabel: 'Explore' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStackScreen}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: styles.cartBadge,
        }}
      />
      {/* <Tab.Screen
        name="Subscribe"
        component={SubscribeStackScreen}
        options={{ tabBarLabel: 'Subscribe' }}
      /> */}
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Delivery Person Bottom Tabs
function DeliveryTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: Math.max(insets.bottom, 6),
          height: 60 + Math.max(insets.bottom - 6, 0),
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'home';

          switch (route.name) {
            case 'DeliveryHome':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'DeliveryProfile':
              iconName = focused ? 'account' : 'account-outline';
              break;
          }

          return <Icon name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DeliveryHome"
        component={DeliveryHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="DeliveryProfile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState<string>('Login');

  useEffect(() => {
    // Auth check happens while splash is showing
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');

      if (token) {
        if (role === 'delivery_person') {
          setInitialRoute('DeliveryTabs');
        } else {
          setInitialRoute('CustomerTabs');
        }
      } else {
        setInitialRoute('Login');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setInitialRoute('Login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show splash screen for 3 seconds
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show loader if still checking auth after splash
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="leaf" size={50} color="#8B5CF6" />
          </View>
          <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
          <Text style={styles.loaderText}>Dhanvantari Naturals</Text>
        </View>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      {/* Auth Screens */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      {/* Customer Tab Navigator */}
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />

      {/* Delivery Person Tab Navigator */}
      <Stack.Screen name="DeliveryTabs" component={DeliveryTabs} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: '#FAF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loaderIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  tabBar: {
    backgroundColor: '#fff',
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cartBadge: {
    backgroundColor: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
  },
});
