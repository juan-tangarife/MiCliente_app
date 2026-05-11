import React, { useState } from 'react';
import { LayoutAnimation, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';

type Props = {
  titulo: string;
  children: string | React.ReactNode;
};

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function AcordionDinamico({ titulo, children }: Props) {
  const [abierto, setAbierto] = useState(false);

  const toggleAcordion = () => {
    // Esto crea la animación suave de "empuje" para el resto de la pantalla
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAbierto(!abierto);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={toggleAcordion} style={styles.header}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.flecha}>{abierto ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {abierto && (
        <View style={styles.contenido}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#D9D9D9', borderRadius: 30, marginVertical: 8, overflow: 'hidden' },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#D9D9D9' },
  titulo: { color: '#E6000D', fontSize: 18, fontFamily: 'JosefinSans_400Regular', opacity: 0.6, marginTop: 4 },
  flecha: { color: '#E6000D', opacity: 0.6 },
  contenido: { paddingHorizontal: 20, paddingBottom: 16 },
});