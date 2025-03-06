import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SizePicker = ({ selectedSize, setSelectedSize }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');

  const categories = ['Man', 'Woman', 'Kids', 'Free Size'];
  const types = ['Shirt', 'Pants', 'Shoes'];

  const sizeOptions = {
    Shirt: ['S', 'M', 'L', 'XL', 'XXL'],
    Pants: ['Waist 28', 'Waist 30', 'Waist 32', 'Waist 34', 'Waist 36'],
    Shoes: ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10']
  };

  const handleSave = () => {
    if (category === 'Free Size') {
      setSelectedSize('Free Size');
    } else if (category && type && size) {
      setSelectedSize(`${category} - ${type} - ${size}`);
    } else {
      setSelectedSize('');
    }
    setModalVisible(false);
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
        <Text style={styles.buttonText}>
          {selectedSize ? selectedSize : 'Select Size'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Select Size</Text>

            {/* Category Picker */}
            <Text style={styles.label}>Category</Text>
            <Picker selectedValue={category} onValueChange={(val) => setCategory(val)}>
              <Picker.Item label="Select Category" value="" />
              {categories.map((item) => (
                <Picker.Item key={item} label={item} value={item} />
              ))}
            </Picker>

            {/* Type Picker (only if not Free Size) */}
            {category !== 'Free Size' && category && (
              <>
                <Text style={styles.label}>Type</Text>
                <Picker selectedValue={type} onValueChange={(val) => setType(val)}>
                  <Picker.Item label="Select Type" value="" />
                  {types.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </>
            )}

            {/* Size Picker (only if type is selected) */}
            {type && sizeOptions[type] && (
              <>
                <Text style={styles.label}>Size</Text>
                <Picker selectedValue={size} onValueChange={(val) => setSize(val)}>
                  <Picker.Item label="Select Size" value="" />
                  {sizeOptions[type].map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </>
            )}

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
              <Button title="Save" onPress={handleSave} color="green" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: 300,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default SizePicker;
