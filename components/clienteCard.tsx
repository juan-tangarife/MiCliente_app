import { Cliente } from '@/database/supabaseClientes';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  cliente: Cliente;
  onPress: () => void;
};

export default function ClienteCard({ cliente, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      
      {/* Avatar */}
      <View style={styles.avatar}>
        <Text style={styles.avatarLetra}>
            {cliente.name?.[0]?.toUpperCase() || '?'}
              </Text>
        </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.nombre}>{cliente.name}</Text>
        <View style={styles.linea} />
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: '#EFEFEF', borderRadius: 14, marginBottom: 12, alignItems: 'center'},
  avatar: { width: 60, height: 60, borderRadius: 100, marginRight: 12, backgroundColor:'#D9D9D9',
    justifyContent: 'center', alignItems: 'center'
  },
  avatarLetra: { fontSize:35, color:'#808080', opacity:0.6, fontFamily: 'JosefinSans_400Regular', marginTop: 4 },
  info: { flex: 1, paddingLeft: 4 },
  nombre: { fontSize: 20, color: '#000', fontFamily: 'JosefinSans_400Regular', marginBottom: 4 },
  linea: { height: 2, backgroundColor: '#D9D9D9', marginTop: 8, justifyContent: 'flex-end' },
});