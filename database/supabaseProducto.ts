import { supabase } from "@/lib/supabase";

export type Productos = {
    id: number;
    nombre: string;
}

// ── READ: Leer contactos del usuario autenticado ───────────────
// RLS filtra automáticamente — solo devuelve los del usuario actual
export async function obtenerProductos(): Promise<Productos[]> {
  const { data, error } = await supabase
    .from('Productos')
    .select('*')
  if (error) { console.error(error); return []; }
  return data ?? [];
}