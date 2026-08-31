"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TopBar({ email }: { email: string | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-line bg-ink px-4 py-3 md:px-8">
      <p className="font-display text-lg italic text-text md:hidden">Radar</p>
      <div className="hidden text-sm text-text-muted md:block" />
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-text-muted sm:inline">{email}</span>
        <button onClick={handleLogout} className="text-sm text-text-muted hover:text-brass">
          Sair
        </button>
      </div>
    </header>
  );
}
