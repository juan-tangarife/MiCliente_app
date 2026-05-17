import { supabase } from "@/lib/supabase";

export type Acta = {
    numeroActa: string;
    tipo: string;
    fecha: string;
    clienteId: string;
}

// ── READ: Leer actas del usuario autenticado ───────────────
// RLS filtra automáticamente — solo devuelve los del usuario actual
export async function obtenerActas(): Promise<Acta[]> {
  const { data, error } = await supabase
    .from('Actas')
    .select('*')
  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ── READ: Obtener uno por numero ───────────────────────────────────
export async function obtenerActaPorNIT(numero: string): Promise<Acta | null> {
  const { data, error } = await supabase
    .from('Actas')
    .select('*')
    .eq('clienteId', numero)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function eliminarActa(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('Actas')
    .delete()
    .eq('numeroActa', id);
  // RLS garantiza que solo puedes eliminar tus propios registros
  if (error) { console.error(error); return false; }
  return true;
}

export async function guardarActa(
  datos: Acta
): Promise<Acta | null>{
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const actaProcesada = {
    ...datos,
    // Aseguramos que la fecha vaya como String ISO para que el campo timestamp no explote
    fecha: datos.fecha instanceof Date 
      ? (datos.fecha as Date).toISOString() 
      : datos.fecha
  };

  const { data, error } = await supabase
    .from('Actas')
    .insert([
      actaProcesada
    ])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}

export async function actualizarActa(
  id: string,
  datos: Partial<Acta>
) {
  const { data, error } = await supabase
    .from('Actas')
    .update(datos)
    .eq('numeroActa', id)
    .select()
    .single();
  
  if (error){
    console.error(error); return null;
  }
  return data;
}