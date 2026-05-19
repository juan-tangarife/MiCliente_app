import ClienteCard from '@/components/clienteCard';
import { buscarClientes, Cliente, obtenerClientes } from '@/database/supabaseClientes';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
export default function EjemploView() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [refrescando, setRefrescando] = useState(false);
  
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);

  

  const cargar = useCallback(async () => {
    // Solo activamos el indicador de carga si no hay una búsqueda en proceso
    if (busqueda.trim() === '') {
      setCargando(true);
    }
    try {
      const datos = await obtenerClientes();
      setClientes(datos);
    } catch (error) {
      console.error("Error al obtener clientes en index:", error);
    } finally {
      setCargando(false);
    }
  }, [busqueda]);

  const refrescar = useCallback(async () => {
    const datos = await obtenerClientes();
    setClientes(datos);
  }, []);

    useEffect(() => {
    cargar();
    }, []);

  // Búsqueda en tiempo real con debounce simple
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (busqueda.trim() === '') {
        cargar();
      } else {
        const resultados = await buscarClientes(busqueda.trim());
        setClientes(resultados);
      }
    }, 300);  // espera 300ms antes de buscar (evita buscar cada tecla)
    return () => clearTimeout(timer);
  }, [busqueda]);

  const onRefresh = async () => {
      setRefrescando(true); 
      await refrescar();
      setRefrescando(false);
  };

  const logOut = () => {
    supabase.auth.signOut().then(() => {
      setUsuario(null);
      Alert.alert('Sesión cerrada', 'Has cerrado sesión exitosamente.');
    }); 
  }

  const handleLogout = () => {
    Alert.alert('¿Deseas cerrar sesión?', 'Al cerrar sesión volverás a la pantalla de iniciar sesión.', [
      { text: 'Cerrar sesión',  onPress: () => logOut() },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.contenedor}>
      <TouchableOpacity onPress={handleLogout} disabled={!usuario}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/LittleIcono.png')}
            style={styles.logo}
          />
          <Text style={styles.nombre}>Hola, {usuario?.user_metadata?.nombre || 'Usuario'}</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.searchView}>
        <Image
          source={require('@/assets/images/buscar.png')}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Buscar"
          placeholderTextColor="#808080"
          value={busqueda}
          onChangeText={setBusqueda}
        />
      </View>
      {cargando ? (
        <ActivityIndicator size='large' color='#E6000D' style={{ marginTop:60 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={item => item.nit}
          renderItem={({ item }) => (
            <ClienteCard cliente={item} onPress={() => router.push(`/cliente/${item.nit}`)} />
          )}
          contentContainerStyle={{ paddingTop:8, paddingBottom:90 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
                refreshing={refrescando}
                onRefresh={onRefresh}
                colors={['#E6000D']}
                tintColor={'#E6000D'} 
            />
          }
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
  contenedor: { flex: 1, backgroundColor: '#EFEFEF', padding: 15, marginTop: 40 },
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
