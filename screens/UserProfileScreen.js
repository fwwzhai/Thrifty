import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params; // 🔥 Get userId from navigation params
  const [userData, setUserData] = useState(null);
  const [userListings, setUserListings] = useState([]);

  // Fetch user profile data
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
    };

    fetchUser();
  }, [userId]);

  // Fetch listings by user
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

  if (!userData) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: userData.profileImage }} style={styles.profileImage} />
      <Text style={styles.name}>{userData.name}</Text>
      <Text style={styles.bio}>{userData.bio}</Text>

      <Text style={styles.listingsTitle}>Listings by {userData.name}</Text>

      <FlatList
        data={userListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.listing}
            onPress={() => navigation.navigate('ListingDetails', { listing: item })}
          >
            <Text style={styles.listingTitle}>{item.name}</Text>
            <Text>{item.price} MYR</Text>
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
    alignItems: 'center',
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
    textAlign: 'center',
    marginTop: 5,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
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
});

export default UserProfileScreen;
