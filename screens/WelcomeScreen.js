import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  ActivityIndicator 
} from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleNavigation = (screen) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate(screen);
    }, 1500); // Simulating a loading effect
  };

  return (
    <View style={styles.container}>
      {/* 🔥 Thrifty Logo */}
      <Image 
        source={require('../assets/logo.png')} // Make sure the logo is in the correct path
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Welcome to Thrifty</Text>
      <Text style={styles.subtitle}>Find your next thrifted gem</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={styles.loader} />
      ) : (
        <>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => handleNavigation('Login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buttonOutline} 
            onPress={() => handleNavigation('Register')}
          >
            <Text style={styles.buttonOutlineText}>Register</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1e', // 🔥 Dark sleek background
    padding: 20,
  },
  logo: {
    width: 400, // Adjust size as needed
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'   ,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#bbb',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#FFFDD0',
    paddingVertical: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 5, // 🔥 Adds a shadow for a premium look
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonOutline: {
    borderWidth: 2,
    borderColor: '#fff',
    paddingVertical: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonOutlineText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});

export default WelcomeScreen;
