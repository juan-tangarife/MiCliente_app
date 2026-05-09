import ClienteCard from '@/components/clienteCard';
import { Cliente, obtenerClientes } from '@/database/supabaseClientes';
import { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
export default function EjemploView() {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);

  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);

  useEffect(() => {
    cargar();
    // Suscribirse a cambios en la tabla contactos
    const canal = supabase
      .channel('clientes_canal')         // nombre único del canal
      .on(
        'postgres_changes',               // tipo de evento
        {
          event: '*',                     // '*' = INSERT + UPDATE + DELETE
          schema: 'public',
          table: 'Cliente',
        },
        (payload) => {
          // Se ejecuta cada vez que hay un cambio en la tabla
          console.log('Cambio detectado:', payload.eventType);
          cargar(); // recargar contactos para mostrar los cambios
        }
      )
      .subscribe();

    // Cancelar la suscripción al salir de la pantalla
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const cargar = useCallback(async () => {
    setCargando(true);
    const datos = await obtenerClientes();
    setClientes(datos);
    setCargando(false);
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
      
      <View style={styles.searchView}>
        <Image
          source={require('../../assets/images/buscar.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar"
          placeholderTextColor="#808080"
        />
      </View>
      {cargando ? (
        <ActivityIndicator size='large' color='#2D9CDB' style={{ marginTop:60 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={item => item.nit}
          renderItem={({ item }) => (
            <ClienteCard cliente={item} onPress={() => {}} />
          )}
          contentContainerStyle={{ paddingTop:8, }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.vacio}>
              No tienes contactos aún 📭
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EFEFEF', padding: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 15
  },
  logo: { width: 60, height: 55 },
  nombre:{
    fontFamily: 'JosefinSans_400Regular', fontSize: 24, fontWeight: 'medium', padding: 10, alignContent: 'space-between'
  },
  searchView: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', borderRadius: 50, paddingHorizontal: 16, justifyContent: 'center', marginBottom: 8 },
  input: { backgroundColor:'#D9D9D9', borderRadius:50, paddingVertical:16, paddingHorizontal: 10, fontSize:18,
            color:'#808080', fontFamily:'JosefinSans_400Regular', flex: 1 },
  searchIcon: { width: 24, height: 24,},
  vacio: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#555', fontFamily: 'JosefinSans_400Regular' },
});
