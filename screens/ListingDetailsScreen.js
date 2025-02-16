import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const ListingDetailsScreen = ({ navigation }) => {
  const route = useRoute();
  const { listing } = route.params || {}; // Ensure listing is not undefined
  const [currentListing, setCurrentListing] = useState(listing);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listing.id) return;

      try {
        const listingRef = doc(db, "listings", listing.id);
        const listingSnap = await getDoc(listingRef);

        if (listingSnap.exists()) {
          setCurrentListing(listingSnap.data());
        }
      } catch (error) {
        console.error("🔥 Error fetching listing:", error);
      }
    };

    fetchListing();
  }, [listing.id]);

  if (!currentListing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Listing not found.</Text>
      </View>
    );
  }

  // 🔥 Buy Now Function (Updates Firestore)
  const handleBuy = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to buy an item.');
      return;
    }

    Alert.alert('Purchase', 'Proceed to buy this item?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Buy', 
        onPress: async () => {
          try {
            const listingRef = doc(db, "listings", listing.id);
            await updateDoc(listingRef, {
              isSold: true,
              buyerId: user.uid,
            });

            setCurrentListing(prev => ({ ...prev, isSold: true, buyerId: user.uid }));

            Alert.alert('Success', 'Purchase completed!');
            navigation.goBack(); // ✅ Go back after purchase
          } catch (error) {
            console.error("🔥 Error updating listing:", error);
            Alert.alert("Error", "Failed to complete the purchase.");
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      
      {currentListing.imageUrl ? (
        <Image 
          source={{ uri: currentListing.imageUrl }} 
          style={{ width: 200, height: 200, borderRadius: 10, marginBottom: 20 }} 
        />
      ) : (
        <Text>No Image Available</Text>
      )}
  
      <Text style={styles.title}>{currentListing.name}</Text>
      <Text style={styles.price}>Price: {currentListing.price} MYR</Text>
      <Text style={styles.type}>Type: {currentListing.type}</Text>
      <Text style={styles.description}>Description: {currentListing.description}</Text>

      {/* 🔥 Show "Buy Now" ONLY if not sold */}
      {!currentListing.isSold ? (
        <Button title="Buy Now" onPress={handleBuy} />
      ) : (
        <Text style={styles.soldText}>SOLD</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginBottom: 10,
  },
  type: {
    fontSize: 18,
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  soldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginTop: 10,
  },
});

export default ListingDetailsScreen;
