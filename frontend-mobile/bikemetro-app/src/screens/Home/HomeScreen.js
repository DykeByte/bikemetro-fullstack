import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../api/endpoints';
import COLORS from '../../constants/colors';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEstaciones();
  }, []);

  const loadEstaciones = async () => {
    try {
      const result = await api.getEstaciones();
      
      if (result.success) {
        setEstaciones(result.data.results || result.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las estaciones');
      }
    } catch (error) {
      console.error('Error cargando estaciones:', error);
      Alert.alert('Error', 'Ocurrio un error al cargar las estaciones');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEstaciones();
  };

  const renderEstacion = ({ item }) => {
    const disponibilidad = item.espacios_disponibles / item.espacios_totales;
    let statusColor = COLORS.success;
    let statusText = 'Disponible';
    
    if (disponibilidad === 0) {
      statusColor = COLORS.error;
      statusText = 'Completo';
    } else if (disponibilidad < 0.3) {
      statusColor = '#F59E0B';
      statusText = 'Pocos espacios';
    }

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('StationDetail', { estacion: item })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.lineIndicator} />
          <View style={styles.cardHeaderText}>
            <Text style={styles.estacionNombre}>{item.nombre}</Text>
            <Text style={styles.lineaText}>{item.linea_display}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.espaciosInfo}>
            <Text style={styles.espaciosNumero}>{item.espacios_disponibles}</Text>
            <Text style={styles.espaciosLabel}>Disponibles</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.espaciosInfo}>
            <Text style={styles.espaciosTotalNumero}>{item.espacios_totales}</Text>
            <Text style={styles.espaciosLabel}>Total</Text>
          </View>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando estaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {user?.nickname || user?.username}</Text>
        <Text style={styles.subtitle}>Selecciona una estacion</Text>
      </View>

      <FlatList
        data={estaciones}
        renderItem={renderEstacion}
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
            <Text style={styles.emptyText}>No hay estaciones disponibles</Text>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textWhite,
    opacity: 0.9,
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  lineIndicator: {
    width: 4,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  estacionNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  lineaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  espaciosInfo: {
    flex: 1,
    alignItems: 'center',
  },
  espaciosNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  espaciosTotalNumero: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  espaciosLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
