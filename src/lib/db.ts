/**
 * Camada de acesso ao banco de dados via Supabase.
 * Substitui o localStorage da versão anterior.
 */
import { createBrowserClient } from "@supabase/ssr";

export function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getWorkshopId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
