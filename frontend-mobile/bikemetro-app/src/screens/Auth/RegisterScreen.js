import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import COLORS from '../../constants/colors';

export default function RegisterScreen({ navigation }) {
  const { register, isLoading } = useAuth();
  
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
    let formattedValue = value;
    
    // Formato automático para RUT
    if (field === 'rut') {
      formattedValue = formatRUT(value);
    }
    
    // Formato automático para teléfono
    if (field === 'telefono') {
      formattedValue = formatPhone(value);
    }
    
    setFormData({ ...formData, [field]: formattedValue });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const formatRUT = (value) => {
    // Remover caracteres no numéricos excepto K
    let rut = value.replace(/[^\dkK]/g, '');
    
    // Limitar a 9 caracteres
    if (rut.length > 9) {
      rut = rut.slice(0, 9);
    }
    
    // Agregar guión antes del último dígito si tiene más de 1 carácter
    if (rut.length > 1) {
      rut = rut.slice(0, -1) + '-' + rut.slice(-1);
    }
    
    return rut;
  };

  const formatPhone = (value) => {
    // Remover caracteres no numéricos excepto +
    let phone = value.replace(/[^\d+]/g, '');
    
    // Agregar +56 si no está
    if (!phone.startsWith('+56') && phone.length > 0) {
      phone = '+56' + phone.replace(/^\+?56?/, '');
    }
    
    // Limitar longitud
    if (phone.length > 12) {
      phone = phone.slice(0, 12);
    }
    
    return phone;
  };

  const validate = () => {
    const newErrors = {};
    
    // Nickname
    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Ingresa tu nickname';
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = 'Mínimo 3 caracteres';
    }
    
    // Nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Ingresa tu nombre';
    }
    
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Ingresa tu email';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // RUT
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    if (!formData.rut.trim()) {
      newErrors.rut = 'Ingresa tu RUT';
    } else if (!rutRegex.test(formData.rut)) {
      newErrors.rut = 'Formato: 12345678-9';
    }
    
    // Teléfono
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'Ingresa tu teléfono';
    } else if (formData.telefono.length < 11) {
      newErrors.telefono = 'Teléfono inválido';
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = 'Ingresa tu contraseña';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
    }
    
    // Password confirm
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
      Alert.alert('Error', result.message || 'No se pudo registrar');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>🚴</Text>
          </View>
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a BikeMetro</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nickname</Text>
            <TextInput
              style={[styles.input, errors.nickname && styles.inputError]}
              placeholder="Tu nombre de usuario"
              value={formData.nickname}
              onChangeText={(value) => handleChange('nickname', value)}
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.nickname && (
              <Text style={styles.errorText}>{errors.nickname}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Juan Pérez"
              value={formData.nombre}
              onChangeText={(value) => handleChange('nombre', value)}
              editable={!isLoading}
            />
            {errors.nombre && (
              <Text style={styles.errorText}>{errors.nombre}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="tu@email.com"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>RUT</Text>
            <TextInput
              style={[styles.input, errors.rut && styles.inputError]}
              placeholder="12345678-9"
              value={formData.rut}
              onChangeText={(value) => handleChange('rut', value)}
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.rut && (
              <Text style={styles.errorText}>{errors.rut}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="+56912345678"
              value={formData.telefono}
              onChangeText={(value) => handleChange('telefono', value)}
              keyboardType="phone-pad"
              editable={!isLoading}
            />
            {errors.telefono && (
              <Text style={styles.errorText}>{errors.telefono}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Mínimo 8 caracteres"
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Contraseña</Text>
            <TextInput
              style={[styles.input, errors.password_confirm && styles.inputError]}
              placeholder="Repite tu contraseña"
              value={formData.password_confirm}
              onChangeText={(value) => handleChange('password_confirm', value)}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
            />
            {errors.password_confirm && (
              <Text style={styles.errorText}>{errors.password_confirm}</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>CREAR CUENTA</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.footerLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 35,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
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
    marginBottom: 6,
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
    marginTop: 10,
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
