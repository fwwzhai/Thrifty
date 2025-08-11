import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { db, auth, storage } from '../firebaseConfig';
import { getDoc, doc, collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImageManipulator from 'expo-image-manipulator';
import { analyzeImage } from '../visionAPI';
import { TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Linking } from 'react-native';


import SizePicker from './SizePicker';

import ClothingPicker from './ClothingPicker'; // Adjust the path based on where the file is located
import ConditionPicker from './ConditionPicker';

const CreateListingScreen = ({ navigation }) => {
  const [images, setImages] = useState([]); // 🔥 Multiple Images State

  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState(''); // 🔥 Clothing Type
const [condition, setCondition] = useState(''); // 🔥 Condition
const [color, setColor] = useState('');
const [selectedColors, setSelectedColors] = useState([]);
const [size, setSize] = useState('');

  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [labels, setLabels] = useState([]);
  
const [colors, setColors] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [deliveryPaidBySeller, setDeliveryPaidBySeller] = useState(true); // true = seller pays, false = buyer pays
const [deliveryFee, setDeliveryFee] = useState('');

// Define clothing types for matching
const clothingTypes = ["Shirt", "Hoodie", "Jacket", "Pants", "Jeans", "Shoes", "Backpack"];

const handleSuggestionClick = (label) => {
  // 🔥 Check if label matches a clothing type
  if (clothingTypes.includes(label)) {
    setType(label); // Auto-select Clothing Type
  } else {
    setItemName(label); // Default to Item Name
  }
  setShowSuggestions(false);
};

const handleColorSelect = (color) => {
  if (selectedColors.includes(color)) {
    // 🔥 Remove color if already selected
    setSelectedColors(selectedColors.filter(c => c !== color));
  } else {
    // 🔥 Add color if not already selected
    setSelectedColors([...selectedColors, color]);
  }
};

  
const pickImages = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsMultipleSelection: true, // 🔥 Allow multiple selection
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
    base64: true,
  });

  if (!result.canceled) {
    const newImages = result.assets.map(asset => asset.uri);
    setImages([...images, ...newImages]); // 🔥 Add to existing images

    // 🔥 Analyze Image using Vision API for the first image
    const { labels: detectedLabels, colors: detectedColors } = await analyzeImage(result.assets[0].base64);
    setLabels(detectedLabels);

    const colorNames = detectedColors.map(color => color.rgb);
    setColors(colorNames);
    setShowSuggestions(true);
  }
};

