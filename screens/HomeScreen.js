import React, { useEffect, useState } from 'react';
import { Image, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut, onAuthStateChanged  } from 'firebase/auth'; 

const HomeScreen = ({ navigation, route }) => {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(route.params?.filters || {});
  const [userData, setUserData] = useState(route.params?.userData || { name: 'Guest' });
  const selectedColors = filters.selectedColors || [];
  const selectedTypes = filters.selectedTypes || [];
  const selectedConditions = filters.selectedConditions || [];
  const maxPrice = filters.maxPrice || '';
  const [followingList, setFollowingList] = useState([]);

  // 🔥 State for Sorting

  
  // 🔥 Extract Sorting Parameters Correctly
  const sortType = filters.sortType || 'date'; 
  const sortOrder = filters.sortOrder || 'desc';
  const priceSortOrder = filters.priceSortOrder || 'desc';
  
  const toggleSection = () => {
    setFilters(prevFilters => ({
      ...prevFilters,
      showFollowing: !prevFilters.showFollowing
    }));
  };
  


  


useEffect(() => {
  let unsubscribeListings;
  let unsubscribeFollowing;

  // 🔥 Track Authentication State
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      // 🔥 Fetch Following List
      const followingRef = collection(db, 'users', user.uid, 'following');
      unsubscribeFollowing = onSnapshot(followingRef, (snapshot) => {
        const followedUsers = snapshot.docs.map(doc => doc.id);
        setFollowingList(followedUsers);
      });

      // 🔥 Fetch Listings
      const q = query(
        collection(db, "listings"),
        orderBy("createdAt", sortOrder)
      ); 
      
      unsubscribeListings = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).filter(item => {
          // 🔥 Only show listings from followed users if in Following Section
          if (filters.showFollowing) {
            return followingList.includes(item.userId);
          }
          return true;
        });
        setListings(items);
      });
    } else {
      // 🔥 Clear State if User is Logged Out
      setListings([]);
      setFollowingList([]);

      // 🔥 Unsubscribe from All Listeners Immediately
      if (unsubscribeListings) {
        unsubscribeListings();
      }
      if (unsubscribeFollowing) {
        unsubscribeFollowing();
      }
    }
  });

  // 🔥 Clean Up Auth Listener on Unmount
  return () => {
    unsubscribeAuth();
    if (unsubscribeListings) {
      unsubscribeListings();
    }
    if (unsubscribeFollowing) {
      unsubscribeFollowing();
    }
  };
}, [sortOrder, filters.showFollowing]);

  
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

    const matchesFollowing = !filters.showFollowing || followingList.includes(item.userId);
    

    // 🔥 Combine all conditions including Following
    return matchesSearchQuery && matchesType && matchesCondition && matchesMaxPrice && matchesColor && matchesFollowing;
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

<View style={styles.buttonRow}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => navigation.navigate('FilterScreen', { currentFilters: filters, sortOrder, userData })}
        >
          <Text style={styles.buttonText}>Filter</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toggleButton, filters.showFollowing ? styles.activeButton : {}]} 
          onPress={toggleSection}
        >
          <Text style={styles.buttonText}>{filters.showFollowing ? 'Public' : 'Following'}</Text>
        </TouchableOpacity>
      </View>



   

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
    backgroundColor: '#A59079', // 🔥 Elegant beige-brown background
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF', // 🔥 White text for contrast
    marginBottom: 10,
  },
  searchBar: {
    width: '100%',
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#F8F5F0', // 🔥 Light beige background
    borderWidth: 1,
    borderColor: '#D9C2A6',
    fontSize: 16,
    color: '#5A4E3C',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: '#6D5F4A', // 🔥 Vibrant blue for contrast
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  toggleButton: {
    backgroundColor: '#6D5F4A', // 🔥 Subtle warm brown tone
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    flex: 1,
  },
  activeButton: {
    backgroundColor: '#4A90E2', // 🔥 Blue highlight for active state
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listing: {
    backgroundColor: '#FFF',
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
    color: '#3C3229',
    marginBottom: 5,
  },
  listingPrice: {
    fontSize: 16,
    color: '#28A745',
    marginBottom: 5,
    fontWeight: '600',
  },
  listingSeller: {
    fontSize: 14,
    color: '#6D5F4A',
  },
  listingImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#FF6F61', // 🔥 Strong red-orange for CTA
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
  addButtonText: {
    color: '#FFF',
    fontSize: 30,
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'absolute',
    bottom: 110,
    right: 30,
    backgroundColor: '#F8F5F0',
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
  profileButtonText: {
    color: '#3C3229',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 160,
    right: 30,
    backgroundColor: '#F8D7DA',
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
    color: '#721C24',
    fontSize: 16,
    fontWeight: '600',
  },
});


export default HomeScreen;
