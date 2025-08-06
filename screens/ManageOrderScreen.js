import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const ManageOrderScreen = ({ route }) => {
  const { listingId, buyerId } = route.params;
  const [order, setOrder] = useState(null);
  const [buyer, setBuyer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndBuyer = async () => {
      try {
        // 1. Get soldHistory (listing info)
        const user = await import('../firebaseConfig').then(mod => mod.auth.currentUser);
        const soldRef = doc(db, 'users', user.uid, 'soldHistory', listingId);
        const soldSnap = await getDoc(soldRef);
        if (soldSnap.exists()) setOrder(soldSnap.data());

        // 2. Get buyer info
        if (buyerId) {
          const buyerRef = doc(db, 'users', buyerId);
          const buyerSnap = await getDoc(buyerRef);
          if (buyerSnap.exists()) setBuyer(buyerSnap.data());

          // 3. Get buyer addresses (if you have an addresses subcollection)
          const addrCol = collection(db, 'users', buyerId, 'addresses');
          const addrSnap = await getDocs(addrCol);
          setAddresses(addrSnap.docs.map(doc => doc.data()));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderAndBuyer();
  }, [listingId, buyerId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order Details</Text>
      {order ? (
        <View style={styles.section}>
          <Text style={styles.label}>Item:</Text>
          <Text style={styles.value}>{order.name}</Text>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>RM {order.price}</Text>
          <Text style={styles.label}>Sold At:</Text>
          <Text style={styles.value}>{order.timestamp?.toDate ? order.timestamp.toDate().toLocaleString() : ''}</Text>
        </View>
      ) : (
        <Text style={styles.value}>Order not found.</Text>
      )}

      <Text style={styles.header}>Buyer Info</Text>
      {buyer ? (
        <View style={styles.section}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{buyer.name}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{buyer.email}</Text>
        </View>
      ) : (
        <Text style={styles.value}>Buyer not found.</Text>
      )}

      <Text style={styles.header}>Buyer Address</Text>
      {addresses.length > 0 ? (
 addresses.map((addr, idx) => (
  <View key={idx} style={styles.section}>
    {addr.address ? (
      <Text style={styles.value}>{addr.address}</Text>
    ) : (
      <Text style={styles.value}>
        {[addr.addressLine1, addr.city, addr.state, addr.zip, addr.country]
          .filter(Boolean)
          .join(', ')}
      </Text>
    )}
  </View>
))
) : (
  <Text style={styles.value}>No address found.</Text>
)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 16, marginBottom: 8, color: '#2563eb' },
  section: { marginBottom: 16, backgroundColor: '#fff', borderRadius: 10, padding: 12, elevation: 1 },
  label: { fontWeight: 'bold', color: '#22223B', marginTop: 4 },
  value: { color: '#22223B', marginBottom: 2 },
});

export default ManageOrderScreen;