import { Acta, obtenerActaPorNumero } from '@/database/supabaseActas';
import { Cliente, obtenerClientePorNIT } from '@/database/supabaseClientes';
import { Cupo, obtenerCuposPorActaId } from '@/database/supabaseCupos';
import { obtenerProdClientePorId, ProductoCliente } from '@/database/supabaseProdCliente';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function DetalleCliente() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [acta, setActa] = useState<Acta | null>(null);
  const [cupo, setCupo] = useState<Cupo[] | null>(null);
  const [prodCliente, setProdCliente] = useState<ProductoCliente[] | null>(null);
  const [modalEliminar, setModalEliminar] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);

  useEffect(() => {
    cargarCliente();
    cargarActa();
    cargarCupos();
    cargarProdCliente();
      // Suscribirse a cambios en la tabla contactos
      const canal = supabase
        .channel('cambios_proyecto_canal')         // nombre único del canal
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
          }
        )
        .on(
          'postgres_changes',               // tipo de evento
          {
            event: '*',                     // '*' = INSERT + UPDATE + DELETE
            schema: 'public',
            table: 'Actas',
          },
          (payload) => {
            // Se ejecuta cada vez que hay un cambio en la tabla
            console.log('Cambio detectado:', payload.eventType);
          }
        )
        .on(
          'postgres_changes',               // tipo de evento
          {
            event: '*',                     // '*' = INSERT + UPDATE + DELETE
            schema: 'public',
            table: 'Cupos',
          },
          (payload) => {
            // Se ejecuta cada vez que hay un cambio en la tabla
            console.log('Cambio detectado:', payload.eventType);
          }
        )
        .on(
          'postgres_changes',               // tipo de evento
          {
            event: '*',                     // '*' = INSERT + UPDATE + DELETE
            schema: 'public',
            table: 'ProductoCliente',
          },
          (payload) => {
            // Se ejecuta cada vez que hay un cambio en la tabla
            console.log('Cambio detectado:', payload.eventType);
          }
        )
        .subscribe();
  
      // Cancelar la suscripción al salir de la pantalla
      return () => {
        supabase.removeChannel(canal);
      };
    }, []);

    const cargarCliente = useCallback(async () => {
      if (!id) return;
        try {
            const data = await obtenerClientePorNIT(id);
            setCliente(data);
        } catch (error) {
            console.error('Error cargando cliente:', error);
        }
    }, [id]);

    const cargarActa = useCallback(async () => {
      if (!id) return;
        try {            
            const data = await obtenerActaPorNumero(cliente?.actaId || '');
            setActa(data);
        } catch (error) {
            console.error('Error cargando acta:', error);
        }   
    }, [id]);

    const cargarCupos = useCallback(async () => {
      if (!id) return;
        try {            
            const data = await obtenerCuposPorActaId(cliente?.actaId || '');
            setCupo(data);
        } catch (error) {
            console.error('Error cargando cupo:', error);
        }   
    }, [id]);

    const cargarProdCliente = useCallback(async () => {
      if (!id) return;
        try {            
            const data = await obtenerProdClientePorId(id);
            setProdCliente(data);
        } catch (error) {
            console.error('Error cargando producto-cliente:', error);
        }   
    }, [id]);

  // Pantalla de carga
  if (!cliente) {
    return (
      <View style={styles.centrado}>
        <Text style={styles.errorTexto}>Cliente no encontrado 🔍</Text>
        <TouchableOpacity style={styles.btnVolver} onPress={() => router.back()}>
          <Text style={styles.btnVolverTexto}>← Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: cliente.name }} />
      <View>
        <Text style={styles.nombre}>{cliente.name}</Text>
        <Text style={styles.empresa}>{cliente.sectorEconomico}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor:       { flex:1, backgroundColor:'#f0f4f8', paddingTop: 40 },
  contenido:        { paddingBottom:40 },
  centrado:         { flex:1, justifyContent:'center', alignItems:'center', gap:16 },
  errorTexto:       { fontSize:18, color:'#888' },
  btnVolver:        { borderWidth:1, borderColor:'#2D9CDB', padding:14, borderRadius:10 },
  btnVolverTexto:   { color:'#2D9CDB', fontSize:16 },
  avatarWrapper:    { alignItems:'center', marginTop:20, marginBottom:16 },
  avatar:           { width:110, height:110, borderRadius:55 },
  nombre:           { fontSize:26, fontWeight:'bold', color:'#1E3A5F', textAlign:'center' },
  empresa:          { fontSize:15, color:'#2D9CDB', textAlign:'center', marginTop:4, marginBottom:24 },
  acciones:         { flexDirection:'row', justifyContent:'center', gap:16, marginBottom:24 },
  btnAccion:        { alignItems:'center', backgroundColor:'#fff', borderRadius:14,
                      paddingVertical:14, paddingHorizontal:28,
                      shadowColor:'#000', shadowOpacity:0.07, shadowRadius:6, elevation:3 },
  btnAccionEmoji:   { fontSize:26, marginBottom:4 },
  btnAccionTexto:   { fontSize:13, color:'#555', fontWeight:'500' },
  tarjeta:          { margin:16, backgroundColor:'#fff', borderRadius:14, padding:16,
                      shadowColor:'#000', shadowOpacity:0.07, shadowRadius:6, elevation:3 },
  seccionTitulo:    { fontSize:12, color:'#aaa', fontWeight:'600', letterSpacing:1, marginBottom:12 },
  fila:             { flexDirection:'row', justifyContent:'space-between', paddingVertical:10 },
  filaLabel:        { fontSize:15, color:'#888' },
  filaValor:        { fontSize:15, color:'#1E3A5F', fontWeight:'500', flexShrink:1, textAlign:'right' },
  separador:        { height:1, backgroundColor:'#f0f0f0' },
  btnEliminar:      { margin:16, marginTop:8, padding:16, borderRadius:12,
                      backgroundColor:'#FDEDEC', alignItems:'center' },
  btnEliminarTexto: { color:'#E74C3C', fontSize:15, fontWeight:'600' },
  overlay:          { flex:1, backgroundColor:'rgba(0,0,0,0.45)',
                      justifyContent:'center', alignItems:'center' },
  modalCaja:        { backgroundColor:'#fff', borderRadius:16, padding:24, width:'82%' },
  modalTitulo:      { fontSize:18, fontWeight:'bold', color:'#1E3A5F', marginBottom:8 },
  modalMsg:         { fontSize:15, color:'#555', marginBottom:24, lineHeight:22 },
  modalBtns:        { flexDirection:'row', gap:12 },
  btnCancelar:      { flex:1, padding:13, borderRadius:10, borderWidth:1,
                      borderColor:'#ddd', alignItems:'center' },
  btnConfirmar:     { flex:1, padding:13, borderRadius:10,
                      backgroundColor:'#E74C3C', alignItems:'center' },
});
