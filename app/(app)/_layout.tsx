import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#E6000D',
          borderTopWidth: 0,
          height: 60,
          paddingTop: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="opciones"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="plus" color={color} />,
        }}
      />
      <Tabs.Screen
        name='cliente/[id]'
        options={{
          tabBarButton: () => null,  // lo oculta de la barra
          tabBarStyle: { display: 'none' }, // oculta la barra cuando se muestra esta pantalla
        }}
      />
      <Tabs.Screen
        name='cliente/formulario'
        options={{
          tabBarButton: () => null,  // lo oculta de la barra
          tabBarStyle: { display: 'none' }, // oculta la barra cuando se muestra esta pantalla
        }}
      />
      <Tabs.Screen
        name='cliente/formulario-detalle'
        options={{
          tabBarButton: () => null,  // lo oculta de la barra
          tabBarStyle: { display: 'none' }, // oculta la barra cuando se muestra esta pantalla
        }}
      />
    </Tabs>
  );
}
