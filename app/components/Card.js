import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from '../constants/Colors';

const Card = ({ 
  children, 
  style, 
  onPress, 
  touchable = false, 
  ...props 
}) => {
  const CardComponent = touchable ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, style]}
      activeOpacity={0.7}
      onPress={touchable ? onPress : undefined}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

export default Card; 