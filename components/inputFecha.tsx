// components/DatePicker.tsx
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  Button,
  Modal,
  Platform, StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';

type DatePickerProps = {
  fecha: Date | null;
  alCambiar: (date: Date) => void;
};

export function DatePicker({
  fecha, alCambiar
}: DatePickerProps) {
  const [mostrar, setMostrar] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setMostrar(true)} style={styles.input}>
        <Text>{fecha ? fecha.toLocaleDateString() : "Seleccionar fecha"}</Text>
      </TouchableOpacity>

      <Modal visible={mostrar} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <DateTimePicker
              value={fecha || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setMostrar(false);
                if (selectedDate) alCambiar(selectedDate);
              }}
              style={{ width: '100%' }}
            />
            {Platform.OS === 'ios' && (
              <Button title="Confirmar" onPress={() => setMostrar(false)} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  input: { padding: 15, backgroundColor: '#F0F0F0', borderRadius: 25 }
});