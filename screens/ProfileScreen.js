import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({});
  const [userListings, setUserListings] = useState([]);
  const route = useRoute();
  const userId = route.params?.userId || auth.currentUser?.uid; // ✅ Show profile for current OR other users

  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        try {
          // 🔥 Fetch User Data
          const userDocRef = doc(db, "users", userId);
          const userDocSnap = await getDoc(userDocRef);
  
          if (userDocSnap.exists()) {
            setUserInfo(userDocSnap.data());
          } else {
            setUserInfo({ name: "Unknown", bio: "No bio available" });
          }
  
          // 🔥 Fetch User's Listings
          const listingsQuery = query(collection(db, "listings"), where("userId", "==", userId));
          const listingsSnapshot = await getDocs(listingsQuery);
          const listingsData = listingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setUserListings(listingsData);
  
        } catch (error) {
          console.error("🔥 Error fetching profile:", error);
        }
      };
  
      fetchUserProfile();
    }, [userId]) // ✅ Refresh data when userId changes
  );
  

  const handleEditProfile = () => {
    if (userId !== auth.currentUser?.uid) return; // ✅ Prevent editing another user's profile
    // Navigate to EditProfileScreen
    navigation.navigate('EditProfile', { userId });
  };
  
  return (
    <View style={styles.container}>
      {/* 🔥 Display User Info */}
      <View style={styles.profileHeader}>
        <Image 
          source={userInfo.profileImage ? { uri: userInfo.profileImage } : require('../assets/default-profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>{userInfo.name}</Text>
        <Text style={styles.bio}>{userInfo.bio}</Text>

        <TouchableOpacity 
  style={styles.editButton} 
  onPress={handleEditProfile} // This will now navigate to the EditProfileScreen
>
  <Text style={styles.editButtonText}>Edit Profile</Text>
</TouchableOpacity>

      </View>

      <Text style={styles.listingHeader}>Listings by {userInfo.name}:</Text>

      {/* 🔥 Show Listings */}
      <FlatList
  data={userListings}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <TouchableOpacity 
      style={styles.listing} 
      onPress={() => navigation.navigate('ListingDetails', { listing: item })}
    >
      {/* 🔥 Display Listing Image */}
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.listingImage} // ✅ Ensure you have this style
        />
      ) : (
        <Text>No Image Available</Text> // Fallback if image is missing
      )}

      {/* 🔥 Display Item Name & Price */}
      <Text style={styles.listingTitle}>{item.name}</Text>
      <Text>RM {item.price}</Text>
    </TouchableOpacity>
  )}
/>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: 'gray',
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
  },
  listingHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listing: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listingImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  
});

export default ProfileScreen;
