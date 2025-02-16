import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth, storage } from '../firebaseConfig'; // Import Firebase Storage
import { getDoc, doc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImageManipulator from 'expo-image-manipulator';

const CreateListingScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // 🔥 Function to pick an image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // ✅ Update UI
    }
  };

  // 🔥 Function to upload image to Firebase Storage
  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      // 🔥 Compress Image Before Upload
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 🔥 Convert Image URI to Blob
      const response = await fetch(compressedImage.uri);
      const blob = await response.blob();

      // 🔥 Upload to Firebase Storage
      const filename = `listings/${auth.currentUser.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);

      // 🔥 Get Image URL
      const downloadURL = await getDownloadURL(storageRef);
      setUploading(false);
      return downloadURL;

    } catch (error) {
      console.error("🔥 Image Upload Error:", error);
      Alert.alert('Error', 'Failed to upload image.');
      setUploading(false);
      return null;
    }
  };

  const handleAddListing = async () => {
    if (!itemName || !image || !price || !type || !description) {
      Alert.alert('Error', 'Please fill all fields and select an image.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }

    try {
      // 🔥 Fetch User Data for Seller's Name
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let sellerName = userSnap.exists() && userSnap.data().name ? userSnap.data().name : "Unknown Seller";

      // 🔥 Upload Image to Firebase Storage
      const imageUrl = await uploadImage(image);
      if (!imageUrl) return; // Stop if upload fails

      // 🔥 Store Listing in Firestore
      await addDoc(collection(db, 'listings'), {
        userId: user.uid,
        sellerName,
        name: itemName,
        imageUrl,  // ✅ Store Image URL (No more Base64)
        price,
        type,
        description,
        createdAt: new Date(),
      });

      Alert.alert('Success', 'Listing added successfully!');
      navigation.goBack(); // ✅ Redirect back to Home
    } catch (error) {
      console.error('🔥 Error adding listing:', error);
      Alert.alert('Error', 'Failed to add listing.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Listing</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text>Select an Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Item Name"
        value={itemName}
        onChangeText={setItemName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Type"
        value={type}
        onChangeText={setType}
      />
      <TextInput
        style={styles.input}
        placeholder="Short Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Button title={uploading ? "Uploading..." : "Add Listing"} onPress={handleAddListing} disabled={uploading} />
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
  imagePicker: {
    width: 200,
    height: 200,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
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

export default CreateListingScreen;
