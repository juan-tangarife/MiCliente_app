import { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
export default function EjemploView() {
  const [usuario, setUsuario] = useState<User | null>(null);

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
            source={{ uri: 'https://picsum.photos/300/200' }}
            style={{ width: 50, height: 50 }}
            resizeMode='cover'
          />
          <Text style={styles.nombre}>Chinga tu madre</Text>
        </View>
      </TouchableOpacity>
      
      <View style={styles.searchBox}>
        <Image
          source={{ uri: 'https://picsum.photos/300/200' }}
          style={{ width: 50, height: 50 , borderRadius: 25}}
          resizeMode='cover'
        />
        <TextInput placeholder="Buscar" placeholderTextColor="#808080"></TextInput>
      </View>
      <View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EFEFEF', padding: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 15
  },
  nombre:{
    fontFamily: 'Comic Sans MS', fontSize: 24, fontWeight: 'medium', padding: 10, alignContent: 'space-between'
  },
  searchBox:   {backgroundColor: '#D9D9D9', borderRadius: 24, padding:10, marginBottom: 15, flexDirection: 'row' },
  tarjeta:    { backgroundColor: '#fff', padding: 20, borderRadius: 12,
                shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
});
