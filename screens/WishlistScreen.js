import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const WishlistScreen = () => {
  const navigation = useNavigation();
  const [wishlistItems, setWishlistItems] = useState([]);
  useEffect(() => {
    const fetchWishlist = async () => {
      const user = auth.currentUser;
      if (!user) return;
  
      const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
      const wishlistSnap = await getDocs(wishlistRef);
  
      const filteredItems = [];
  
      for (const docSnap of wishlistSnap.docs) {
        const data = docSnap.data();
        const listingId = data?.listingId;
  
        if (!listingId) continue;
  
        const listingRef = doc(db, 'listings', listingId);
        const listingSnap = await getDoc(listingRef);
  
        if (listingSnap.exists()) {
          filteredItems.push({
            id: docSnap.id,
            ...data,
          });
        }
      }
  
      setWishlistItems(filteredItems);
    };
  
    fetchWishlist();
  }, []);
  
const renderItem = ({ item }) => {
  const handleNavigateToDetails = async () => {
    try {
      const listingRef = doc(db, 'listings', item.listingId);
      const listingSnap = await getDoc(listingRef);

      if (listingSnap.exists()) {
        const fullListing = { id: item.listingId, ...listingSnap.data() };

        // 🔥 Navigate to ListingDetails with full listing object
        navigation.navigate('ListingDetails', { listing: fullListing });
      } else {
        Alert.alert('Error', 'Listing not found.');
      }
    } catch (error) {
      console.error('🔥 Error fetching listing details:', error);
      Alert.alert('Error', 'Failed to fetch listing details.');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handleNavigateToDetails}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.price}>RM {item.price}</Text>
      </View>
    </TouchableOpacity>
  );
};


  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Wishlist</Text>
      {wishlistItems.length > 0 ? (
        <FlatList
          data={wishlistItems}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.emptyText}>Your wishlist is empty.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  infoContainer: {
    padding: 10,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#28a745',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default WishlistScreen;