const removeImage = (index) => {
  setImages(images.filter((_, i) => i !== index)); // 🔥 Remove the image at the specified index
};


  // 🔥 Function to upload image to Firebase Storage
  const uploadImages = async () => {
    try {
      setUploading(true);
      const downloadURLs = [];
  
      for (const uri of images) {
        const compressedImage = await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width: 800 } }],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
  
        const response = await fetch(compressedImage.uri);
        const blob = await response.blob();
  
        const filename = `listings/${auth.currentUser.uid}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, filename);
  
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        downloadURLs.push(downloadURL); // 🔥 Collect all image URLs
      }
  
      setUploading(false);
      return downloadURLs;
    } catch (error) {
      console.error("🔥 Image Upload Error:", error);
      Alert.alert('Error', 'Failed to upload images.');
      setUploading(false);
      return null;
    }
  };
  

  const handleAddListing = async () => {
    if (!itemName || !images || !price || !type || !description) {
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
  
      const imageUrls = await uploadImages(); // 🔥 Multiple Image URLs
if (!imageUrls) return;

  
      // 🔥 Add color to Firestore
      await addDoc(collection(db, 'listings'), {
        userId: user.uid,
        sellerName,
        name: itemName,
        imageUrls, // 🔥 Store multiple image URLs

        price,
        type,
        condition,
        description,
        size,
        labels,
        colors: selectedColors,  // 🔥 Store multiple selected colors
        deliveryPaidBySeller,
  deliveryFee: deliveryPaidBySeller ? 0 : parseFloat(deliveryFee) || 0,
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Listing</Text>
  
        <TouchableOpacity onPress={pickImages} style={styles.imagePicker}>
  <Text>Select Images</Text>
</TouchableOpacity>

{images.length > 0 && (
  <ScrollView horizontal style={styles.imagePreviewContainer}>
    {images.map((img, index) => (
      <View key={index} style={styles.imageWrapper}>
        <Image source={{ uri: img }} style={styles.imagePreview} />
        <TouchableOpacity 
          style={styles.removeButton} 
          onPress={() => removeImage(index)}
        >
          <Text style={styles.removeButtonText}>✖️</Text>
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
)}


  
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
        <SizePicker selectedSize={size} setSelectedSize={setSize} />

  
        <TextInput
          style={styles.input}
          placeholder="Short Description"
          value={description}
          onChangeText={setDescription}
        />
  
        <View style={styles.colorSection}>
          <Text style={styles.colorTitle}>Choose Color:</Text>
          <TouchableOpacity
            style={[styles.colorBox, { backgroundColor: color || '#ccc' }]}
            onPress={() => setShowSuggestions(true)}
          >
            <Text style={styles.colorText}>{color ? color : 'Select Color'}</Text>
          </TouchableOpacity>
        </View>
  
        {colors.length > 0 && (
  <View style={styles.colorSuggestionContainer}>
    <Text style={styles.suggestionTitle}>Color Suggestions:</Text>
    <View style={styles.colorSuggestionList}>
      {colors.map((color, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.suggestionItem,
            {
              backgroundColor: color,
              borderWidth: selectedColors.includes(color) ? 3 : 1,
              borderColor: selectedColors.includes(color) ? '#000' : '#ccc'
            }
          ]}
          onPress={() => handleColorSelect(color)}
        >
          <Text style={styles.colorText}>{color}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>

  
)}



<View style={styles.colorPickerGrid}>
  {colorGroups.map(group => (
    <View key={group.name} style={styles.colorGroup}>
      <Text style={styles.groupLabel}>{group.name}</Text>
      <View style={styles.shadeRow}>
        {group.shades.map(shade => (
          <TouchableOpacity
            key={shade.value}
            style={[
              styles.colorSwatch,
              selectedColors.includes(shade.value) && styles.selectedSwatch
            ]}
            onPress={() => handleColorSelect(shade.value)}
          >
            <View style={[styles.swatchCircle, { backgroundColor: shade.value }]} />
            <Text style={styles.swatchLabel}>{shade.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ))}
</View>


{selectedColors.length > 0 && (
  <View style={styles.selectedColorsContainer}>
    <Text style={styles.colorTitle}>Selected Colors:</Text>
    <View style={styles.selectedColorsList}>
      {selectedColors.map((color, index) => (
        <View
          key={index}
          style={[
            styles.colorBox,
            { backgroundColor: color }
          ]}
        />
      ))}
    </View>
  </View>
)}

<View style={{ width: '100%', marginBottom: 15 }}>
  <Text style={{ fontWeight: 'bold', marginBottom: 5, color: '#333' }}>Delivery Fee</Text>
  <View style={{ flexDirection: 'row', marginBottom: 10 }}>
    <TouchableOpacity
      style={[
        { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginRight: 5, backgroundColor: deliveryPaidBySeller ? '#2563eb' : '#eee' }
      ]}
      onPress={() => setDeliveryPaidBySeller(true)}
    >
      <Text style={{ color: deliveryPaidBySeller ? '#fff' : '#333', fontWeight: 'bold' }}>Seller Pays (Free for Buyer)</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginLeft: 5, backgroundColor: !deliveryPaidBySeller ? '#2563eb' : '#eee' }
      ]}
      onPress={() => setDeliveryPaidBySeller(false)}
    >
      <Text style={{ color: !deliveryPaidBySeller ? '#fff' : '#333', fontWeight: 'bold' }}>Buyer Pays</Text>
    </TouchableOpacity>
  </View>
  {!deliveryPaidBySeller && (
    <TextInput
      style={styles.input}
      placeholder="Enter delivery fee (RM)"
      value={deliveryFee}
      onChangeText={setDeliveryFee}
      keyboardType="numeric"
    />
  )}
</View>

        <Button 
          title={uploading ? "Uploading..." : "Add Listing"} 
          onPress={handleAddListing} 
          disabled={uploading} 
        />
      </View>
    </ScrollView>
  );
}  

const colorGroups = [
  {
    name: 'Blue',
    shades: [
      { name: 'Light Blue', value: '#90cdf4' },
      { name: 'Blue', value: '#2563eb' },
      { name: 'Dark Blue', value: '#1e3a8a' },
    ],
  },
  {
    name: 'Green',
    shades: [
      { name: 'Light Green', value: '#bbf7d0' },
      { name: 'Green', value: '#10b981' },
      { name: 'Dark Green', value: '#065f46' },
    ],
  },
  {
    name: 'Red',
    shades: [
      { name: 'Light Red', value: '#fca5a5' },
      { name: 'Red', value: '#ef4444' },
      { name: 'Dark Red', value: '#991b1b' },
    ],
  },
  {
    name: 'Yellow',
    shades: [
      { name: 'Light Yellow', value: '#fef9c3' },
      { name: 'Yellow', value: '#FFD600' },
      { name: 'Dark Yellow', value: '#b59f3b' },
    ],
  },
  {
    name: 'Brown',
    shades: [
      { name: 'Light Brown', value: '#d2b48c' },
      { name: 'Brown', value: '#8B4513' },
      { name: 'Dark Brown', value: '#5c4033' },
    ],
  },
  {
    name: 'Grey',
    shades: [
      { name: 'Light Grey', value: '#e5e7eb' },
      { name: 'Grey', value: '#808080' },
      { name: 'Dark Grey', value: '#374151' },
    ],
  },
  {
    name: 'Black/White',
    shades: [
      { name: 'White', value: '#FFFFFF' },
      { name: 'Black', value: '#000000' },
    ],
  },
];

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5', // Soft background
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  imagePicker: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginBottom: 15,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 8,
  },
  input: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  colorSection: {
    marginTop: 10,
    width: '100%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  colorTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  colorBox: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorText: {
    fontWeight: 'bold',
    color: '#333',
  },
  colorSuggestionContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorSuggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionItem: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedColorsContainer: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    width: '100%',
  },
  selectedColorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addColorButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addColorButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  addListingButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
  },
  addListingButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
   manualColorInput: {
  
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  colorInput: {
    borderWidth: 1,        // Border thickness
    borderColor: '#ccc',   // Border color (change to any color you prefer)
    borderRadius: 8,       // Optional: Adds rounded corners
    padding: 10,           // Adds space inside the container
    backgroundColor: '#fff',
  },

  colorPickerButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },

  imageWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  removeButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  colorPickerGrid: {
  marginVertical: 10,
},
colorGroup: {
  marginBottom: 18,
},
groupLabel: {
  fontWeight: 'bold',
  fontSize: 15,
  color: '#333',
  marginBottom: 6,
  marginLeft: 4,
},
shadeRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
},
colorSwatch: {
  alignItems: 'center',
  margin: 8,
},
swatchCircle: {
  width: 32,
  height: 32,
  borderRadius: 16,
  borderWidth: 2,
  borderColor: '#eee',
  marginBottom: 4,
},
selectedSwatch: {
  borderColor: '#2563eb',
  borderWidth: 2,
},
swatchLabel: {
  fontSize: 12,
  color: '#333',
},
  
});


export default CreateListingScreen;