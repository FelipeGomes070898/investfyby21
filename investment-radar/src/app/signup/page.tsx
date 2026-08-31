"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/primitives";
import { GoogleButton } from "@/components/GoogleButton";

export default function SignupPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <div className="max-w-sm">
          <p className="font-display text-2xl italic text-text">Quase lá</p>
          <p className="mt-2 text-sm text-text-muted">
            Enviamos um link de confirmação para <span className="text-text">{email}</span>. Abra seu
            e-mail para ativar a conta.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl italic text-text">Criar conta</p>
          <p className="text-sm text-text-muted">Comece a acompanhar seu radar de investimentos</p>
        </div>

        <GoogleButton label="Cadastrar com Google" />

        <div className="my-5 flex items-center gap-3 text-xs text-text-faint">
          <div className="h-px flex-1 bg-ink-line" />
          ou com e-mail
          <div className="h-px flex-1 bg-ink-line" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
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
            minLength={6}
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-ink-line bg-ink-raised px-3 py-2 text-sm text-text placeholder:text-text-faint focus:border-brass"
          />
          {error && <p className="text-sm text-neg">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="text-brass hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
