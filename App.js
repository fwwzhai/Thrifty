import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StripeProvider } from '@stripe/stripe-react-native'; // Import StripeProvider
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ListingDetailsScreen from './screens/ListingDetailsScreen';
import CreateListingScreen from './screens/CreateListingScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import FilterScreen from './screens/FilterScreen';
import WishlistScreen from './screens/WishlistScreen';
import FollowListScreen from './screens/FollowListScreen';
import PaymentScreen from './screens/PaymentScreen';
import PurchaseHistoryScreen from './screens/PurchaseHistoryScreen';
import SoldHistoryScreen from './screens/SoldHistoryScreen';
import PurchaseDetailsScreen from './screens/PurchaseDetailsScreen';
import SoldDetailsScreen from './screens/SoldDetailsScreen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import './firebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  return (
    // Wrap your entire app with StripeProvider
    <StripeProvider publishableKey="pk_test_51QurWO2aNN6Ml181iHCJ8Hnb2cLDunJ3dOaCFjhzL8b0wvYXoqwkVbRk3Xib2V3RorvAtAhmzRK4mDSHigtq0u7g00odrpZ9YM">
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="CreateListing" component={CreateListingScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="ListingDetails" component={ListingDetailsScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="FilterScreen" component={FilterScreen} />
          <Stack.Screen 
            name="Wishlist" 
            component={WishlistScreen} 
            options={{ title: 'My Wishlist' }} 
          />
          <Stack.Screen name="FollowList" component={FollowListScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
          <Stack.Screen name="SoldHistory" component={SoldHistoryScreen} />
          <Stack.Screen name="PurchaseDetails" component={PurchaseDetailsScreen} />
          <Stack.Screen name="SoldDetails" component={SoldDetailsScreen} />

        </Stack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
