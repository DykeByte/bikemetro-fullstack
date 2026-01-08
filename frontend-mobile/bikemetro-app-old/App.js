import React, { createContext, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const Stack = createStackNavigator();
const AuthContext = createContext({});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authState, setAuthState] = useState({ isAuth: false, isLoading: false });

  const doLogin = (username, password) => {
    setAuthState({ isAuth: false, isLoading: true });
    
    setTimeout(() => {
      if (username && password) {
        setUser({ username, email: username + '@example.com' });
        setAuthState({ isAuth: true, isLoading: false });
        Alert.alert('Exito', 'Bienvenido');
      } else {
        Alert.alert('Error', 'Ingresa usuario y contrasena');
        setAuthState({ isAuth: false, isLoading: false });
      }
    }, 1000);
  };

  const doLogout = () => {
    Alert.alert('Cerrar Sesion', 'Estas seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { 
        text: 'Si', 
        onPress: () => {
          setUser(null);
          setAuthState({ isAuth: false, isLoading: false });
        }
      },
    ]);
  };

  const value = {
    user,
    isAuth: authState.isAuth,
    isLoading: authState.isLoading,
    doLogin,
    doLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

function LoginScreen({ navigation }) {
  const { doLogin, isLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    doLogin(username, password);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoText}>🚴</Text>
      </View>
      <Text style={styles.title}>BikeMetro</Text>
      <Text style={styles.subtitle}>Inicia sesion para continuar</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuario o email"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        editable={!isLoading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contrasena"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        editable={!isLoading}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Cargando...' : 'INICIAR SESION'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Registrate aqui</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RegisterScreen({ navigation }) {
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

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function HomeScreen() {
  const { user, doLogout } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bienvenido</Text>
      <Text style={styles.userText}>{user?.username}</Text>
      <Text style={styles.emailText}>{user?.email}</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Sesion Iniciada</Text>
        <Text style={styles.infoText}>
          El sistema funciona correctamente
        </Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={doLogout}>
        <Text style={styles.buttonText}>Cerrar Sesion</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ 
          title: 'BikeMetro',
          headerStyle: { backgroundColor: '#DC2626' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const auth = useAuth();
  const isAuthBoolean = Boolean(auth.isAuth);
  const isLoadingBoolean = Boolean(auth.isLoading);

  if (isLoadingBoolean === true) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.title}>Cargando...</Text>
      </View>
    );
  }

  return isAuthBoolean === true ? <MainNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  userText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
