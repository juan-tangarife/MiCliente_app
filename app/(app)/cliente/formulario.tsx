import { AcordionDinamico } from '@/components/acordionCard';
import { Acta, actualizarActa, guardarActa, obtenerActaPorNIT } from '@/database/supabaseActas';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { User } from '@supabase/supabase-js';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { actualizarCliente, Cliente, guardarCliente, obtenerClientePorNIT } from '../../../database/supabaseClientes';


export default function FormularioCliente() {
  // Obtenemos el ID si viene de la ruta de edición
  const { id } = useLocalSearchParams<{ id: string }>();
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [acta, setActa] = useState<Acta | null>(null);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [texto, setTexto] = useState('Seleccionar fecha');
  const [mostrar, setMostrar] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [errores, setErrores] = useState<{ [key: string]: string}>({});
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
          const actaActual = obtenerActaPorNIT(data.nit).then((actaData: Acta | null) => {
            if (actaData) {
              setActa(actaData);
              
              if (actaData.fecha){
                const fechaDate = new Date(actaData.fecha);
                setFecha(fechaDate);
                let fFecha = fechaDate.getDate() + '/' + (fechaDate.getMonth() + 1) + '/' + fechaDate.getFullYear();
                setTexto(fFecha);
              }
            }
          });
        }
      });
    }
    return () => {
      setCliente(null);
      setActa(null);
      setFecha(null);
      setTexto('Seleccionar fecha');
      setMostrar(false);
      setErrores({});
    };
  }, [id]);

  const alCambiar = (e: any, fechaSeleccionada?: Date) => {
    const currenteDate = fechaSeleccionada || fecha || new Date();
    if (Platform.OS === 'android'){
      setMostrar(false);
    }

    if (fechaSeleccionada){
      setFecha(currenteDate);
      let fFecha = fechaSeleccionada.getDate() + '/' + (fechaSeleccionada.getMonth() + 1) + '/' + fechaSeleccionada.getFullYear();
      setTexto(fFecha);
      setActa(prev => prev ? { ...prev, fecha: fechaSeleccionada.toISOString() } : null);
    }
  };

  const mostrarDatePicker = () => {
    setMostrar(true);
  };

  const validarFormulario = () => {
    let erroresTemporales: { [key: string]: string } = {};

    // Validaciones del Cliente
    // Nombre cliente
    if (!cliente?.name?.trim()) {
      erroresTemporales.name = 'El nombre es obligatorio';
    }else if(cliente?.name?.trim().length <= 3){
      erroresTemporales.name = 'Nombre no puede ser menor de 3 caracteres';
    };

    // NIT
    if(!esEdicion){
      if (!cliente?.nit?.trim()) {
        erroresTemporales.nit = 'El NIT es obligatorio';
      }else if(cliente?.nit?.trim().length != 9){
        erroresTemporales.nit = 'El NIT debe de ser 9 caracteres';
      };
    }
    

    // Sector económico
    if (!cliente?.sectorEconomico?.trim()) {
      erroresTemporales.sectorEconomico = 'El Sector Económico es obligatorio';
    }

    // Gerenete
    if (!cliente?.gerente?.trim()) {
      erroresTemporales.gerente = 'El nombre del gerente es obligatorio';
    }else if(cliente?.gerente?.trim().length <= 3){
      erroresTemporales.gerente = 'Nombre no puede ser menor de 3 caracteres';
    };


    // Telefono
    if (!cliente?.telefono?.trim()) {
      erroresTemporales.telefono = 'El teléfono es obligatorio';
    }else if(cliente?.telefono?.trim().length != 10){
      erroresTemporales.telefono = 'El teléfono debe ser de 10 números';
    };
      
    // Correo
    if (!cliente?.email?.trim()) {
      erroresTemporales.email = 'El correo es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(cliente.email)) {
      erroresTemporales.email = 'El correo no es válido';
    };

    //Captación
    if (!cliente?.captacion || cliente?.captacion <= 0) {
      erroresTemporales.captacion = 'El valor de captación es obligatorio';
    };

    // Captación
    if (!cliente?.colocacion || cliente?.colocacion <= 0) {
      erroresTemporales.colocacion = 'El valor de colocación es obligatorio';
    };

    // Validaciones del Acta
    // Número de Acta
    if (!acta?.numeroActa?.trim()) {
      erroresTemporales.numeroActa = 'El número de acta es obligatorio';
    };
    
    // Tipo acta
    if (!acta?.tipo) {
      erroresTemporales.tipo = 'Debes seleccionar un tipo de acta';
    };
      
    // Fecha
    if (!acta?.fecha) {
      erroresTemporales.fecha = 'La fecha es obligatoria';
    };

    // Guardamos los errores en el estado
    setErrores(erroresTemporales);

    // Si el objeto está vacío, significa que todo está perfecto (retorna true)
    return Object.keys(erroresTemporales).length === 0;
  };

  const handleGuardar = () => {
    if (!validarFormulario()){
      return;
    };
    Alert.alert('¿Deseas guardar?', 'Se creará el cliente con los datos actuales', [
      { text: 'Guardar', onPress: () => guardar() },
      { text: 'Cancelar', style: 'cancel' }
    ])
  }

  const guardar = async () => {
    try{
      if (esEdicion) {
        // Lógica de UPDATE en Supabase

        const actaProcesada = {
          ...acta,
          fecha: fecha instanceof Date ? fecha.toISOString() : acta?.fecha
        };

        const [clienteActualizado, actaActualizado] = await Promise.all([
          actualizarCliente(id, cliente!),
          actualizarActa(acta!.numeroActa, acta!)
        ])

        if (clienteActualizado == null || actaActualizado == null){
          Alert.alert('Error', 'No se pudo actualizar correctamente')
          return;
        }

        Alert.alert('Éxito',"¡Cliente y Acta actualizados con éxito!");
        router.push({ pathname: '/cliente/formulario-detalle', params: { id: clienteActualizado.nit } })
      } else {
        const nuevoCliente = await guardarCliente(cliente!)
        if (!nuevoCliente){
          Alert.alert('Error', 'No se pudo crear cliente')
          setMostrarModal(false);
          return;
        }

        const datosActa = {
          ...acta, 
          clienteId: nuevoCliente.nit
        } as Acta;

        const nuevaActa = await guardarActa(datosActa);

        if(!nuevaActa){
          Alert.alert('Error', 'Se creó cliente pero no acta')
          setMostrarModal(false);
          return;
        }

        Alert.alert('Éxito',"¡Cliente y Acta creados con éxito!");
        setMostrarModal(false);
        router.push({ pathname: '/cliente/formulario-detalle', params: { id: nuevoCliente.nit } })
      }
    }catch (e){
      console.error("Error en el proceso de guardado:", e);
      alert("Ocurrió un error inesperado al guardar.");
      Alert.alert('Error', 'No se pudo crear cliente')
      setMostrarModal(false);
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
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), name: text} as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.name && <Text style={styles.textError}>{errores.name}</Text>}
            <TextInput 
                placeholder="NIT"
                value={cliente?.nit || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), nit: text} as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
                editable={!esEdicion}
            />
            {errores.nit && <Text style={styles.textError}>{errores.nit}</Text>}
            <TextInput 
                placeholder="Nombre gerente"
                value={cliente?.gerente || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), gerente: text} as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.gerente && <Text style={styles.textError}>{errores.gerente}</Text>}
            <TextInput 
                placeholder="Sector económico"
                value={cliente?.sectorEconomico || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), sectorEconomico: text} as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.sectorEconomico && <Text style={styles.textError}>{errores.sectorEconomico}</Text>}
            <TextInput 
                placeholder="Teléfono"
                value={cliente?.telefono || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), telefono: text} as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.telefono && <Text style={styles.textError}>{errores.telefono}</Text>}
            <TextInput 
                placeholder="Correo electrónico"
                value={cliente?.email || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), email: text} as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.email && <Text style={styles.textError}>{errores.email}</Text>}
            <AcordionDinamico titulo='Contacto'>
                <View>
                    <TextInput 
                        placeholder="Nombre"
                        value={cliente?.nombreContacto || ''}
                        onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), nombreContacto: text} as Cliente))}
                        style={styles.inputCard}
                        placeholderTextColor={'#636363'}
                    />
                    <TextInput 
                        placeholder="Teléfono"
                        value={cliente?.telefonoContacto || ''}
                        onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), telefonoContacto: text} as Cliente))}
                        style={styles.inputCard}
                        placeholderTextColor={'#636363'}
                    />
                    <TextInput 
                        placeholder="Correo electrónico"
                        value={cliente?.correoContacto || ''}
                        onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), correoContacto: text} as Cliente))}
                        style={styles.inputCard}
                        placeholderTextColor={'#636363'}
                    />
                </View>
            </AcordionDinamico>
            
            <TextInput 
                placeholder="Saldo de captación"
                value={cliente?.captacion?.toString() || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), captacion: parseInt(text) || 0 } as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.captacion && <Text style={styles.textError}>{errores.captacion}</Text>}
            <TextInput 
                placeholder="Saldo de colocación"
                value={cliente?.colocacion?.toString() || ''}
                onChangeText={text => setCliente(prev => ({ ...(prev ?? {}), colocacion: parseInt(text) || 0 } as Cliente))}
                style={styles.input}
                placeholderTextColor={'#808080'}
            />
            {errores.colocacion && <Text style={styles.textError}>{errores.colocacion}</Text>}
            <Text style={styles.titulo}>Acta</Text>
            <TextInput 
                placeholder="Número de acta"
                value={acta?.numeroActa || ''}
                onChangeText={text => setActa(prev => ({ ...(prev ?? {}), numeroActa: text} as Acta))}
                style={styles.input}
                placeholderTextColor={'#808080'}
                editable={!esEdicion}
            />
            {errores.numeroActa && <Text style={styles.textError}>{errores.numeroActa}</Text>}
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
            {errores.tipo && <Text style={styles.textError}>{errores.tipo}</Text>}
            <View style={styles.viewFecha}>
              <TouchableOpacity onPress={mostrarDatePicker}>
                    <Text style={styles.inputFecha}>{texto}</Text>
              </TouchableOpacity>  
              {mostrar && (
                <DateTimePicker
                  testID='dateTimePicker'
                  value={fecha instanceof Date && !isNaN(fecha.getTime()) ? fecha : new Date()}
                  mode={'date'}
                  is24Hour={true}
                  display='default'
                  onChange={alCambiar}
                  minimumDate={new Date()}
                />
              )}
            </View>
            {errores.fecha && <Text style={styles.textError}>{errores.fecha}</Text>}
            <TouchableOpacity style={{ flexDirection: 'row',justifyContent: 'flex-end'}} onPress={handleGuardar}>
              <View style= {styles.button}>
                <Text style={styles.textButton}>➜</Text>
              </View>
            </TouchableOpacity>
        </ScrollView>
        
        <Modal visible={mostrarModal} transparent={true} animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
              <Text style={styles.titulo}>Cliente:</Text>
              <Text style = {styles.textButtonCard}>Nombre: {cliente?.name}</Text>
              <Text style = {styles.textButtonCard}>NIT: {cliente?.nit}</Text>
              <Text style = {styles.textButtonCard}>Gerente: {cliente?.gerente}</Text>
              <Text style = {styles.textButtonCard}>Sector Económico: {cliente?.sectorEconomico}</Text>
              <Text style = {styles.textButtonCard}>Telefono: {cliente?.telefono}</Text>
              <Text style = {styles.textButtonCard}>Correo: {cliente?.email}</Text>
              <Text style = {styles.textButtonCard}>Nombre contacto: {cliente?.nombreContacto}</Text>
              <Text style = {styles.textButtonCard}>Teléfono contacto: {cliente?.telefonoContacto}</Text>
              <Text style = {styles.textButtonCard}>Correo contacto: {cliente?.correoContacto}</Text>
              <Text style = {styles.textButtonCard}>Captacion: {cliente?.captacion}</Text>
              <Text style = {styles.textButtonCard}>Colocacion: {cliente?.colocacion}</Text>
              <Text style={styles.titulo}>Acta:</Text>
              <Text style = {styles.textButtonCard}>Numero de acta: {acta?.numeroActa}</Text>
              <Text style = {styles.textButtonCard}>Fecha: {acta?.fecha}</Text>
              <Text style = {styles.textButtonCard}>Tipo: {acta?.tipo}</Text>
              <Button title='Chao' onPress={() => {setMostrarModal(false)}} color="#E6000D" /> 
            </View>
          </View>
        </Modal>
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
  viewFecha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 50, paddingVertical:16, paddingHorizontal: 15, backgroundColor: '#D9D9D9' },
  inputFecha: {fontSize: 18, color: '#000', fontFamily: 'JosefinSans_400Regular', flex: 1 },
  textError: { color: '#E6000D', fontSize: 14, fontFamily: 'JosefinSans_400Regular', marginLeft: 15, marginTop: -4, marginBottom: 8},
  button: {backgroundColor: '#E6000D', height: 60, width: '50%', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  textButton: { color: '#fff', fontSize: 36},
});
