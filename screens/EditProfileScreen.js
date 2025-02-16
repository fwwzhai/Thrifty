import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Button, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { auth, db, storage } from '../firebaseConfig'; // Import Storage
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const user = auth.currentUser;

  // Load Profile Data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setName(userData.name || '');
          setBio(userData.bio || '');
          setProfileImage(userData.profileImage || null);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  // Handle Image Upload to Firebase Storage
  const handleImageUpload = async (uri) => {
    try {
      if (!user) {
        throw new Error("User is not authenticated.");
      }

      // Step 1: Resize & Compress Image
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Step 2: Convert Image to Blob
      const response = await fetch(compressedImage.uri);
      const blob = await response.blob();

      // Step 3: Create a Reference for Firebase Storage
      const filename = `profile_pictures/${user.uid}.jpg`;
      const storageRef = ref(storage, filename);

      // Step 4: Upload to Firebase Storage
      await uploadBytes(storageRef, blob);

      // Step 5: Get the URL of the uploaded image
      const downloadURL = await getDownloadURL(storageRef);

      // Step 6: Update Firestore with Image URL
      await updateDoc(doc(db, "users", user.uid), { profileImage: downloadURL });

      setProfileImage(downloadURL); // Update UI with the new image URL
      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.error("Image Upload Error:", error);
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  // Handle picking image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "We need camera roll permissions to upload profile pictures.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      setProfileImage(selectedUri); // Update UI immediately
      await handleImageUpload(selectedUri); // Upload Image
    }
  };

  // Save profile data to Firestore
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "users", user.uid), {
        name,
        bio,
        profileImage, // Firebase Storage URL
      });

      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <TouchableOpacity onPress={pickImage}>
        <Image
          source={profileImage ? { uri: profileImage } : require('../assets/default-profile.png')}
          style={styles.profileImage}
        />
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Your Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />

      <Button title="Save Profile" onPress={handleSaveProfile} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default ProfileScreen;
