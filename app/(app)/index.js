import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import Colors from '../constants/Colors';
import OrderCard from '../components/OrderCard';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'cleaning', name: 'Cleaning', icon: 'water-outline', count: 320 },
  { id: 'repair', name: 'Repair & Construction', icon: 'construct-outline', count: 450 },
  { id: 'tourism', name: 'Tourism & Entertainment', icon: 'airplane-outline', count: 250 },
];

export default function HomeScreen() {
  const router = useRouter();
  const { currentUser, orders, users, getFilteredOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  
  const isProvider = currentUser?.role === 'provider';

  useEffect(() => {
    if (isProvider) {
      // For providers, show available orders (not their own)
      setFilteredOrders(
        getFilteredOrders({ status: 'pending' }).filter(
          order => order.customerId !== currentUser?.id
        )
      );
    } else {
      // For customers, show their orders on the home screen
      setFilteredOrders(
        getFilteredOrders({ customerId: currentUser?.id }).slice(0, 5)
      );
    }
  }, [currentUser, orders]);

  const getBestPerformers = () => {
    // Get providers with highest ratings
    return users
      .filter(user => user.role === 'provider' && user.averageRating > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 2);
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => router.push(`/orders?category=${item.id}`)}
    >
      <View style={styles.categoryIconContainer}>
        <Ionicons name={item.icon} size={24} color={Colors.primary} />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
      <Text style={styles.categoryCount}>{item.count} numbers</Text>
    </TouchableOpacity>
  );

  const renderPerformerCard = (performer) => (
    <TouchableOpacity
      key={performer.id}
      style={styles.performerCard}
      onPress={() => router.push(`/performers/${performer.id}`)}
    >
      <View style={styles.performerAvatar}>
        <Ionicons name="person" size={30} color={Colors.primary} />
      </View>
      <View style={styles.performerInfo}>
        <Text style={styles.performerName}>{performer.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>{performer.averageRating.toFixed(1)}</Text>
          <Ionicons name="star" size={14} color={Colors.yellow} />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={24} color={Colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                Hello, {currentUser?.name || 'User'}
              </Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color={Colors.primary} />
                <Text style={styles.location}>Dubai, USA</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/menu')}>
            <Ionicons name="menu" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.inactive} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={Colors.inactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Quick Access */}
        <View style={styles.quickAccess}>
          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: Colors.yellow }]}
            onPress={() => router.push('/performers')}
          >
            <Ionicons name="people-outline" size={24} color="white" />
            <Text style={styles.quickText}>Performers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: Colors.primary }]}
            onPress={() => router.push('/orders')}
          >
            <Ionicons name="list-outline" size={24} color="white" />
            <Text style={styles.quickText}>All Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickCard, { backgroundColor: Colors.secondary }]}
            onPress={() => router.push('/orders/map')}
          >
            <Ionicons name="map-outline" size={24} color="white" />
            <Text style={styles.quickText}>Orders Map</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Categories</Text>
          <TouchableOpacity onPress={() => router.push('/categories')}>
            <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Best Performers or Your Orders */}
        {isProvider ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Available Orders</Text>
              <TouchableOpacity onPress={() => router.push('/orders')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {filteredOrders.length > 0 ? (
              <View style={styles.ordersList}>
                {filteredOrders.slice(0, 3).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={50} color={Colors.inactive} />
                <Text style={styles.emptyText}>No available orders yet</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Best Performers</Text>
              <TouchableOpacity onPress={() => router.push('/performers')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.performersList}>
              {getBestPerformers().map(renderPerformerCard)}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Recent Orders</Text>
              <TouchableOpacity onPress={() => router.push('/orders')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>

            {filteredOrders.length > 0 ? (
              <View style={styles.ordersList}>
                {filteredOrders.slice(0, 3).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={50} color={Colors.inactive} />
                <Text style={styles.emptyText}>You haven't placed any orders yet</Text>
                <TouchableOpacity 
                  style={styles.createButton}
                  onPress={() => router.push('/create-order')}
                >
                  <Text style={styles.createButtonText}>Create Your First Order</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: 'white',
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 30,
    marginHorizontal: 20,
    marginTop: -20,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.text,
  },
  quickAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
  },
  quickCard: {
    width: (width - 56) / 3,
    height: 100,
    borderRadius: 12,
    padding: 15,
    justifyContent: 'space-between',
  },
  quickText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAll: {
    color: Colors.primary,
    fontSize: 14,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: 150,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.secondaryText,
  },
  performersList: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  performerCard: {
    width: (width - 56) / 2,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  performerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  performerInfo: {
    flex: 1,
  },
  performerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    marginRight: 2,
  },
  ordersList: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
    marginVertical: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 