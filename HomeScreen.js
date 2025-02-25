import React from 'react';
import {View,Text, StyleSheet, TouchableOpacity} from 'react-native';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Mensaje de Bienvenida */}
      <Text style={styles.welcomeText}>¡Bienvenido a BioKnee!</Text>

      {/* Botón para Iniciar Sesión */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LoginScreen')}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>
      

      {/* Texto para registrarse */}
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('RoleSelection')}>
          <Text style={styles.registerLink}>Registrarse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F9F9F9',
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#333',
    },
    button: {
      backgroundColor: '#007BFF',
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 8,
      marginVertical: 10,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    registerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
    registerText: {
      fontSize: 14,
      color: '#555',
    },
    registerLink: {
      fontSize: 14,
      color: '#007BFF',
      textDecorationLine: 'underline',
    },
  });