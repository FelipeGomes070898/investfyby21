"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card } from "./ui/primitives";

export function SettingsForm({
  userId,
  initialDisplayName,
  initialNotify,
}: {
  userId: string;
  initialDisplayName: string;
  initialNotify: boolean;
}) {
  const supabase = createClient();
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [notify, setNotify] = useState(initialNotify);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await supabase.from("user_settings").upsert({
      user_id: userId,
      display_name: displayName,
      notify_on_thesis_change: notify,
      updated_at: new Date().toISOString(),
    });
    setLoading(false);
    setSaved(true);
  }

  return (
    <Card className="max-w-md p-5">
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-text-muted">Nome de exibição</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md border border-ink-line bg-ink-raised px-3 py-2 text-sm text-text focus:border-brass"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-text">
          <input
            type="checkbox"
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
            className="h-4 w-4 rounded border-ink-line bg-ink-raised accent-brass"
          />
          Destacar no radar diário quando uma notícia mudar minha tese
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando…" : "Salvar"}
          </Button>
          {saved && <span className="text-sm text-pos">Salvo.</span>}
        </div>
      </form>
    </Card>
  );
}
