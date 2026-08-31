import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchBrStockQuotes } from "@/lib/providers/brapi";
import { fetchUsStockQuotes } from "@/lib/providers/finnhub";
import { fetchCrossReferencedCrypto } from "@/lib/providers/cryptoAggregate";
import { fetchAllNews } from "@/lib/providers/rssNews";
import { generateAssetAnalysis, classifyNewsBatch } from "@/lib/claude";
import { stockFacts, cryptoFacts } from "@/lib/scoring";
import { DEFAULT_BR_STOCKS, DEFAULT_US_STOCKS, DEFAULT_CRYPTO } from "@/lib/defaultAssets";
import type { AssetType } from "@/lib/types";

export const maxDuration = 300; // segundos — várias chamadas de API + Claude, precisa de folga

function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

export async function POST(req: NextRequest) {
  if (!process.env.CRON_SECRET || !isAuthorized(req)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const log: string[] = [];

  // 1) junta a lista padrão com o que os usuários colocaram na watchlist
  const { data: watchlistRows } = await supabase.from("watchlist").select("symbol, asset_type");
  const extra = watchlistRows ?? [];

  const brSymbols = Array.from(
    new Set([...DEFAULT_BR_STOCKS, ...extra.filter((w) => w.asset_type === "acao_br").map((w) => w.symbol)])
  );
  const usSymbols = Array.from(
    new Set([...DEFAULT_US_STOCKS, ...extra.filter((w) => w.asset_type === "acao_us").map((w) => w.symbol)])
  );
  const cryptoSymbols = Array.from(
    new Set([...DEFAULT_CRYPTO, ...extra.filter((w) => w.asset_type === "cripto").map((w) => w.symbol)])
  );

  // 2) busca os dados brutos em paralelo
  const [brStocks, usStocks, cryptos] = await Promise.all([
    fetchBrStockQuotes(brSymbols),
    fetchUsStockQuotes(usSymbols),
    fetchCrossReferencedCrypto(cryptoSymbols),
  ]);
  log.push(`Dados brutos: ${brStocks.length} ações BR, ${usStocks.length} ações US, ${cryptos.length} criptos.`);

  // 3) gera a análise da Claude API para cada ativo e grava snapshot + histórico
  async function saveAsset(symbol: string, assetType: AssetType, name: string, price: number, change24h: number | null, facts: Record<string, unknown>) {
    try {
      const analysis = await generateAssetAnalysis({ symbol, assetType, facts });

      const { error: snapshotError } = await supabase.from("asset_snapshots").upsert(
        {
          symbol,
          asset_type: assetType,
          name,
          price,
          change_24h: change24h,
          fundamentals: facts,
          score: analysis.score,
          score_breakdown: analysis.breakdown,
          classification: analysis.classification,
          analysis: analysis.text,
          source: { generated_by: "claude", model_facts: facts },
          fetched_at: new Date().toISOString(),
        },
        { onConflict: "symbol,asset_type" }
      );
      if (snapshotError) {
        log.push(`Erro ao salvar snapshot de ${symbol}: ${snapshotError.message}`);
      }

      const { error: historyError } = await supabase.from("asset_history").insert({
        symbol,
        asset_type: assetType,
        price,
        score: analysis.score,
      });
      if (historyError) {
        log.push(`Erro ao salvar histórico de ${symbol}: ${historyError.message}`);
      }
    } catch (err) {
      log.push(`Erro ao analisar ${symbol}: ${(err as Error).message}`);
    }
  }

  await Promise.all([
    ...brStocks.map((q) => saveAsset(q.symbol, "acao_br", q.name, q.price, q.change24h, stockFacts(q))),
    ...usStocks.map((q) => saveAsset(q.symbol, "acao_us", q.name, q.price, q.change24h, stockFacts(q))),
    ...cryptos.map((q) =>
      saveAsset(q.symbol, "cripto", q.name, q.priceUsd, q.change24h, cryptoFacts(q))
    ),
  ]);

  // 4) busca e classifica notícias
  try {
    const news = await fetchAllNews();
    const watchedSymbols = [...brSymbols, ...usSymbols, ...cryptoSymbols];
    // processa em lotes de 8 para manter o prompt enxuto
    const batches: (typeof news)[] = [];
    for (let i = 0; i < news.length; i += 8) batches.push(news.slice(i, i + 8));

    const batchResults = await Promise.allSettled(
      batches.map((batch) => classifyNewsBatch(batch, watchedSymbols))
    );

    let processedCount = 0;
    for (const result of batchResults) {
      if (result.status !== "fulfilled") {
        log.push(`Erro num lote de notícias: ${result.reason}`);
        continue;
      }
      for (const item of result.value) {
        await supabase.from("news_alerts").upsert(
          {
            region: item.region,
            headline: item.headline,
            summary: item.summary,
            related_symbols: item.relatedSymbols,
            impact: item.impact,
            changes_thesis: item.changesThesis,
            source_url: item.link,
            source_name: item.sourceName,
            published_at: item.publishedAt,
          },
          { onConflict: "headline" }
        );
        processedCount++;
      }
    }
    log.push(`Notícias processadas: ${processedCount}/${news.length}`);
  } catch (err) {
    log.push(`Erro ao processar notícias: ${(err as Error).message}`);
  }

  return NextResponse.json({ ok: true, log, ranAt: new Date().toISOString() });
}

// Permite testar manualmente pelo navegador (ainda exige o header Authorization via ferramenta tipo curl/Postman)
export async function GET(req: NextRequest) {
  return POST(req);
}
