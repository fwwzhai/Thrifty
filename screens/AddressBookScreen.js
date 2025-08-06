import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Button, Alert, TextInput } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const AddressBookScreen = () => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');

  const fetchAddresses = async () => {
  if (!auth.currentUser) return; // Prevent fetch if logged out
  const ref = collection(db, 'users', auth.currentUser.uid, 'addresses');
  const snap = await getDocs(ref);
  setAddresses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
};

useEffect(() => { fetchAddresses(); }, []);

  const handleAdd = async () => {
  if (!newAddress) return;
  try {
    await addDoc(collection(db, 'users', auth.currentUser.uid, 'addresses'), { address: newAddress });
    setNewAddress('');
    fetchAddresses();
  } catch (e) {
    Alert.alert('Error', e.message);
  }
};

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'addresses', id));
    fetchAddresses();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Addresses</Text>
      <FlatList
        data={addresses}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.addressRow}>
            <Text style={styles.addressText}>{item.address}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: '#888', marginTop: 20 }}>No addresses yet.</Text>}
      />
      <TextInput
        style={styles.input}
        value={newAddress}
        onChangeText={setNewAddress}
        placeholder="Add new address"
      />
      <Button title="Add Address" onPress={handleAdd} color="#2563eb" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  addressText: { flex: 1, fontSize: 16, color: '#22223B' },
  delete: { color: '#e74c3c', fontWeight: 'bold', marginLeft: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16, marginTop: 16 },
});

export default AddressBookScreen;