import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  TextInput,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '../../context/AppContext';
import Colors from '../../constants/Colors';
import Button from '../../components/Button';
import Card from '../../components/Card';

export default function OrderDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { 
    orders, 
    users, 
    currentUser, 
    updateOrder, 
    placeBid, 
    acceptBid,
    completeOrder,
    cancelOrder,
    rateOrderParticipant 
  } = useApp();
  
  const [order, setOrder] = useState(null);
  const [owner, setOwner] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [showBidsModal, setShowBidsModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id && orders) {
      const foundOrder = orders.find((o) => o.id === id);
      setOrder(foundOrder);
      
      if (foundOrder && users) {
        const orderOwner = users.find((u) => u.id === foundOrder.customerId);
        setOwner(orderOwner);
        
        // Find provider if order has one assigned
        if (foundOrder.providerId) {
          const orderProvider = users.find((u) => u.id === foundOrder.providerId);
          setProvider(orderProvider);
        }
      }
      
      setLoading(false);
    }
  }, [id, orders, users]);

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading order details...</Text>
      </SafeAreaView>
    );
  }

  const isOwner = currentUser?.id === order.customerId;
  const isProvider = currentUser?.role === 'provider';
  const isAssignedProvider = order.providerId === currentUser?.id;
  const canPlaceBid = isProvider && !isOwner && order.status === 'pending';
  const hasUserRatedOrder = order.ratings?.some(r => r.fromUserId === currentUser?.id);

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cleaning':
        return 'water-outline';
      case 'repair':
      case 'repair & construction':
        return 'construct-outline';
      case 'installation':
        return 'build-outline';
      case 'tourism':
      case 'tourism & entertainment':
        return 'airplane-outline';
      case 'apartment_repair':
        return 'home-outline';
      case 'ac_repair':
        return 'snow-outline';
      default:
        return 'cube-outline';
    }
  };

  const handlePlaceBid = () => {
    const amount = parseFloat(bidAmount);
    
    // Validation
    if (!bidAmount || isNaN(amount)) {
      setBidError('Please enter a valid bid amount');
      return;
    }
    
    if (amount <= 0) {
      setBidError('Bid amount must be greater than zero');
      return;
    }
    
    if (amount > order.maxPrice) {
      setBidError(`Bid cannot exceed maximum price of ${order.maxPrice} AED`);
      return;
    }
    
    // Place bid
    placeBid(order.id, {
      providerId: currentUser.id,
      amount,
      createdAt: new Date().toISOString(),
      providerName: currentUser.name,
    });
    
    // Update order with current bid
    updateOrder(order.id, {
      currentBid: amount,
    });
    
    Alert.alert('Success', 'Your bid has been placed successfully!');
    setBidAmount('');
    setBidError('');
  };

  const handleAcceptBid = (bidId) => {
    Alert.alert(
      'Accept Bid',
      'Are you sure you want to accept this bid? This will assign the provider to your order.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: () => {
            acceptBid(order.id, bidId);
            setShowBidsModal(false);
            Alert.alert('Success', 'Bid accepted successfully! The provider has been assigned to your order.');
          }
        }
      ]
    );
  };

  const handleCompleteOrder = () => {
    Alert.alert(
      'Complete Order',
      'Are you sure you want to mark this order as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Complete', 
          onPress: () => {
            completeOrder(order.id);
            setShowRatingModal(true);
          }
        }
      ]
    );
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const submitCancelOrder = () => {
    cancelOrder(order.id, cancelReason);
    setShowCancelModal(false);
    Alert.alert('Success', 'Order has been cancelled');
  };

  const handleSubmitRating = () => {
    // Determine who to rate
    const toUserId = isOwner ? order.providerId : order.customerId;
    
    rateOrderParticipant(order.id, {
      fromUserId: currentUser.id,
      toUserId,
      rating,
      comment: ratingComment,
    });
    
    setShowRatingModal(false);
    Alert.alert('Thank You', 'Your rating has been submitted successfully!');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render the bids modal
  const renderBidsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showBidsModal}
      onRequestClose={() => setShowBidsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Bids</Text>
            <TouchableOpacity onPress={() => setShowBidsModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          {order.bids && order.bids.length > 0 ? (
            <FlatList
              data={order.bids.sort((a, b) => a.amount - b.amount)} // Sort by lowest price
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.bidCard}>
                  <View style={styles.bidCardHeader}>
                    <View style={styles.bidProviderInfo}>
                      <View style={styles.bidProviderAvatar}>
                        <Ionicons name="person" size={16} color={Colors.primary} />
                      </View>
                      <Text style={styles.bidProviderName}>
                        {item.providerName || 'Provider'}
                      </Text>
                    </View>
                    <Text style={styles.bidAmount}>{item.amount} AED</Text>
                  </View>
                  
                  <Text style={styles.bidDate}>
                    Bid placed: {formatDate(item.createdAt)}
                  </Text>
                  
                  {isOwner && order.status === 'pending' && (
                    <Button
                      title="Accept Bid"
                      onPress={() => handleAcceptBid(item.id)}
                      style={styles.acceptBidButton}
                    />
                  )}
                </Card>
              )}
              contentContainerStyle={styles.bidsList}
            />
          ) : (
            <View style={styles.noBidsContainer}>
              <Ionicons name="alert-circle-outline" size={60} color={Colors.inactive} />
              <Text style={styles.noBidsText}>No bids placed yet</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );

  // Render the rating modal
  const renderRatingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showRatingModal}
      onRequestClose={() => setShowRatingModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Rate {isOwner ? 'Service Provider' : 'Customer'}
            </Text>
            <TouchableOpacity onPress={() => setShowRatingModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.ratingText}>How would you rate your experience?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={40}
                  color={Colors.yellow}
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment (optional)"
            value={ratingComment}
            onChangeText={setRatingComment}
            multiline
            numberOfLines={3}
          />
          
          <Button
            title="Submit Rating"
            onPress={handleSubmitRating}
            style={styles.submitRatingButton}
          />
        </View>
      </View>
    </Modal>
  );

  // Render cancel order modal
  const renderCancelModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showCancelModal}
      onRequestClose={() => setShowCancelModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Order</Text>
            <TouchableOpacity onPress={() => setShowCancelModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.cancelText}>Please provide a reason for cancellation:</Text>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Reason for cancellation"
            value={cancelReason}
            onChangeText={setCancelReason}
            multiline
            numberOfLines={3}
          />
          
          <View style={styles.cancelButtonsRow}>
            <Button
              title="Keep Order"
              variant="outline"
              onPress={() => setShowCancelModal(false)}
              style={styles.cancelActionButton}
            />
            <Button
              title="Cancel Order"
              variant="secondary"
              onPress={submitCancelOrder}
              style={styles.cancelActionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders N {id.split('-')[1]}</Text>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Badge */}
        <View style={styles.statusBadgeContainer}>
          <View
            style={[
              styles.statusBadge,
              order.status === 'pending' && styles.pendingBadge,
              order.status === 'in_progress' && styles.inProgressBadge,
              order.status === 'completed' && styles.completedBadge,
              order.status === 'cancelled' && styles.cancelledBadge,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {order.status?.replace('_', ' ')}
            </Text>
          </View>
        </View>

        {/* Order Owner */}
        {owner && (
          <Card style={styles.ownerCard}>
            <View style={styles.ownerInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={30} color={Colors.primary} />
              </View>
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{owner.name}</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= owner.averageRating ? "star" : "star-outline"}
                      size={16}
                      color={Colors.yellow}
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    ({owner.ratings?.length || 0})
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}
        
        {/* Assigned Provider (if exists) */}
        {provider && order.status !== 'pending' && (
          <Card style={styles.providerCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Service Provider</Text>
            </View>
            <View style={styles.ownerInfo}>
              <View style={[styles.avatar, { backgroundColor: Colors.secondary }]}>
                <Ionicons name="construct" size={30} color="white" />
              </View>
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerName}>{provider.name}</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= provider.averageRating ? "star" : "star-outline"}
                      size={16}
                      color={Colors.yellow}
                    />
                  ))}
                  <Text style={styles.ratingText}>
                    ({provider.ratings?.length || 0})
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        )}
        
        {/* Order Details */}
        <View style={styles.orderInfoContainer}>
          <View style={styles.dateInfo}>
            <Text style={styles.postedText}>
              Posted: {formatDate(order.createdAt)}
            </Text>
            <Text style={styles.untilText}>
              Until: {formatDate(order.expireDate)}
            </Text>
          </View>
          
          <View style={styles.bidInfo}>
            <Text style={styles.currentBid}>
              Current Bid: {order.currentBid ? `${order.currentBid} AED` : 'No bids yet'}
            </Text>
            <Text style={styles.priceRange}>
              {order.minPrice}-{order.maxPrice} AED
            </Text>
          </View>
        </View>
        
        {/* Bids count and view all button */}
        {order.status === 'pending' && (
          <TouchableOpacity 
            style={styles.viewBidsButton} 
            onPress={() => setShowBidsModal(true)}
          >
            <Text style={styles.viewBidsText}>
              {order.bids && order.bids.length > 0 
                ? `View all bids (${order.bids.length})` 
                : 'No bids yet'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
          </TouchableOpacity>
        )}
        
        <Text style={styles.title}>{order.title}</Text>
        
        <Text style={styles.description}>
          {order.description || 'A competitive type of auction in which participants compete for a contract, offering each time a price lower than that of competitors.'}
        </Text>
        
        {/* Order Attributes */}
        <View style={styles.attributesContainer}>
          <View style={styles.attributeItem}>
            <Ionicons name={getCategoryIcon(order.category)} size={22} color={Colors.primary} />
            <Text style={styles.attributeText}>{order.category}</Text>
          </View>
          
          <View style={styles.attributeItem}>
            <Ionicons name="location-outline" size={22} color={Colors.primary} />
            <Text style={styles.attributeText}>{order.location}</Text>
          </View>
          
          <View style={styles.attributeItem}>
            <Ionicons name="time-outline" size={22} color={Colors.primary} />
            <Text style={styles.attributeText}>12:00</Text>
          </View>
          
          <View style={styles.attributeItem}>
            <Ionicons name="card-outline" size={22} color={Colors.primary} />
            <Text style={styles.attributeText}>Cash - payment method</Text>
          </View>
        </View>
        
        {/* Images */}
        <View style={styles.imagesContainer}>
          {/* Using icons instead of actual images */}
          <View style={styles.imageItem}>
            <Ionicons name="image-outline" size={40} color={Colors.secondaryText} />
          </View>
          <View style={styles.imageItem}>
            <Ionicons name="image-outline" size={40} color={Colors.secondaryText} />
          </View>
          <View style={styles.imageItem}>
            <Ionicons name="image-outline" size={40} color={Colors.secondaryText} />
          </View>
          <View style={styles.imageItem}>
            <Ionicons name="image-outline" size={40} color={Colors.secondaryText} />
          </View>
        </View>
        
        {/* Bid Section */}
        {canPlaceBid && (
          <View style={styles.bidSection}>
            <Text style={styles.bidSectionTitle}>Place Your Bid</Text>
            <Text style={styles.bidDescription}>
              Enter your bid amount. The lowest bid has a higher chance of winning.
            </Text>
            
            <View style={styles.bidInputContainer}>
              <TextInput
                style={styles.bidInput}
                placeholder="Enter bid amount"
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
              />
              <Text style={styles.bidCurrency}>AED</Text>
            </View>
            
            {bidError ? <Text style={styles.bidError}>{bidError}</Text> : null}
            
            <Button
              title="Make a Bid"
              onPress={handlePlaceBid}
              style={styles.bidButton}
            />
          </View>
        )}
        
        {/* Order Actions based on user role and order status */}
        
        {/* Owner actions */}
        {isOwner && (
          <View style={styles.actionsContainer}>
            {order.status === 'pending' && (
              <View style={styles.ownerActions}>
                <Button
                  title="Edit Order"
                  variant="outline"
                  onPress={() => {}}
                  style={styles.actionButton}
                />
                <Button
                  title="Cancel Order"
                  variant="secondary"
                  onPress={handleCancelOrder}
                  style={styles.actionButton}
                />
              </View>
            )}
            
            {order.status === 'in_progress' && (
              <Button
                title="Mark as Completed"
                onPress={handleCompleteOrder}
                style={styles.fullWidthButton}
              />
            )}
            
            {order.status === 'completed' && !hasUserRatedOrder && (
              <Button
                title="Rate Service Provider"
                onPress={() => setShowRatingModal(true)}
                style={styles.fullWidthButton}
              />
            )}
          </View>
        )}
        
        {/* Provider actions */}
        {isAssignedProvider && (
          <View style={styles.actionsContainer}>
            {order.status === 'in_progress' && (
              <Text style={styles.providerNote}>
                Complete the order as specified. When finished, the customer will mark it as completed.
              </Text>
            )}
            
            {order.status === 'completed' && !hasUserRatedOrder && (
              <Button
                title="Rate Customer"
                onPress={() => setShowRatingModal(true)}
                style={styles.fullWidthButton}
              />
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Modals */}
      {renderBidsModal()}
      {renderRatingModal()}
      {renderCancelModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  statusBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.inactive,
  },
  pendingBadge: {
    backgroundColor: Colors.yellow,
  },
  inProgressBadge: {
    backgroundColor: Colors.info,
  },
  completedBadge: {
    backgroundColor: Colors.success,
  },
  cancelledBadge: {
    backgroundColor: Colors.error,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  ownerCard: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  providerCard: {
    marginHorizontal: 0,
    marginTop: 12,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: Colors.secondaryText,
  },
  orderInfoContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  postedText: {
    fontSize: 13,
    color: Colors.text,
  },
  untilText: {
    fontSize: 13,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  bidInfo: {
    alignItems: 'flex-end',
  },
  currentBid: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  priceRange: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginTop: 4,
  },
  viewBidsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewBidsText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.secondaryText,
    lineHeight: 22,
    marginBottom: 20,
  },
  attributesContainer: {
    marginBottom: 20,
  },
  attributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attributeText: {
    fontSize: 14,
    color: Colors.text,
    marginLeft: 12,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  imageItem: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: Colors.card,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bidSection: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bidSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  bidDescription: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 16,
  },
  bidInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  bidInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  bidCurrency: {
    fontWeight: '600',
    color: Colors.text,
  },
  bidError: {
    color: Colors.error,
    fontSize: 12,
    marginBottom: 12,
  },
  bidButton: {
    marginTop: 8,
  },
  actionsContainer: {
    marginVertical: 8,
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
  },
  fullWidthButton: {
    width: '100%',
  },
  providerNote: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
    backgroundColor: Colors.lightBlue,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  bidsList: {
    paddingBottom: 20,
  },
  bidCard: {
    marginBottom: 12,
  },
  bidCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bidProviderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bidProviderAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  bidProviderName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  bidDate: {
    fontSize: 12,
    color: Colors.secondaryText,
    marginBottom: 12,
  },
  acceptBidButton: {
    marginTop: 8,
  },
  noBidsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noBidsText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.secondaryText,
  },
  
  // Rating modal styles
  ratingText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  starButton: {
    paddingHorizontal: 6,
  },
  commentInput: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  submitRatingButton: {
    marginTop: 8,
  },
  
  // Cancel modal styles
  cancelText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  cancelButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelActionButton: {
    flex: 0.48,
  },
}); 