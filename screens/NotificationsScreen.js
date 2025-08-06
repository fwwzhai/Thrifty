import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'notifications'),
      orderBy('timestamp', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handlePress = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', notification.id), { read: true });
    }
    // Optionally, navigate to listing details if notification.listingId exists
    if (notification.listingId) {
      navigation.navigate('ListingDetails', { listing: { id: notification.listingId } });
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notification, !item.read && styles.unread]}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.message}>{item.message}</Text>
            <Text style={styles.time}>
              {item.timestamp?.toDate
                ? item.timestamp.toDate().toLocaleString()
                : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#22223B' },
  notification: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  unread: {
    borderLeftWidth: 5,
    borderLeftColor: '#2563eb',
    backgroundColor: '#e0e7ff',
  },
  message: { fontSize: 16, color: '#22223B', marginBottom: 4 },
  time: { fontSize: 12, color: '#888' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});

export default NotificationsScreen;