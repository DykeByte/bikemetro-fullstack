import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as api from '../../api/endpoints';
import COLORS from '../../constants/colors';

export default function ActiveReservationScreen({ route, navigation }) {
  const { reserva: initialReserva } = route.params;
  const [reserva, setReserva] = useState(initialReserva);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showQREntrada, setShowQREntrada] = useState(true);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    if (reserva.fecha_expiracion_reserva) {
      calculateTimeRemaining();
      const interval = setInterval(calculateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [reserva]);

  const calculateTimeRemaining = () => {
    const now = new Date();
    const expirationDate = new Date(reserva.fecha_expiracion_reserva);
    const diff = expirationDate - now;

    if (diff <= 0) {
      setTimeRemaining('EXPIRADO');
    } else {
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(minutes + ':' + (seconds < 10 ? '0' : '') + seconds);
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar Reserva',
      'Estas seguro que deseas cancelar esta reserva?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Si, cancelar',
          style: 'destructive',
          onPress: confirmarCancelacion,
        },
      ]
    );
  };

  const confirmarCancelacion = async () => {
    setCanceling(true);
    try {
      const result = await api.cancelReserva(reserva.id);
      
      if (result.success) {
        Alert.alert(
          'Reserva Cancelada',
          'Tu reserva ha sido cancelada exitosamente',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Home'),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.error?.message || 'No se pudo cancelar la reserva');
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      Alert.alert('Error', 'Ocurrio un error al cancelar la reserva');
    } finally {
      setCanceling(false);
    }
  };

  const getEstadoInfo = () => {
    const estados = {
      PENDIENTE: {
        color: '#F59E0B',
        texto: 'Pendiente',
        descripcion: 'Confirma tu llegada escaneando el QR de entrada',
      },
      CONFIRMADA: {
        color: '#3B82F6',
        texto: 'Confirmada',
        descripcion: 'Reserva confirmada. Escanea el QR de salida al terminar',
      },
      EN_CURSO: {
        color: '#10B981',
        texto: 'En Curso',
        descripcion: 'Bicicleta estacionada. Escanea el QR de salida al terminar',
      },
    };
    return estados[reserva.estado] || estados.PENDIENTE;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CL');
    } catch (e) {
      return 'N/A';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-CL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const estadoInfo = getEstadoInfo();
  const puedeCancel = ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado);

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.statusBanner, { backgroundColor: estadoInfo.color }]}>
        <Text style={styles.statusText}>{estadoInfo.texto}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Estacion:</Text>
          <Text style={styles.value}>
            {reserva.estacion_nombre || 'Cargando...'}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Espacio:</Text>
          <Text style={styles.valueHighlight}>
            {reserva.espacio_codigo || 'N/A'}
          </Text>
        </View>

        {reserva.estado === 'PENDIENTE' && timeRemaining && timeRemaining !== 'EXPIRADO' && (
          <View style={styles.timerCard}>
            <Text style={styles.timerLabel}>Tiempo para confirmar:</Text>
            <Text style={styles.timerValue}>{timeRemaining}</Text>
            <Text style={styles.timerHint}>
              Confirma tu llegada en los proximos minutos
            </Text>
          </View>
        )}

        {timeRemaining === 'EXPIRADO' && (
          <View style={styles.expiredCard}>
            <Text style={styles.expiredText}>⏰ Reserva Expirada</Text>
            <Text style={styles.expiredSubtext}>
              El tiempo de confirmacion ha vencido
            </Text>
          </View>
        )}

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instrucciones:</Text>
          <Text style={styles.instructionsText}>{estadoInfo.descripcion}</Text>
        </View>

        <View style={styles.qrSection}>
          <View style={styles.qrTabs}>
            <TouchableOpacity
              style={[styles.qrTab, showQREntrada && styles.qrTabActive]}
              onPress={() => setShowQREntrada(true)}
            >
              <Text style={[styles.qrTabText, showQREntrada && styles.qrTabTextActive]}>
                QR Entrada
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.qrTab, !showQREntrada && styles.qrTabActive]}
              onPress={() => setShowQREntrada(false)}
            >
              <Text style={[styles.qrTabText, !showQREntrada && styles.qrTabTextActive]}>
                QR Salida
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.qrContainer}>
            {reserva.qr_entrada && reserva.qr_salida ? (
              <>
                <QRCode
                  value={showQREntrada ? String(reserva.qr_entrada) : String(reserva.qr_salida)}
                  size={200}
                  color={COLORS.text}
                  backgroundColor={COLORS.background}
                />
                <Text style={styles.qrLabel}>
                  {showQREntrada ? 'Escanea al llegar' : 'Escanea al salir'}
                </Text>
              </>
            ) : (
              <View style={styles.qrError}>
                <Text style={styles.qrErrorText}>⚠️ QR no disponible</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detalles de la Reserva:</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Fecha:</Text>
            <Text style={styles.detailValue}>{formatDate(reserva.fecha_reserva)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Hora:</Text>
            <Text style={styles.detailValue}>{formatTime(reserva.fecha_reserva)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <Text style={[styles.detailValue, { color: estadoInfo.color }]}>
              {estadoInfo.texto}
            </Text>
          </View>
        </View>

        {puedeCancel && (
          <TouchableOpacity
            style={[styles.cancelButton, canceling && styles.buttonDisabled]}
            onPress={handleCancelar}
            disabled={canceling}
          >
            {canceling ? (
              <ActivityIndicator color={COLORS.textWhite} />
            ) : (
              <Text style={styles.cancelButtonText}>Cancelar Reserva</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backButtonText}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  statusBanner: {
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textWhite,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  valueHighlight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timerCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  timerLabel: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
  },
  timerHint: {
    fontSize: 12,
    color: '#92400E',
    textAlign: 'center',
  },
  expiredCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  expiredText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  expiredSubtext: {
    fontSize: 14,
    color: '#991B1B',
  },
  instructionsCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  qrSection: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  qrTabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  qrTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  qrTabActive: {
    borderBottomColor: COLORS.primary,
  },
  qrTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  qrTabTextActive: {
    color: COLORS.primary,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  qrLabel: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  qrError: {
    alignItems: 'center',
    padding: 20,
  },
  qrErrorText: {
    fontSize: 16,
    color: COLORS.error,
  },
  detailsCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelButton: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  cancelButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  backButton: {
    backgroundColor: COLORS.textLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
