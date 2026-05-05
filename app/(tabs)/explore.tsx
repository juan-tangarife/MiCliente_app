import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text,TouchableOpacity } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { useState } from 'react';

export default function TabTwoScreen() {
    const [contador, setContador] = useState(0);  // estado inicial = 0

  return (
    <View style={styles.container}>
      <Text style={styles.numero}>{contador}</Text>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => setContador(contador + 1)}
      >
        <Text style={styles.botonTexto}>Incrementar +</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.boton, styles.botonRojo]}
        onPress={() => setContador(0)}
      >
        <Text style={styles.botonTexto}>Reiniciar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  numero:    { fontSize: 72, fontWeight: 'bold', color: '#1E3A5F' },
  boton:     { backgroundColor: '#2D9CDB', padding: 16, borderRadius: 12, margin: 8, minWidth: 160, alignItems: 'center' },
  botonRojo: { backgroundColor: '#E74C3C' },
  botonTexto:{ color: '#fff', fontSize: 16, fontWeight: '600' },
});

