import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

export default function App() { 

  const [fecha, setFecha] = useState(new Date());
  const [mostrar, setMostrar] = useState(false);
  const [texto, setTexto] = useState('Seleccionar fecha');

  const onChange = (e, selectedDate) => {
    setFecha(selectedDate);
  };

  const alCambiar = (e, fechaSeleccionada) => {
    const currenteDate = fechaSeleccionada || fecha;
    setMostrar(Platform.OS === 'ios');
    setFecha(fechaSeleccionada);

    let tempDate = new Date(currenteDate);
    let fFecha = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
    setTexto(fFecha);
  };

  const mostrarDatePicker = () => {
    setMostrar(true);
  };
  

    return ( 
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <>
        <View style = {styles.viewFecha}>
          <DateTimePicker
            value={fecha}
            mode={'date'}
            onChange={onChange}
            minimumDate={new Date()}
            style={styles.input}
          />
        </View>
        <View>
          <Text>{texto}</Text>
          <View style={styles.viewFecha}>
            <Button title={texto} onPress={mostrarDatePicker} />
          
          {mostrar && (
            <DateTimePicker
              testID='dateTimePicker'
              value= {fecha}
              mode={'date'}
              is24Hour={true}
              display='default'
              onChange={alCambiar}
            />
          )}
          </View>
        </View>  
        </>
      ) : (
        <View>
          <Text>{texto}</Text>
          <View style={styles.viewFecha}>
            <Button title={texto} onPress={mostrarDatePicker} />
          </View>
          {mostrar && (
            <DateTimePicker
              testID='dateTimePicker'
              value= {fecha}
              mode={'date'}
              is24Hour={true}
              display='default'
              onChange={alCambiar}
            />
          )}
        </View>
      )}
      
    </View> 
    ); 
}
const styles = StyleSheet.create({ 
  container: { flex:1, padding:24, backgroundColor:'#fff', justifyContent:'center' }, 
  rowSearch: { flexDirection:'row', gap:8, marginBottom:16, alignItems:'center' }, 
  input: { borderRadius: 25, backgroundColor: '#d9d9d9', fontFamily:'JosefinSans_400Regular' }, 
  viewFecha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 50, paddingVertical:8, paddingHorizontal: 8, backgroundColor: '#D9D9D9' },
});