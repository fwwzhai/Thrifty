import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState({});
  const [userListings, setUserListings] = useState([]);
  const userId = auth.currentUser?.uid;
  const [followersCount, setFollowersCount] = useState(0);
const [followingCount, setFollowingCount] = useState(0);


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
    }, [userId]) 
  );

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
  
          // 🔥 Fetch Followers Count
          const followersRef = collection(db, "users", userId, "followers");
          const followersSnap = await getDocs(followersRef);
          setFollowersCount(followersSnap.size);
  
          // 🔥 Fetch Following Count
          const followingRef = collection(db, "users", userId, "following");
          const followingSnap = await getDocs(followingRef);
          setFollowingCount(followingSnap.size);
  
        } catch (error) {
          console.error("🔥 Error fetching profile:", error);
        }
      };
  
      fetchUserProfile();
    }, [userId]) 
  );
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { userId });
  };

  return (
    <FlatList
      data={userListings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.listingCard} 
          onPress={() => navigation.navigate('ListingDetails', { listing: item })}
        >
          {item.imageUrl ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.listingImage} 
            />
          ) : (
            <Text>No Image Available</Text>
          )}
  
          <View style={styles.listingDetails}>
            <Text style={styles.listingTitle}>{item.name}</Text>
            <Text style={styles.listingPrice}>RM {item.price}</Text>
          </View>
        </TouchableOpacity>
      )}
  
      // 🔥 Move Profile Info to Header
      ListHeaderComponent={
        <View style={styles.profileHeader}>
          <Image 
            source={userInfo.profileImage ? { uri: userInfo.profileImage } : require('../assets/default-profile.png')}
            style={styles.profileImage}
          />
          <Text style={styles.name}>{userInfo.name}</Text>
          <Text style={styles.bio}>{userInfo.bio}</Text>
          <View style={styles.followContainer}>
  <TouchableOpacity onPress={() => navigation.navigate('FollowList', { userId, type: 'followers' })}>
    <Text style={styles.followCount}>{followersCount}</Text>
    <Text style={styles.followLabel}>Followers</Text>
  </TouchableOpacity>

  <TouchableOpacity onPress={() => navigation.navigate('FollowList', { userId, type: 'following' })}>
    <Text style={styles.followCount}>{followingCount}</Text>
    <Text style={styles.followLabel}>Following</Text>
  </TouchableOpacity>
</View>

  
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={handleEditProfile}
          >
            <Icon name="edit" size={18} color="white" />
            <Text style={styles.editButtonText}> Edit Profile</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={styles.wishlistButton} 
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Icon name="heart" size={18} color="white" />
            <Text style={styles.wishlistButtonText}> Wishlist</Text>
          </TouchableOpacity>
  
          <Text style={styles.listingHeader}>Listings by {userInfo.name}:</Text>
        </View>
      }
  
      // ✅ Dynamic Padding
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
  
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  wishlistButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  wishlistButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  listingHeader: {
    marginTop: 50,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  listingDetails: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  listingPrice: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  
  followCount: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  followLabel: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 2,  // Space between count and label
    paddingHorizontal: 15, // Space between Followers and Following
  },
  
  
});

export default ProfileScreen;
