import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';


const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [userData, setUserData] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
const currentUser = auth.currentUser;


  // 🔥 Fetch User Data
  useEffect(() => {
    const fetchUser = async () => {
      if (userId) {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("❌ User not found");
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [userId]);

  // 🔥 Fetch User's Listings
  useEffect(() => {
    const fetchUserListings = async () => {
      if (userId) {
        const listingsRef = collection(db, "listings");
        const q = query(listingsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const listings = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUserListings(listings);
      }
    };

    fetchUserListings();
  }, [userId]);

  useEffect(() => {
    const checkFollowing = async () => {
      if (currentUser?.uid && userId) {
        const followingRef = doc(db, "users", currentUser.uid, "following", userId);
        const followingSnap = await getDoc(followingRef);
        setIsFollowing(followingSnap.exists());
      }
    };
    checkFollowing();
  }, [currentUser, userId]);
  
  const handleFollow = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to follow.');
      return;
    }
  
    try {
      // 🔥 Add to "following" of current user
      await setDoc(doc(db, "users", currentUser.uid, "following", userId), {
        userId: userId,
        timestamp: new Date()
      });
  
      // 🔥 Add to "followers" of the other user
      await setDoc(doc(db, "users", userId, "followers", currentUser.uid), {
        userId: currentUser.uid,
        timestamp: new Date()
      });
  
      setIsFollowing(true);
      Alert.alert('Success', 'You are now following this user.');
    } catch (error) {
      console.error("🔥 Error following user:", error);
      Alert.alert('Error', 'Failed to follow user.');
    }
  };
  
  const handleUnfollow = async () => {
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to unfollow.');
      return;
    }
  
    try {
      // 🔥 Remove from "following" of current user
      await deleteDoc(doc(db, "users", currentUser.uid, "following", userId));
  
      // 🔥 Remove from "followers" of the other user
      await deleteDoc(doc(db, "users", userId, "followers", currentUser.uid));
  
      setIsFollowing(false);
      Alert.alert('Success', 'You have unfollowed this user.');
    } catch (error) {
      console.error("🔥 Error unfollowing user:", error);
      Alert.alert('Error', 'Failed to unfollow user.');
    }
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

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
      ListHeaderComponent={
        
        <View style={styles.profileHeader}>
          

          <Image 
            source={{ uri: userData.profileImage }} 
            style={styles.profileImage} 
          />
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.bio}>{userData.bio}</Text>
          {currentUser?.uid !== userId && (
  <TouchableOpacity 
    style={isFollowing ? styles.unfollowButton : styles.followButton} 
    onPress={isFollowing ? handleUnfollow : handleFollow}
  >
    <Text style={isFollowing ? styles.unfollowButtonText : styles.followButtonText}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Text>
  </TouchableOpacity>
)}
          <Text style={styles.listingsTitle}>Listings by {userData.name}</Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  bio: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  listingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: 20,
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
  followButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  unfollowButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  unfollowButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
});

export default UserProfileScreen;
