import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchBrStockQuotes } from "@/lib/providers/brapi";
import { fetchUsStockQuotes } from "@/lib/providers/finnhub";
import { fetchCrossReferencedCrypto } from "@/lib/providers/cryptoAggregate";
import { generateAssetAnalysis } from "@/lib/claude";
import { stockFacts, cryptoFacts } from "@/lib/scoring";
import type { AssetType } from "@/lib/types";

export async function POST(req: NextRequest) {
  // exige usuário logado (evita que qualquer um esgote sua cota da Claude API)
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });

  const { symbol, asset_type } = (await req.json()) as { symbol: string; asset_type: AssetType };
  if (!symbol || !asset_type) {
    return NextResponse.json({ error: "symbol e asset_type são obrigatórios" }, { status: 400 });
  }

  let name = symbol;
  let price = 0;
  let change24h: number | null = null;
  let facts: Record<string, unknown> = {};

  if (asset_type === "acao_br") {
    const [q] = await fetchBrStockQuotes([symbol]);
    if (!q) return NextResponse.json({ error: "ativo não encontrado" }, { status: 404 });
    name = q.name;
    price = q.price;
    change24h = q.change24h;
    facts = stockFacts(q);
  } else if (asset_type === "acao_us") {
    const [q] = await fetchUsStockQuotes([symbol]);
    if (!q) return NextResponse.json({ error: "ativo não encontrado" }, { status: 404 });
    name = q.name;
    price = q.price;
    change24h = q.change24h;
    facts = stockFacts(q);
  } else {
    const [q] = await fetchCrossReferencedCrypto([symbol]);
    if (!q) return NextResponse.json({ error: "ativo não encontrado" }, { status: 404 });
    name = q.name;
    price = q.priceUsd;
    change24h = q.change24h;
    facts = cryptoFacts(q);
  }

  const analysis = await generateAssetAnalysis({ symbol, assetType: asset_type, facts });

  const admin = createAdminClient();
  await admin.from("asset_snapshots").upsert(
    {
      symbol,
      asset_type,
      name,
      price,
      change_24h: change24h,
      fundamentals: facts,
      score: analysis.score,
      score_breakdown: analysis.breakdown,
      classification: analysis.classification,
      analysis: analysis.text,
      source: { generated_by: "claude", triggered_by: "on-demand", model_facts: facts },
      fetched_at: new Date().toISOString(),
    },
    { onConflict: "symbol,asset_type" }
  );
  await admin.from("asset_history").insert({ symbol, asset_type, price, score: analysis.score });

  return NextResponse.json({ symbol, name, price, change24h, facts, analysis });
}
