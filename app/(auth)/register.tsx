// app/(auth)/registro.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function Registro() {
  const router = useRouter();
  const [nombre,    setNombre]    = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando,  setCargando]  = useState(false);
  const [errorMsg,  setErrorMsg]  = useState('');
  const [exito,     setExito]     = useState(false);

  const handleRegistro = async () => {
    setErrorMsg('');

    // Validaciones
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Todos los campos son obligatorios');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('El email no es válido');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmar) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    setCargando(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { nombre: nombre.trim() },  // datos extra del usuario
      },
    });
    setCargando(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setErrorMsg('Este email ya está registrado');
      } else {
        setErrorMsg(error.message);
      }
    } else {
      setExito(true);  // mostrar mensaje de confirmación
    }
  };

  // Pantalla de éxito — verificar email
  if (exito) {
    return (
      <View style={styles.exitoCont}>
        <Text style={{ fontSize:64 }}>📧</Text>
        <Text style={styles.exitoTitulo}>¡Revisa tu email!</Text>
        <Text style={styles.exitoMsg}>
          Te enviamos un enlace de confirmación a {email}.
          Una vez confirmado, podrás iniciar sesión.
        </Text>
        <TouchableOpacity style={styles.btnLogin}
          onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.btnLoginTexto}>Ir al Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

    const handleAyuda = () =>{
        Alert.alert('Ayuda', 'Llame al ingeniero Juan José y le ayuda.');
      }
  

  return (
    <KeyboardAvoidingView style={{flex:1}}
      behavior={Platform.OS==='ios'?'padding':'height'}
    >
      <ScrollView contentContainerStyle={styles.contenedor}>
        <View style={styles.header}>
          {/* Logo / Título */}
          <Image source={require('../../assets/images/BigIcono.png')} style={styles.logo} />
          <Text style={styles.titulo}>MiCliente</Text>
        </View>
        

        <View style={styles.formulario}>
          <Text style={styles.subtitulo}>Creación de cuenta</Text>
          <TextInput style={styles.input} value={nombre}
            onChangeText={setNombre} placeholder='Nombre completo'
            placeholderTextColor='#808080' autoCapitalize='words' />
          <TextInput style={styles.input} value={email}
            onChangeText={setEmail} placeholder='Email'
            placeholderTextColor='#808080' keyboardType='email-address' autoCapitalize='none' />
          <TextInput style={styles.input} value={password}
            onChangeText={setPassword} placeholder='Contraseña (mínimo 6 caracteres)'
            placeholderTextColor='#808080' secureTextEntry />
          <TextInput style={styles.input} value={confirmar}
            onChangeText={setConfirmar} placeholder='Confirmar contraseña'
            placeholderTextColor='#808080' secureTextEntry />

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <TouchableOpacity style={[styles.btnLogin, cargando&&{opacity:0.7}]}
            onPress={handleRegistro} disabled={cargando}>
            <Text style={styles.btnLoginTexto}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.help}>
            <TouchableOpacity
              onPress={() => router.back()}>
              <Text style={styles.linkTexto}>
                Iniciar sesión
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAyuda}>
              <Text style={styles.linkTexto}>
                Ayuda
              </Text>
            </TouchableOpacity>
          </View>

          
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor:    { flex: 1, flexGrow:1, justifyContent:'center', padding:28, backgroundColor:'#EFEFEF' },
  header:        { flex: 3, justifyContent:'center', alignItems:'center' },
  titulo:        { fontSize:36, color:'#000', fontFamily:'JosefinSans_400Regular', marginTop:12 },
  logo:          { width:100, height:100},
  subtitulo:     { fontSize:20, color:'#E6000D', opacity:0.51, fontFamily:'JosefinSans_400Regular', alignItems:'center', marginTop: 50},
  formulario:    { gap:12, flex: 7 },
  input:         { backgroundColor:'#D9D9D9', borderRadius:50, padding:16, fontSize:18,
                    borderWidth:1, borderColor:'#e0e0e0', color:'#808080', fontFamily:'JosefinSans_400Regular' },
  error:         { color:'#E74C3C', fontSize:14, textAlign:'center' },
  btnLogin:      { backgroundColor:'#ff0513', borderRadius:50, padding: 9,
                  alignItems:'center', marginTop:4, opacity:0.61 },
  btnLoginTexto: { color:'#fff', fontSize:24, fontWeight:'600', fontFamily:'JosefinSans_700Bold' },
  help:          { flexDirection:'row', justifyContent:'space-between', gap:4, marginTop:8, marginBottom: 16 },
  linkTexto:      { fontSize:20, color:'#E6000D', opacity:0.51, fontFamily:'JosefinSans_400Regular', textDecorationLine:'underline' },
  exitoCont:     { flex:1, justifyContent:'center', alignItems:'center',
                   padding:32, backgroundColor:'#EFEFEF', gap:16 },
  exitoTitulo:   { fontSize:26, fontWeight:'bold', color:'#000', fontFamily:'JosefinSans_400Regular' },
  exitoMsg:      { fontSize:16, color:'#555', textAlign:'center', lineHeight:24, fontFamily:'JosefinSans_400Regular' },
});
