export const API_CONFIG = {
  BASE_URL_IOS: 'http://localhost:8000/api',
  BASE_URL_ANDROID: 'http://10.0.2.2:8000/api',
  BASE_URL_DEVICE: 'http://192.168.1.9:8000/api',
  TIMEOUT: 10000,
};

export const AUTH_CONFIG = {
  TOKEN_KEY: '@bikemetro_token',
  REFRESH_TOKEN_KEY: '@bikemetro_refresh_token',
  USER_KEY: '@bikemetro_user',
};

export const ESTADOS_ESPACIO = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADO: 'OCUPADO',
  RESERVADO: 'RESERVADO',
  MANTENIMIENTO: 'MANTENIMIENTO',
};

export const COLORES_ESTADO_ESPACIO = {
  DISPONIBLE: '#10B981',
  OCUPADO: '#EF4444',
  RESERVADO: '#3B82F6',
  MANTENIMIENTO: '#F59E0B',
};
