import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  StatusBar,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');
const { manifest } = Constants;
const background = require('./assets/FondoApp.png');

const PatientListScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return Alert.alert("Error", "No se encontró token");
        const res = await fetch("http://10.0.0.6:3000/patients", {
          headers: { "Authorization": "Bearer " + token }
        });
        const data = await res.json();
        setPatients(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPatients();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('PatientDetail', { patient: item })}
      activeOpacity={0.8}
    >
      <Text style={styles.itemText}>{ item.fullName || item.email }</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={background}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <Text style={styles.title}>Mis Pacientes</Text>
        <FlatList
          data={patients}
          keyExtractor={item => item._id || item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      </View>
    </ImageBackground>
  );
};

export default PatientListScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width,
    height,
  },
  backgroundImage: {
    resizeMode: 'cover',
    opacity: 0.2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  itemText: {
    fontSize: 18,
    color: '#333',
  },
});
