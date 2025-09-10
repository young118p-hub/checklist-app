/**
 * 아맞다이거! - 체크리스트 앱
 * React Native 버전
 *
 * @format
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TemplateSelectionScreen } from './src/screens/TemplateSelectionScreen';
import { ChecklistDetailScreen } from './src/screens/ChecklistDetailScreen';

const Stack = createStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#dc2626"
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="TemplateSelection"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#dc2626',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="TemplateSelection" 
            component={TemplateSelectionScreen}
            options={{ 
              title: '아맞다이거! 📋',
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen 
            name="ChecklistDetail" 
            component={ChecklistDetailScreen}
            options={{ 
              headerTitleAlign: 'center',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
