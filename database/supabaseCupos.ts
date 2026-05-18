import { supabase } from "@/lib/supabase";
import { TipoCupo } from "@/types/enums";

export type Cupo = {
    id: number;
    monto: number;
    tipo: TipoCupo;
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

export async function guardarCupo(
  datos: Cupo
): Promise<Cupo | null>{
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('Cupos')
    .insert([
      datos
    ])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}