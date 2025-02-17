import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth, storage } from '../firebaseConfig';
import { getDoc, doc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImageManipulator from 'expo-image-manipulator';

import ClothingPicker from './ClothingPicker'; // Adjust the path based on where the file is located
import ConditionPicker from './ConditionPicker';

const CreateListingScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState(''); // 🔥 Clothing Type
const [condition, setCondition] = useState(''); // 🔥 Condition

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
      setImage(result.assets[0].uri);
    }
  };

  // 🔥 Function to upload image to Firebase Storage
  const uploadImage = async (uri) => {
    try {
      setUploading(true);

      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(compressedImage.uri);
      const blob = await response.blob();

      const filename = `listings/${auth.currentUser.uid}_${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
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
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      let sellerName = userSnap.exists() && userSnap.data().name ? userSnap.data().name : "Unknown Seller";

      const imageUrl = await uploadImage(image);
      if (!imageUrl) return;

      await addDoc(collection(db, 'listings'), {
        userId: user.uid,
        sellerName,
        name: itemName,
        imageUrl,
        price,
        type,       // ✅ Store clothing type
        condition,  // ✅ Store condition
        description,
        createdAt: new Date(),
      });
      

      Alert.alert('Success', 'Listing added successfully!');
      navigation.goBack();
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
<ConditionPicker condition={condition} setCondition={setCondition} />
<ClothingPicker type={type} setType={setType} />





      <TextInput
        style={styles.input}
        placeholder="Short Description"
        value={description}
        onChangeText={setDescription}
        
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
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default CreateListingScreen;
