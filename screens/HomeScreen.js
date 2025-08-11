import React, { useEffect, useState } from 'react';
import { Image, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { signOut, onAuthStateChanged  } from 'firebase/auth'; 
import { Ionicons } from '@expo/vector-icons'; 



const HomeScreen = ({ navigation, route }) => {
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(route.params?.filters || {});
  const [userData, setUserData] = useState(route.params?.userData || { name: 'Guest' });
  const selectedColors = filters.selectedColors || [];
  const selectedTypes = filters.selectedTypes || [];
  const selectedConditions = filters.selectedConditions || [];
  const maxPrice = filters.maxPrice || '';
  const selectedGender = filters.selectedGender || '';
const selectedType = filters.selectedType || '';
const selectedSize = filters.selectedSize || '';

  const [followingList, setFollowingList] = useState([]);
 const goToInbox = () => {
  navigation.navigate('Inbox');
};
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
   if (!auth.currentUser) return;
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

const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  let unsubscribeInbox;
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (user) {
      const inboxRef = collection(db, 'users', user.uid, 'inbox');
      unsubscribeInbox = onSnapshot(inboxRef, (snapshot) => {
        const unread = snapshot.docs.filter(doc => doc.data().read === false).length;
        setUnreadCount(unread);
      });
    } else {
      setUnreadCount(0);
      if (unsubscribeInbox) unsubscribeInbox();
    }
  });

  return () => {
    unsubscribeAuth();
    if (unsubscribeInbox) unsubscribeInbox();
  };
}, []);
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
   
const matchesSize = (() => {
  const gender = selectedGender.trim();
  const type = selectedType.trim();
  const size = selectedSize.trim();
  const listingSize = item.size?.trim() || '';

  if (!gender && !type && !size) return true;
  if (gender && !type && !size) {
    return listingSize.toLowerCase().startsWith(gender.toLowerCase());
  }
  if (gender && type && !size) {
    return listingSize.toLowerCase().startsWith(`${gender} - ${type}`.toLowerCase());
  }
  if (gender && type && size) {
    return listingSize.toLowerCase() === `${gender} - ${type} - ${size}`.toLowerCase();
  }
  if (!gender && type && !size) {
    return listingSize.toLowerCase().includes(type.toLowerCase());
  }
  if (!gender && !type && size) {
    return listingSize.toLowerCase().endsWith(size.toLowerCase());
  }
  return true;
})();

    // 🔥 Combine all conditions including Following
 return (
      matchesSearchQuery &&
      matchesType &&
      matchesCondition &&
      matchesMaxPrice &&
      matchesColor &&
      matchesFollowing &&
    
      matchesSize
    );
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
      
<View style={styles.headerRow}>
  <View style={styles.headerCenter}>
    <Image source={require('../assets/smallerbg.png')} style={styles.logo} />
    <Text style={styles.welcome}>Thrifty</Text>
  </View>
 <TouchableOpacity style={styles.inboxButton} onPress={goToInbox}>
  <Ionicons name="mail-outline" size={28} color="#2563eb" />
  {unreadCount > 0 && (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{unreadCount}</Text>
    </View>
  )}
</TouchableOpacity>
</View>
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

// ...existing code...
// ...existing code...
const styles = StyleSheet.create({
 container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#f8fafc',
  },
 headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
  paddingHorizontal: 4,
  position: 'relative',
},
headerCenter: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
inboxButton: {
  position: 'absolute',
  right: 0,
  padding: 8,
  zIndex: 10,
},
logo: {
  width: 50,
  height: 50,
  resizeMode: 'contain',
  marginRight: 10,
  backgroundColor: '#fff',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#e2e8f0',
},
welcome: {
  fontSize: 26,
  fontWeight: '700',
  color: '#22223B',
  letterSpacing: 0.5,
  textAlign: 'center',
},
  searchBar: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 16,
    color: '#22223B',
    marginBottom: 16,
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  activeButton: {
    backgroundColor: '#f59e42',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  listing: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22223B',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  listingPrice: {
    fontSize: 17,
    color: '#2563eb',
    marginBottom: 4,
    fontWeight: '700',
  },
  listingSeller: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
  },
  listingImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e2e8f0',
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#2563eb',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  badge: {
  position: 'absolute',
  top: -4,
  right: -4,
  backgroundColor: '#ef4444',
  borderRadius: 10,
  minWidth: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 4,
  zIndex: 20,
},
badgeText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 12,
},
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'absolute',
    bottom: 100,
    right: 32,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileButtonText: {
    color: '#22223B',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 150,
    right: 32,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
