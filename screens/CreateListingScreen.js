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



import ClothingPicker from './ClothingPicker'; // Adjust the path based on where the file is located
import ConditionPicker from './ConditionPicker';

const CreateListingScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState(''); // 🔥 Clothing Type
const [condition, setCondition] = useState(''); // 🔥 Condition
const [color, setColor] = useState('');
const [selectedColors, setSelectedColors] = useState([]);




  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [labels, setLabels] = useState([]);
  
const [colors, setColors] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

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

  
  // 🔥 Function to pick an image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });
  
    if (!result.canceled) {
      setImage(result.assets[0].uri);
  
      // 🔥 Analyze Image using Vision API
      const { labels: detectedLabels, colors: detectedColors } = await analyzeImage(result.assets[0].base64);
      setLabels(detectedLabels);
  
      // 🔥 Extract Dominant Color Names
      const colorNames = detectedColors.map(color => color.rgb);
      setColors(colorNames);
      setShowSuggestions(true);
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
  
      // 🔥 Add color to Firestore
      await addDoc(collection(db, 'listings'), {
        userId: user.uid,
        sellerName,
        name: itemName,
        imageUrl,
        price,
        type,
        condition,
        description,
        labels,
        colors: selectedColors,  // 🔥 Store multiple selected colors
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

<View style={styles.manualColorInput}>
  <TextInput
    style={styles.colorInput}
    placeholder="Enter Color (e.g., #FFFFFF)"
    onChangeText={(text) => setColor(text)}
    value={color}
  />
  <TouchableOpacity
    style={styles.addColorButton}
    onPress={() => {
      if (color && !selectedColors.includes(color)) {
        setSelectedColors([...selectedColors, color]);
        setColor('');
      }
    }}
  >
    <Text style={styles.addColorButtonText}>Add Color</Text>
  </TouchableOpacity>
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

        <Button 
          title={uploading ? "Uploading..." : "Add Listing"} 
          onPress={handleAddListing} 
          disabled={uploading} 
        />
      </View>
    </ScrollView>
  );
}  

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
  scrollContainer: {
    paddingVertical: 20,
    
  },
  

  labelContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    width: '100%',
  },
  labelTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  labelText: {
    color: '#555',
  },
  suggestionContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,  // Make sure the popup appears above other elements
  },
  suggestionTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  suggestionText: {
    color: '#333',
  },
  
  colorSection: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '100%',
  },
  colorTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  colorBox: {
    width: '100%',
    height: 40,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  colorText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  
  colorSuggestionContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 999,
  },
  colorSuggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionItem: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 5,
    marginBottom: 5,
  },
  suggestionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  colorInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  addColorButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  addColorButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  
  
  selectedColorsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    width: '100%',
  },
  selectedColorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  manualColorInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  
});

export default CreateListingScreen;