// Documentação: https://finnhub.io/docs/api
import type { StockQuote } from "../types";

async function fetchOne(symbol: string, apiKey: string): Promise<StockQuote | null> {
  const [quoteRes, metricRes, profileRes] = await Promise.all([
    fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`, {
      next: { revalidate: 0 },
    }),
    fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`, {
      next: { revalidate: 0 },
    }),
    fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`, {
      next: { revalidate: 0 },
    }),
  ]);

  if (!quoteRes.ok) return null;

  const quote = await quoteRes.json();
  const metric = metricRes.ok ? await metricRes.json() : { metric: {} };
  const profile = profileRes.ok ? await profileRes.json() : {};

  if (!quote || quote.c === 0) return null;

  return {
    symbol,
    name: profile?.name ?? symbol,
    price: quote.c,
    change24h: quote.dp ?? null,
    currency: profile?.currency ?? "USD",
    pl: metric?.metric?.peTTM ?? null,
    pvp: metric?.metric?.pbAnnual ?? null,
    dividendYield: metric?.metric?.dividendYieldIndicatedAnnual ?? null,
    roe: metric?.metric?.roeTTM ?? null,
    marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1_000_000 : null,
    provider: "finnhub",
  };
}

export async function fetchUsStockQuotes(tickers: string[]): Promise<StockQuote[]> {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey || tickers.length === 0) return [];

  // Finnhub free tier: ~60 chamadas/min. Buscamos em série com um pequeno intervalo para não estourar o limite.
  const out: StockQuote[] = [];
  for (const ticker of tickers) {
    try {
      const q = await fetchOne(ticker, apiKey);
      if (q) out.push(q);
    } catch (err) {
      console.error(`Erro Finnhub para ${ticker}:`, err);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return out;
}
