/**
 * Funciones para consumir los endpoints de la API
 * Archivo: src/api/endpoints.js
 */

import apiClient, { handleApiError } from './client';

// ==================== AUTENTICACIÓN ====================

/**
 * Registrar nuevo usuario
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register/', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Iniciar sesión
 */
export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Refrescar token
 */
export const refreshToken = async (refreshToken) => {
  try {
    const response = await apiClient.post('/auth/refresh/', {
      refresh: refreshToken,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== USUARIO ====================

/**
 * Obtener perfil del usuario actual
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/usuarios/me/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Actualizar perfil del usuario
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/usuarios/update_profile/', profileData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== ESTACIONES ====================

/**
 * Obtener lista de estaciones
 */
export const getEstaciones = async () => {
  try {
    const response = await apiClient.get('/estaciones/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener estaciones con espacios disponibles
 */
export const getEstacionesDisponibles = async () => {
  try {
    const response = await apiClient.get('/estaciones/disponibles/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener detalle de una estación
 */
export const getEstacionDetalle = async (estacionId) => {
  try {
    const response = await apiClient.get(`/estaciones/${estacionId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener espacios de una estación
 */
export const getEspaciosEstacion = async (estacionId) => {
  try {
    const response = await apiClient.get(`/estaciones/${estacionId}/espacios/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== RESERVAS ====================

/**
 * Crear nueva reserva
 */
export const createReserva = async (reservaData) => {
  try {
    const response = await apiClient.post('/reservas/', reservaData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener reservas activas
 */
export const getReservasActivas = async () => {
  try {
    const response = await apiClient.get('/reservas/activas/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener historial de reservas
 */
export const getHistorialReservas = async () => {
  try {
    const response = await apiClient.get('/reservas/historial/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener detalle de una reserva
 */
export const getReservaDetalle = async (reservaId) => {
  try {
    const response = await apiClient.get(`/reservas/${reservaId}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Confirmar reserva (escanear QR de entrada)
 */
export const confirmarReserva = async (reservaId, qrCode) => {
  try {
    const response = await apiClient.post(
      `/reservas/${reservaId}/confirmar/`,
      { qr_code: qrCode }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Finalizar reserva (escanear QR de salida)
 */
export const finalizarReserva = async (reservaId, qrCode) => {
  try {
    const response = await apiClient.post(
      `/reservas/${reservaId}/finalizar/`,
      { qr_code: qrCode }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Cancelar reserva
 */
export const cancelarReserva = async (reservaId) => {
  try {
    const response = await apiClient.post(`/reservas/${reservaId}/cancelar/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== PAGOS ====================

/**
 * Obtener historial de pagos
 */
export const getPagos = async () => {
  try {
    const response = await apiClient.get('/pagos/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== RESEÑAS ====================

/**
 * Crear reseña
 */
export const createResena = async (resenaData) => {
  try {
    const response = await apiClient.post('/resenas/', resenaData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener reseñas de una estación
 */
export const getResenasEstacion = async (estacionId) => {
  try {
    const response = await apiClient.get(`/resenas/?estacion=${estacionId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== NOTIFICACIONES ====================

/**
 * Obtener notificaciones
 */
export const getNotificaciones = async () => {
  try {
    const response = await apiClient.get('/notificaciones/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Marcar notificación como leída
 */
export const marcarNotificacionLeida = async (notificacionId) => {
  try {
    const response = await apiClient.post(
      `/notificaciones/${notificacionId}/marcar_leida/`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// ==================== SOPORTE ====================

/**
 * Crear ticket de soporte
 */
export const createTicket = async (ticketData) => {
  try {
    const response = await apiClient.post('/tickets/', ticketData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

/**
 * Obtener mis tickets
 */
export const getTickets = async () => {
  try {
    const response = await apiClient.get('/tickets/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

// Exportar todas las funciones
export default {
  // Auth
  register,
  login,
  refreshToken,
  // Usuario
  getProfile,
  updateProfile,
  // Estaciones
  getEstaciones,
  getEstacionesDisponibles,
  getEstacionDetalle,
  getEspaciosEstacion,
  // Reservas
  createReserva,
  getReservasActivas,
  getHistorialReservas,
  getReservaDetalle,
  confirmarReserva,
  finalizarReserva,
  cancelarReserva,
  // Pagos
  getPagos,
  // Reseñas
  createResena,
  getResenasEstacion,
  // Notificaciones
  getNotificaciones,
  marcarNotificacionLeida,
  // Soporte
  createTicket,
  getTickets,
};