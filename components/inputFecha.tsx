// components/DatePicker.tsx
import DateTimePicker, {
    DateTimePickerEvent
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    Modal,
    Platform, StyleSheet,
    Text, TouchableOpacity,
    View
} from 'react-native';

type DatePickerProps = {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
};

export function DatePicker({
  label = 'Fecha',
  value,
  onChange,
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [fechaTemporal, setFechaTemporal] = useState(value);

  const formatearFecha = (date: Date) =>
    date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const onCambio = (event: DateTimePickerEvent, date?: Date) => {
    if (!date) return;

    if (Platform.OS === 'android') {
      // Android: confirma o cancela en el mismo evento
      setMostrarPicker(false);
      if (event.type === 'set') onChange(date);
    } else {
      // iOS: el spinner actualiza en tiempo real, se confirma con "Listo"
      setFechaTemporal(date);
    }
  };

  const confirmarIOS = () => {
    onChange(fechaTemporal);
    setMostrarPicker(false);
  };

  const cancelarIOS = () => {
    setFechaTemporal(value); // resetea si cancela
    setMostrarPicker(false);
  };

  return (
    <View>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.input}
        onPress={() => setMostrarPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.inputText}>{formatearFecha(value)}</Text>
        <Text style={styles.icono}>📅</Text>
      </TouchableOpacity>

      {/* ── iOS: spinner inline dentro de un Modal ── */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={mostrarPicker}
          transparent
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContenido}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={cancelarIOS}>
                  <Text style={styles.botonCancelar}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmarIOS}>
                  <Text style={styles.botonListo}>Listo</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={fechaTemporal}
                mode="date"
                display="spinner" // ← tres columnas nativas
                onChange={onCambio}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                locale="es-CO"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* ── Android: abre el diálogo nativo del sistema ── */}
      {Platform.OS === 'android' && mostrarPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="spinner" // ← tres columnas en Android también
          onChange={onCambio}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 6,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
  },
  inputText: {
    fontSize: 15,
    color: '#222',
  },
  icono: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContenido: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  botonCancelar: {
    fontSize: 15,
    color: '#888',
  },
  botonListo: {
    fontSize: 15,
    color: '#1D9E75',
    fontWeight: '500',
  },
});