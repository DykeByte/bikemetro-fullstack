import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_CONFIG, AUTH_CONFIG } from '../constants/config';

const getBaseURL = () => {
  if (Platform.OS === 'ios') {
    return API_CONFIG.BASE_URL_DEVICE;
  } else if (Platform.OS === 'android') {
    return API_CONFIG.BASE_URL_ANDROID;
  }
  return API_CONFIG.BASE_URL_DEVICE;
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const handleApiError = (error) => {
  if (error.response) {
    return {
      message: error.response.data.detail || error.response.data.message || 'Error desconocido',
      details: error.response.data,
    };
  } else if (error.request) {
    return {
      message: 'No se pudo conectar con el servidor',
      details: null,
    };
  }
  return {
    message: error.message || 'Error desconocido',
    details: null,
  };
};

export default apiClient;
