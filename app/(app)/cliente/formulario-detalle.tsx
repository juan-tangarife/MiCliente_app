import { AcordionDinamico } from "@/components/acordionCard";
import { Acta, obtenerActaPorNIT } from "@/database/supabaseActas";
import { Cupo, eliminarCuposPorActaId, guardarCupo, obtenerCuposPorActaId } from "@/database/supabaseCupos";
import { eliminarProdCliente, guardarProductoCliente, obtenerProdClientePorId, ProductoCliente } from "@/database/supabaseProdCliente";
import { obtenerProductos, Productos } from "@/database/supabaseProducto";
import { supabase } from "@/lib/supabase";
import { TipoCupo } from "@/types/enums";
import { User } from "@supabase/supabase-js";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FormularioCupos() {
    const [usuario, setUsuario] = useState<User | null>(null);
    const { id } = useLocalSearchParams<{ id: string }>();
    const [acta, setActa] = useState<Acta | null>(null);
    const [cupos, setCupos] = useState<Cupo[] | null>(null);
    const [productos, setProductos] = useState<ProductoCliente[] | null>(null);
    const [fullProd, setFullProd] = useState<Productos[] | null>(null);
    const [cupoActual, setCupoActual] = useState<Cupo | null>(null);
    const [prodActual, setProdActual] = useState<ProductoCliente | null>(null);
    const [abiertoCupos, setAbiertoCupos] = useState(false);
    const [cupoSeleccionado, setCupoSeleccionado] = useState('Tipo de cupo');
    const [abiertoProd, setAbiertoProd] = useState(false);
    const [prodSeleccionado, setProdSeleccionado] = useState('Tipo de producto');
    const [modalCupos, setModalCupos] = useState(false);
    const [modalProd, setModalProd] = useState(false);
    const [errores, setErrores] = useState<{ [key: string]: string }>({});

    const opcionesCupos = Object.values(TipoCupo);

    // --- 1. FUNCIONES INDEPENDIENTES DE CARGA (Optimizadas) ---
    const cargarDatosIniciales = useCallback(async () => {
        try {
            // Cargar el acta por el NIT (id)
            const actaData = await obtenerActaPorNIT(id);
            if (actaData) {
                setActa(actaData);
                // Si hay acta, traemos sus cupos asignados usando el numeroActa
                const cuposData = await obtenerCuposPorActaId(actaData.numeroActa);
                setCupos(cuposData || []);
            } else {
                setCupos([]);
            }

            // Cargar productos asignados al cliente
            const prodData = await obtenerProdClientePorId(id);
            setProductos(prodData || []);

            // Cargar catálogo maestro de productos
            const catálogoProds = await obtenerProductos();
            if (catálogoProds) setFullProd(catálogoProds);

        } catch (error) {
            console.error("Error cargando datos del cliente:", error);
        }
    }, [id]);

    // 🗑️ SE ELIMINARON LAS FUNCIONES 'recargarCuposOmitiendoActa' Y 'recargarProductosOmitiendoId' PORQUE YA NO SE USAN

    // --- 2. EFECTOS ---
    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUsuario(user);
        });
    }, []);

    // Carga inicial al montar la pantalla (Súper limpio y optimizado)
    useEffect(() => {
        cargarDatosIniciales();

        return () => {
            setActa(null);
            setProductos(null);
            setCupos(null);
            setAbiertoCupos(false);
            setCupoActual(null);
            setCupoSeleccionado('Tipo de cupo');
            setProdSeleccionado('Tipo de producto');
            setErrores({});
        };
    }, [cargarDatosIniciales]); // 🌟 Corregido: Solo depende de la función memorizada

    // 🗑️ SE ELIMINÓ POR COMPLETO EL EFFECT DE LA SUSCRIPCIÓN REALTIME (`cambios_cliente_${id}`)

    // --- 3. LÓGICA DE FILTROS ---
    const tiposAsignadosCupos = cupos?.map(c => c.tipo) || [];
    const tiposAsignadosProductos = productos?.map(p => p.Productos?.nombre) || [];
    
    const cuposDisponibles = opcionesCupos.filter(tipo => !tiposAsignadosCupos.includes(tipo));
    const prodsDisponibles = fullProd?.filter(tipo => !tiposAsignadosProductos.includes(tipo.nombre)) || [];

    const handleModalCupos = () => setModalCupos(!modalCupos);
    const handleModalProd = () => setModalProd(!modalProd);

    const validarFormulario = (modo: boolean) => {
        let erroresTemporales: { [key: string]: string } = {};

        if (modo) {
            if (!cupoActual?.tipo) {
                erroresTemporales.tipoCupo = 'El tipo de cupo es obligatorio';
            }
            if (!cupoActual?.monto || cupoActual?.monto <= 0) {
                erroresTemporales.monto = 'El valor de monto es obligatorio';
            }
        } else {
            if (!prodActual?.productoId) {
                erroresTemporales.tipoProducto = 'El tipo de producto es obligatorio';
            }
        }
        setErrores(erroresTemporales);
        return Object.keys(erroresTemporales).length === 0;
    };

    const guardar = async (modo: boolean) => {
        if (!validarFormulario(modo)) return;
        try {
            if (modo) {
                const cupoProcesado = {
                    ...cupoActual,
                    actaId: acta?.numeroActa
                } as Cupo;
                
                const cupoCreado = await guardarCupo(cupoProcesado);

                if (!cupoCreado) {
                    Alert.alert('Error', 'No se agregó el cupo correctamente');
                    return;
                }
                await cargarDatosIniciales();

                Alert.alert('Éxito', "¡Cupo agregado con éxito!");
                
                setCupoActual(null);
                setCupoSeleccionado('Tipo de cupo');
            } else {
                const productoProcesado = {
                    ...prodActual,
                    clienteId: id
                } as ProductoCliente;
                
                const productoCreado = await guardarProductoCliente(productoProcesado);

                if (!productoCreado) {
                    Alert.alert('Error', 'No se agregó el producto correctamente');
                    return;
                }
                await cargarDatosIniciales();

                Alert.alert('Éxito', "¡Producto agregado con éxito!");
                
                setProdActual(null);
                setProdSeleccionado('Tipo de producto');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEliminar = (modo: boolean) => {
        if (modo){
            if(!cupos) return;
        }else{
            if(!productos) return;
        };
        const mensaje = `Se eliminarán todos los ${modo ? 'cupos' : 'productos'} que hay actualmente`;
        Alert.alert('¿Deseas eliminar todos?', mensaje, [
            { text: 'Eliminar todos', onPress: () => eliminar(modo) },
            { text: 'Cancelar', style: 'cancel' }
        ])
    }

    const eliminar = async (modo: boolean) => {
        try {
            if (modo) {
                if(acta) await eliminarCuposPorActaId(acta?.numeroActa);

                await cargarDatosIniciales();

                Alert.alert('Éxito', "¡Cupo agregado con éxito!");
                
                setCupoActual(null);
                setCupoSeleccionado('Tipo de cupo');
            } else {
                await eliminarProdCliente(id);
                await cargarDatosIniciales();

                Alert.alert('Éxito', "¡Producto agregado con éxito!");
                
                setProdActual(null);
                setProdSeleccionado('Tipo de producto');
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.contenedor}>
                <View style={styles.header}>
                    <Image source={require('../../../assets/images/LittleIcono.png')} style={styles.logo} />
                    <TouchableOpacity onPress={router.back}>
                        <Image source={require('../../../assets/images/atras.png')} style={styles.back} />
                    </TouchableOpacity>
                    <Text style={styles.nombre}>MiCliente</Text>
                </View>
                
                <ScrollView>
                    <Text style={styles.titulo}>Cupos</Text>
                    <AcordionDinamico titulo={cupoSeleccionado} isOpen={abiertoCupos} onToggle={() => setAbiertoCupos(!abiertoCupos)}>
                        {cuposDisponibles.length > 0 ? (
                            cuposDisponibles.map((tipo) => (
                                <TouchableOpacity
                                    key={tipo}
                                    style={styles.botonCupoOpcion}
                                    onPress={() => {
                                        setCupoActual(prev => ({ ...(prev ?? {}), tipo: tipo } as Cupo));
                                        setCupoSeleccionado(tipo);
                                        setAbiertoCupos(false);
                                    }}
                                >
                                    <Text style={styles.textoGris}>{tipo}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.textoGris}>Este cliente ya cuenta con todos los tipos de cupos disponibles.</Text>
                        )}
                    </AcordionDinamico>
                    {errores.tipoCupo && <Text style={styles.textError}>{errores.tipoCupo}</Text>}
                    
                    <TextInput 
                        placeholder="Monto"
                        value={cupoActual?.monto ? cupoActual.monto.toString() : ''}
                        onChangeText={text => setCupoActual(prev => ({ ...(prev ?? {}), monto: parseInt(text) || 0 } as Cupo))}
                        style={styles.input}
                        placeholderTextColor={'#808080'}
                        keyboardType="numeric"
                    />
                    {errores.monto && <Text style={styles.textError}>{errores.monto}</Text>}
                    
                    <View style={styles.rowButtons}>
                        <TouchableOpacity onPress= {() => handleEliminar(true)}>
                            <View style={styles.viewButton}>
                                <Image source={require('../../../assets/images/eliminarCP.png')} style={[styles.logoButton, { marginLeft: 4 }]} />
                            </View>    
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleModalCupos}>
                            <View style={styles.viewButton}>
                                <Image source={require('../../../assets/images/ojo.png')} style={styles.logoButton} />
                            </View>    
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => guardar(true)}>
                            <View style={styles.viewButton}>
                                <Text style={styles.addIcon}>+</Text>
                            </View>    
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.titulo}>Productos</Text>
                    <AcordionDinamico titulo={prodSeleccionado} isOpen={abiertoProd} onToggle={() => setAbiertoProd(!abiertoProd)}>
                        {prodsDisponibles.length > 0 ? (
                            prodsDisponibles.map((tipo) => (
                                <TouchableOpacity
                                    key={tipo.id}
                                    style={styles.botonCupoOpcion}
                                    onPress={() => {
                                        setProdActual(prev => ({ ...(prev ?? {}), productoId: tipo.id } as ProductoCliente));
                                        setProdSeleccionado(tipo.nombre);
                                        setAbiertoProd(false);
                                    }}
                                >
                                    <Text style={styles.textoGris}>{tipo.nombre}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.textoGris}>Este cliente ya cuenta con todos los productos disponibles.</Text>
                        )}
                    </AcordionDinamico>
                    {errores.tipoProducto && <Text style={styles.textError}>{errores.tipoProducto}</Text>}
                    
                    <View style={styles.rowButtons}>
                        <TouchableOpacity onPress= {() => handleEliminar(false)}>
                            <View style={styles.viewButton}>
                                <Image source={require('../../../assets/images/eliminarCP.png')} style={[styles.logoButton, { marginLeft: 4 }]} />
                            </View>    
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleModalProd}>
                            <View style={styles.viewButton}>
                                <Image source={require('../../../assets/images/ojo.png')} style={styles.logoButton} />
                            </View>    
                        </TouchableOpacity>
                        {/* 🛠️ CORREGIDO: Llamaba a validarFormulario, ahora ejecuta guardar(false) correctamente */}
                        <TouchableOpacity onPress={() => guardar(false)}>
                            <View style={styles.viewButton}>
                                <Text style={styles.addIcon}>+</Text>
                            </View>    
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end' }} onPress={() => router.push(`/cliente/${id}`)}>
                        <View style={styles.button}>
                            <Text style={styles.textButton}>➜</Text>
                        </View>
                    </TouchableOpacity>
                </ScrollView>

                {/* --- MODAL CUPOS --- */}
                <Modal animationType="fade" transparent={true} visible={modalCupos} onRequestClose={handleModalCupos}>
                    <View style={styles.fondoModal}>
                        <View style={styles.tarjetaModal}>
                            <Text style={styles.tituloModal}>Cupos actuales:</Text>
                            <View style={styles.lineaDivisoria} />
                            <ScrollView contentContainerStyle={styles.listaContenedor}>
                                {cupos && cupos.length > 0 ? (
                                    cupos.map((cupo, index) => (
                                        <View key={index} style={styles.filaCupo}>
                                            <View style={styles.indicadorRojo} />
                                            <View style={styles.infoCupo}>
                                                <Text style={styles.tipoTexto}>{cupo.tipo}</Text>
                                                <Text style={styles.montoTexto}>
                                                    ${Number(cupo.monto).toLocaleString('es-CO')}
                                                </Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.contenedorVacio}>
                                        <Text style={styles.textoVacio}>No se han agregado cupos aún para este cliente.</Text>
                                    </View>
                                )}
                            </ScrollView>
                            <TouchableOpacity style={styles.botonCerrar} onPress={handleModalCupos}>
                                <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                {/* --- MODAL PRODUCTOS --- */}
                <Modal animationType="fade" transparent={true} visible={modalProd} onRequestClose={handleModalProd}>
                    <View style={styles.fondoModal}>
                        <View style={styles.tarjetaModal}>
                            <Text style={styles.tituloModal}>Productos actuales:</Text>
                            <View style={styles.lineaDivisoria} />
                            <ScrollView contentContainerStyle={styles.listaContenedor}>
                                {productos && productos.length > 0 ? (
                                    productos.map((producto, index) => (
                                        <View key={index} style={styles.filaCupo}>
                                            <View style={styles.indicadorRojo} />
                                            <View style={styles.infoCupo}>
                                                <Text style={styles.tipoTexto}>{producto.Productos?.nombre || 'Producto sin nombre'}</Text>
                                            </View>
                                        </View>
                                    ))
                                ) : (
                                    <View style={styles.contenedorVacio}>
                                        <Text style={styles.textoVacio}>No se han agregado productos aún para este cliente.</Text>
                                    </View>
                                )}
                            </ScrollView>
                            <TouchableOpacity style={styles.botonCerrar} onPress={handleModalProd}>
                                <Text style={styles.textoBotonCerrar}>Cerrar</Text>
                            </TouchableOpacity>
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
  back: { marginHorizontal: 10, width: 30, height: 30 },
  nombre: { fontFamily: 'JosefinSans_400Regular', fontSize: 24, alignContent: 'space-between' },
  titulo: { fontSize: 20, color: '#000', fontFamily: 'JosefinSans_400Regular', marginBottom: 4 },
  input: { backgroundColor: '#D9D9D9', borderRadius: 50, paddingVertical: 16, paddingHorizontal: 15, fontSize: 18, color: '#000', fontFamily: 'JosefinSans_400Regular', marginVertical: 8 },
  botonCupoOpcion: { backgroundColor: '#EFEFEF', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16, margin: 4 },
  textoGris: { color: '#5D5D5D', fontFamily: 'JosefinSans_400Regular', padding: 8 },
  rowButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  viewButton: { backgroundColor: '#C4C4C4', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  logoButton: { width: 30, height: 30 },
  addIcon: { fontFamily: 'JosefinSans_400Regular', fontSize: 56, color: '#595959', marginTop: -6 },
  button: { backgroundColor: '#E6000D', height: 60, width: '50%', borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  textButton: { color: '#fff', fontSize: 36 },
  fondoModal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  tarjetaModal: { backgroundColor: '#D9D9D9', borderRadius: 30, width: '100%', maxHeight: '70%', padding: 24 },
  tituloModal: { fontSize: 22, color: '#E6000D', fontFamily: 'JosefinSans_700Bold', textAlign: 'center', marginBottom: 10 },
  lineaDivisoria: { height: 1, backgroundColor: '#5d5d5d', opacity: 0.3, marginBottom: 16 },
  listaContenedor: { paddingVertical: 4 },
  filaCupo: { flexDirection: 'row', backgroundColor: '#EFEFEF', borderRadius: 20, padding: 14, marginVertical: 6, alignItems: 'center' },
  indicadorRojo: { width: 6, height: 24, backgroundColor: '#E6000D', borderRadius: 3, marginRight: 12 },
  infoCupo: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipoTexto: { fontSize: 16, color: '#2A2A2A', fontFamily: 'JosefinSans_400Regular' },
  montoTexto: { fontSize: 16, color: '#E6000D', fontFamily: 'JosefinSans_700Bold' },
  contenedorVacio: { paddingVertical: 30, alignItems: 'center', justifyContent: 'center' },
  textoVacio: { fontSize: 16, color: '#5D5D5D', fontFamily: 'JosefinSans_400Regular', textAlign: 'center', opacity: 0.8 },
  botonCerrar: { backgroundColor: '#E6000D', borderRadius: 50, paddingVertical: 14, marginTop: 20, alignItems: 'center' },
  textoBotonCerrar: { color: '#FFFFFF', fontSize: 18, fontFamily: 'JosefinSans_700Bold' },
  textError: { color: '#E6000D', fontSize: 14, fontFamily: 'JosefinSans_400Regular', marginLeft: 15, marginTop: -4, marginBottom: 8 },
});