import { ActaVencimiento, obtenerActasProximasAVencer } from '@/database/supabaseActas';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SeccionActas {
  title: string;
  data: ActaVencimiento[];
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function PantallaNotificaciones() {
  const [secciones, setSecciones] = useState<SeccionActas[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();
    const [usuario, setUsuario] = useState<User | null>(null);
    useEffect(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUsuario(user);
      });
    }, []);
    
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

  useEffect(() => {
    const cargarYAgrupar = async () => {
      setCargando(true);
      const actas = await obtenerActasProximasAVencer();
      
      const ahora = new Date();
      const añoActual = ahora.getFullYear();
      const mesActual = ahora.getMonth(); // 0 - 11

      // Contenedores temporales para la agrupación
      const vencidas: ActaVencimiento[] = [];
      const porMeses: { [key: string]: ActaVencimiento[] } = {};

      actas.forEach(acta => {
        const fechaVence = new Date(acta.fechaVencimiento);
        
        // Validar si ya se venció (comparando marcas de tiempo o días)
        if (fechaVence < ahora && fechaVence.toDateString() !== ahora.toDateString()) {
          vencidas.push(acta);
        } else {
          // Agrupar por Mes y Año (Ej: "Junio 2026")
          const nombreMes = MESES[fechaVence.getMonth()];
          const año = fechaVence.getFullYear();
          const llaveMes = `${nombreMes} ${año}`;

          if (!porMeses[llaveMes]) {
            porMeses[llaveMes] = [];
          }
          porMeses[llaveMes].push(acta);
        }
      });

      // Estructurar el array final listo para el SectionList
      const resultadoSecciones: SeccionActas[] = [];

      if (vencidas.length > 0) {
        resultadoSecciones.push({ title: '⚠️ Ya vencidas', data: vencidas });
      }

      // Añadir los grupos de los meses ordenados
      Object.keys(porMeses).forEach(mes => {
        resultadoSecciones.push({ title: `📅 Vence en ${mes}`, data: porMeses[mes] });
      });

      setSecciones(resultadoSecciones);
      setCargando(false);
    };

    cargarYAgrupar();
  }, []);

  if (cargando) {
    return <ActivityIndicator size="large" color="#E6000D" style={{ flex: 1 }} />;
  }

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
      <Text style={styles.headerTitulo}>Próximos Vencimientos</Text>
      
      <SectionList
        sections={secciones}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.contenedorSeccion}>
            <Text style={styles.tituloSeccion}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.tarjetaActa}>
            <Text style={styles.clienteText}>{item.clienteNombre}</Text>
            <Text style={styles.infoText}>Acta N°: {item.numeroActa}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay actas próximas a vencer 🎉</Text>
        }
        contentContainerStyle={{ paddingBottom: 90}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: '#EFEFEF', paddingHorizontal: 15, paddingTop: 50},
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  logo: { width: 60, height: 55 },
  nombre:{ fontFamily: 'JosefinSans_400Regular', fontSize: 24, fontWeight: 'medium', padding: 10, alignContent: 'space-between' },
  headerTitulo: { fontSize:24, fontFamily:'JosefinSans_700Bold', color: '#E6000D', opacity:0.5, marginTop:16, marginBottom: 8 },
  contenedorSeccion: { backgroundColor: '#D9D9D9', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginVertical: 8 },
  tituloSeccion: { fontSize: 16, fontFamily: 'JosefinSans_400Regular', color: '#E6000D' },
  tarjetaActa: { backgroundColor: '#FFF', padding: 16, borderRadius: 15, marginVertical: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  clienteText: { fontSize: 18, fontFamily: 'JosefinSans_700Bold', color: '#2A2A2A' },
  infoText: { fontSize: 14, fontFamily: 'JosefinSans_400Regular', color: '#5D5D5D', marginTop: 2 },
  fechaText: { fontSize: 14, fontFamily: 'JosefinSans_700Bold', color: '#E6000D', marginTop: 4 },
  vacio: { textAlign: 'center', marginTop: 40, fontSize: 16, color: '#808080', fontFamily: 'JosefinSans_400Regular' }
});