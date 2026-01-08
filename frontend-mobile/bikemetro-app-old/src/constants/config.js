/**
 * Configuración y constantes de la aplicación BikeMetro
 * Archivo: src/constants/config.js
 */

// URL de la API según el entorno
export const API_CONFIG = {
  // Para desarrollo en simulador iOS
  BASE_URL_IOS: 'http://localhost:8000/api',
  
  // Para desarrollo en simulador Android
  BASE_URL_ANDROID: 'http://10.0.2.2:8000/api',
  
  // Para desarrollo en dispositivo físico (reemplaza con tu IP local)
  BASE_URL_DEVICE: 'http://192.168.1.100:8000/api',
  
  // Para producción
  BASE_URL_PRODUCTION: 'https://tu-dominio.com/api',
  
  // Timeout de requests
  TIMEOUT: 10000,
};

// Configuración de autenticación
export const AUTH_CONFIG = {
  TOKEN_KEY: '@bikemetro_token',
  REFRESH_TOKEN_KEY: '@bikemetro_refresh_token',
  USER_KEY: '@bikemetro_user',
};

// Configuración de reservas
export const RESERVA_CONFIG = {
  TIEMPO_EXPIRACION_MINUTOS: 10,
  HORAS_GRATIS: 2,
  COSTO_MEDIA_HORA: 500,
};

// Estados de reserva
export const ESTADOS_RESERVA = {
  PENDIENTE: 'PENDIENTE',
  CONFIRMADA: 'CONFIRMADA',
  EN_CURSO: 'EN_CURSO',
  FINALIZADA: 'FINALIZADA',
  CANCELADA: 'CANCELADA',
  EXPIRADA: 'EXPIRADA',
};

// Estados de espacio
export const ESTADOS_ESPACIO = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADO: 'OCUPADO',
  RESERVADO: 'RESERVADO',
  MANTENIMIENTO: 'MANTENIMIENTO',
};

// Colores por estado de espacio
export const COLORES_ESTADO_ESPACIO = {
  DISPONIBLE: '#10B981', // Verde
  OCUPADO: '#EF4444',    // Rojo
  RESERVADO: '#3B82F6',  // Azul
  MANTENIMIENTO: '#F59E0B', // Amarillo
};

// Líneas de metro
export const LINEAS_METRO = {
  L1: { nombre: 'Línea 1', color: '#DC2626' },
  L2: { nombre: 'Línea 2', color: '#F59E0B' },
  L3: { nombre: 'Línea 3', color: '#8B5CF6' },
  L4: { nombre: 'Línea 4', color: '#3B82F6' },
  L4A: { nombre: 'Línea 4A', color: '#06B6D4' },
  L5: { nombre: 'Línea 5', color: '#10B981' },
  L6: { nombre: 'Línea 6', color: '#8B5CF6' },
  L7: { nombre: 'Línea 7', color: '#F97316' },
};

export default {
  API_CONFIG,
  AUTH_CONFIG,
  RESERVA_CONFIG,
  ESTADOS_RESERVA,
  ESTADOS_ESPACIO,
  COLORES_ESTADO_ESPACIO,
  LINEAS_METRO,
};