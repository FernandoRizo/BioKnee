// DoctorRegisterScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const API_BASE = 'http://10.0.0.6:3000'; // Ajusta si cambias tu host

const DoctorRegisterScreen = ({ navigation }) => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [nombres, setNombres]           = useState('');
  const [apellidoP, setApellidoP]       = useState('');
  const [apellidoM, setApellidoM]       = useState('');
  const [curp, setCurp]                 = useState('');
  const [cedula, setCedula]             = useState('');
  const [loading, setLoading]           = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    if (curp.length !== 18) {
      Alert.alert('Error', 'La CURP debe tener 18 caracteres');
      return;
    }
    if (!email || !password || !nombres || !apellidoP || !apellidoM || !curp || !cedula) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/register-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nombres,
          apellidoPaterno: apellidoP,
          apellidoMaterno: apellidoM,
          CURP: curp,
          NumeroCedula: cedula
        })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Registro exitoso', data.message || 'Doctor registrado');
        navigation.replace('LoginScreen');
      } else {
        Alert.alert('Error', data.error || 'Error en el registro');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo conectar al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('./assets/FondoApp.png')}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Text style={styles.title}>Registro de Doctores</Text>

        {[
          {value: email, setter: setEmail, placeholder: 'Correo electrónico', secure: false, keyboard: 'email-address'},
          {value: password, setter: setPassword, placeholder: 'Contraseña', secure: true},
          {value: confirmPassword, setter: setConfirm, placeholder: 'Confirmar contraseña', secure: true},
          {value: nombres, setter: setNombres, placeholder: 'Nombres'},
          {value: apellidoP, setter: setApellidoP, placeholder: 'Apellido Paterno'},
          {value: apellidoM, setter: setApellidoM, placeholder: 'Apellido Materno'},
          {value: curp, setter: setCurp, placeholder: 'CURP', maxLength: 18},
          {value: cedula, setter: setCedula, placeholder: 'Número de Cédula Profesional'}
        ].map((fld, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={fld.placeholder}
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={fld.value}
            onChangeText={fld.setter}
            secureTextEntry={fld.secure}
            keyboardType={fld.keyboard || 'default'}
            autoCapitalize="none"
            maxLength={fld.maxLength}
          />
        ))}

        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Registrarse</Text>
          }
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default DoctorRegisterScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.3
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: '#FFF',
    borderWidth: 1,
    color: '#FFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginBottom: 15
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: 'rgba(32,201,151,0.9)',
    borderWidth: 2,
    borderColor: '#FFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600'
  }
});
