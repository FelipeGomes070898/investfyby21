"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/primitives";

export function WatchlistToggle({
  symbol,
  assetType,
  initialWatchlistId,
}: {
  symbol: string;
  assetType: string;
  initialWatchlistId: string | null;
}) {
  const router = useRouter();
  const [id, setId] = useState(initialWatchlistId);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (id) {
        await fetch(`/api/watchlist?id=${id}`, { method: "DELETE" });
        setId(null);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol, asset_type: assetType }),
        });
        const body = await res.json();
        setId(body.item?.id ?? null);
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant={id ? "primary" : "ghost"} onClick={handleClick} disabled={loading}>
      {id ? "✓ Na minha watchlist" : "+ Adicionar à watchlist"}
    </Button>
  );
}
