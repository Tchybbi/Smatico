import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();

  // Navigate to onboarding tutorial after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(onboarding)/tutorial');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="flash" size={50} color="white" />
        </View>
        <Text style={styles.appName}>SmatiCo</Text>
        <Text style={styles.tagline}>Downgrade Orders Auction</Text>
      </View>

      <View style={styles.mapBackground}>
        <Ionicons 
          name="globe-outline" 
          size={200} 
          color={Colors.lightBlue} 
          style={styles.globeIcon} 
        />
      </View>

      <Button
        title="Get Started"
        onPress={() => router.replace('/(onboarding)/tutorial')}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: Colors.secondaryText,
  },
  mapBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
    opacity: 0.1,
  },
  globeIcon: {
    marginTop: 80,
  },
  button: {
    width: width - 40,
    marginBottom: 40,
  },
}); 