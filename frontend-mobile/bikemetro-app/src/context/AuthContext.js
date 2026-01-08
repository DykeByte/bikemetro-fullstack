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
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await storage.getSession();
      
      if (session.token && session.user) {
        setUser(session.user);
        setAuthState({ isAuthenticated: true, isLoading: false });
        
        const profileResult = await api.getProfile();
        if (profileResult.success) {
          setUser(profileResult.data);
          await storage.saveSession(
            { access: session.token, refresh: session.refreshToken },
            profileResult.data
          );
        } else {
          await handleLogout();
        }
      } else {
        setAuthState({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error verificando auth:', error);
      setAuthState({ isAuthenticated: false, isLoading: false });
    }
  };

  const login = async (credentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const result = await api.login(credentials);
      
      if (result.success) {
        const { access, refresh } = result.data;
        
        await storage.saveSession({ access, refresh }, {});
        
        const profileResult = await api.getProfile();
        
        if (profileResult.success) {
          setUser(profileResult.data);
          await storage.saveSession({ access, refresh }, profileResult.data);
          setAuthState({ isAuthenticated: true, isLoading: false });
          return { success: true };
        }
      }
      
      setAuthState({ isAuthenticated: false, isLoading: false });
      return {
        success: false,
        message: result.error?.message || 'Credenciales invalidas',
      };
    } catch (error) {
      console.error('Error en login:', error);
      setAuthState({ isAuthenticated: false, isLoading: false });
      return {
        success: false,
        message: 'Error al iniciar sesion',
      };
    }
  };

  const register = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const result = await api.register(userData);
      
      if (result.success) {
        const loginResult = await login({
          username: userData.nickname,
          password: userData.password,
        });
        return loginResult;
      }
      
      setAuthState({ isAuthenticated: false, isLoading: false });
      
      let message = 'Error al registrarse';
      if (result.error?.details) {
        const errors = result.error.details;
        const errorMessages = [];
        Object.keys(errors).forEach((key) => {
          if (Array.isArray(errors[key])) {
            errorMessages.push(key + ': ' + errors[key].join(', '));
          } else {
            errorMessages.push(key + ': ' + errors[key]);
          }
        });
        message = errorMessages.join('\n');
      } else {
        message = result.error?.message || message;
      }
      
      return { success: false, message };
    } catch (error) {
      console.error('Error en registro:', error);
      setAuthState({ isAuthenticated: false, isLoading: false });
      return {
        success: false,
        message: 'Error al registrarse',
      };
    }
  };

  const logout = () => {
    Alert.alert(
      'Cerrar Sesion',
      'Estas seguro que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Si, cerrar sesion', style: 'destructive', onPress: handleLogout },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      await storage.clearSession();
      setUser(null);
      setAuthState({ isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Error al cerrar sesion:', error);
    }
  };

  const value = {
    user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
