import React from 'react';
import { View, Text, Image, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const ListingDetailsScreen = ({ navigation }) => {
  const route = useRoute();
  const { listing } = route.params || {}; // Ensure listing is not undefined

  if (!listing) {
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
            // ✅ Update Firestore to mark as SOLD
            await updateDoc(doc(db, "listings", listing.id), {
              isSold: true,
              buyerId: user.uid,
            });

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
      {/* 🔥 Display Listing Image */}
      {listing.imageUrl ? (
        <Image 
          source={{ uri: listing.imageUrl }} 
          style={styles.image} 
        />
      ) : (
        <Text>No Image Available</Text>
      )}
  
      {/* 🔥 Display Item Info */}
      <Text style={styles.title}>{listing.name}</Text>
      <Text style={styles.price}>Price: {listing.price} MYR</Text>
      <Text style={styles.type}>Type: {listing.type}</Text>
      <Text style={styles.description}>Description: {listing.description}</Text>

      {/* 🔥 Display Seller Name */}
      <Text style={styles.sellerText}>Seller: {listing.sellerName ? listing.sellerName : "Unknown Seller"}</Text>

      {/* 🔥 View Seller Profile Button */}
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={() => navigation.navigate('UserProfile', { userId: listing.userId })}
      >
        <Text style={styles.profileButtonText}>View Seller Profile</Text>
      </TouchableOpacity>

      {/* 🔥 Show "Buy Now" ONLY if not sold */}
      {!listing.isSold ? (
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
    width: 200,
    height: 200,
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
  profileButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  sellerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListingDetailsScreen;
