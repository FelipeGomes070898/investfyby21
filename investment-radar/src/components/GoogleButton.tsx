"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleButton({ label }: { label: string }) {
  const supabase = createClient();

  async function handleClick() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-md border border-ink-line bg-ink-raised px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-ink-surface"
    >
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.5 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.1 17.7 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.6c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-4 6.8-9.9 6.8-17.2z" />
        <path fill="#FBBC05" d="M10.5 19.3l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.6 10.8l7.9-6.1c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7z" />
        <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.3-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-3.6-13.5-8.7l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
      </svg>
      {label}
    </button>
  );
}
