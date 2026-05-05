import { supabase } from '../lib/supabase';

// ── REGISTRO — crear una cuenta nueva ──────────────────────────
const registrar = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  // data.user contiene info del usuario creado
  // data.session contiene el token de sesión
  if (error) throw error;
  return data;
};

// ── LOGIN — iniciar sesión con cuenta existente ─────────────────
const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;  // data.session, data.user
};

// ── LOGOUT — cerrar sesión ──────────────────────────────────────
const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// ── OBTENER USUARIO ACTUAL ──────────────────────────────────────
const obtenerUsuario = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;  // null si no hay sesión, objeto User si hay sesión
};

// ── ESCUCHAR CAMBIOS DE SESIÓN ──────────────────────────────────
// Este evento se dispara cuando el usuario hace login, logout,
// o cuando el token se renueva automáticamente
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Evento de auth:', event);  // SIGNED_IN, SIGNED_OUT, etc.
  console.log('Sesión:', session?.user?.email);
});

export const authService = {
  registrar,
  login,
  logout,
  obtenerUsuario,
};