import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const categories = ['Man', 'Woman', 'Kids', 'Free Size'];
const types = ['Shirt', 'Pants', 'Shoes'];
const sizeOptions = {
  Shirt: ['S', 'M', 'L', 'XL', 'XXL'],
  Pants: ['Waist 28', 'Waist 30', 'Waist 32', 'Waist 34', 'Waist 36'],
  Shoes: ['UK 6', 'UK 6.5', 'UK 7', 'UK 7.5', 'UK 8', 'UK 8.5', 'UK 9', 'UK 9.5', 'UK 10']
};

const SizePicker = ({ selectedSize, setSelectedSize }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [size, setSize] = useState('');

  const handleSave = () => {
    if (category === 'Free Size') {
      setSelectedSize('Free Size');
    } else if (category && type && size) {
      setSelectedSize(`${category} - ${type} - ${size}`);
    } else {
      setSelectedSize('');
    }
    setModalVisible(false);
    setCategory('');
    setType('');
    setSize('');
  };

  const handleCancel = () => {
    setModalVisible(false);
    setCategory('');
    setType('');
    setSize('');
  };

  return (
    <View>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.openButton}>
        <Text style={styles.openButtonText}>
          {selectedSize ? selectedSize : 'Select Size'}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.sheetContainer}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Choose Size</Text>

            {/* Category Chips */}
            <Text style={styles.sheetLabel}>Category</Text>
            <View style={styles.chipRow}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.chip,
                    category === item && styles.chipSelected
                  ]}
                  onPress={() => {
                    setCategory(item);
                    setType('');
                    setSize('');
                  }}
                >
                  <Text style={[
                    styles.chipText,
                    category === item && styles.chipTextSelected
                  ]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Type Chips */}
            {category !== 'Free Size' && category && (
              <>
                <Text style={styles.sheetLabel}>Type</Text>
                <View style={styles.chipRow}>
                  {types.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        type === item && styles.chipSelected
                      ]}
                      onPress={() => {
                        setType(item);
                        setSize('');
                      }}
                    >
                      <Text style={[
                        styles.chipText,
                        type === item && styles.chipTextSelected
                      ]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Size Chips */}
            {type && sizeOptions[type] && (
              <>
                <Text style={styles.sheetLabel}>Size</Text>
                <View style={styles.chipRow}>
                  {sizeOptions[type].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.chip,
                        size === item && styles.chipSelected
                      ]}
                      onPress={() => setSize(item)}
                    >
                      <Text style={[
                        styles.chipText,
                        size === item && styles.chipTextSelected
                      ]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  ((category === 'Free Size') || (category && type && size)) ? null : styles.saveBtnDisabled
                ]}
                onPress={handleSave}
                disabled={!((category === 'Free Size') || (category && type && size))}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  openButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  sheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(34,34,59,0.25)',
  },
  sheetCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 18,
  },
  sheetLabel: {
    fontWeight: '600',
    color: '#22223B',
    marginTop: 10,
    marginBottom: 4,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    margin: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  chipText: {
    color: '#22223B',
    fontWeight: '600',
    fontSize: 15,
  },
  chipTextSelected: {
    color: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },
  cancelBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtn: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#b6e3d4',
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default SizePicker;