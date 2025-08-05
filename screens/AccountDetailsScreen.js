import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const AccountDetailsScreen = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setUserData(userSnap.data());
    };
    fetchUser();
  }, []);

  if (!userData) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{userData.name}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{auth.currentUser.email}</Text>
      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{userData.phone || '-'}</Text>
      {/* Add more fields as needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  label: { fontWeight: 'bold', fontSize: 16, marginTop: 16 },
  value: { fontSize: 16, marginTop: 4, color: '#22223B' },
});

export default AccountDetailsScreen;