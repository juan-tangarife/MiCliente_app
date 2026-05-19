import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* El grupo de pestañas es la raíz del flujo protegido */}
      <Stack.Screen name="(tabs)" />
      
      {/* Estas pantallas se abrirán en modo Stack (con animación de tarjeta encima) */}
      <Stack.Screen 
        name="cliente/[id]" 
        options={{ 
          animation: 'slide_from_right' // Animación nativa fluida
        }} 
      />
      <Stack.Screen 
        name="cliente/formulario" 
        options={{ 
          animation: 'slide_from_bottom' // Tipo modal hacia arriba
        }} 
      />
      <Stack.Screen 
        name="cliente/formulario-detalle" 
        options={{ 
          animation: 'slide_from_bottom' 
        }} 
      />
    </Stack>
  );
}