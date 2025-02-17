import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const conditionsTypes = ["New", "Opened - Unused", "Used - Very Good", "Used - Good", "Used - Satisfactory"];

const ConditionPicker = ({ condition, setCondition }) => { // ✅ Use 'condition' instead of 'type'
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Condition:</Text>
      <View style={styles.optionsContainer}>
        {conditionsTypes.map((item) => (
          <TouchableOpacity 
            key={item} 
            style={[styles.option, condition === item && styles.selectedOption]} // ✅ Check 'condition'
            onPress={() => setCondition(item)} // ✅ Set 'condition' instead of 'type'
          >
            <Text style={[styles.optionText, condition === item && styles.selectedText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // ✅ Adds spacing between buttons
  },
  option: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f8f8f8',
  },
  selectedOption: {
    backgroundColor: '#007bff', // ✅ Highlight selected choice
    borderColor: '#007bff',
  },
  optionText: {
    color: 'black',
  },
  selectedText: {
    color: 'white', // ✅ Change text color when selected
  },
});

export default ConditionPicker;
