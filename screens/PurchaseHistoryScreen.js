import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const PurchaseHistoryScreen = ({ navigation }) => {
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    const buyerHistoryRef = collection(db, 'users', auth.currentUser.uid, 'purchaseHistory');
    const q = query(buyerHistoryRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const history = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPurchaseHistory(history);
    });

    return () => unsubscribe();
  }, []);

  const handlePress = (item) => {
    navigation.navigate('PurchaseDetails', { item });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purchase History</Text>
      <FlatList
        data={purchaseHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.historyItem} onPress={() => handlePress(item)}>
            <Image source={{ uri: item.imageUrl }} style={styles.historyImage} />
            <View style={styles.detailsContainer}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>RM {item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyHistoryText}>No Purchase History Available</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f4f4f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 16,
    color: '#007BFF',
    marginTop: 5,
  },
  emptyHistoryText: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
  },
});

export default PurchaseHistoryScreen;
