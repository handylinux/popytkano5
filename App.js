import { Appearance } from 'react-native';

if (Appearance.removeChangeListener === undefined) {
  Appearance.removeChangeListener = () => {};
}

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { CharacterProvider } from './components/CharacterContext';

import CharacterScreen from './components/screens/CharacterScreen/CharacterScreen';
import EquipmentScreen from './components/screens/WeaponsAndArmorScreen/WeaponsAndArmorScreen';
import InventoryScreen from './components/screens/InventoryScreen/InventoryScreen';
import PerksAndTraitsScreen from './components/screens/PerksAndTraitsScreen/PerksAndTraitsScreen';
import HomeScreen from './components/screens/HomeScreen/HomeScreen';

const Tab = createMaterialTopTabNavigator();

function CharacterTabs({ onGoHome }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={onGoHome}>
          <Ionicons name="people-outline" size={18} color="#f0e68c" />
          <Text style={styles.backButtonText}>Персонажи</Text>
        </TouchableOpacity>
      </View>
      <Tab.Navigator
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => {
            let iconName;
            if (route.name === 'Персонаж') {
              iconName = focused ? 'person' : 'person-outline';
            } else if (route.name === 'Снаряжение') {
              iconName = focused ? 'shield' : 'shield-outline';
            } else if (route.name === 'Инвентарь') {
              iconName = focused ? 'briefcase' : 'briefcase-outline';
            } else if (route.name === 'Перки') {
              iconName = focused ? 'star' : 'star-outline';
            }
            return <Ionicons name={iconName} size={16} color={color} />;
          },
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#5a5a5a',
          },
          tabBarActiveTintColor: '#f0e68c',
          tabBarInactiveTintColor: 'gray',
          tabBarShowIcon: true,
          tabBarIndicatorStyle: { backgroundColor: '#f0e68c', height: 2 },
          swipeEnabled: true,
          animationEnabled: true,
          style: { backgroundColor: 'transparent' },
        })}
      >
        <Tab.Screen
          name="Персонаж"
          component={CharacterScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontSize: 11, textAlign: 'center' }}>Персонаж</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Снаряжение"
          component={EquipmentScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontSize: 11, textAlign: 'center' }}>Броня и оружие</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Инвентарь"
          component={InventoryScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontSize: 11, textAlign: 'center' }}>Инвентарь</Text>
            ),
          }}
        />
        <Tab.Screen
          name="Перки"
          component={PerksAndTraitsScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontSize: 11, textAlign: 'center' }}>Перки</Text>
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

function AppNavigator() {
  const [screen, setScreen] = useState('home');
  const [homeKey, setHomeKey] = useState(0);

  const goHome = () => {
    setScreen('home');
    setHomeKey(k => k + 1);
  };

  return (
    <ImageBackground
      source={require('./assets/bg.png')}
      style={styles.background}
      imageStyle={{ opacity: 0.3 }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {screen === 'home' ? (
          <HomeScreen
            key={homeKey}
            onCreateCharacter={() => setScreen('character')}
            onOpenCharacter={() => setScreen('character')}
          />
        ) : (
          <CharacterTabs onGoHome={goHome} />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

function App() {
  return (
    <PaperProvider>
      <SafeAreaProvider>
        <CharacterProvider>
          <NavigationContainer>
            <View style={{ flex: 1, backgroundColor: 'white' }}>
              <AppNavigator />
            </View>
          </NavigationContainer>
        </CharacterProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topBar: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#5a5a5a',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#5a5a5a',
  },
  backButtonText: {
    color: '#f0e68c',
    fontSize: 13,
    marginLeft: 6,
  },
});

export default App;
