import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const SoldDetailsScreen = ({ route, navigation }) => {
  const { item } = route.params;
  const [buyerUsername, setBuyerUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerUsername = async () => {
      try {
        const buyerDocRef = doc(db, 'users', item.buyerId);
        const buyerDocSnap = await getDoc(buyerDocRef);

        if (buyerDocSnap.exists()) {
          setBuyerUsername(buyerDocSnap.data().name || 'Unknown Buyer');
        } else {
          setBuyerUsername('Unknown Buyer');
        }
      } catch (error) {
        console.error("🔥 Error fetching buyer's username:", error);
        setBuyerUsername('Unknown Buyer');
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerUsername();
  }, [item.buyerId]);

  const handleNavigateToProfile = () => {
    navigation.navigate('UserProfile', { userId: item.buyerId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sold Details</Text>
      <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemPrice}>RM {item.price}</Text>
      <TouchableOpacity onPress={handleNavigateToProfile}>
        <Text style={styles.buyerName}>Buyer: <Text style={styles.buyerLink}>{buyerUsername}</Text></Text>
      </TouchableOpacity>
      <Text style={styles.date}>Date: {new Date(item.timestamp.seconds * 1000).toDateString()}</Text>
      <TouchableOpacity
        style={styles.manageButton}
        onPress={() => navigation.navigate('ManageOrder', { listingId: item.listingId || item.id, buyerId: item.buyerId })}
      >
        <Text style={styles.manageButtonText}>Manage Order</Text>
      </TouchableOpacity>
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
  buyerName: {
    fontSize: 18,
    color: '#333',
    marginTop: 5,
  },
  buyerLink: {
    color: '#007BFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  manageButton: {
    marginTop: 18,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SoldDetailsScreen;
