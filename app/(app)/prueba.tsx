import { DatePicker } from '@/components/inputFecha';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() { 
  const [filter, setFilter] = useState('Todos'); 
  const [search, setSearch] = useState('');
  const [fecha, setFecha] = useState<Date | null>(null); 
  const generos = ['Todos', 'Terror', 'Animación', 'Acción', 'Ciencia Ficción', 'Drama'];
  const peliculas = [ 
    { id: '1', titulo: 'El Laberinto del Fauno', genero: 'Terror', calificacion: 9.2 }, 
    { id: '2', titulo: 'Coco', genero: 'Animación', calificacion: 9.0 }, 
    { id: '3', titulo: 'Mad Max: Fury Road', genero: 'Acción', calificacion: 8.1 }, 
    { id: '4', titulo: 'Arrival', genero: 'Ciencia Ficción', calificacion: 7.9 }, 
    { id: '5', titulo: 'Parasite', genero: 'Drama', calificacion: 8.6 }, 
    { id: '6', titulo: 'Get Out', genero: 'Terror', calificacion: 7.7 }, 
    { id: '7', titulo: 'Spider-Man: Into the Spider-Verse', genero: 'Animación', calificacion: 8.4 }, 
    { id: '8', titulo: 'Interstellar', genero: 'Ciencia Ficción', calificacion: 8.6 } ]; 
  
  const peliculasFiltradas = peliculas.filter(p => {
    const coincideBusqueda = search
      ? p.titulo.toLowerCase().includes(search.toLowerCase())
      : true;

    const coincideFiltro =
      filter === 'Todos' ? true : p.genero === filter;

    return coincideBusqueda && coincideFiltro;
  });

    return ( 
    <View style={styles.container}> 
      <View style={styles.rowSearch}> 
        <Text style={styles.textSearch}>🔍</Text> 
        <TextInput 
        style={styles.input} 
        placeholder="Buscar" 
        value={search} 
        onChangeText={setSearch} 
        /> 
        <Text style={styles.textSearch}>X</Text> 
      </View> 
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.rowSearch, { height: 70 }]}>
          {generos.map((g) => (
            <View
              key={g}
              style={filter === g ? styles.buttonPressed : styles.buttonCard}
              onTouchStart={() => setFilter(g)}
            >
              <Text style={styles.textButtonCard}>{g}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <DatePicker
        label="Fecha del acta"
        value={fecha || new Date()}
        onChange={setFecha}
        maximumDate={new Date()} // no permite fechas futuras
      />

      <View> 
        <Text style={styles.textCount}>No. peliculas encontradas: {peliculasFiltradas.length}</Text> 
      </View> 
      <FlatList 
      data={peliculasFiltradas} 
      keyExtractor={(item) => item.id} 
      style={{ flex: 1 }}
      renderItem={({ item }) => ( 
        <View style={styles.itemView}> 
          <Text style={styles.itemTitle}>{item.titulo}</Text> 
          <Text style={styles.itemSubtitle}>{item.genero} - ⭐ {item.calificacion}</Text> 
        </View> )} 
      contentContainerStyle={{justifyContent: 'flex-start'}} /> 
    </View> 
    ); 
}
const styles = StyleSheet.create({ 
  container: { flex:1, padding:24, backgroundColor:'#fff' }, 
  rowSearch: { flexDirection:'row', gap:8, marginBottom:16, alignItems:'center' }, 
  input: { flex:1, borderWidth:1, borderColor:'#ddd', borderRadius:10, padding:12 }, 
  textSearch: { fontSize: 24, color:'#888' }, 
  buttonCard: { backgroundColor:'#fff', padding:16, borderRadius:10, alignItems:'center', borderWidth: 1, borderColor:'#ccc' }, 
  buttonPressed: { backgroundColor:'#2D9CDB', borderRadius:10, padding:16, alignItems:'center' }, 
  textButtonCard: { color:'#000', fontSize:16, fontWeight:'bold' }, textCount: { fontSize:18, fontWeight:'bold', color:'#757575', padding:5}, 
  itemView: { backgroundColor:'#fff', padding:16, borderRadius:10, marginBottom:8 }, 
  itemTitle: { fontSize:18, fontWeight:'bold' }, 
  itemSubtitle: { fontSize:14, color:'#888' } 
});