import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as api from '../../api/endpoints';
import SpaceMatrix from '../../components/SpaceMatrix';
import COLORS from '../../constants/colors';

export default function StationDetailScreen({ route, navigation }) {
  const { estacion } = route.params;
  const [espacios, setEspacios] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadEspacios();
  }, []);

  const loadEspacios = async () => {
    try {
      const result = await api.getEspaciosEstacion(estacion.id);
      
      if (result.success) {
        setEspacios(result.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los espacios');
      }
    } catch (error) {
      console.error('Error cargando espacios:', error);
      Alert.alert('Error', 'Ocurrio un error al cargar los espacios');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSpace = (espacio) => {
    setSelectedSpace(espacio);
  };

  const handleReservar = async () => {
    if (!selectedSpace) {
      Alert.alert('Error', 'Selecciona un espacio primero');
      return;
    }

    Alert.alert(
      'Confirmar Reserva',
      'Deseas reservar el espacio ' + selectedSpace.codigo + '?\n\nTendras 10 minutos para confirmar tu llegada.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            setCreating(true);
            try {
              const result = await api.createReserva({
                estacion: estacion.id,
                espacio: selectedSpace.id,
              });

              if (result.success) {
                navigation.replace('ActiveReservation', { 
                  reserva: result.data 
                });
              } else {
                Alert.alert('Error', result.error?.message || 'No se pudo crear la reserva');
              }
            } catch (error) {
              console.error('Error creando reserva:', error);
              Alert.alert('Error', 'Ocurrio un error al crear la reserva');
            } finally {
              setCreating(false);
            }
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando espacios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>{estacion.nombre}</Text>
          <Text style={styles.subtitle}>{estacion.linea_display}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{estacion.espacios_disponibles}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, { color: COLORS.textSecondary }]}>
                {estacion.espacios_totales}
              </Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        <SpaceMatrix
          espacios={espacios}
          onSelectSpace={handleSelectSpace}
          selectedSpace={selectedSpace}
        />

        {selectedSpace && (
          <View style={styles.selectionInfo}>
            <Text style={styles.selectionTitle}>Espacio Seleccionado:</Text>
            <Text style={styles.selectionCode}>{selectedSpace.codigo}</Text>
            <Text style={styles.selectionDetails}>
              Fila {selectedSpace.fila} - Columna {selectedSpace.columna}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.reserveButton,
            (!selectedSpace || creating) && styles.reserveButtonDisabled
          ]}
          onPress={handleReservar}
          disabled={!selectedSpace || creating}
        >
          {creating ? (
            <ActivityIndicator color={COLORS.textWhite} />
          ) : (
            <Text style={styles.reserveButtonText}>
              {selectedSpace ? 'RESERVAR ESPACIO' : 'SELECCIONA UN ESPACIO'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textWhite,
    opacity: 0.9,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.9,
    marginTop: 4,
  },
  selectionInfo: {
    margin: 16,
    padding: 20,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    alignItems: 'center',
  },
  selectionTitle: {
    fontSize: 14,
    color: '#1E40AF',
    marginBottom: 8,
  },
  selectionCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  selectionDetails: {
    fontSize: 14,
    color: '#1E40AF',
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  reserveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  reserveButtonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  reserveButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
