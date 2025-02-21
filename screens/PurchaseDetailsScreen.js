import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const PurchaseDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [sellerUsername, setSellerUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerUsername = async () => {
      try {
        const sellerDocRef = doc(db, 'users', item.sellerId);
        const sellerDocSnap = await getDoc(sellerDocRef);

        if (sellerDocSnap.exists()) {
          setSellerUsername(sellerDocSnap.data().name || 'Unknown Seller');
        } else {
          setSellerUsername('Unknown Seller');
        }
      } catch (error) {
        console.error("🔥 Error fetching seller's username:", error);
        setSellerUsername('Unknown Seller');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerUsername();
  }, [item.sellerId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  const handleNavigateToSellerProfile = () => {
    navigation.navigate('UserProfile', { userId: item.sellerId });
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purchase Details</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>RM {item.price}</Text>
      <TouchableOpacity onPress={handleNavigateToSellerProfile}>
  <Text style={styles.sellerName}>
    Seller: <Text style={styles.sellerLink}>{sellerUsername}</Text>
  </Text>
</TouchableOpacity>

      <Text style={styles.date}>Date: {new Date(item.timestamp.seconds * 1000).toDateString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  itemImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 20,
    color: '#28a745',
    marginVertical: 10,
  },
  sellerName: {
    fontSize: 18,
    color: '#007BFF',
    marginTop: 5,
  },
  date: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
});

export default PurchaseDetailsScreen;
