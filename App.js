import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './PatientRegisterScreen';
import RoleSelectionScreen from './RoleSelection';
import DoctorRegisterScreen from './DoctorRegisterScreen';
import PatientRegisterScreen from './PatientRegisterScreen';
import { PatientProvider } from './PatientContext';
import DoctorHomeScreen from './DoctorHomeScreen';
import RegisterPatientScreen from './RegisterPatientScreen';
import PatientListScreen from './PatientListScreen';
import PatientDetailScreen from './PatientDetailScreen';
import AngleResultScreen from './AngleResultScreen';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PatientProvider>
    <NavigationContainer>
     
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="LoginScreen" 
          component={LoginScreen} 
          options={{ headerShown:false }}
        />
        <Stack.Screen
          name='RegisterScreen'
          component={RegisterScreen}
          options={{headerShown:false}}
        />
        <Stack.Screen
          name='RoleSelection'
          component={RoleSelectionScreen}
          options={{headerShown:false}}
        />
        <Stack.Screen
          name='DoctorRegisterScreen'
          component={DoctorRegisterScreen}
          options={{headerShown:false}}
        />
        <Stack.Screen
          name='PatientRegisterScreen'
          component={PatientRegisterScreen}
          options={{headerShown: false}}
        
        />
        <Stack.Screen name="DoctorHomeScreen" component={DoctorHomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterPatient" component={RegisterPatientScreen} options={{ title: 'Registrar Paciente' }} />
        <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: 'Mis Pacientes' }} />
        <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Detalle del Paciente' }} />
        <Stack.Screen name='AngleResult' component={AngleResultScreen} options={{title: "Resultados"}}/>
        
      </Stack.Navigator>
    </NavigationContainer>
    </PatientProvider>
  );
}
