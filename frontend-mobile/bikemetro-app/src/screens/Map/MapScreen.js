import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
  Animated,
} from 'react-native';
import * as api from '../../api/endpoints';
import COLORS from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export default function MapScreen({ navigation }) {
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [scale, setScale] = useState(1);
  
  const scaleValue = useRef(new Animated.Value(1)).current;

  // Escala base del mapa
  const BASE_MAP_SIZE = width * 1.2;

  // Límites de zoom: 100% a 200%
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 2;

  // Posiciones normalizadas (0-1)
  const stationPositionsNormalized = {
    'San Pablo': { x: 0.167, y: 0.269 },
    'Universidad de Santiago': { x: 0.306, y: 0.308 },
    'Estación Central': { x: 0.370, y: 0.324 },
    'Los Héroes': { x: 0.440, y: 0.306 },
    'Universidad de Chile': { x: 0.491, y: 0.308 },
    'Santa Lucía': { x: 0.556, y: 0.333 },
    'Baquedano': { x: 0.602, y: 0.329 },
    'Salvador': { x: 0.667, y: 0.269 },
    'Pedro de Valdivia': { x: 0.718, y: 0.269 },
    'Tobalaba': { x: 0.769, y: 0.269 },
    'Los Dominicos': { x: 0.940, y: 0.292 },
  };

  useEffect(() => {
    loadEstaciones();
  }, []);

  const loadEstaciones = async () => {
    try {
      const result = await api.getEstaciones();
      if (result.success && Array.isArray(result.data)) {
        setEstaciones(result.data);
      }
    } catch (error) {
      console.error('Error cargando estaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.25, MAX_ZOOM);
    setScale(newScale);
    Animated.spring(scaleValue, {
      toValue: newScale,
      useNativeDriver: false, // Cambiar a false para que funcione con layout
    }).start();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale / 1.25, MIN_ZOOM);
    setScale(newScale);
    Animated.spring(scaleValue, {
      toValue: newScale,
      useNativeDriver: false,
    }).start();
  };

  const handleResetZoom = () => {
    setScale(1);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: false,
    }).start();
  };

  const getMarkerColor = (estacion) => {
    const porcentaje = (estacion.espacios_disponibles / estacion.espacios_totales) * 100;
    if (porcentaje > 50) return '#10B981';
    if (porcentaje > 20) return '#F59E0B';
    if (porcentaje > 0) return '#EF4444';
    return '#6B7280';
  };

  const handleMarkerPress = (estacion) => {
    setSelectedStation(estacion);
  };

  const handleNavigateToStation = () => {
    if (selectedStation) {
      setSelectedStation(null);
      navigation.navigate('Home', {
        screen: 'StationDetail',
        params: { estacion: selectedStation },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  const currentMapSize = BASE_MAP_SIZE * scale;
  // Escala inversa para mantener tamaño constante de marcadores
  const markerScale = 1 / scale;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Mapa Metro Santiago</Text>
        <Text style={styles.headerSubtitle}>Línea 1 • {estaciones.length} estaciones</Text>
      </View>

      {/* Leyenda */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Alta</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Media</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Baja</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#6B7280' }]} />
          <Text style={styles.legendText}>Lleno</Text>
        </View>
      </View>

      {/* Controles de Zoom */}
      <View style={styles.zoomControls}>
        <TouchableOpacity 
          style={[styles.zoomButton, scale >= MAX_ZOOM && styles.zoomButtonDisabled]} 
          onPress={handleZoomIn}
          disabled={scale >= MAX_ZOOM}
        >
          <Text style={styles.zoomButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButtonReset} onPress={handleResetZoom}>
          <Text style={styles.zoomButtonTextSmall}>⟲</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.zoomButton, scale <= MIN_ZOOM && styles.zoomButtonDisabled]} 
          onPress={handleZoomOut}
          disabled={scale <= MIN_ZOOM}
        >
          <Text style={styles.zoomButtonText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Indicador de Zoom */}
      <View style={styles.zoomIndicator}>
        <Text style={styles.zoomIndicatorText}>{Math.round(scale * 100)}%</Text>
      </View>

      {/* Mapa Scrollable */}
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={true}
        style={styles.mapScrollContainer}
        contentContainerStyle={styles.mapScrollContent}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.mapVerticalContent}
        >
          <View style={[styles.mapContainer, { width: currentMapSize, height: currentMapSize }]}>
            {/* Imagen del Mapa */}
            <Image
              source={require('../../../assets/mapa-metro-santiago.jpg')}
              style={styles.mapImage}
              resizeMode="contain"
            />

            {/* Marcadores - usar currentMapSize para posiciones */}
            <View style={styles.markersOverlay}>
              {estaciones.map((estacion) => {
                const normalizedPos = stationPositionsNormalized[estacion.nombre];
                if (!normalizedPos) return null;

                // Usar currentMapSize (que cambia con el zoom) para las posiciones
                const x = normalizedPos.x * currentMapSize;
                const y = normalizedPos.y * currentMapSize;

                const markerColor = getMarkerColor(estacion);
                const isSelected = selectedStation?.id === estacion.id;

                // Tamaño base del marcador
                const baseMarkerSize = 36;
                const markerSize = baseMarkerSize * markerScale;

                return (
                  <View key={estacion.id}>
                    {/* Marcador con tamaño escalado inversamente */}
                    <TouchableOpacity
                      style={[
                        styles.marker,
                        {
                          left: x - (markerSize / 2),
                          top: y - (markerSize / 2),
                          width: markerSize,
                          height: markerSize,
                          borderRadius: markerSize / 2,
                          backgroundColor: markerColor,
                          borderWidth: isSelected ? 3 * markerScale : 2 * markerScale,
                          borderColor: isSelected ? '#1E40AF' : '#fff',
                          transform: [{ scale: isSelected ? 1.3 : 1 }],
                          zIndex: isSelected ? 1000 : 100,
                        },
                      ]}
                      onPress={() => handleMarkerPress(estacion)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.markerText, { fontSize: 13 * markerScale }]}>
                        {estacion.espacios_disponibles}
                      </Text>
                    </TouchableOpacity>

                    {/* Etiqueta con tamaño escalado */}
                    <View
                      style={[
                        styles.stationLabel,
                        {
                          left: x - (50 * markerScale),
                          top: y + (22 * markerScale),
                          width: 100 * markerScale,
                          zIndex: isSelected ? 999 : 99,
                        },
                      ]}
                    >
                      <Text 
                        style={[
                          styles.stationLabelText, 
                          { 
                            fontSize: 10 * markerScale,
                            paddingHorizontal: 6 * markerScale,
                            paddingVertical: 3 * markerScale,
                            borderRadius: 6 * markerScale,
                            borderWidth: 1.5 * markerScale,
                          }
                        ]} 
                        numberOfLines={2}
                      >
                        {estacion.nombre}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </ScrollView>

      {/* Card Info */}
      {selectedStation && (
        <View style={styles.infoCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedStation(null)}
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.cardContent}>
            <View style={styles.cardLeft}>
              <Text style={styles.stationName}>{selectedStation.nombre}</Text>
              <Text style={styles.stationLine}>
                {selectedStation.linea_display} • Bicicletero
              </Text>
            </View>
            
            <View style={styles.cardRight}>
              <Text style={styles.availabilityLarge}>
                {selectedStation.espacios_disponibles}
              </Text>
              <Text style={styles.availabilitySmall}>
                de {selectedStation.espacios_totales}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={handleNavigateToStation}
          >
            <Text style={styles.viewButtonText}>🚴 Ver Estación</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E5E5',
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
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textWhite,
    opacity: 0.9,
  },
  legend: {
    backgroundColor: COLORS.background,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    top: height * 0.35,
    zIndex: 100,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  zoomButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  zoomButtonDisabled: {
    backgroundColor: COLORS.textLight,
    opacity: 0.5,
  },
  zoomButtonReset: {
    width: 44,
    height: 36,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  zoomButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  zoomButtonTextSmall: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  zoomIndicator: {
    position: 'absolute',
    top: height * 0.25,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 100,
  },
  zoomIndicatorText: {
    color: COLORS.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mapScrollContainer: {
    flex: 1,
  },
  mapScrollContent: {
    paddingHorizontal: 10,
  },
  mapVerticalContent: {
    paddingVertical: 10,
  },
  mapContainer: {
    position: 'relative',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  markersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  marker: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  markerText: {
    color: COLORS.textWhite,
    fontWeight: 'bold',
  },
  stationLabel: {
    position: 'absolute',
    alignItems: 'center',
  },
  stationLabelText: {
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  stationName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  stationLine: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  cardRight: {
    alignItems: 'center',
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.border,
  },
  availabilityLarge: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    lineHeight: 36,
  },
  availabilitySmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  viewButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
