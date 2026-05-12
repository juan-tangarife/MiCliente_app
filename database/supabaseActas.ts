import { supabase } from "@/lib/supabase";

export type Acta = {
    numeroActa: string;
    tipo: string;
    fecha: Date;
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
export async function obtenerActaPorNumero(numero: string): Promise<Acta | null> {
  const { data, error } = await supabase
    .from('Actas')
    .select('*')
    .eq('numeroActa', numero)
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