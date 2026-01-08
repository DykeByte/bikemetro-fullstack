/**
 * Utilidades para manejo de AsyncStorage
 * Archivo: src/utils/storage.js
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG } from '../constants/config';

/**
 * Guardar token de acceso
 */
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error al guardar token:', error);
    return false;
  }
};

/**
 * Obtener token de acceso
 */
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

/**
 * Guardar refresh token
 */
export const saveRefreshToken = async (refreshToken) => {
  try {
    await AsyncStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
    return true;
  } catch (error) {
    console.error('Error al guardar refresh token:', error);
    return false;
  }
};

/**
 * Obtener refresh token
 */
export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_CONFIG.REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error al obtener refresh token:', error);
    return null;
  }
};

/**
 * Guardar datos del usuario
 */
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(AUTH_CONFIG.USER_KEY, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    return false;
  }
};

/**
 * Obtener datos del usuario
 */
export const getUser = async () => {
  try {
    const userStr = await AsyncStorage.getItem(AUTH_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return null;
  }
};

/**
 * Guardar sesión completa (token, refresh token y usuario)
 */
export const saveSession = async (tokens, user) => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_CONFIG.TOKEN_KEY, tokens.access],
      [AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refresh],
      [AUTH_CONFIG.USER_KEY, JSON.stringify(user)],
    ]);
    return true;
  } catch (error) {
    console.error('Error al guardar sesión:', error);
    return false;
  }
};

/**
 * Obtener sesión completa
 */
export const getSession = async () => {
  try {
    const values = await AsyncStorage.multiGet([
      AUTH_CONFIG.TOKEN_KEY,
      AUTH_CONFIG.REFRESH_TOKEN_KEY,
      AUTH_CONFIG.USER_KEY,
    ]);

    const token = values[0][1];
    const refreshToken = values[1][1];
    const userStr = values[2][1];

    return {
      token,
      refreshToken,
      user: userStr ? JSON.parse(userStr) : null,
    };
  } catch (error) {
    console.error('Error al obtener sesión:', error);
    return {
      token: null,
      refreshToken: null,
      user: null,
    };
  }
};

/**
 * Limpiar sesión (logout)
 */
export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove([
      AUTH_CONFIG.TOKEN_KEY,
      AUTH_CONFIG.REFRESH_TOKEN_KEY,
      AUTH_CONFIG.USER_KEY,
    ]);
    return true;
  } catch (error) {
    console.error('Error al limpiar sesión:', error);
    return false;
  }
};

/**
 * Verificar si hay sesión activa
 */
export const hasActiveSession = async () => {
  try {
    const token = await getToken();
    return token !== null;
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    return false;
  }
};

export default {
  saveToken,
  getToken,
  saveRefreshToken,
  getRefreshToken,
  saveUser,
  getUser,
  saveSession,
  getSession,
  clearSession,
  hasActiveSession,
};