import { supabase } from "@/lib/supabase";

export type Cliente = {
   nit: string;
   name: string;
   gerente: string;
   sectorEconomico: string;
   telefono: string;
   email: string;
   nombreContacto: string;
   telefonoContacto: string;
   correoContacto: string;
   captacion: number;
   colocacion: number;
   actaId: string;
   userId: string;
   photoUrl: string;
}

// ── READ: Leer contactos del usuario autenticado ───────────────
// RLS filtra automáticamente — solo devuelve los del usuario actual
export async function obtenerClientes(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('Cliente')
    .select('*')
    .order('name', { ascending: true })
  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ── READ: Obtener uno por NIT ───────────────────────────────────
export async function obtenerClientePorNIT(id: string): Promise<Cliente | null> {
  const { data, error } = await supabase
    .from('Cliente')
    .select('*')
    .eq('nit', id)
    .single();
  if (error) { console.error(error); return null; }
  return data;
}