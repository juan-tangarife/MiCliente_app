// app/(auth)/login.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [cargando,  setCargando]  = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');

  const handleLogin = async () => {
    // Validaciones básicas
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Completa todos los campos');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('El email no es válido');
      return;
    }

    setCargando(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setCargando(false);

    if (error) {
      // Supabase devuelve mensajes en inglés — los traducimos
      if (error.message === 'Invalid login credentials') {
        setErrorMsg('Email o contraseña incorrectos');
      } else {
        setErrorMsg(error.message);
      }
    }
    // Si no hay error, _layout.tsx detecta la sesión y redirige automáticamente
  };

  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.contenedor}>
        <View style={styles.header}>
          {/* Logo / Título */}
          <Image source={require('../../assets/images/BigIcono.png')} style={styles.logo} />
          <Text style={styles.titulo}>MiCliente</Text>
        </View>
        
        {/* Formulario */}
        <View style={styles.formulario}>
          <Text style={styles.subtitulo}>¡Bienvenido!</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder='Correo'
            placeholderTextColor='#808080'
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder='Contraseña'
            placeholderTextColor='#808080'
            secureTextEntry
          />

          {/* Mensaje de error */}
          {errorMsg ? (
            <Text style={styles.error}>{errorMsg}</Text>
          ) : null}

          {/* Botón de login */}
          <TouchableOpacity
            style={[styles.btnLogin, cargando && { opacity:0.7 }]}
            onPress={handleLogin}
            disabled={cargando}
          >
            <Text style={styles.btnLoginTexto}>
              {cargando ? 'Iniciando sesión...' : 'Ingresar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.help}>
            {/* Enlace a registro */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
            >
              <Text style={styles.linkTexto}>
                Crear cuenta
              </Text>
            </TouchableOpacity>
            <Text style={styles.linkTexto}>
              Ayuda
            </Text>
          </View>

          
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor:     { flex:1, justifyContent:'center', padding:28, backgroundColor:'#EFEFEF', },
  header: { flex: 6.5, justifyContent:'center', alignItems:'center' },
  logo:           { width:142, height:142, marginBottom:16 },
  titulo:         { fontSize:45, color:'#000',
                    textAlign:'center', marginBottom:6, fontFamily:'JosefinSans_400Regular' },
  subtitulo:      { fontSize:21, color:'#E6000D', opacity:0.51, fontFamily:'JosefinSans_400Regular' },
  formulario:     { gap:12, },
  input:          { backgroundColor:'#D9D9D9', borderRadius:50, padding:16, fontSize:18,
                    borderWidth:1, borderColor:'#e0e0e0', color:'#808080', fontFamily:'JosefinSans_400Regular' },
  error:          { color:'#E74C3C', fontSize:14, textAlign:'center', marginTop:4 },
  btnLogin:       { backgroundColor:'#ff0513', borderRadius:50, padding: 9,
                    alignItems:'center', marginTop:4, opacity:0.61 },
  btnLoginTexto:  { color:'#fff', fontSize:24, fontWeight:'600', fontFamily:'JosefinSans_700Bold' },
  help: { flexDirection:'row', justifyContent:'space-between', gap:4, marginTop:8, marginBottom: 16 },
  linkTexto:      { fontSize:20, color:'#E6000D', opacity:0.51, fontFamily:'JosefinSans_400Regular', textDecorationLine:'underline' },
});
