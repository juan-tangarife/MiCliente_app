import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
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
      }}
    >
      {/* 🏠 1. PESTAÑA: INDEX */}
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* ➕ 2. PESTAÑA: OPCIONES */}
      <Tabs.Screen
        name="opciones"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <IconSymbol size={32} name="plus" color={color} />,
        }}
      />

      {/* 🧪 3. PESTAÑA: PRUEBA (Mencionas que la quieres aquí) */}
      <Tabs.Screen
        name="prueba"
        options={{
          title: '',
          // Puedes cambiar "play.circle.fill" por el icono que prefieras de tu IconSymbol
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="play.circle.fill" color={color} />, 
        }}
      />

      {/* 🚫 AQUÍ SE ELIMINARON LOS HUECOS: 
          Sacamos 'cliente/[id]', 'cliente/formulario' y 'cliente/formulario-detalle' de la barra.
          Al no declararlas aquí, Expo Router entiende que pertenecen al flujo general,
          pero no alteran el espacio ni la simetría de los tres botones de abajo. */}
    </Tabs>
  );
}