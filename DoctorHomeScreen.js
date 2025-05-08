// DoctorHomeScreen.js

import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions
} from 'react-native';
import Constants from 'expo-constants';
import { PatientContext } from './PatientContext';

const { width, height } = Dimensions.get('window');

const DoctorHomeScreen = ({ navigation }) => {
  const { patients } = useContext(PatientContext);

  return (
    <ImageBackground
      source={require('./assets/FondoApp.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Text style={styles.title}>¡Bienvenido, Doctor!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('RegisterPatient')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Registrar Paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('PatientList')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Ver Pacientes</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Total de Pacientes: {patients.length}
        </Text>
      </View>
    </ImageBackground>
  );
};

export default DoctorHomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: '80%',
    paddingVertical: 15,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: 'rgba(32,201,151,0.9)', // verde turquesa
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,123,255,0.9)',  // azul intenso
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    color: '#FFF',
    marginTop: 30,
  },
});
