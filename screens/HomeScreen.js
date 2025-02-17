import React, { useEffect, useState } from 'react';
import { Image, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Alert } from 'react-native'; 

const HomeScreen = ({ navigation, route }) => {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(route.params?.filters || {}); // 🔥 Store applied filters
  const [userData, setUserData] = useState(route.params?.userData || { name: 'Guest' });
  // ✅ Ensure userData is always present
 
  const selectedTypes = filters.selectedTypes || [];  // ✅ Get selected types as an array
const selectedConditions = filters.selectedConditions || [];  
const maxPrice = filters.maxPrice || '';

  useEffect(() => {
    const q = query(collection(db, "listings")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListings(items);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (route.params?.userData) {
      setUserData(route.params.userData);  // 🔥 Ensures userData is kept even after filtering
    }
  }, [route.params]);
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have been logged out.');
      navigation.navigate('Login'); 
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const filteredListings = listings.filter(item =>
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.sellerName?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedTypes.length === 0 || selectedTypes.includes(item.type)) &&  // ✅ Check multiple types
    (selectedConditions.length === 0 || selectedConditions.includes(item.condition)) &&  // ✅ Check multiple conditions
    (maxPrice === '' || item.price <= parseFloat(maxPrice))  // ✅ Check max price
  );
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userData.name}!</Text>
      {/* 🔥 Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 🔥 Filter Button */}
      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => navigation.navigate('FilterScreen', { currentFilters: filters, userData })}

      >
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

      {/* 🔥 Listings */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.listing} 
            onPress={() => navigation.navigate('ListingDetails', { listing: item })}
          >
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
            ) : (
              <Text>No Image Available</Text>
            )}
            <Text style={styles.listingTitle}>{item.name}</Text>
            <Text>RM {item.price}</Text>
            <Text>Seller: {item.sellerName || 'Unknown'}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 🔥 Buttons */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CreateListing')}
      >
        <Text style={styles.addButtonText}>+ Add Listing</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.profileButtonText}>Profile</Text>
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
    marginBottom: 10,
  },
  searchBar: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  filterButton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
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
