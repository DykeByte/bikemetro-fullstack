import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORES_ESTADO_ESPACIO } from '../constants/config';
import COLORS from '../constants/colors';

export default function SpaceMatrix({ espacios, onSelectSpace, selectedSpace }) {
  const filas = ['1', '2', '3', '4', '5', '6', '7'];
  const columnas = ['A', 'B', 'C'];

  const getEspacio = (fila, columna) => {
    return espacios.find(e => e.fila === parseInt(fila) && e.columna === columna);
  };

  const renderSpace = (fila, columna) => {
    const espacio = getEspacio(fila, columna);
    
    if (!espacio) return null;

    const isSelected = selectedSpace?.id === espacio.id;
    const isDisponible = espacio.estado === 'DISPONIBLE';
    const backgroundColor = isSelected 
      ? '#3B82F6' 
      : COLORES_ESTADO_ESPACIO[espacio.estado] || COLORS.textLight;

    return (
      <TouchableOpacity
        key={espacio.codigo}
        style={[
          styles.space,
          { backgroundColor },
          isSelected && styles.spaceSelected,
        ]}
        onPress={() => isDisponible && onSelectSpace(espacio)}
        disabled={!isDisponible}
        activeOpacity={0.7}
      >
        <Text style={styles.spaceText}>{espacio.codigo}</Text>
        {!isDisponible && (
          <View style={styles.lockedIcon}>
            <Text style={styles.lockedText}>🔒</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona un Espacio</Text>
      
      <View style={styles.matrix}>
        <View style={styles.columnHeaders}>
          <View style={styles.cornerSpace} />
          {columnas.map(col => (
            <View key={col} style={styles.headerCell}>
              <Text style={styles.headerText}>{col}</Text>
            </View>
          ))}
        </View>

        {filas.map(fila => (
          <View key={fila} style={styles.row}>
            <View style={styles.rowHeader}>
              <Text style={styles.headerText}>{fila}</Text>
            </View>
            {columnas.map(columna => (
              <View key={columna} style={styles.spaceContainer}>
                {renderSpace(fila, columna)}
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORES_ESTADO_ESPACIO.DISPONIBLE }]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORES_ESTADO_ESPACIO.OCUPADO }]} />
          <Text style={styles.legendText}>Ocupado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: COLORES_ESTADO_ESPACIO.RESERVADO }]} />
          <Text style={styles.legendText}>Reservado</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.legendText}>Seleccionado</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  matrix: {
    alignSelf: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 12,
  },
  columnHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cornerSpace: {
    width: 40,
  },
  headerCell: {
    width: 70,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rowHeader: {
    width: 40,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spaceContainer: {
    marginHorizontal: 4,
  },
  space: {
    width: 62,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  spaceSelected: {
    borderColor: '#1E40AF',
    borderWidth: 3,
  },
  spaceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  lockedIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  lockedText: {
    fontSize: 12,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
