import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

const ChangeUsernameScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');

  const handleChange = async () => {
    if (!username) return Alert.alert('Error', 'Username cannot be empty');
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { name: username });
    Alert.alert('Success', 'Username updated!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter new username"
      />
      <Button title="Save" onPress={handleChange} color="#2563eb" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  label: { fontWeight: 'bold', fontSize: 16, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
});

export default ChangeUsernameScreen;