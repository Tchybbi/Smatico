import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './context/AppContext';

// Keep the splash screen visible while we check authentication
SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { isAuthenticated, loading } = useApp();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Check if user has seen onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem('hasSeenOnboarding');
        setHasSeenOnboarding(onboardingStatus === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasSeenOnboarding(false);
      } finally {
        setInitialCheckDone(true);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    // Hide splash screen after both checks are complete
    if (!loading && initialCheckDone) {
      SplashScreen.hideAsync();
    }
  }, [loading, initialCheckDone]);

  // Show a loading indicator while checking
  if (loading || !initialCheckDone) {
    return null;
  }

  // If user is logged in, go to app home
  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  // If user hasn't seen onboarding, show it first
  if (!hasSeenOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // Otherwise, go to the auth screen
  return <Redirect href="/(auth)" />;
} 