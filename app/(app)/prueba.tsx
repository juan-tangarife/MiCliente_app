import { AcordionDinamico } from '@/components/acordionCard';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

export default function Prueba() {
  return (
    <ScrollView style={{ flex: 1 }}>
  <Text>Información General</Text>
  
  <AcordionDinamico titulo="Ver Cupos">
     {/* Aquí van los valores específicos que mencionaste */}
     <Text>Cupo 1: Disponible</Text>
     <Text>Cupo 2: Reservado</Text>
  </AcordionDinamico>

  <AcordionDinamico titulo="Ver Productos">
     {/* La lista de productos del cliente */}
     <Text>Producto A</Text>
     <Text>Producto B</Text>
  </AcordionDinamico>

  <View style={{ padding: 20 }}>
    <Text>Este texto bajará automáticamente cuando abras los de arriba.</Text>
  </View>
</ScrollView>
  );
}
