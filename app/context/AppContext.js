import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial data structure
const initialData = {
  users: [],
  orders: [],
  reviews: [],
  currentUser: null,
  isAuthenticated: false,
};

// Keys for storing data
const STORAGE_KEYS = {
  APP_DATA: 'appData',
  USER_SESSION: 'userSession',
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage when the app starts
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load app data
        const storedData = await AsyncStorage.getItem(STORAGE_KEYS.APP_DATA);
        let appData = initialData;

        if (storedData) {
          appData = JSON.parse(storedData);
        } else {
          // Initialize with empty data if nothing exists
          await AsyncStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(initialData));
        }

        // Try to restore user session
        const storedSession = await AsyncStorage.getItem(STORAGE_KEYS.USER_SESSION);
        if (storedSession) {
          const { userId } = JSON.parse(storedSession);
          const user = appData.users.find(u => u.id === userId);
          
          if (user) {
            // User found, restore session
            appData.currentUser = user;
            appData.isAuthenticated = true;
          }
        }

        setData(appData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save app data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.APP_DATA, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };

    if (!loading) {
      saveData();
    }
  }, [data, loading]);

  // Auth functions
  const signUp = async (userData) => {
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
      ratings: [],
      averageRating: 0,
    };

    // Update app data with new user
    setData((prevData) => ({
      ...prevData,
      users: [...prevData.users, newUser],
      currentUser: newUser,
      isAuthenticated: true,
    }));

    // Save user session separately
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_SESSION, 
        JSON.stringify({ userId: newUser.id })
      );
    } catch (error) {
      console.error('Error saving user session:', error);
    }

    return newUser;
  };

  const signIn = async (email, password) => {
    const user = data.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      // Update app data with authenticated user
      setData((prevData) => ({
        ...prevData,
        currentUser: user,
        isAuthenticated: true,
      }));

      // Save user session separately
      try {
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_SESSION, 
          JSON.stringify({ userId: user.id })
        );
      } catch (error) {
        console.error('Error saving user session:', error);
      }

      return user;
    }
    
    throw new Error('Invalid credentials');
  };

  const signOut = async () => {
    // Update app data, removing current user
    setData((prevData) => ({
      ...prevData,
      currentUser: null,
      isAuthenticated: false,
    }));

    // Remove user session
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    } catch (error) {
      console.error('Error removing user session:', error);
    }
  };

  // Order functions
  const createOrder = (orderData) => {
    const newOrder = {
      id: 'ORD-' + Math.floor(Math.random() * 10000) + '-' + Math.floor(Math.random() * 100),
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      bids: [],
    };

    setData((prevData) => ({
      ...prevData,
      orders: [...prevData.orders, newOrder],
    }));

    return newOrder;
  };

  const updateOrder = (orderId, updates) => {
    setData((prevData) => ({
      ...prevData,
      orders: prevData.orders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      ),
    }));
  };

  const placeBid = (orderId, bidData) => {
    const bid = {
      id: Date.now().toString(),
      ...bidData,
      createdAt: new Date().toISOString(),
    };

    setData((prevData) => ({
      ...prevData,
      orders: prevData.orders.map((order) =>
        order.id === orderId
          ? { ...order, bids: [...order.bids, bid] }
          : order
      ),
    }));

    return bid;
  };

  // New function to accept a bid
  const acceptBid = (orderId, bidId) => {
    setData((prevData) => {
      const order = prevData.orders.find(o => o.id === orderId);
      if (!order) return prevData;

      const acceptedBid = order.bids.find(b => b.id === bidId);
      if (!acceptedBid) return prevData;

      const updatedOrder = {
        ...order,
        status: 'in_progress',
        acceptedBid: acceptedBid,
        providerId: acceptedBid.providerId,
        acceptedAt: new Date().toISOString()
      };

      return {
        ...prevData,
        orders: prevData.orders.map(o => o.id === orderId ? updatedOrder : o)
      };
    });
  };

  // New function to complete an order
  const completeOrder = (orderId) => {
    setData((prevData) => {
      const updatedOrders = prevData.orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order,
            status: 'completed',
            completedAt: new Date().toISOString(),
          };
        }
        return order;
      });

      return {
        ...prevData,
        orders: updatedOrders
      };
    });
  };

  // New function to cancel an order
  const cancelOrder = (orderId, reason = '') => {
    setData((prevData) => {
      const updatedOrders = prevData.orders.map(order => {
        if (order.id === orderId) {
          return {
            ...order, 
            status: 'cancelled',
            cancelReason: reason,
            cancelledAt: new Date().toISOString(),
          };
        }
        return order;
      });

      return {
        ...prevData,
        orders: updatedOrders
      };
    });
  };

  // Review functions
  const addReview = (reviewData) => {
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      createdAt: new Date().toISOString(),
    };

    // Add the review to the reviews array
    setData((prevData) => ({
      ...prevData,
      reviews: [...prevData.reviews, newReview],
    }));

    // Update the user's ratings
    setData((prevData) => {
      const updatedUsers = prevData.users.map((user) => {
        if (user.id === reviewData.targetUserId) {
          const userRatings = [
            ...user.ratings,
            { id: newReview.id, rating: reviewData.rating },
          ];
          
          // Calculate new average
          const averageRating = 
            userRatings.reduce((sum, item) => sum + item.rating, 0) / userRatings.length;
          
          return {
            ...user,
            ratings: userRatings,
            averageRating: parseFloat(averageRating.toFixed(1)),
          };
        }
        return user;
      });

      return {
        ...prevData,
        users: updatedUsers,
      };
    });

    return newReview;
  };

  // New function to rate after order completion
  const rateOrderParticipant = (orderId, ratingData) => {
    const { fromUserId, toUserId, rating, comment } = ratingData;
    
    // Create a review
    const review = addReview({
      orderId,
      fromUserId,
      targetUserId: toUserId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    });
    
    // Update the order to mark that this user has given a rating
    setData((prevData) => {
      const order = prevData.orders.find(o => o.id === orderId);
      if (!order) return prevData;
      
      let updatedRatings = order.ratings || [];
      updatedRatings.push({
        fromUserId,
        toUserId,
        reviewId: review.id,
        rating,
        createdAt: new Date().toISOString(),
      });
      
      return {
        ...prevData,
        orders: prevData.orders.map(o => 
          o.id === orderId 
            ? { ...o, ratings: updatedRatings } 
            : o
        )
      };
    });
    
    return review;
  };

  // Filter functions for convenience
  const getFilteredOrders = (filters = {}) => {
    return data.orders.filter((order) => {
      let match = true;
      
      if (filters.status && order.status !== filters.status) {
        match = false;
      }
      
      if (filters.customerId && order.customerId !== filters.customerId) {
        match = false;
      }
      
      if (filters.providerId && order.providerId !== filters.providerId) {
        match = false;
      }
      
      if (filters.category && order.category !== filters.category) {
        match = false;
      }
      
      return match;
    });
  };

  return (
    <AppContext.Provider
      value={{
        ...data,
        loading,
        signUp,
        signIn,
        signOut,
        createOrder,
        updateOrder,
        placeBid,
        acceptBid,
        completeOrder,
        cancelOrder,
        addReview,
        rateOrderParticipant,
        getFilteredOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => useContext(AppContext);

export default AppContext; 