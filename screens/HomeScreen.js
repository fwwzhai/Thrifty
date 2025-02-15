import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Alert } from 'react-native'; 


const HomeScreen = ({ navigation, route }) => {
  const [listings, setListings] = useState([]);
  const userData = route.params?.userData || {}; // Get user data from login

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "listings"));
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setListings(items);
      } catch (error) {
        console.error("Error fetching listings:", error);
      }
    };

    fetchListings();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been logged out.');
      navigation.navigate('Login'); // ✅ Use navigate instead of replace
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  

  

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userData.name}!</Text>

      <FlatList
        data={listings}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listing} 
            onPress={() => navigation.navigate('ListingDetails', { listing: item })}

          >
            <Text style={styles.listingTitle}>{item.title}</Text>
            <Text>{item.price} MYR</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CreateListing')}
      >
        <Text style={styles.addButtonText}>+ Add Listing</Text>
      </TouchableOpacity>


        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
    <Text style={styles.profileButtonText}>Edit Profile</Text>
    </TouchableOpacity>

      
    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
    <Text style={styles.logoutButtonText}>Log Out</Text>
  </TouchableOpacity>

    </View>

    
  );

  
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
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
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  profileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  logoutButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
});

export default HomeScreen;
