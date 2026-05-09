// app/_layout.tsx
import { JosefinSans_400Regular, JosefinSans_700Bold, useFonts, } from '@expo-google-fonts/josefin-sans';
import type { Session } from '@supabase/supabase-js';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession]   = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);
  const router   = useRouter();
  const segments = useSegments();  // ruta actual como array
  const [loaded] = useFonts({
    JosefinSans_400Regular,
    JosefinSans_700Bold,
  });

  useEffect(() => {
    // 1. Verificar si ya hay una sesión guardada al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCargando(false);
    });

    // 2. Escuchar cambios de sesión (login, logout, renovación)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );
    // 3. Limpiar la suscripción al desmontar
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded && !cargando) {
      SplashScreen.hideAsync();
    }
  }, [loaded, cargando]);

  useEffect(() => {
    if (cargando || !loaded) return;

    // ¿Estamos en una ruta de auth?
    const enAuth = segments[0] === '(auth)';

    if (!session && !enAuth) {
      // No hay sesión y no estamos en auth → ir al login
      router.replace('/(auth)/login');
    } else if (session && enAuth) {
      // Hay sesión y estamos en auth → ir a la app
      router.replace('/(app)');
    }
  }, [session, cargando, loaded, segments]);

  // No renderizar nada mientras verifica la sesión
  if (cargando || !loaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(auth)' />
      <Stack.Screen name='(app)'  />
    </Stack>
  );
}
