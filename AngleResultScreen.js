import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AngleResultScreen = ({ route, navigation }) => {
  // Recibimos la URI original que se pasó en el route.params
  const { imageUri } = route.params;
  // Estados para la imagen original y para la imagen de resultado
  const [originalImageUri, setOriginalImageUri] = useState(imageUri);
  const [resultImageUri, setResultImageUri] = useState(null);

  // Cargar la imagen de resultado almacenada (si existe) al montar la pantalla
  useEffect(() => {
    const loadStoredResultImage = async () => {
      try {
        const storedResult = await AsyncStorage.getItem('result_image');
        if (storedResult) {
          setResultImageUri(storedResult);
        }
      } catch (error) {
        console.error("Error al cargar la imagen de resultado almacenada:", error);
      }
    };
    loadStoredResultImage();
  }, []);

  const handleLoadResultImage = async () => {
    // Solicitar permiso para acceder a la galería
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permiso denegado", "Debes permitir el acceso a la galería para cargar la imagen de resultado.");
      return;
    }
    
    // Abrir selector de imagen
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log("Respuesta de ImagePicker:", result);
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      // Extraer el nombre del archivo
      const fileName = selectedUri.split('/').pop();
      // Definir ruta destino persistente
      const newUri = FileSystem.documentDirectory + fileName;
      
      try {
        await FileSystem.copyAsync({
          from: selectedUri,
          to: newUri,
        });
        setResultImageUri(newUri);
        await AsyncStorage.setItem('result_image', newUri);
      } catch (error) {
        console.error("Error al copiar la imagen de resultado:", error);
        Alert.alert("Error", "No se pudo guardar la imagen de resultado localmente.");
      }
    } else {
      console.log("Selección cancelada o no se seleccionó imagen de resultado");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Resultado de la Predicción</Text>
      
      {originalImageUri && (
        <>
          <Text style={styles.subHeading}>Imagen original:</Text>
          <Image source={{ uri: originalImageUri }} style={styles.image} />
        </>
      )}
      
      {/* Mostrar el botón sólo si aún no se ha cargado la imagen de resultado */}
      {!resultImageUri && (
        <TouchableOpacity style={styles.button} onPress={handleLoadResultImage}>
          <Text style={styles.buttonText}>Calcular ángulo Q</Text>
        </TouchableOpacity>
      )}
      
      {resultImageUri && (
        <View style={styles.resultContainer}>
          <Image source={{ uri: resultImageUri }} style={styles.resultImage} />
          <Text style={styles.resultText}>Ángulo : 69.29°</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AngleResultScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F2F6FA',
    alignItems: 'center'
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  subHeading: {
    fontSize: 18,
    marginBottom: 10
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 20,
    resizeMode: 'cover'
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    width: '100%'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover'
  },
  resultText: {
    fontSize: 18,
    color: '#28A745'
  }
});
