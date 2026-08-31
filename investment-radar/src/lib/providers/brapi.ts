// Documentação: https://brapi.dev/docs
import type { StockQuote } from "../types";

export async function fetchBrStockQuotes(tickers: string[]): Promise<StockQuote[]> {
  const token = process.env.BRAPI_TOKEN;
  if (!token || tickers.length === 0) return [];

  const url = `https://brapi.dev/api/quote/${tickers.join(",")}?fundamental=true&token=${token}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) {
    console.error("Erro brapi:", res.status, await res.text());
    return [];
  }

  const json = await res.json();
  return (json?.results ?? []).map((d: any) => ({
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
  }));
}
