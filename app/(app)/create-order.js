import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import Colors from '../constants/Colors';
import Input from '../components/Input';
import Button from '../components/Button';

const CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', icon: 'water-outline' },
  { id: 'repair', name: 'Repair & Construction', icon: 'construct-outline' },
  { id: 'installation', name: 'Installation', icon: 'build-outline' },
  { id: 'tourism', name: 'Tourism & Entertainment', icon: 'airplane-outline' },
  { id: 'apartment_repair', name: 'Apartment Repair', icon: 'home-outline' },
  { id: 'ac_repair', name: 'AC Repair', icon: 'snow-outline' },
];

export default function CreateOrderScreen() {
  const router = useRouter();
  const { currentUser, createOrder } = useApp();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.minPrice) {
      newErrors.minPrice = 'Minimum price is required';
    } else if (isNaN(formData.minPrice) || parseFloat(formData.minPrice) <= 0) {
      newErrors.minPrice = 'Price must be a positive number';
    }
    
    if (!formData.maxPrice) {
      newErrors.maxPrice = 'Maximum price is required';
    } else if (isNaN(formData.maxPrice) || parseFloat(formData.maxPrice) <= 0) {
      newErrors.maxPrice = 'Price must be a positive number';
    } else if (parseFloat(formData.maxPrice) < parseFloat(formData.minPrice)) {
      newErrors.maxPrice = 'Maximum price must be greater than minimum price';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectCategory = (categoryId) => {
    handleChange('category', categoryId);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    if (!currentUser) {
      Alert.alert('Error', 'You must be logged in to create an order');
      return;
    }
    
    setLoading(true);
    try {
      const newOrder = await createOrder({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        minPrice: parseFloat(formData.minPrice),
        maxPrice: parseFloat(formData.maxPrice),
        expireDate: formData.expireDate.toISOString(),
        customerId: currentUser.id,
        createdAt: new Date().toISOString(),
      });
      
      Alert.alert(
        'Success',
        'Your order has been created successfully',
        [
          {
            text: 'View Order',
            onPress: () => router.push(`/orders/${newOrder.id}`),
          },
          {
            text: 'Go to Orders',
            onPress: () => router.push('/orders'),
          },
        ]
      );
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        minPrice: '',
        maxPrice: '',
        expireDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create order. Please try again.');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryItem = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        formData.category === category.id && styles.selectedCategoryItem,
      ]}
      onPress={() => handleSelectCategory(category.id)}
    >
      <View 
        style={[
          styles.categoryIcon,
          formData.category === category.id && styles.selectedCategoryIcon,
        ]}
      >
        <Ionicons
          name={category.icon}
          size={24}
          color={formData.category === category.id ? 'white' : Colors.primary}
        />
      </View>
      <Text 
        style={[
          styles.categoryName,
          formData.category === category.id && styles.selectedCategoryName,
        ]}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create New Order</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <Input
            label="Title"
            placeholder="Enter order title"
            value={formData.title}
            onChangeText={(value) => handleChange('title', value)}
            error={errors.title}
            touched={true}
            icon="text-outline"
          />
          
          <Input
            label="Description"
            placeholder="Describe what you need"
            value={formData.description}
            onChangeText={(value) => handleChange('description', value)}
            error={errors.description}
            touched={true}
            multiline
            numberOfLines={4}
            icon="document-text-outline"
          />
          
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(renderCategoryItem)}
          </View>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
          
          <Input
            label="Location"
            placeholder="Enter the location"
            value={formData.location}
            onChangeText={(value) => handleChange('location', value)}
            error={errors.location}
            touched={true}
            icon="location-outline"
          />
          
          <Text style={styles.sectionTitle}>Price Range (AED)</Text>
          
          <View style={styles.priceContainer}>
            <Input
              label="Minimum Price"
              placeholder="Min"
              value={formData.minPrice}
              onChangeText={(value) => handleChange('minPrice', value)}
              keyboardType="numeric"
              error={errors.minPrice}
              touched={true}
              style={styles.priceInput}
              icon="trending-down-outline"
            />
            
            <Input
              label="Maximum Price"
              placeholder="Max"
              value={formData.maxPrice}
              onChangeText={(value) => handleChange('maxPrice', value)}
              keyboardType="numeric"
              error={errors.maxPrice}
              touched={true}
              style={styles.priceInput}
              icon="trending-up-outline"
            />
          </View>
          
          <View style={styles.termsContainer}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.secondaryText} />
            <Text style={styles.termsText}>
              By posting this order, you agree to our Terms and Conditions regarding order placement and bidding.
            </Text>
          </View>
          
          <Button
            title="Create Order"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    color: Colors.text,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryItem: {
    width: '31%',
    alignItems: 'center',
    padding: 10,
    marginRight: '2%',
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCategoryItem: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightBlue,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedCategoryIcon: {
    backgroundColor: Colors.primary,
  },
  categoryName: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
  },
  selectedCategoryName: {
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceInput: {
    width: '48%',
  },
  termsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.lightBlue,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 16,
  },
  termsText: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginLeft: 10,
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -10,
    marginBottom: 16,
    marginLeft: 4,
  },
}); 