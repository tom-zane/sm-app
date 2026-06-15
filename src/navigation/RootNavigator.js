import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import { AccountsProvider } from '../context/AccountsContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <AccountsProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainApp" component={AppNavigator} />
      </Stack.Navigator>
    </AccountsProvider>
  );
}