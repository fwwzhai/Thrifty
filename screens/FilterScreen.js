import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const FilterScreen = ({ navigation, route }) => {
  const currentFilters = route.params?.currentFilters || {};
  
  // 🔥 Use arrays to store multiple selected values
  const [selectedTypes, setSelectedTypes] = useState(currentFilters.selectedTypes || []);
  const [selectedConditions, setSelectedConditions] = useState(currentFilters.selectedConditions || []);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice || '');
  const [selectedColors, setSelectedColors] = useState(currentFilters.selectedColors || []);
  // 🔥 New State for Sort Order
const [sortOrder, setSortOrder] = useState('desc'); // Default: Recent First
const [priceSortOrder, setPriceSortOrder] = useState('desc');
const [sortType, setSortType] = useState('date'); // Default: Sort by Date


// 🔥 Toggle Sort Order
const toggleSortOrder = () => {
  setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
};

const togglePriceSortOrder = () => {
  setPriceSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
};


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
      {/* Sort Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Sort</Text>
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.sortButton, sortType === 'date' && styles.selectedSort]} 
            onPress={() => setSortType('date')}
          >
            <Text style={styles.sortButtonText}>Date</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortType === 'price' && styles.selectedSort]} 
            onPress={() => setSortType('price')}
          >
            <Text style={styles.sortButtonText}>Price</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.sortOrderButton} 
            onPress={sortType === 'date' ? toggleSortOrder : togglePriceSortOrder}
          >
            <Text style={styles.sortOrderText}>
              {sortType === 'date' 
                ? (sortOrder === 'desc' ? 'Recent First' : 'Oldest First') 
                : (priceSortOrder === 'desc' ? 'High to Low' : 'Low to High')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Type Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Type</Text>
        <View style={styles.grid}>
          {["Shirt", "Hoodie", "Jacket", "Pants", "Jeans", "Shoes", "Backpack"].map(type => (
            <TouchableOpacity 
              key={type} 
              style={[styles.filterButton, selectedTypes.includes(type) && styles.selectedFilter]} 
              onPress={() => toggleType(type)}
            >
              <Text style={[styles.filterText, selectedTypes.includes(type) && styles.selectedFilterText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Condition Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Condition</Text>
        <View style={styles.grid}>
          {["New", "Opened - Unused", "Used - Very Good", "Used - Good", "Used - Satisfactory"].map(condition => (
            <TouchableOpacity 
              key={condition} 
              style={[styles.filterButton, selectedConditions.includes(condition) && styles.selectedFilter]} 
              onPress={() => toggleCondition(condition)}
            >
              <Text style={[styles.filterText, selectedConditions.includes(condition) && styles.selectedFilterText]}>{condition}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Price Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Max Price (RM)</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter max price" 
          keyboardType="numeric"
          value={maxPrice} 
          onChangeText={setMaxPrice} 
        />
      </View>

      {/* Color Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.grid}>
          {/*
          "rgb(106, 84, 69)", 
          "rgb(202, 189, 181)", 
          "rgb(84, 78, 58)", 
          "rgb(69, 64, 45)",
          "rgb(34, 32, 18)",
          "#627",
          "#000000",
          "#FFFFFF"
          */}
          {Object.entries({
            "rgb(106, 84, 69)": "Brown",
            "rgb(202, 189, 181)": "Beige",
            "rgb(84, 78, 58)": "Dark Brown",
            "rgb(69, 64, 45)": "Olive",
            "rgb(34, 32, 18)": "Black Olive",
            "#627": "Dark Slate",
            "#000000": "Black",
            "#FFFFFF": "White"
          }).map(([color, label]) => (
            <TouchableOpacity 
              key={color} 
              style={[
                styles.colorCircle, 
                { backgroundColor: color },
                selectedColors.includes(color) && styles.selectedColor
              ]}
              onPress={() => {
                setSelectedColors(prev =>
                  prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
                );
              }}
              accessibilityLabel={`Select ${label} color`}
            />
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity 
        style={styles.applyButton} 
        onPress={() => {
          navigation.navigate('Home', { 
            filters: { 
              selectedTypes, 
              selectedConditions, 
              selectedColors, 
              maxPrice, 
              sortType,
              sortOrder, 
              priceSortOrder 
            }, 
            userData: route.params?.userData
          });
        }}
      >
        <Text style={styles.applyButtonText}>Apply Filters</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={() => {
          setSelectedTypes([]);
          setSelectedConditions([]);
          setSelectedColors([]);
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
    padding: 16,
    backgroundColor: '#f8fafc',
    alignItems: 'stretch',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#22223B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    color: '#2563eb',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  sortButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 8,
  },
  selectedSort: {
    backgroundColor: '#2563eb',
  },
  sortButtonText: {
    color: '#22223B',
    fontSize: 15,
    fontWeight: '600',
  },
  sortOrderButton: {
    backgroundColor: '#f59e42',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOrderText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    margin: 5,
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterText: {
    color: '#22223B',
    fontSize: 14,
  },
  selectedFilterText: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: '#f8f8f8',
    fontSize: 15,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    margin: 5,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#2563eb',
  },
  applyButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    elevation: 2,
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
    elevation: 2,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FilterScreen;
