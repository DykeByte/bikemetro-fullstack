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

export default function LoginScreen({ navigation }) {
  const { login, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Ingresa tu email, RUT o nickname';
    }
    if (!formData.password) {
      newErrors.password = 'Ingresa tu contrasena';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    const result = await login(formData);

    if (!result.success) {
      Alert.alert('Error', result.message || 'Credenciales invalidas');
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
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>🚴</Text>
            </View>
          </View>
          <Text style={styles.title}>BikeMetro</Text>
          <Text style={styles.subtitle}>Inicia sesion para continuar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email, RUT o Nickname</Text>
            <TextInput
              style={[styles.input, errors.username && styles.inputError]}
              placeholder="ejemplo@mail.com o 12345678-9"
              value={formData.username}
              onChangeText={(value) => handleChange('username', value)}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contrasena</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Ingresa tu contrasena"
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

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>INICIAR SESION</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>No tienes cuenta? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={isLoading}
            >
              <Text style={styles.footerLink}>Registrate aqui</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.testDataContainer}>
          <Text style={styles.testDataTitle}>Datos de prueba:</Text>
          <Text style={styles.testDataText}>Usuario: testuser</Text>
          <Text style={styles.testDataText}>Contrasena: test123</Text>
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
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
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
    padding: 16,
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
    marginTop: 24,
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
  testDataContainer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testDataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  testDataText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});
