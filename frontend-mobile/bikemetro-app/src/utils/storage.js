import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_CONFIG } from '../constants/config';

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(AUTH_CONFIG.TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error al guardar token:', error);
    return false;
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
  } catch (error) {
    console.error('Error al obtener token:', error);
    return null;
  }
};

export const saveSession = async (tokens, user) => {
  try {
    await AsyncStorage.multiSet([
      [AUTH_CONFIG.TOKEN_KEY, tokens.access],
      [AUTH_CONFIG.REFRESH_TOKEN_KEY, tokens.refresh],
      [AUTH_CONFIG.USER_KEY, JSON.stringify(user)],
    ]);
    return true;
  } catch (error) {
    console.error('Error al guardar sesion:', error);
    return false;
  }
};

export const getSession = async () => {
  try {
    const values = await AsyncStorage.multiGet([
      AUTH_CONFIG.TOKEN_KEY,
      AUTH_CONFIG.REFRESH_TOKEN_KEY,
      AUTH_CONFIG.USER_KEY,
    ]);

    return {
      token: values[0][1],
      refreshToken: values[1][1],
      user: values[2][1] ? JSON.parse(values[2][1]) : null,
    };
  } catch (error) {
    console.error('Error al obtener sesion:', error);
    return { token: null, refreshToken: null, user: null };
  }
};

export const clearSession = async () => {
  try {
    await AsyncStorage.multiRemove([
      AUTH_CONFIG.TOKEN_KEY,
      AUTH_CONFIG.REFRESH_TOKEN_KEY,
      AUTH_CONFIG.USER_KEY,
    ]);
    return true;
  } catch (error) {
    console.error('Error al limpiar sesion:', error);
    return false;
  }
};
