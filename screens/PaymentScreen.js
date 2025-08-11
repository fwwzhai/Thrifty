import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, FlatList, Image, ScrollView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { doc, getDoc, updateDoc, addDoc, setDoc } from 'firebase/firestore';

const PaymentScreen = ({ route, navigation }) => {
  const { listing } = route.params;
  const totalPrice = parseFloat(listing.price) + parseFloat(listing.deliveryFee || 0);

  // Address selection
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!auth.currentUser) return;
      const ref = collection(db, 'users', auth.currentUser.uid, 'addresses');
      const snap = await getDocs(ref);
      const addrArr = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAddresses(addrArr);
      if (addrArr.length > 0) setSelectedAddress(addrArr[0].address);
    };
    fetchAddresses();
  }, []);

  const handleCardPayment = () => {
    if (!selectedAddress) return Alert.alert('Error', 'Please select a delivery address.');
    navigation.navigate('Card', { listing, address: selectedAddress });
  };

  const handleDummyPayment = (type) => {
    if (!selectedAddress) return Alert.alert('Error', 'Please select a delivery address.');
    Alert.alert(type, 'This is a dummy payment method.');
  };

  const handleCashOnDelivery = async () => {
  if (!selectedAddress) return Alert.alert('Error', 'Please select a delivery address.');
  Alert.alert(
    'Confirm Cash on Delivery',
    'Are you sure you want to place this order with Cash on Delivery?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          try {
            // Get buyer name
            const buyerDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const buyerName = buyerDoc.exists() ? buyerDoc.data().name : 'a buyer';

            // Notify seller in inbox
            await addDoc(collection(db, 'users', listing.userId, 'inbox'), {
              type: 'purchase',
              message: `Your item "${listing.name}" was purchased by ${buyerName}.`,
              listingId: listing.id,
              buyerId: auth.currentUser.uid,
              timestamp: new Date(),
              read: false,
            });

            // Mark listing as sold
            const listingRef = doc(db, 'listings', listing.id);
            await updateDoc(listingRef, {
              isSold: true,
              soldTo: auth.currentUser.uid,
              soldAt: new Date().toISOString()
            });

            // Get image for history
            const historyImageUrl = listing.imageUrl 
              ? listing.imageUrl 
              : Array.isArray(listing.imageUrls) && listing.imageUrls.length > 0 
                ? listing.imageUrls[0] 
                : null;

            // Add to buyer's purchase history
            const buyerHistoryRef = doc(db, 'users', auth.currentUser.uid, 'purchaseHistory', listing.id);
            await setDoc(buyerHistoryRef, {
              listingId: listing.id,
              name: listing.name,
              price: listing.price,
              imageUrl: historyImageUrl,
              sellerId: listing.userId,
              timestamp: new Date()
            });

            // Add to seller's sold history
            const sellerHistoryRef = doc(db, 'users', listing.userId, 'soldHistory', listing.id);
            await setDoc(sellerHistoryRef, {
              listingId: listing.id,
              name: listing.name,
              price: listing.price,
              imageUrl: historyImageUrl,
              buyerId: auth.currentUser.uid,
              timestamp: new Date()
            });

            Alert.alert('Success', 'Order placed and marked as paid!');
            setTimeout(() => {
              navigation.goBack();
            }, 1000);
          } catch (err) {
            Alert.alert('Error', 'Failed to update listing.');
          }
        },
      },
    ]
  );
};

  // Helper to display color names
  const colorLabel = (color) => {
    // Map color codes to names if needed, otherwise just show the name
    const colorMap = {
      '#000000': 'Black',
      '#FFFFFF': 'White',
      '#2563eb': 'Blue',
      '#10b981': 'Green',
      '#FFD600': 'Yellow',
      '#8B4513': 'Brown',
      '#F5F5DC': 'Beige',
      '#808080': 'Grey',
      '#1e3a8a': 'Dark Blue',
      '#bbf7d0': 'Light Green',
      '#fca5a5': 'Light Red',
      '#ef4444': 'Red',
      '#991b1b': 'Dark Red',
      '#fef9c3': 'Light Yellow',
      '#b59f3b': 'Dark Yellow',
      '#d2b48c': 'Light Brown',
      '#5c4033': 'Dark Brown',
      '#e5e7eb': 'Light Grey',
      '#374151': 'Dark Grey',
    };
    return colorMap[color] || color;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Order Summary</Text>
        <View style={styles.summaryBox}>
          {/* Listing Images */}
          <ScrollView horizontal style={styles.imageRow}>
            {(listing.imageUrls || [listing.imageUrl]).map((img, idx) =>
              img ? (
                <Image key={idx} source={{ uri: img }} style={styles.listingImage} />
              ) : null
            )}
          </ScrollView>
          <Text style={styles.itemName}>{listing.name}</Text>
          {/* ...other summary details... */}
          <Text style={styles.detailText}>Seller: {listing.sellerName || 'Unknown'}</Text>
          <Text style={styles.detailText}>Condition: {listing.condition}</Text>
          <Text style={styles.detailText}>Size: {listing.size}</Text>
          <Text style={styles.detailText}>Type: {listing.type}</Text>
          <Text style={styles.detailText}>
            Color: {listing.colors?.map(colorLabel).join(', ') || '-'}
          </Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Price:</Text>
            <Text style={styles.priceValue}>RM {listing.price}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee:</Text>
            <Text style={styles.priceValue}>
              {listing.deliveryPaidBySeller ? 'Free' : `RM ${listing.deliveryFee}`}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>RM {totalPrice}</Text>
          </View>
        </View>

        {/* Address Selection */}
        <View style={styles.addressBox}>
          <Text style={styles.addressLabel}>Delivery Address</Text>
          {addresses.length === 0 ? (
            <Text style={styles.addressText}>No addresses found. Please add one in Address Book.</Text>
          ) : (
            addresses.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.addressOption,
                  selectedAddress === item.address && styles.selectedAddressOption,
                ]}
                onPress={() => setSelectedAddress(item.address)}
              >
                <Text
                  style={[
                    styles.addressText,
                    selectedAddress === item.address && styles.selectedAddressText,
                  ]}
                >
                  {item.address}
                </Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity
            style={styles.changeAddressBtn}
            onPress={() => navigation.navigate('AddressBook')}
          >
            <Text style={styles.changeAddressText}>Manage Addresses</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.paymentLabel}>Choose Payment Method:</Text>
        <TouchableOpacity style={styles.paymentButton} onPress={handleCardPayment}>
  <View style={styles.paymentRow}>
    <Image source={require('../assets/card.jpg')} style={styles.paymentLogo} />
    <Text style={styles.paymentText}>Pay with Card</Text>
  </View>
