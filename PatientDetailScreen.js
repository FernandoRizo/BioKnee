// PatientDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Detectar IP del host Expo
const { manifest } = Constants;
const host = manifest?.debuggerHost?.split(':').shift();
const API_BASE = host ? `http://${host}:5000` : 'http://10.0.0.6:5000';

const PatientDetailScreen = ({ route }) => {
  const { patient } = route.params;
  const [original, setOriginal] = useState(null);
  const [mask,     setMask]     = useState(null);
  const [overlay,  setOverlay]  = useState(null);
  const [angleQ,   setAngleQ]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  // Carga inicial de URIs almacenadas
  useEffect(() => {
    (async () => {
      try {
        const o = await AsyncStorage.getItem(`patient_image_original_${patient._id}`);
        const m = await AsyncStorage.getItem(`patient_mask_${patient._id}`);
        const ov = await AsyncStorage.getItem(`patient_overlay_${patient._id}`);
        const a = await AsyncStorage.getItem(`patient_angle_${patient._id}`);
        if (o) setOriginal(o);
        if (m) setMask(m);
        if (ov) setOverlay(ov);
        if (a) setAngleQ(parseFloat(a));
      } catch (e) {
        console.error('Error cargando datos:', e);
      }
    })();
  }, [patient._id]);

  // Seleccionar y copiar imagen a almacenamiento local
  const pickAndSaveImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permiso denegado', 'Debes permitir acceso a la galería.');
      return null;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (res.canceled || !res.assets?.length) return null;
    const uri = res.assets[0].uri;
    const name = uri.split('/').pop();
    const dest = FileSystem.documentDirectory + name;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (e) {
      console.error('Error copiando imagen:', e);
      Alert.alert('Error', 'No se pudo guardar la imagen localmente.');
      return null;
    }
  };

  // Llamada al servidor para segmentar + overlay + ángulo
  const handleProcessImage = async () => {
    setLoading(true);
    try {
      const uri = await pickAndSaveImage();
      if (!uri) return;

      // Guardar original
      setOriginal(uri);
      await AsyncStorage.setItem(`patient_image_original_${patient._id}`, uri);

      // Preparar form-data
      const form = new FormData();
      form.append('image', { uri, name: 'mri.jpg', type: 'image/jpeg' });

      // POST /segment
      const resp = await fetch(`${API_BASE}/segment`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
        body: form
      });
      const j = await resp.json();
      if (!resp.ok) {
        throw new Error(j.error || 'Error segmentando');
      }

      // Construir URIs data:
      const maskUri    = `data:image/png;base64,${j.mask_png_b64}`;
      const overlayUri = `data:image/png;base64,${j.overlay_png_b64}`;

      // Guardar y mostrar
      setMask(maskUri);
      setOverlay(overlayUri);
      await AsyncStorage.setItem(`patient_mask_${patient._id}`, maskUri);
      await AsyncStorage.setItem(`patient_overlay_${patient._id}`, overlayUri);

      if (j.angle_q != null) {
        setAngleQ(j.angle_q);
        await AsyncStorage.setItem(`patient_angle_${patient._id}`, j.angle_q.toString());
      }
    } catch (e) {
      console.error('Error en segmentación:', e);
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalles del Paciente</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Nombre:</Text>
        <Text style={styles.value}>{patient.fullName}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Correo:</Text>
        <Text style={styles.value}>{patient.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>CURP:</Text>
        <Text style={styles.value}>{patient.curp}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleProcessImage}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>
              {original ? 'Reprocesar Imagen' : 'Cargar y Procesar Imagen'}
            </Text>
        }
      </TouchableOpacity>

      {/* Imagen Original */}
      {original && (
        <View style={styles.imageBlock}>
          <Text style={styles.subtitle}>Imagen Original</Text>
          <Image source={{ uri: original }} style={styles.image} />
        </View>
      )}

      {/* Máscara Cruda */}
      {mask && (
        <View style={styles.imageBlock}>
          <Text style={styles.subtitle}>Máscara Segmentada</Text>
          <ScrollView horizontal>
            <Image source={{ uri: mask }} style={styles.image} />
          </ScrollView>
        </View>
      )}

      {/* Overlay con Centroides + Ángulo */}
      {overlay && (
        <View style={styles.imageBlock}>
          <Text style={styles.subtitle}>Centroides y Ángulo</Text>
          <ScrollView horizontal>
            <Image source={{ uri: overlay }} style={styles.image} />
          </ScrollView>
        </View>
      )}

      {/* Ángulo Q */}
      {angleQ != null && (
        <Text style={styles.angleText}>Ángulo Q: {angleQ.toFixed(1)}°</Text>
      )}
    </ScrollView>
  );
};

export default PatientDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F6FA',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    alignItems: 'center',
  },
  label: {
    width: 100,
    fontSize: 18,
    fontWeight: '600',
    color: '#555',
  },
  value: {
    fontSize: 18,
    color: '#777',
    flex: 1,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  imageBlock: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  angleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#28A745',
    marginTop: 10,
  },
});
