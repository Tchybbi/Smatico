import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import Colors from '../constants/Colors';
import OrderCard from '../components/OrderCard';

export default function OrdersScreen() {
  const router = useRouter();
  
  const { currentUser, getFilteredOrders } = useApp();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
  });

  const isProvider = currentUser?.role === 'provider';

  useEffect(() => {
    loadOrders();
  }, [currentUser, filters]);

  const loadOrders = () => {
    setLoading(true);
    try {
      let filterOptions = { ...filters };
      
      if (isProvider) {
        // Providers see all orders except their own
        filterOptions = {
          ...filterOptions,
          status: 'pending',
        };
        const providerOrders = getFilteredOrders(filterOptions).filter(
          order => order.customerId !== currentUser?.id
        );
        setOrders(providerOrders);
      } else {
        // Customers see only their orders
        filterOptions = {
          ...filterOptions,
          customerId: currentUser?.id,
        };
        setOrders(getFilteredOrders(filterOptions));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Search logic here (filter by title/description)
    if (!text) {
      loadOrders();
    } else {
      const filtered = orders.filter(
        order => 
          order.title?.toLowerCase().includes(text.toLowerCase()) ||
          order.description?.toLowerCase().includes(text.toLowerCase())
      );
      setOrders(filtered);
    }
  };

  const handleStatusFilter = (status) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status === status ? '' : status,
    }));
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {isProvider ? 'Available Orders' : 'My Orders'}
      </Text>
      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => router.push('/orders/filter')}
      >
        <Ionicons name="filter" size={22} color={Colors.text} />
        <Text style={styles.filterText}>Sort</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={Colors.inactive} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search orders..."
        placeholderTextColor={Colors.inactive}
        value={searchQuery}
        onChangeText={handleSearch}
      />
      {searchQuery ? (
        <TouchableOpacity
          onPress={() => handleSearch('')}
          style={styles.clearButton}
        >
          <Ionicons name="close-circle" size={20} color={Colors.inactive} />
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderStatusFilters = () => (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[
          styles.filterChip,
          filters.status === '' && styles.activeFilterChip,
        ]}
        onPress={() => handleStatusFilter('')}
      >
        <Text
          style={[
            styles.filterChipText,
            filters.status === '' && styles.activeFilterChipText,
          ]}
        >
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterChip,
          filters.status === 'pending' && styles.activeFilterChip,
        ]}
        onPress={() => handleStatusFilter('pending')}
      >
        <Text
          style={[
            styles.filterChipText,
            filters.status === 'pending' && styles.activeFilterChipText,
          ]}
        >
          Pending
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterChip,
          filters.status === 'in_progress' && styles.activeFilterChip,
        ]}
        onPress={() => handleStatusFilter('in_progress')}
      >
        <Text
          style={[
            styles.filterChipText,
            filters.status === 'in_progress' && styles.activeFilterChipText,
          ]}
        >
          In Progress
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.filterChip,
          filters.status === 'completed' && styles.activeFilterChip,
        ]}
        onPress={() => handleStatusFilter('completed')}
      >
        <Text
          style={[
            styles.filterChipText,
            filters.status === 'completed' && styles.activeFilterChipText,
          ]}
        >
          Completed
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={60} color={Colors.inactive} />
      <Text style={styles.emptyText}>No orders found</Text>
      {!isProvider && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('/create-order')}
        >
          <Text style={styles.createButtonText}>Create New Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOrderItem = ({ item }) => <OrderCard order={item} />;

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <View style={styles.content}>
        {renderSearchBar()}
        {renderStatusFilters()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    marginLeft: 4,
    fontSize: 14,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: Colors.text,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  activeFilterChipText: {
    color: 'white',
    fontWeight: '500',
  },
  ordersList: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.secondaryText,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 