import { createBrowserClient } from "@supabase/ssr";

// Usado em componentes de cliente ("use client"). Usa a chave anon (pública, segura no navegador).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
