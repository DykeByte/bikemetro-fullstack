import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as api from '../api/endpoints';
import COLORS from '../constants/colors';

export default function TabBarBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadActiveReservations();
    const interval = setInterval(loadActiveReservations, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const loadActiveReservations = async () => {
    try {
      const result = await api.getReservasActivas();
      if (result.success && result.data) {
        setCount(result.data.length);
      }
    } catch (error) {
      console.error('Error loading active reservations:', error);
    }
  };

  if (count === 0) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
