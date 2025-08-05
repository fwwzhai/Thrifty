import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

const SettingsScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.header}>Settings</Text>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AccountDetails')}>
        <Ionicons name="person-outline" size={22} color="#2563eb" style={styles.icon} />
        <Text style={styles.itemText}>Account Details</Text>
        <Feather name="chevron-right" size={20} color="#bbb" style={styles.chevron} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChangeUsername')}>
        <MaterialIcons name="edit" size={22} color="#2563eb" style={styles.icon} />
        <Text style={styles.itemText}>Change Username</Text>
        <Feather name="chevron-right" size={20} color="#bbb" style={styles.chevron} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChangePassword')}>
        <Feather name="lock" size={22} color="#2563eb" style={styles.icon} />
        <Text style={styles.itemText}>Change Password</Text>
        <Feather name="chevron-right" size={20} color="#bbb" style={styles.chevron} />
      </TouchableOpacity>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Addresses</Text>
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('AddressBook')}>
        <Ionicons name="location-outline" size={22} color="#2563eb" style={styles.icon} />
        <Text style={styles.itemText}>Manage Addresses</Text>
        <Feather name="chevron-right" size={20} color="#bbb" style={styles.chevron} />
      </TouchableOpacity>
    </View>

    {/* Add more sections as needed */}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, color: '#22223B' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#2563eb', marginBottom: 10, marginLeft: 2 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  icon: { marginRight: 16 },
  itemText: { fontSize: 17, color: '#22223B', flex: 1, fontWeight: '500' },
  chevron: { marginLeft: 8 },
});

export default SettingsScreen;