import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import Colors from '../constants/Colors';
import Button from '../components/Button';
import Card from '../components/Card';

export default function ProfileScreen() {
  const router = useRouter();
  const { currentUser, signOut } = useApp();

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-outline" size={60} color={Colors.inactive} />
          <Text style={styles.notLoggedInText}>
            You are not logged in
          </Text>
          <Button
            title="Sign In"
            onPress={() => router.replace('/(auth)')}
            style={styles.signInButton}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => {
            signOut();
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => router.push('/menu')}>
            <Ionicons name="menu" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={40} color="white" />
          </View>
          <Text style={styles.name}>{currentUser.name}</Text>
          <Text style={styles.role}>
            {currentUser.role === 'provider' ? 'Service Provider' : 'Customer'}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentUser.role === 'provider' ? 
                  (currentUser.completedOrders || 0) : 
                  (currentUser.orders?.length || 0)}
              </Text>
              <Text style={styles.statLabel}>
                {currentUser.role === 'provider' ? 'Jobs Completed' : 'Orders Placed'}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Text style={styles.statValue}>
                  {currentUser.averageRating?.toFixed(1) || '0.0'}
                </Text>
                <Ionicons name="star" size={16} color={Colors.yellow} />
              </View>
              <Text style={styles.statLabel}>Rating</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentUser.role === 'provider' ? 
                  (currentUser.yearsOfService || 0) + '+' : 
                  (new Date().getFullYear() - new Date(currentUser.createdAt).getFullYear())}
              </Text>
              <Text style={styles.statLabel}>
                Years with us
              </Text>
            </View>
          </View>
        </View>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{currentUser.email}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{currentUser.phone || 'Not provided'}</Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{currentUser.location || 'Not provided'}</Text>
          </View>
        </Card>

        {currentUser.role === 'provider' && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
            
            <View style={styles.infoItem}>
              <Ionicons name="briefcase-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Specializations</Text>
              <Text style={styles.infoValue}>
                {currentUser.specializations?.join(', ') || 'Not specified'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Hourly Rate</Text>
              <Text style={styles.infoValue}>
                {currentUser.hourlyRate ? `${currentUser.hourlyRate} AED` : 'Not specified'}
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={[styles.actionText, { color: Colors.error }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    color: Colors.secondaryText,
    marginTop: 16,
    marginBottom: 24,
  },
  signInButton: {
    width: 200,
  },
  scrollContent: {
    paddingBottom: 40,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    width: 100,
    marginLeft: 10,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  actionsContainer: {
    marginTop: 24,
    marginHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionText: {
    fontSize: 16,
    marginLeft: 12,
    color: Colors.text,
  },
}); 