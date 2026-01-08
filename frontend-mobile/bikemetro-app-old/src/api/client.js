/**
 * Cliente HTTP para la API de BikeMetro
 * Archivo: src/api/client.js
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG, AUTH_CONFIG } from '../constants/config';

// Determinar la URL base según la plataforma
const getBaseURL = () => {
  if (__DEV__) {
    // TEMPORAL: Forzar IP local para dispositivo físico
    // Comenta esta línea cuando uses simulador
    return 'http://192.168.1.9:8000/api'; 
    
    /* Código original comentado:
    if (Platform.OS === 'ios') {
      return API_CONFIG.BASE_URL_IOS;
    } else if (Platform.OS === 'android') {
      return API_CONFIG.BASE_URL_ANDROID;
    } else {
      return API_CONFIG.BASE_URL_DEVICE;
    }
    */
  } else {
    return API_CONFIG.BASE_URL_PRODUCTION;
  }
};

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a cada request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(
          AUTH_CONFIG.REFRESH_TOKEN_KEY
        );

        if (refreshToken) {
          // Intentar refrescar el token
          const response = await axios.post(
            `${getBaseURL()}/auth/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;

          // Guardar nuevo token
          await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_KEY, access);

          // Reintentar el request original
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar storage y redirigir a login
        await AsyncStorage.multiRemove([
          AUTH_CONFIG.TOKEN_KEY,
          AUTH_CONFIG.REFRESH_TOKEN_KEY,
          AUTH_CONFIG.USER_KEY,
        ]);
        // Aquí podrías emitir un evento para redirigir al login
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Función helper para manejar errores de la API
 */
export const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de error
    const { status, data } = error.response;
    
    if (status === 400) {
      return {
        message: 'Datos inválidos',
        details: data,
      };
    } else if (status === 401) {
      return {
        message: 'No autorizado. Por favor inicia sesión nuevamente.',
        details: data,
      };
    } else if (status === 403) {
      return {
        message: 'No tienes permisos para realizar esta acción.',
        details: data,
      };
    } else if (status === 404) {
      return {
        message: 'Recurso no encontrado.',
        details: data,
      };
    } else if (status >= 500) {
      return {
        message: 'Error del servidor. Intenta nuevamente más tarde.',
        details: data,
      };
    }
    
    return {
      message: data.detail || data.message || 'Error desconocido',
      details: data,
    };
  } else if (error.request) {
    // La petición se hizo pero no hubo respuesta
    return {
      message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
      details: null,
    };
  } else {
    // Algo pasó al configurar la petición
    return {
      message: error.message || 'Error desconocido',
      details: null,
    };
  }
};

/**
 * Función helper para formatear datos de formularios
 */
export const formatFormData = (data) => {
  // Eliminar campos vacíos o undefined
  return Object.keys(data).reduce((acc, key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      acc[key] = data[key];
    }
    return acc;
  }, {});
};

export default apiClient;