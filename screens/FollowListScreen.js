import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const FollowListScreen = ({ route, navigation }) => {
  const { userId, type } = route.params;
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const ref = collection(db, "users", userId, type);
        const snapshot = await getDocs(ref);
        const userIds = snapshot.docs.map(doc => doc.id);

        const usersData = await Promise.all(userIds.map(async (id) => {
          const userRef = doc(db, "users", id);
          const userSnap = await getDoc(userRef);
          return { id, ...userSnap.data() };
        }));

        setUsersList(usersData);
        setLoading(false);
      } catch (error) {
        console.error("🔥 Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [userId, type]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <FlatList
      data={usersList}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.userCard} 
          onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
        >
          <Image 
            source={{ uri: item.profileImage }} 
            style={styles.userImage} 
          />
          <Text style={styles.userName}>{item.name}</Text>
        </TouchableOpacity>
      )}
    />
  );
};

  const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});

export default FollowListScreen;

