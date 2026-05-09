import { supabase } from "@/lib/supabase";

export type Acta = {
    numeroActa: string;
    tipo: string;
    fecha: Date;
}

// ── READ: Leer contactos del usuario autenticado ───────────────
// RLS filtra automáticamente — solo devuelve los del usuario actual
export async function obtenerActas(): Promise<Acta[]> {
  const { data, error } = await supabase
    .from('Actas')
    .select('*')
  if (error) { console.error(error); return []; }
  return data ?? [];
}