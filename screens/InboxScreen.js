import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const InboxScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'inbox'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'inbox', id));
      }}
    ]);
  };

  const handlePress = (item) => {
  if (item.listingId && item.buyerId) {
    navigation.navigate('ManageOrder', { listingId: item.listingId, buyerId: item.buyerId });
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Inbox</Text>
      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          item.message ? (
            <TouchableOpacity
              style={[styles.message, !item.read && styles.unread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.text}>{item.message}</Text>
                <Text style={styles.time}>
                  {item.timestamp?.toDate
                    ? item.timestamp.toDate().toLocaleString()
                    : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          ) : null
        )}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#22223B' },
  message: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  unread: {
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
    backgroundColor: '#e0e7ff',
  },
  text: { fontSize: 16, color: '#22223B', marginBottom: 4 },
  time: { fontSize: 12, color: '#888' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
  deleteBtn: {
    marginLeft: 16,
    padding: 4,
  },
});

export default InboxScreen;