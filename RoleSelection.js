// RoleSelectionScreen.js

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  StatusBar,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

const RoleSelectionScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('./assets/FondoApp.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Text style={styles.title}>Selecciona tu rol</Text>

        <TouchableOpacity
          style={[styles.button, styles.patientButton]}
          onPress={() => navigation.navigate('PatientRegisterScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Paciente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.doctorButton]}
          onPress={() => navigation.navigate('DoctorRegisterScreen')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Médico</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  patientButton: {
    backgroundColor: 'rgba(32,201,151,0.8)',  // turquesa suave
  },
  doctorButton: {
    backgroundColor: 'rgba(32,144,230,0.8)',  // azul suave
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
