import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './PatientRegisterScreen';
import RoleSelectionScreen from './RoleSelection';
import DoctorRegisterScreen from './DoctorRegisterScreen';
import PatientRegisterScreen from './PatientRegisterScreen';



const Stack = createNativeStackNavigator();

export default function App() {
  return (
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
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}
