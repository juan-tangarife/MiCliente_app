import { AcordionDinamico } from '@/components/acordionCard';
import { Acta, eliminarActa, obtenerActaPorNumero } from '@/database/supabaseActas';
import { Cliente, eliminarCliente, obtenerClientePorNIT } from '@/database/supabaseClientes';
import { Cupo, eliminarCuposPorActaId, obtenerCuposPorActaId } from '@/database/supabaseCupos';
import { eliminarProdCliente, obtenerProdClientePorId, ProductoCliente } from '@/database/supabaseProdCliente';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


export default function DetalleCliente() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [acta, setActa] = useState<Acta | null>(null);
  const [fechaActa, setFechaActa] = useState<string | null>(null);
  const [cupos, setCupos] = useState<Cupo[] | null>(null);
  const [prodClientes, setProdClientes] = useState<ProductoCliente[] | null>(null);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUsuario(user);
    });
  }, []);

  const cargarCliente = useCallback(async () => {
    if (!id) return;
      try {
          const data = await obtenerClientePorNIT(id);
          setCliente(data);
          return data;
       } catch (error) {
          console.error('Error cargando cliente:', error);
        }}, [id]);

  const cargarActa = useCallback(async (actaId: string) => {
    if (!id) return;
    
      try {
          const data = await obtenerActaPorNumero(actaId);
          if (!data) {
            setActa(null);
            setFechaActa(null);
            return;
          }
          setActa(data);
          const opciones = { month: 'long', year: 'numeric' };
          if (data.fecha) {
            const fechaFormateada = new Date(data.fecha).toLocaleDateString('es-ES', opciones);
            setFechaActa(fechaFormateada);
          } else {
            setFechaActa(null);
          }
      } catch (error) {
          console.error('Error cargando acta:', error);
      }}, [id]);

  const cargarCupos = useCallback(async (actaId: string) => {
    if (!id) return;
      try {            
          const data = await obtenerCuposPorActaId(actaId);
          setCupos(data);   
      } catch (error) {
          console.error('Error cargando cupo:', error);
      }}, [id]);

  const cargarProdCliente = useCallback(async () => {
    if (!id) return;
      try {            
          const data = await obtenerProdClientePorId(id);
          setProdClientes(data);
      } catch (error) {
          console.error('Error cargando producto-cliente:', error);
      }}, [id]);

  const cargarTodos = useCallback(async () => {
    if (!id) return;
    try {            
      const clienteData = await obtenerClientePorNIT(id);
      if (!clienteData) return;
      setCliente(clienteData);
      if(clienteData.actaId) {
        await Promise.all([
          cargarActa(clienteData.actaId),
          cargarCupos(clienteData.actaId),
        ]);
      }
      await cargarProdCliente(); // esta usa id directamente, no actaId
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }}, [id]);

    const mostrarConfirmacionEliminar = () => {
      Alert.alert('Eliminar cliente', '¿Estás seguro de que quieres eliminar este cliente?', [
      { text: 'Eliminar',  onPress: () => handleEliminar()  },
      { text: 'Cancelar', style: 'cancel' },
    ]);
    };

    const handleEliminar = async () => {
      if (!cliente) return;
      try{
        await Promise.all([
          eliminarCuposPorActaId(cliente.actaId),
          eliminarProdCliente(cliente.nit),
          eliminarActa(cliente.actaId),
          eliminarCliente(cliente.nit)
        ]);
        router.back();
      } catch (error) {
        console.error('Error eliminando cliente:', error);
      }
    };

  useEffect(() => {
    cargarTodos();

      // Suscribirse a cambios en la tabla contactos
      const canal = supabase
    .channel('cambios_proyecto_canal')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Cliente' },
      () => cargarCliente())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Actas' },
      () => { if (cliente?.actaId) cargarActa(cliente.actaId); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Cupos' },
      () => { if (cliente?.actaId) cargarCupos(cliente.actaId); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ProductoCliente' },
      () => cargarProdCliente())
    .subscribe();

  return () => { 
    supabase.removeChannel(canal);
    setCliente(null);
    setActa(null);
    setFechaActa(null);
    setCupos(null);
    setProdClientes(null);
    setLoading(true);
   };
    }, [id]);

    // Pantalla de carga
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cargando...' }} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E6000D" />
          <Text style={styles.loadingText}>Obteniendo información...</Text>
        </View>
      </>
    );
  }

  // ── Pantalla si no existe el cliente ──────────────────────────
  if (!cliente) {
    return (
      <>
        <Stack.Screen options={{ title: 'Error' }} />
        <View style={styles.centered}>
          <Text style={styles.errorText}>No se encontró el cliente.</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <View style={styles.contenedor}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image style={styles.arrow} source={require('../../../assets/images/atras.png')} />
          </TouchableOpacity>
          <Image style={styles.avatar} source={require('../../../assets/images/avatar.png')} />
          <TouchableOpacity onPress={mostrarConfirmacionEliminar}>
            <Image style={styles.arrow} source={require('../../../assets/images/eliminar.png')} />
          </TouchableOpacity>
         
          
        </View>
        <ScrollView contentContainerStyle={styles.contenido}>
          <Text style={styles.nombre}>{cliente.name}</Text>
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitle}>Gerente</Text>
            <Text style={styles.tarjetaContenido}>{cliente.gerente}</Text>
            <View style={styles.linea}></View>
            <Text style={styles.tarjetaTitle}>NIT</Text>
            <Text style={styles.tarjetaContenido}>{cliente.nit}</Text>
            <View style={styles.linea}></View>
            <Text style={styles.tarjetaTitle}>Teléfono</Text>
            <Text style={styles.tarjetaContenido}>{cliente.telefono}</Text>
            <View style={styles.linea}></View>
            <Text style={styles.tarjetaTitle}>Correo</Text>
            <Text style={styles.tarjetaContenido}>{cliente.email}</Text>
          </View>
          <AcordionDinamico titulo="Contacto">
            <View>
              <Text style={styles.tarjetaTitleContacto}>Nombre</Text>
              <Text style={styles.tarjetaContenidoContacto}>{cliente.nombreContacto}</Text>
              <View style={styles.linea}></View>
              <Text style={styles.tarjetaTitleContacto}>Teléfono</Text>
              <Text style={styles.tarjetaContenidoContacto}>{cliente.telefonoContacto}</Text>
              <View style={styles.linea}></View>
              <Text style={styles.tarjetaTitleContacto}>Correo</Text>
              <Text style={styles.tarjetaContenidoContacto}>{cliente.correoContacto}</Text>
            </View>
          </AcordionDinamico>
          <View style= {{flexDirection:'row', justifyContent:'space-between'}}>
            <View style={styles.tarjeta}>
              <Text style={styles.tarjetaTitle}>Sector</Text>
            </View>
            <View style={styles.tarjetaSector}>
              <Text style={styles.tarjetaContenidoSector}>{cliente.sectorEconomico}</Text>
            </View>
          </View>
          <View style={styles.tarjeta}>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <Text style={styles.tarjetaTitle}>Acta</Text>
              <Text style={styles.tarjetaContenido}>{acta?.numeroActa}</Text>
            </View>
            <View style={styles.tarjetaFecha}>
              <Text style={styles.tarjetaFechaContenido}>{fechaActa}</Text>
            </View>
          </View>
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitle}>Cupos</Text>
            <FlatList
              data={cupos || []}
              renderItem={({ item }) => (
                <View style={styles.cupos}>
                  <Text style={styles.tarjetaTitulo}>{item.tipo}</Text>
                  <Text style={styles.tarjetaTexto }>${item.monto}</Text>
                </View>
              )}
              numColumns={2}
              ListEmptyComponent={
                <View style={{justifyContent:'center', alignItems:'center', padding:4}}>
                  <Text style={styles.loadingText}>No hay cupos agregados</Text>
                </View>
              }
            />
          </View>
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitle}>Productos</Text>
            <FlatList
              data={prodClientes || []}
              renderItem={({ item }) => (
                <View style={styles.productos}>
                  <Text style={styles.tarjetaTitulo}>{item.Productos?.nombre}</Text>
                </View>
              )}
              numColumns={2}
              ListEmptyComponent={
                <View style={{justifyContent:'center', alignItems:'center', padding:4}}>
                  <Text style={styles.loadingText}>No hay productos agregados</Text>
                </View>
              
            }
            />
          </View>
          <View style={styles.tarjeta}>
            <Text style={styles.tarjetaTitle}>Promedios</Text>
            <View style={{flexDirection:'row', justifyContent:'space-between'}}>
              <View style={styles.saldos}>
                <Text style={styles.tarjetaTitulo}>Saldo Captación</Text>
                <Text style={styles.tarjetaTexto}>${cliente.captacion}</Text>
              </View>
              <View style={styles.saldos}>
                <Text style={styles.tarjetaTitulo}>Saldo Colocación</Text>
                <Text style={styles.tarjetaTexto}>${cliente.colocacion}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <TouchableOpacity style={styles.fab} onPress={() => router.push({ pathname: '/cliente/formulario', params: { id: cliente.nit } })}>
          <Image source={require('@/assets/images/editar.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contenedor:       { flex:1, backgroundColor:'#EFEFEF'},
  header:           { flexDirection:'row',  gap:12,  backgroundColor: '#D9D9D9', padding: 12, justifyContent:'space-between', paddingTop:40 },
  contenido:        { padding: 16 },
  arrow:            { width:24, height:24, alignContent:'flex-start' },
  avatar:           { width:230, height:230, borderRadius:55, marginRight:20, alignSelf:'center' },
  centered:         { flex:1, justifyContent:'center', alignItems:'center', gap:12 },
  errorText:        { fontSize:15, color:'#E6000D', fontFamily:'JosefinSans_400Regular' },
  loadingText:      { fontSize:16, color:'#888', fontFamily:'JosefinSans_400Regular' },
  nombre:           { fontSize:36, fontFamily:'JosefinSans_400Regular', color:'#E6000D', textAlign:'center', opacity:0.6 },
  tarjeta:          { backgroundColor:'#D9D9D9', borderRadius:30, padding:16, marginVertical:8 },
  tarjetaTitle:     { fontSize:20, color:'#E6000D', fontFamily:'JosefinSans_400Regular', opacity: 0.6 },
  tarjetaContenido: { fontSize:18, color:'#5D5D5D', opacity: 0.6, fontFamily:'JosefinSans_400Regular' },
  linea:            { height:1, backgroundColor:'#5D5D5D', marginVertical:8 },
  tarjetaTitleContacto:     { fontSize:17, color:'#E6000D', fontFamily:'JosefinSans_400Regular', opacity: 0.6 },
  tarjetaContenidoContacto: { fontSize:16, color:'#5D5D5D', marginTop:4, opacity: 0.6, fontFamily:'JosefinSans_400Regular' },
  tarjetaSector:     { backgroundColor:'#C4C4C4', borderRadius:30, marginVertical:8, flex:1, marginHorizontal:4, justifyContent:'center', alignItems:'center'  },
  tarjetaContenidoSector: { fontSize:24, color:'#2A2A2A', marginTop:4, opacity: 0.6, fontFamily:'JosefinSans_700Bold' }, 
  tarjetaFecha: {backgroundColor: '#FF0513', borderRadius: 30, padding: 16, marginVertical: 4, alignItems:'center', flex:1, marginHorizontal:40, opacity:0.6, justifyContent:'center' },
  tarjetaFechaContenido: { fontSize:22, color:'#FFFFFF', fontFamily:'JosefinSans_700Bold', justifyContent:'center', alignItems:'center', textAlign:'center' },
  cupos: {backgroundColor: '#FF0513', borderRadius: 30, padding: 8, marginVertical: 4, alignItems:'center', opacity:0.6, justifyContent:'center', alignContent:'center', flex:1, margin:4 },
  productos: {backgroundColor: '#F8981F', borderRadius: 30, padding: 8, marginVertical: 4, alignItems:'center', opacity:0.6, justifyContent:'center', alignContent:'center', flex:1, margin:4 },
  saldos: {backgroundColor: '#FFDE00', borderRadius: 30, padding: 8, marginVertical: 4, alignItems:'center', opacity:0.6, justifyContent:'center', alignContent:'center', flex:1, margin:4 },
  tarjetaTitulo: { fontSize:18, color:'#FFFFFF', fontFamily:'JosefinSans_700Bold', justifyContent:'center', alignItems:'center', textAlign:'center' },
  tarjetaTexto: { fontSize:18, color:'#FFFFFF', fontFamily:'JosefinSans_400Regular', justifyContent:'center', alignItems:'center', textAlign:'center' },
  fab: { position:'absolute', bottom:20, right:20, backgroundColor:'#E6000D', width:60, height:60, borderRadius:30, justifyContent:'center', alignItems:'center' },
  icon: { width:40, height:40 },
});
