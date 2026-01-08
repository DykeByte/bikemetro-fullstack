import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import * as api from '../../api/endpoints';
import COLORS from '../../constants/colors';

export default function ReservationHistoryScreen() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      const result = await api.getReservasActivas();
      if (result.success) {
        setReservas(result.data);
      }
    } catch (error) {
      console.error('Error cargando reservas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReservas();
  };

  const getEstadoColor = (estado) => {
    const colores = {
      PENDIENTE: '#F59E0B',
      CONFIRMADA: '#3B82F6',
      EN_CURSO: '#10B981',
      FINALIZADA: '#6B7280',
      CANCELADA: '#EF4444',
      EXPIRADA: '#9CA3AF',
    };
    return colores[estado] || COLORS.textSecondary;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderReserva = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.estacionText}>{item.estacion_nombre || 'Estación'}</Text>
            <Text style={styles.espacioText}>Espacio {item.espacio_codigo || 'N/A'}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(item.estado) }]}>
            <Text style={styles.estadoText}>{item.estado_display || item.estado}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>📅 Fecha:</Text>
            <Text style={styles.infoValue}>{formatDate(item.fecha_reserva)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>🕒 Hora:</Text>
            <Text style={styles.infoValue}>{formatTime(item.fecha_reserva)}</Text>
          </View>
          {item.costo_total > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💰 Costo:</Text>
              <Text style={styles.infoValue}>${item.costo_total}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reservas}
        renderItem={renderReserva}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>📭</Text>
            <Text style={styles.emptyTitle}>No hay reservas</Text>
            <Text style={styles.emptySubtext}>
              Tus reservas aparecerán aquí
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  estacionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  espacioText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
