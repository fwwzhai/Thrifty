import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';


import Icon from 'react-native-vector-icons/FontAwesome';



const ListingDetailsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const route = useRoute();
  const { listing } = route.params || {}; 

  const [sellerData, setSellerData] = useState(null); // 🔥 Store seller info here

  // 🔥 Fetch Seller Data
  useEffect(() => {
    const fetchSellerData = async () => {
      if (listing.userId) {
        const sellerRef = doc(db, "users", listing.userId);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSellerData(sellerSnap.data());
        }
      }
    };
    fetchSellerData();
  }, [listing.userId]);

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Listing not found.</Text>
      </View>
    );
  }

  const [isWishlisted, setIsWishlisted] = useState(false);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);
  
// 🔥 Check if item is in Wishlist
useEffect(() => {
  const checkWishlist = async () => {
    if (user && listing.id) {
      const wishlistRef = doc(db, 'users', user.uid, 'wishlist', listing.id);
      const wishlistSnap = await getDoc(wishlistRef);
      setIsWishlisted(wishlistSnap.exists());
    }
  };
  checkWishlist();
}, [user, listing.id]);


const toggleWishlist = async () => {
  if (!user) {
    Alert.alert('Error', 'You must be logged in to add to wishlist.');
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const wishlistRef = doc(db, 'users', user.uid, 'wishlist', listing.id);

  try {
    // 🔥 Ensure the user document exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {}); // Create an empty user document
    }

    if (isWishlisted) {
      // 🔥 Remove from Wishlist
      await deleteDoc(wishlistRef);
      setIsWishlisted(false);
      Alert.alert('Removed', 'Item removed from wishlist.');
    } else {
      // 🔥 Add to Wishlist
      await setDoc(wishlistRef, {
        listingId: listing.id,
        name: listing.name,
        price: listing.price,
        imageUrl: listing.imageUrl,
        timestamp: new Date(),
      }, { merge: true }); // Ensure the document is merged
      setIsWishlisted(true);
      Alert.alert('Added', 'Item added to wishlist.');
    }
  } catch (error) {
    console.error('🔥 Error updating wishlist:', error);
    Alert.alert('Error', 'Failed to update wishlist.');
  }
};




  
  const isOwner = user?.uid === listing.userId;

  // 🔥 Delete Listing Function
  const handleDeleteListing = async () => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "listings", listing.id));
            Alert.alert('Success', 'Listing deleted successfully!');
            navigation.goBack();
          } catch (error) {
            console.error("🔥 Error deleting listing:", error);
            Alert.alert("Error", "Failed to delete listing.");
          }
        }
      }
    ]);
  };

  // 🔥 Buy Now Function
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
            await updateDoc(doc(db, "listings", listing.id), {
              isSold: true,
              buyerId: user.uid,
            });
            Alert.alert('Success', 'Purchase completed!');
            navigation.goBack();
          } catch (error) {
            console.error("🔥 Error updating listing:", error);
            Alert.alert("Error", "Failed to complete the purchase.");
          }
        }
      }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {listing.imageUrl ? (
          <Image 
            source={{ uri: listing.imageUrl }} 
            style={styles.image} 
          />
        ) : (
          <Text>No Image Available</Text>
        )}
  <TouchableOpacity 
  style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
  onPress={toggleWishlist}
>
  <Icon 
    name={isWishlisted ? 'heart' : 'heart-o'} 
    size={30} 
    color={isWishlisted ? 'red' : '#888'} 
  />
</TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{listing.name}</Text>
          <Text style={styles.price}>RM {listing.price}</Text>
          <Text style={styles.type}>Type: {listing.type}</Text>
          <Text style={styles.condition}>Condition: {listing.condition}</Text>
          <Text style={styles.description}>Description: {listing.description}</Text>
          {/* 🔥 Display Colors */}
{listing.colors && listing.colors.length > 0 && (
  <View style={styles.colorContainer}>
    <Text style={styles.colorTitle}>Colors:</Text>
    <View style={styles.colorList}>
      {listing.colors.map((color, index) => (
        <View 
          key={index} 
          style={[styles.colorCircle, { backgroundColor: color }]}
        />
      ))}
    </View>
  </View>
)}


       {/* 🔥 Display Seller Info */}
       {sellerData && (
  <TouchableOpacity 
    style={styles.sellerContainer}
    onPress={() => navigation.navigate('UserProfile', { userId: listing.userId })}
  >
    <Image 
      source={{ uri: sellerData.profileImage }} 
      style={styles.sellerImage} 
    />
    <Text style={styles.sellerName}>{sellerData.name}</Text>
  </TouchableOpacity>
)}


          {/* 🔥 Show "Buy Now" ONLY if not sold */}
          {!listing.isSold ? (
            <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.soldText}>SOLD</Text>
          )}

          {/* 🔥 Show "Delete" button ONLY if the user is the owner */}
          {isOwner && (
            <TouchableOpacity 
              style={styles.deleteButton} 
              onPress={handleDeleteListing}
            >
              <Text style={styles.deleteButtonText}>Delete Listing</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  
  price: {
    fontSize: 22,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sellerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buyButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  soldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  colorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  colorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#555',
  },
  colorList: {
    flexDirection: 'row',
  },
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  
});

export default ListingDetailsScreen;
