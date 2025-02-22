import React, { useEffect, useState } from 'react';
import { Image, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth'; 

const HomeScreen = ({ navigation, route }) => {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(route.params?.filters || {});
  const [userData, setUserData] = useState(route.params?.userData || { name: 'Guest' });
  const selectedColors = filters.selectedColors || [];
  const selectedTypes = filters.selectedTypes || [];
  const selectedConditions = filters.selectedConditions || [];
  const maxPrice = filters.maxPrice || '';
  // 🔥 State for Sorting

  
  // 🔥 Extract Sorting Parameters Correctly
  const sortType = filters.sortType || 'date'; 
  const sortOrder = filters.sortOrder || 'desc';
  const priceSortOrder = filters.priceSortOrder || 'desc';
  



  

  useEffect(() => {
    const q = query(
      collection(db, "listings"),
      orderBy("createdAt", sortOrder) // 🔥 Order by createdAt with selected sortOrder
    ); 
  
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setListings(items);
    });
  
    return () => unsubscribe();
  }, [sortOrder]); // 🔥 Re-fetch when sortOrder changes
  
  useEffect(() => {
    if (route.params?.userData) {
      setUserData(route.params.userData);
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

  const filteredListings = listings
  .filter(item => {
    const matchesSearchQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sellerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(item.type);

    const matchesCondition = selectedConditions.length === 0 || selectedConditions.includes(item.condition);

    const matchesMaxPrice = maxPrice === '' || item.price <= parseFloat(maxPrice);

    const matchesColor = selectedColors.length === 0 || 
      item.colors?.some(color => selectedColors.includes(color));

    return matchesSearchQuery && matchesType && matchesCondition && matchesMaxPrice && matchesColor;
  })
  .sort((a, b) => {
    // 🔥 Sort by Date
    if (sortType === 'date') {
      if (sortOrder === 'desc') {
        return b.createdAt.toMillis() - a.createdAt.toMillis();
      } else {
        return a.createdAt.toMillis() - b.createdAt.toMillis();
      }
    }

    // 🔥 Sort by Price
    if (sortType === 'price') {
      if (priceSortOrder === 'desc') {
        return b.price - a.price;  // High to Low
      } else {
        return a.price - b.price;  // Low to High
      }
    }

    // 🔥 Default: No Sorting
    return 0;
  });





  
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userData.name}!</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Search items..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <TouchableOpacity 
        style={styles.filterButton} 
        onPress={() => navigation.navigate('FilterScreen', { currentFilters: filters, sortOrder, userData })}
      >
        <Text style={styles.filterButtonText}>Filter</Text>
      </TouchableOpacity>

   

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
) : Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? (
  <Image source={{ uri: item.imageUrls[0] }} style={styles.listingImage} />
) : (
  <Text>No Image Available</Text>
)}

            <Text style={styles.listingTitle}>{item.name}</Text>
            <Text style={styles.listingPrice}>RM {item.price}</Text>
            <Text style={styles.listingSeller}>Seller: {item.sellerName || 'Unknown'}</Text>
          </TouchableOpacity>
        )}
      />

<TouchableOpacity 
        style={styles.addButton} 
        onPress={() => navigation.navigate('CreateListing')}
      >
        <Text style={styles.addButtonText}>+</Text>
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
    backgroundColor: '#F5F5F5',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  searchBar: {
    width: '100%',
    padding: 12,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  filterButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listing: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 16,
    color: '#28a745',
    marginBottom: 5,
  },
  listingSeller: {
    fontSize: 14,
    color: '#888',
  },
  listingImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,  // Adjusted to give space for Profile & Log Out
    right: 30,
    backgroundColor: '#FF6F61',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  profileButton: {
    position: 'absolute',
    bottom: 110,  // Positioned above Add Button
    right: 30,
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,  // More rounded for modern look
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 160,  // Positioned above Profile Button
    right: 30,
    backgroundColor: '#f8d7da',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#721c24',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sortButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  sortButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  


});

export default HomeScreen;
