import { AcordionDinamico } from '@/components/acordionCard';
import { Acta, obtenerActaPorNumero } from '@/database/supabaseActas';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Cliente, obtenerClientePorNIT } from '../../../database/supabaseClientes';


export default function FormularioCliente() {
  // Obtenemos el ID si viene de la ruta de edición
  const { id } = useLocalSearchParams<{ id: string }>();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [acta, setActa] = useState<Acta | null>(null);
  const esEdicion = !!id;
  const tiposActa = ['Individual', 'Masiva'];

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
    }, []);

  useEffect(() => {
    if (esEdicion) {
      const clienteActual = obtenerClientePorNIT(id).then((data: Cliente | null) => {
        if (data) {
          setCliente(data);
          const actaActual = obtenerActaPorNumero(data.actaId).then((actaData: Acta | null) => {
            if (actaData) {
              setActa(actaData);
            }
          });
        }
      });
    }
    return () => {
      setCliente(null);
      setActa(null);
    };
  }, [id]);

  const guardar = () => {
    if (esEdicion) {
      // Lógica de UPDATE en Supabase
    } else {
      // Lógica de INSERT en Supabase
    }
  };

  return (
    <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <View style={styles.contenedor}>
        <View style={styles.header}>
            <Image
               source={require('../../../assets/images/LittleIcono.png')}
                style={styles.logo}
            />
            <TouchableOpacity onPress={router.back}>
                <Image
                    source={require('../../../assets/images/atras.png')}
                    style={styles.back}
                />
            </TouchableOpacity>
            
            <Text style={styles.nombre}>MiCliente</Text>
        </View>
        <ScrollView>
           <Text style={styles.titulo}>{esEdicion ? "Actualizar" : "Crear"} Cliente</Text>
            <TextInput 
                placeholder="Nombre del cliente"
                value={cliente?.name || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, name: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <TextInput 
                placeholder="NIT"
                value={cliente?.nit || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, nit: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <TextInput 
                placeholder="Nombre gerente"
                value={cliente?.gerente || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, gerente: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <TextInput 
                placeholder="Sector económico"
                value={cliente?.sectorEconomico || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, sectorEconomico: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <TextInput 
                placeholder="Teléfono"
                value={cliente?.telefono || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, telefono: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <TextInput 
                placeholder="Correo electrónico"
                value={cliente?.email || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, email: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />

            <AcordionDinamico titulo='Contacto'>
                <View>
                    <TextInput 
                        placeholder="Nombre"
                        value={cliente?.nombreContacto || ''}
                        onChangeText={text => setCliente(prev => prev ? { ...prev, nombreContacto: text } : null)}
                        style={styles.inputCard}
                        placeholderTextColor={'#636363'}
                    />
                    <TextInput 
                        placeholder="Teléfono"
                        value={cliente?.telefonoContacto || ''}
                        onChangeText={text => setCliente(prev => prev ? { ...prev, telefonoContacto: text } : null)}
                        style={styles.inputCard}
                        placeholderTextColor={'#636363'}
                    />
                    <TextInput 
                        placeholder="Correo electrónico"
                        value={cliente?.correoContacto || ''}
                        onChangeText={text => setCliente(prev => prev ? { ...prev, correoContacto: text } : null)}
                        style={styles.inputCard}
                        placeholderTextColor={'#636363'}
                    />
                </View>
            </AcordionDinamico>
            <TextInput 
                placeholder="Saldo de captación"
                value={cliente?.captacion?.toString() || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, captacion: parseInt(text) || 0 } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <TextInput 
                placeholder="Saldo de colocación"
                value={cliente?.colocacion?.toString() || ''}
                onChangeText={text => setCliente(prev => prev ? { ...prev, colocacion: parseInt(text) || 0 } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <Text style={styles.titulo}>Acta</Text>
            <TextInput 
                placeholder="Número de acta"
                value={acta?.numeroActa || ''}
                onChangeText={text => setActa(prev => prev ? { ...prev, numeroActa: text } : null)}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            <View style={[styles.rowSearch]}>
                    {tiposActa.map((g) => (
                        <View
                          key={g}
                          style={acta?.tipo === g ? styles.buttonPressed : styles.buttonCard}
                          onTouchStart={() => setActa(prev => ({...prev, tipo: g } as Acta))}
                        >
                          <Text style={acta?.tipo === g ? styles.textButtonCardPressed : styles.textButtonCard}>{g}</Text>
                    </View>
                    ))}
            </View>

            <Button title={esEdicion ? "Actualizar" : "Crear"} onPress={router.back} color="#E6000D" /> 
        </ScrollView>
        
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EFEFEF', padding: 15, marginTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  logo: { width: 60, height: 55 },
  rowSearch: { flexDirection:'row', paddingVertical: 8, alignItems:'center', justifyContent: 'space-around', gap: 8 },
  buttonPressed: { backgroundColor:'#e6000d', borderRadius:30, padding:16, alignItems:'center', width: 120 }, 
  buttonCard: { backgroundColor:'#c4c4c4', padding:16, borderRadius:30, alignItems:'center', width: 120 }, 
  textButtonCard: { color:'#000', fontSize:18, fontFamily:'JosefinSans_400Regular' }, 
  textButtonCardPressed: { color:'#fff', fontSize:18, fontFamily:'JosefinSans_700Bold' },
  back: {marginHorizontal: 10, width: 30, height: 30 },
  nombre:{ fontFamily: 'JosefinSans_400Regular', fontSize: 24, fontWeight: 'medium', alignContent: 'space-between' },
  titulo: { fontSize: 20, color: '#000', fontFamily: 'JosefinSans_400Regular', marginBottom: 4 },
  searchView: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D9D9D9', borderRadius: 50, paddingHorizontal: 16, justifyContent: 'center', marginBottom: 8 },
  input: { backgroundColor:'#D9D9D9', borderRadius:50, paddingVertical:16, paddingHorizontal: 15, fontSize:18,
            color:'#000', fontFamily:'JosefinSans_400Regular', marginVertical: 8},
  inputCard: { backgroundColor:'#b5b5b5', borderRadius:50, paddingVertical:16, paddingHorizontal: 15, fontSize:18,
            color:'#000', fontFamily:'JosefinSans_400Regular', marginVertical: 8},
  searchIcon: { width: 24, height: 24,},
  vacio: { textAlign: 'center', marginTop: 60, fontSize: 16, color: '#555', fontFamily: 'JosefinSans_400Regular' },
});
