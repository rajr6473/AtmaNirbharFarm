import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';

import HomeScreen from '../screens/home/HomeScreen';
import AllProductsScreen from '../screens/products/AllProductsScreen';
import MyOrdersScreen from '../screens/orders/MyOrdersScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CategoryProductsScreen from '../screens/products/CategoryProductsScreen';
import CartScreen from '../screens/cart/CartScreen';
import CheckoutScreen from '../screens/cart/CheckoutScreen';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Account/Profile screens
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="AllProducts" component={AllProductsScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setInitialRoute('Tabs');
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FBF7' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
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

      {/* Main App Screens */}
      <Stack.Screen
        name="Tabs"
        component={Tabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />

      {/* Account/Profile screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="MonthlyBill" component={MonthlyBillScreen} />
      <Stack.Screen name="FAQs" component={FAQsScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="ReferEarn" component={ReferEarnScreen} />
      <Stack.Screen name="AppLanguage" component={AppLanguageScreen} />
      <Stack.Screen name="DeliveryPreferences" component={DeliveryPreferencesScreen} />
      <Stack.Screen name="AddressRequests" component={AddressRequestsScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
}
