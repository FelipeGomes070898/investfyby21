"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "./ui/primitives";

export interface WatchlistItem {
  id: string;
  symbol: string;
  asset_type: "acao_br" | "acao_us" | "cripto";
}

const TYPE_LABEL: Record<string, string> = {
  acao_br: "Ação BR",
  acao_us: "Ação US",
  cripto: "Cripto",
};

export function WatchlistManager({ items }: { items: WatchlistItem[] }) {
  const router = useRouter();
  const [symbol, setSymbol] = useState("");
  const [assetType, setAssetType] = useState<"acao_br" | "acao_us" | "cripto">("acao_br");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!symbol.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: symbol.trim(), asset_type: assetType }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Não foi possível adicionar.");
      }
      setSymbol("");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: string) {
    await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card className="p-4">
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="mb-1 block text-xs text-text-muted">Símbolo</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="ex: PETR4, AAPL, BTC"
              className="w-full rounded-md border border-ink-line bg-ink-raised px-3 py-2 text-sm font-mono text-text placeholder:text-text-faint focus:border-brass"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Tipo</label>
            <select
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as any)}
              className="rounded-md border border-ink-line bg-ink-raised px-3 py-2 text-sm text-text focus:border-brass"
            >
              <option value="acao_br">Ação BR</option>
              <option value="acao_us">Ação US</option>
              <option value="cripto">Cripto</option>
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Adicionando…" : "Adicionar"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-neg">{error}</p>}
        <p className="mt-2 text-xs text-text-faint">
          Ativos adicionados aqui entram automaticamente no radar horário na próxima execução.
        </p>
      </Card>

      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-text">{item.symbol}</span>
              <span className="text-xs text-text-muted">{TYPE_LABEL[item.asset_type]}</span>
            </div>
            <button onClick={() => handleRemove(item.id)} className="text-xs text-text-muted hover:text-neg">
              remover
            </button>
          </Card>
        ))}
        {items.length === 0 && (
          <Card className="p-6 text-center text-sm text-text-muted">
            Sua watchlist está vazia. Adicione um ativo acima.
          </Card>
        )}
      </div>
    </div>
  );
}
