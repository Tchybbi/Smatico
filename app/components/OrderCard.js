import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '../constants/Colors';
import Card from './Card';

const OrderCard = ({ order, style }) => {
  const router = useRouter();

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cleaning':
        return 'water-outline';
      case 'repair':
      case 'installation':
        return 'construct-outline';
      case 'tourism':
        return 'airplane-outline';
      case 'apartment repair':
        return 'home-outline';
      case 'ac repair':
        return 'snow-outline';
      default:
        return 'cube-outline';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return Colors.success;
      case 'in_progress':
        return Colors.info;
      case 'pending':
        return Colors.yellow;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.inactive;
    }
  };

  // Format price range
  const formatPrice = () => {
    if (order.fixedPrice) {
      return `${order.fixedPrice} AED`;
    } else if (order.minPrice && order.maxPrice) {
      return `${order.minPrice}-${order.maxPrice} AED`;
    } else if (order.currentBid) {
      return `Current Bid: ${order.currentBid} AED`;
    }
    return 'Price not set';
  };

  return (
    <Card 
      touchable 
      style={[styles.card, style]} 
      onPress={() => router.push({
        pathname: "/orders/[id]",
        params: { id: order.id }
      })}
    >
      <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={getCategoryIcon(order.category)} 
              size={20} 
              color="white" 
            />
          </View>
          <Text style={styles.title}>{order.title}</Text>
        </View>
        {order.status && (
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(order.status) }
            ]}
          >
            <Text style={styles.statusText}>
              {order.status.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.detailsRow}>
        <Text style={styles.category}>
          <Ionicons name="folder-outline" size={14} color={Colors.secondaryText} /> {order.category}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>{formatPrice()}</Text>
        <Text style={styles.date}>
          <Ionicons name="calendar-outline" size={14} color={Colors.secondaryText} /> Until: {new Date(order.expireDate || order.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    color: Colors.secondaryText,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  date: {
    fontSize: 13,
    color: Colors.secondaryText,
  },
});

export default OrderCard; 