import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import * as api from '../api/endpoints';
import * as storage from '../utils/storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const session = await storage.getSession();
      
      if (session.token && session.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        
        const profileResult = await api.getProfile();
        if (profileResult.success) {
          setUser(profileResult.data);
          await storage.saveUser(profileResult.data);
        } else {
          await handleLogout();
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      await handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const result = await api.login(credentials);
      
      if (result.success) {
        const { access, refresh } = result.data;
        await storage.saveSession({ access, refresh }, {});
        
        const profileResult = await api.getProfile();
        if (profileResult.success) {
          setUser(profileResult.data);
          setIsAuthenticated(true);
          await storage.saveUser(profileResult.data);
          return { success: true };
        } else {
          throw new Error('No se pudo obtener el perfil del usuario');
        }
      } else {
        return {
          success: false,
          message: result.error.message || 'Credenciales inválidas',
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const result = await api.register(userData);
      
      if (result.success) {
        const loginResult = await login({
          username: userData.nickname,
          password: userData.password,
        });
        return loginResult;
      } else {
        let message = 'Error al registrarse';
        if (result.error.details) {
          const errors = result.error.details;
          const errorMessages = [];
          Object.keys(errors).forEach((key) => {
            if (Array.isArray(errors[key])) {
              errorMessages.push(`${key}: ${errors[key].join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${errors[key]}`);
            }
          });
          message = errorMessages.join('\n');
        } else {
          message = result.error.message;
        }
        return { success: false, message };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        success: false,
        message: error.message || 'Error al registrarse',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar sesión', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await storage.clearSession();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const result = await api.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.data);
        await storage.saveUser(result.data);
        return { success: true };
      } else {
        return {
          success: false,
          message: result.error.message || 'Error al actualizar perfil',
        };
      }
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar perfil',
      };
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const result = await api.getProfile();
      if (result.success) {
        setUser(result.data);
        await storage.saveUser(result.data);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      return { success: false };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
