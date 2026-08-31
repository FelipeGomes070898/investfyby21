"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/primitives";
import { GoogleButton } from "@/components/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl italic text-text">Radar</p>
          <p className="text-sm text-text-muted">Entre para ver seu radar de investimentos</p>
        </div>

        <GoogleButton label="Entrar com Google" />

        <div className="my-5 flex items-center gap-3 text-xs text-text-faint">
          <div className="h-px flex-1 bg-ink-line" />
          ou com e-mail
          <div className="h-px flex-1 bg-ink-line" />
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <input
            type="email"
            required
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-ink-line bg-ink-raised px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-brass"
          />
          <input
            type="password"
            required
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-ink-line bg-ink-raised px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-brass"
          />
          {error && <p className="text-sm text-neg">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Entrando…" : "Entrar"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Ainda não tem conta?{" "}
          <Link href="/signup" className="text-brass hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
