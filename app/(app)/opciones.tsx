import { Cliente } from '@/database/supabaseClientes';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
export default function Opciones() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);

  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);



  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      setUsuario(null);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
    }); 
  };

  return (
    <View style={styles.contenedor}>
      <TouchableOpacity onPress={handleLogout} disabled={!usuario}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/LittleIcono.png')}
            style={styles.logo}
          />
          <Text style={styles.nombre}>Hola, {usuario?.user_metadata?.nombre || 'Usuario'}</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.title}>¿Qué quieres hacer?</Text>
      <View style={styles.linea} />
      <TouchableOpacity onPress={() => router.push('/cliente/formulario')}>
        <View style={styles.row}>
            <Image source={require('../../assets/images/anadir-amigo.png')} style={styles.icon} />
            <Text style={styles.textRow}>Agregar cliente</Text>
        </View>  
      </TouchableOpacity>
      <View style={styles.linea}></View>
      <TouchableOpacity>
        <View style={styles.row}>
            <Image source={require('../../assets/images/descargar.png')} style={styles.icon} />
            <Text style={styles.textRow}>Importar clientes</Text>
        </View>  
      </TouchableOpacity>
      <View style={styles.linea}></View>
      <TouchableOpacity>
        <View style={styles.row}>
            <Image source={require('../../assets/images/subir.png')} style={styles.icon} />
            <Text style={styles.textRow}>Exportar clientes</Text>
        </View>  
      </TouchableOpacity>
      <View style={styles.linea}></View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EFEFEF', padding: 15, marginTop: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 15
  },
  logo: { width: 60, height: 55 },
  nombre:{
    fontFamily: 'JosefinSans_400Regular', fontSize: 24, fontWeight: 'medium', padding: 10, alignContent: 'space-between'
  },
  vacio: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#555', fontFamily: 'JosefinSans_400Regular' },
  linea:            { height:1, backgroundColor:'#5D5D5D', marginVertical:8 },
  icon:             { width: 35, height: 35, marginBottom: 4, marginTop: 4, opacity:0.5 },
  row:             { flexDirection:'row', alignItems:'center', paddingHorizontal:16, },
  title:          { fontSize:24, fontFamily:'JosefinSans_700Bold', color: '#E6000D', opacity:0.5, marginTop:16 },
  textRow:         { fontSize:24, marginLeft:16, fontFamily:'JosefinSans_400Regular', color: '#5D5D5D', marginTop:4 },
});
