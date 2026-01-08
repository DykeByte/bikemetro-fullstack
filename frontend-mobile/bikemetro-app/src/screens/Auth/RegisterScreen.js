import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import COLORS from '../../constants/colors';

export default function RegisterScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <Text style={styles.subtitle}>Proximamente...</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Volver a Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
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
    marginBottom: 30,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
