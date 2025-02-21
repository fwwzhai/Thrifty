import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import axios from 'axios';
import { doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

const PaymentScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://api-q7hlyxfraa-uc.a.run.app/createPaymentIntent', {
        amount: listing.price * 100, 
        currency: 'myr'
      });
  
      const clientSecret = response.data && response.data.clientSecret;
      console.log('Client Secret:', clientSecret);
  
      if (!clientSecret) {
        Alert.alert('Payment Error', 'Could not get client secret');
        setLoading(false);
        return;
      }
  
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: 'Test User',
          },
        },
      });
  
      if (error) {
        console.error('Payment Confirmation Error:', error);
        Alert.alert('Payment failed', error.message);
      } else if (paymentIntent) {
        Alert.alert('Payment successful', 'Your payment was successful!');
  
        // 🔥 Update Firestore to mark the listing as SOLD
        const listingRef = doc(db, 'listings', listing.id);
        await updateDoc(listingRef, {
          isSold: true
        });
  
        // 🔥 Navigate back or update state
        navigation.goBack();  // If the navigation crash happens, comment this out
      }
    } catch (err) {
      console.error('Payment Error:', err);
      Alert.alert('Payment failed', 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Pay Now" onPress={handlePayment} disabled={loading} />
      <Text style={styles.title}>Pay for {listing.name}</Text>
      <Text style={styles.price}>Amount: RM {listing.price}</Text>
      <CardField
        postalCodeEnabled={false}
        placeholder={{
          number: '4242 4242 4242 4242',
        }}
        cardStyle={{
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        }}
        style={styles.cardField}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardField: {
    height: 50,
    marginVertical: 30,
  }
});

export default PaymentScreen;
