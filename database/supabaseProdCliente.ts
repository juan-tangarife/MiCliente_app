import { supabase } from "@/lib/supabase";

export type ProductoCliente = {
    clienteId: string;
    productoId: number;
    Productos: { nombre: string};
}

// ── READ: Leer contactos del usuario autenticado ───────────────
// RLS filtra automáticamente — solo devuelve los del usuario actual
export async function obtenerProdCliente(): Promise<ProductoCliente[]> {
  const { data, error } = await supabase
    .from('ProductoCliente')
    .select('*')
  if (error) { console.error(error); return []; }
  return data ?? [];
}

// ── READ: Obtener uno por ID ───────────────────────────────────
export async function obtenerProdClientePorId(id: string): Promise<ProductoCliente[] | null> {
  const { data, error } = await supabase
    .from('ProductoCliente')
    .select('*, Productos (nombre)') 
    .eq('clienteId', id);
  if (error) { console.error(error); return null; }
  return data;
}

export async function eliminarProdCliente(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ProductoCliente')
    .delete()
    .eq('clienteId', id);
  // RLS garantiza que solo puedes eliminar tus propios registros
  if (error) { console.error(error); return false; }
  return true;
}

export async function guardarProductoCliente(
  datos: ProductoCliente
): Promise<ProductoCliente | null>{
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('ProductoCliente')
    .insert([
      datos
    ])
    .select()
    .single();
  if (error) { console.error(error); return null; }
  return data;
}