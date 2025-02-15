import React from 'react';
import { View, Text, Image, Button, StyleSheet, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ListingDetailsScreen = ({ navigation }) => {
  const route = useRoute();
  const { listing } = route.params || {}; // Ensure listing is not undefined

  if (!listing) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Listing not found.</Text>
      </View>
    );
  }

  const handleBuy = () => {
    Alert.alert('Purchase', 'Proceed to buy this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Buy', onPress: () => Alert.alert('Success', 'Purchase completed!') }
    ]);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: listing.imageUrl }} style={styles.image} />
      <Text style={styles.title}>{listing.name}</Text>
      <Text style={styles.price}>${listing.price}</Text>
      <Text style={styles.type}>Type: {listing.type}</Text>
      <Text style={styles.description}>{listing.description}</Text>
      <Button title="Buy Now" onPress={handleBuy} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: 'green',
    marginBottom: 10,
  },
  type: {
    fontSize: 18,
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ListingDetailsScreen;
