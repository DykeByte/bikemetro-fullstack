/**
 * Pantalla de Registro
 * Archivo: src/screens/Auth/RegisterScreen.js
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import COLORS from '../../constants/colors';

export default function RegisterScreen({ navigation }) {
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    nickname: '',
    nombre: '',
    email: '',
    rut: '',
    telefono: '',
    password: '',
    password_confirm: '',
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatRUT = (value) => {
    // Eliminar caracteres no válidos
    const clean = value.replace(/[^0-9kK]/g, '');
    
    if (clean.length <= 1) return clean;
    
    // Agregar guión antes del dígito verificador
    const rut = clean.slice(0, -1);
    const dv = clean.slice(-1);
    
    return `${rut}-${dv}`;
  };

  const handleRUTChange = (value) => {
    const formatted = formatRUT(value);
    handleChange('rut', formatted);
  };

  const formatPhone = (value) => {
    // Eliminar caracteres no válidos
    const clean = value.replace(/[^0-9+]/g, '');
    
    // Si no empieza con +, agregar +56
    if (clean && !clean.startsWith('+')) {
      return `+56${clean}`;
    }
    
    return clean;
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhone(value);
    handleChange('telefono', formatted);
  };

  const validate = () => {
    const newErrors = {};

    // Nickname
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'El nickname es obligatorio';
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = 'El nickname debe tener al menos 3 caracteres';
    }

    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // RUT
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es obligatorio';
    } else if (!rutRegex.test(formData.rut)) {
      newErrors.rut = 'Formato de RUT inválido (ej: 12345678-9)';
    }

    // Teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio';
    } else if (formData.telefono.length < 10) {
      newErrors.telefono = 'Teléfono inválido';
    }

    // Contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    // Confirmar contraseña
    if (!formData.password_confirm) {
      newErrors.password_confirm = 'Confirma tu contraseña';
    } else if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    const result = await register(formData);

    if (!result.success) {
      Alert.alert('Error', result.message || 'Error al registrarse');
    }
    // Si es exitoso, el AuthContext manejará la redirección
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Completa tus datos para registrarte</Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Nickname */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nickname *</Text>
            <TextInput
              style={[styles.input, errors.nickname && styles.inputError]}
              placeholder="Tu apodo único"
              value={formData.nickname}
              onChangeText={(value) => handleChange('nickname', value)}
              autoCapitalize="none"
              editable={!!loading === false}
            />
            {errors.nickname && (
              <Text style={styles.errorText}>{errors.nickname}</Text>
            )}
          </View>

          {/* Nombre */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo *</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
              autoCapitalize="words"
              editable={!!loading === false}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="ejemplo@mail.com"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!!loading === false}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* RUT */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT *</Text>
            <TextInput
              style={[styles.input, errors.rut && styles.inputError]}
              placeholder="12345678-9"
              value={formData.rut}
              onChangeText={handleRUTChange}
              keyboardType="numeric"
              editable={!!loading === false}
              maxLength={10}
            />
            {errors.rut && (
              <Text style={styles.errorText}>{errors.rut}</Text>
            )}
          </View>

          {/* Teléfono */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="+56912345678"
              value={formData.telefono}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              editable={!!loading === false}
            />
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono}</Text>
            )}
          </View>

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry={true}
              autoCapitalize="none"
              editable={!!loading === false}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirmar Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <TextInput
              style={[styles.input, errors.password_confirm && styles.inputError]}
              placeholder="Repite tu contraseña"
              value={formData.password_confirm}
              onChangeText={(value) => handleChange('password_confirm', value)}
              secureTextEntry={true}
              autoCapitalize="none"
              editable={!!loading === false}
            />
            {errors.password_confirm && (
              <Text style={styles.errorText}>{errors.password_confirm}</Text>
            )}
          </View>

          {/* Botón de Registro */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>REGISTRARSE</Text>
            )}
          </TouchableOpacity>

          {/* Link a Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={!!loading}
            >
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: COLORS.textLight,
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});