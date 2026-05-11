// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL  = process.env.SUPABASE_URL || '';
const SUPABASE_ANON = process.env.SUPABASE_ANON || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    // AsyncStorage guarda la sesión del usuario en el dispositivo
    // Así el usuario no tiene que hacer login cada vez que abre la app
    storage: Platform.OS === 'web' ? undefined : AsyncStorage,
    autoRefreshToken: true,   // renueva el token automáticamente
    persistSession:   true,   // guarda la sesión entre reinicios
    detectSessionInUrl: false, // necesario en React Native (no es web)
  },
});
