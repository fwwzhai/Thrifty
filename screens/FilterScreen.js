import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FilterScreen = ({ navigation, route }) => {
  const currentFilters = route.params?.currentFilters || {};
  
  // 🔥 Use arrays to store multiple selected values
  const [selectedTypes, setSelectedTypes] = useState(currentFilters.selectedTypes || []);
  const [selectedConditions, setSelectedConditions] = useState(currentFilters.selectedConditions || []);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');

  // 🔥 Toggle Type Selection
  const toggleType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // 🔥 Toggle Condition Selection
  const toggleCondition = (condition) => {
    setSelectedConditions(prev =>
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Filters</Text>

      {/* 🔹 Type Selection */}
      <Text style={styles.label}>Type:</Text>
      <View style={styles.grid}>
        {["Shirt", "Hoodie", "Jacket", "Pants", "Jeans", "Shoes", "Backpack"].map(type => (
          <TouchableOpacity 
            key={type} 
            style={[styles.filterButton, selectedTypes.includes(type) && styles.selectedFilter]} 
            onPress={() => toggleType(type)}
          >
            <Text style={styles.filterText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Condition Selection */}
      <Text style={styles.label}>Condition:</Text>
      <View style={styles.grid}>
        {["New", "Opened - Unused", "Used - Very Good", "Used - Good", "Used - Satisfactory"].map(condition => (
          <TouchableOpacity 
            key={condition} 
            style={[styles.filterButton, selectedConditions.includes(condition) && styles.selectedFilter]} 
            onPress={() => toggleCondition(condition)}
          >
            <Text style={styles.filterText}>{condition}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔹 Max Price Input */}
      <Text style={styles.label}>Max Price (RM):</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Enter max price" 
        keyboardType="numeric"
        value={maxPrice} 
        onChangeText={setMaxPrice} 
      />

      {/* 🔥 Apply Filters */}
      <TouchableOpacity 
        style={styles.applyButton} 
        onPress={() => {
            navigation.navigate('Home', { 
              filters: { selectedTypes, selectedConditions, maxPrice }, 
              userData: route.params?.userData  // 🔥 Preserve userData
            });
          }}
      >
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>

      {/* 🔥 Reset Filters */}
      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={() => {
          setSelectedTypes([]);
          setSelectedConditions([]);
          setMaxPrice('');
        }}
      >
        <Text style={styles.resetButtonText}>Reset Filters</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
  },
  filterButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    margin: 5,
    alignItems: 'center',
    width: '45%', // 🔥 Keeps buttons aligned in a 2-column grid
  },
  selectedFilter: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  filterText: {
    color: 'black',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  applyButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FilterScreen;
