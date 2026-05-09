// lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const SUPABASE_URL  = 'https://gcneemetghylujlglatc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjbmVlbWV0Z2h5bHVqbGdsYXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzUxNzMsImV4cCI6MjA4NzA1MTE3M30.0nDWOrEij_IDowoIsjNxGPcjkMqrF1GGmzXghO4xNFM';

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
