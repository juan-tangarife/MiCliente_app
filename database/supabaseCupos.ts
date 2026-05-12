import { supabase } from "@/lib/supabase";

export type Cupo = {
    id: number;
    monto: number;
    tipo: string;
    actaId: string;
}

// ── READ: Leer contactos del usuario autenticado ───────────────
// RLS filtra automáticamente — solo devuelve los del usuario actual
export async function obtenerCupos(): Promise<Cupo[]> {
  const { data, error } = await supabase
    .from('Cupos')
    .select('*')
  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ── READ: Obtener uno por actaId ───────────────────────────────────
export async function obtenerCuposPorActaId(actaId: string): Promise<Cupo[] | null> {
  const { data, error } = await supabase
    .from('Cupos')
    .select('*')
    .eq('actaId', actaId);
  if (error) { console.error(error); return null; }
  return data;
}

export async function eliminarCuposPorActaId(actaId: string): Promise<boolean> {
  const { error } = await supabase
    .from('Cupos')
    .delete()
    .eq('actaId', actaId);
  // RLS garantiza que solo puedes eliminar tus propios registros
  if (error) { console.error(error); return false; }
  return true;
}