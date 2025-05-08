import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import Input from '../components/Input';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(1); // Step 1: Basic Info, Step 2: Role Selection

  const [selectedRole, setSelectedRole] = useState(null);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: null,
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      setStep(2);
    }
  };

  const handleSignup = async () => {
    if (!selectedRole) {
      Alert.alert('Role Required', 'Please select a role to continue.');
      return;
    }
    
    setLoading(true);
    try {
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
      });
      
      router.replace('/(app)');
    } catch (error) {
      Alert.alert('Signup Failed', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfoForm = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>
          Create an account to start using SmatiCo
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Name"
          placeholder="Your full name"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          autoCapitalize="words"
          icon="person-outline"
          error={errors.name}
          touched={true}
        />
        
        <Input
          label="Email"
          placeholder="Your email address"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          icon="mail-outline"
          error={errors.email}
          touched={true}
        />
        
        <Input
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
          icon="lock-closed-outline"
          error={errors.password}
          touched={true}
        />
        
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(value) => handleChange('confirmPassword', value)}
          secureTextEntry
          icon="lock-closed-outline"
          error={errors.confirmPassword}
          touched={true}
        />
        
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.button}
          loading={loading}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.replace('/(auth)')}>
          <Text style={styles.signinText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderRoleSelection = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setStep(1)}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select a Role</Text>
        <Text style={styles.subtitle}>
          Choose how you want to use SmatiCo
        </Text>
      </View>

      <View style={styles.rolesContainer}>
        <TouchableOpacity 
          style={[
            styles.roleCard,
            selectedRole === 'customer' && styles.selectedRole,
          ]}
          onPress={() => setSelectedRole('customer')}
        >
          <View style={styles.roleIconContainer}>
            <Ionicons name="person" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.roleTitle}>Looking for a specialist</Text>
          <Text style={styles.roleDescription}>
            To place any type of order to search for a performer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.roleCard,
            selectedRole === 'provider' && styles.selectedRole,
          ]}
          onPress={() => setSelectedRole('provider')}
        >
          <View style={styles.roleIconContainer}>
            <Ionicons name="construct" size={40} color={Colors.yellow} />
          </View>
          <Text style={styles.roleTitle}>I want to find a job</Text>
          <Text style={styles.roleDescription}>
            Search and execute orders in your field of activity
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Sign Up"
          onPress={handleSignup}
          style={styles.button}
          loading={loading}
        />
        
        <TouchableOpacity 
          style={styles.skipButton} 
          onPress={() => router.replace('/(app)')}
        >
          <Text style={styles.skipText}>Skip and Start</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? renderPersonalInfoForm() : renderRoleSelection()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 30,
  },
  button: {
    width: '100%',
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  signinText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  rolesContainer: {
    width: '100%',
    marginVertical: 20,
  },
  roleCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedRole: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.lightBlue,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.text,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  skipButton: {
    marginTop: 16,
    padding: 10,
  },
  skipText: {
    color: Colors.secondaryText,
    fontSize: 16,
  },
}); 