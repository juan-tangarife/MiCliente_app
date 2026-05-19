import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Mantiene la barra limpia sin textos
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF', // Icono de pestaña activa en blanco
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Icono inactivo con opacidad
      }}
    >
      {/* 🏠 PESTAÑA 1: Inicio (index.tsx) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={30} color={color} />
          ),
        }}
      />

      {/* ➕ 2. PESTAÑA: OPCIONES */}
      <Tabs.Screen
        name="opciones" // Apunta a tu archivo opciones.tsx
        options={{
          tabBarButton: (props) => (
            <TouchableOpacity
              {...(props as any)}
              activeOpacity={0.8}
              style={styles.contenedorBotonFlotante}
            >
              <View style={styles.botonFlotante}>
                <Ionicons name="add" size={40} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      {/* 🔔 PESTAÑA 3: Notificaciones / Prueba (prueba.tsx) */}
      <Tabs.Screen
        name="prueba"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="notifications-outline" size={30} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#E6000D', // Tu rojo corporativo
    borderTopWidth: 0,
    height: 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Ajuste para el notch de iPhone
    paddingTop: 8,
    position: 'absolute', // Permite que el botón central flote por fuera
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  contenedorBotonFlotante: {
    top: -33, // El truco mágico: Lo sube para que quede "volando" sobre la barra
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonFlotante: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#E6000D', // Círculo blanco de fondo
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra interna/externa para que se despegue del fondo
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
});