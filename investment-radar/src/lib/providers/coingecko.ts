// Documentação: https://www.coingecko.com/en/api/documentation
const BASE_URL = "https://api.coingecko.com/api/v3";

export interface GeckoQuote {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number | null;
  change7d: number | null;
  marketCap: number | null;
  fdv: number | null;
  volume24h: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
}

function authHeaders(): HeadersInit {
  const key = process.env.COINGECKO_API_KEY;
  return key ? { "x-cg-demo-api-key": key } : {};
}

// coingeckoIds: mapa symbol -> id do coingecko (ex: BTC -> bitcoin), porque o Gecko não busca por símbolo diretamente
export async function fetchGeckoQuotes(coingeckoIds: string[]): Promise<Record<string, GeckoQuote>> {
  if (coingeckoIds.length === 0) return {};

  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${coingeckoIds.join(
    ","
  )}&price_change_percentage=24h,7d`;

  const res = await fetch(url, { headers: authHeaders(), next: { revalidate: 0 } });
  if (!res.ok) {
    console.error("Erro CoinGecko:", res.status, await res.text());
    return {};
  }

  const json = await res.json();
  const out: Record<string, GeckoQuote> = {};
  for (const d of json) {
    out[d.id] = {
      id: d.id,
      symbol: d.symbol?.toUpperCase(),
      name: d.name,
      priceUsd: d.current_price,
      change24h: d.price_change_percentage_24h_in_currency ?? d.price_change_percentage_24h ?? null,
      change7d: d.price_change_percentage_7d_in_currency ?? null,
      marketCap: d.market_cap ?? null,
      fdv: d.fully_diluted_valuation ?? null,
      volume24h: d.total_volume ?? null,
      circulatingSupply: d.circulating_supply ?? null,
      totalSupply: d.total_supply ?? null,
    };
  }
  return out;
}

// Moedas recém-listadas no CoinGecko — bom complemento ao "novos listings" da CMC
export async function fetchNewGeckoListings(): Promise<GeckoQuote[]> {
  const url = `${BASE_URL}/coins/list/new`;
  const res = await fetch(url, { headers: authHeaders(), next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json ?? []).slice(0, 25).map((d: any) => ({
    id: d.id,
    symbol: (d.symbol ?? "").toUpperCase(),
    name: d.name,
    priceUsd: 0,
    change24h: null,
    change7d: null,
    marketCap: null,
    fdv: null,
    volume24h: null,
    circulatingSupply: null,
    totalSupply: null,
  }));
}

// Trending do momento (o que está sendo mais buscado) — ótimo sinal para meme coins em alta
export async function fetchTrending(): Promise<{ id: string; symbol: string; name: string }[]> {
  const url = `${BASE_URL}/search/trending`;
  const res = await fetch(url, { headers: authHeaders(), next: { revalidate: 0 } });
  if (!res.ok) return [];
  const json = await res.json();
  return (json?.coins ?? []).map((c: any) => ({
    id: c.item.id,
    symbol: c.item.symbol?.toUpperCase(),
    name: c.item.name,
  }));
}
