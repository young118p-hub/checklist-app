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
import { AuthScreen } from './src/screens/AuthScreen';
import { FriendSystemScreen } from './src/screens/FriendSystemScreen';
import { MyChecklistsScreen } from './src/screens/MyChecklistsScreen';

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
          initialRouteName="Auth"
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
            name="Auth" 
            component={AuthScreen}
            options={{ 
              title: '아맞다이거! 📋',
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen 
            name="TemplateSelection" 
            component={TemplateSelectionScreen}
            options={{ 
              title: '템플릿 선택',
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen 
            name="MyChecklists" 
            component={MyChecklistsScreen}
            options={{ 
              title: '내 체크리스트',
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
          <Stack.Screen 
            name="Friends" 
            component={FriendSystemScreen}
            options={{ 
              title: '친구 및 협업',
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
