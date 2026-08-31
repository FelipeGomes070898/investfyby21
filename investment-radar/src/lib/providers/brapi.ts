// Documentação: https://brapi.dev/docs
import type { StockQuote } from "../types";

function mapQuote(d: any): StockQuote {
  return {
    symbol: d.symbol,
    name: d.longName ?? d.shortName ?? d.symbol,
    price: d.regularMarketPrice,
    change24h: d.regularMarketChangePercent ?? null,
    currency: "BRL",
    pl: d.priceEarnings ?? null,
    pvp: d.priceToBook ?? null,
    dividendYield: d.dividendsYield ? d.dividendsYield * 100 : null,
    roe: d.returnOnEquity ? d.returnOnEquity * 100 : null,
    marketCap: d.marketCap ?? null,
    provider: "brapi",
  };
}

async function fetchOne(ticker: string, token: string): Promise<StockQuote | null> {
  const url = `https://brapi.dev/api/quote/${ticker}?fundamental=true&token=${token}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    console.error(`Erro brapi (${ticker}):`, res.status, await res.text());
    return null;
  }
  const json = await res.json();
  const d = json?.results?.[0];
  return d ? mapQuote(d) : null;
}

// O plano gratuito do brapi.dev permite apenas 1 ativo por requisição,
// então buscamos ticker por ticker — mas em paralelo, para não demorar demais.
export async function fetchBrStockQuotes(tickers: string[]): Promise<StockQuote[]> {
  const token = process.env.BRAPI_TOKEN;
  if (!token || tickers.length === 0) return [];

  const settled = await Promise.allSettled(tickers.map((ticker) => fetchOne(ticker, token)));
  return settled
    .filter((r): r is PromiseFulfilledResult<StockQuote | null> => r.status === "fulfilled")
    .map((r) => r.value)
    .filter((q): q is StockQuote => q !== null);
}
