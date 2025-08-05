import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import { updatePassword } from 'firebase/auth';

const ChangePasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');

  const handleChange = async () => {
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    try {
      await updatePassword(auth.currentUser, password);
      Alert.alert('Success', 'Password updated!');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>New Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Enter new password"
        secureTextEntry
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

export default ChangePasswordScreen;