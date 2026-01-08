import apiClient, { handleApiError } from './client';

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login/', credentials);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register/', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/usuarios/me/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getEstaciones = async () => {
  try {
    const response = await apiClient.get('/estaciones/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getEspaciosEstacion = async (estacionId) => {
  try {
    const response = await apiClient.get('/estaciones/' + estacionId + '/espacios/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const createReserva = async (reservaData) => {
  try {
    const response = await apiClient.post('/reservas/', reservaData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};

export const getReservasActivas = async () => {
  try {
    const response = await apiClient.get('/reservas/activas/');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: handleApiError(error) };
  }
};
