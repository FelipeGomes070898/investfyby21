"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/primitives";

export function ReanalyzeButton({ symbol, assetType }: { symbol: string; assetType: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, asset_type: assetType }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Falha ao reanalisar.");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="ghost" onClick={handleClick} disabled={loading}>
        {loading ? "Buscando dados atuais…" : "Reanalisar agora"}
      </Button>
      {error && <p className="text-xs text-neg">{error}</p>}
    </div>
  );
}