</TouchableOpacity>
<TouchableOpacity style={styles.paymentButton} onPress={() => handleDummyPayment('TNG')}>
  <View style={styles.paymentRow}>
    <Image source={require('../assets/tng.png')} style={styles.paymentLogo} />
    <Text style={styles.paymentText}>Pay with TNG </Text>
  </View>
</TouchableOpacity>
<TouchableOpacity style={styles.paymentButton} onPress={() => handleDummyPayment('FPX')}>
  <View style={styles.paymentRow}>
    <Image source={require('../assets/fpx.png')} style={styles.paymentLogo} />
    <Text style={styles.paymentText}>Pay with FPX </Text>
  </View>
</TouchableOpacity>
<TouchableOpacity style={[styles.paymentButton, styles.codButton]} onPress={handleCashOnDelivery}>
  <View style={styles.paymentRow}>
    <Image source={require('../assets/cod.png')} style={styles.paymentLogo} />
    <Text style={styles.paymentText}>Cash on Delivery</Text>
  </View>
</TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 18,
    textAlign: 'center',
  },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#eee',
  },
  itemName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
    color: '#22223B',
  },
  detailText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  priceLabel: {
    fontSize: 15,
    color: '#22223B',
  },
  priceValue: {
    fontSize: 15,
    color: '#22223B',
    fontWeight: 'bold',
  },
  totalLabel: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
  },
  addressBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
  },
  addressLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
    color: '#2563eb',
  },
  addressOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e8f0',
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
  },
  selectedAddressOption: {
    borderColor: '#2563eb',
    backgroundColor: '#e0e7ff',
  },
  addressText: {
    fontSize: 14,
    color: '#22223B',
  },
  selectedAddressText: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  changeAddressBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
    marginTop: 8,
  },
  changeAddressText: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 13,
  },
  paymentRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
paymentLogo: {
  width: 28,
  height: 28,
  marginRight: 10,
},
  paymentLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#22223B',
  },
  paymentButton: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  codButton: {
    backgroundColor: '#10b981',
  },
  paymentText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaymentScreen;