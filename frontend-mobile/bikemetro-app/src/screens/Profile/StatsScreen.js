import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import COLORS from '../../constants/colors';

export default function StatsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 Tus Estadísticas</Text>
        
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reservas Totales</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>$0</Text>
            <Text style={styles.statLabel}>Total Gastado</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0h</Text>
            <Text style={styles.statLabel}>Tiempo Total</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Estaciones Visitadas</Text>
          </View>
        </View>
      </View>

      <View style={styles.comingSoon}>
        <Text style={styles.comingSoonText}>🚧 Próximamente</Text>
        <Text style={styles.comingSoonSubtext}>
          Más estadísticas y análisis de tu uso
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  card: {
    backgroundColor: COLORS.background,
    margin: 16,
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  comingSoon: {
    margin: 16,
    padding: 20,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
});
