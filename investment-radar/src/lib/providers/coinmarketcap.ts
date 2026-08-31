// Documentação: https://coinmarketcap.com/api/documentation/v1/
const BASE_URL = "https://pro-api.coinmarketcap.com/v1";

export interface CmcQuote {
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

export async function fetchCmcQuotes(symbols: string[]): Promise<Record<string, CmcQuote>> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    console.warn("COINMARKETCAP_API_KEY não configurada — pulando CoinMarketCap.");
    return {};
  }

  const url = `${BASE_URL}/cryptocurrency/quotes/latest?symbol=${symbols.join(",")}&convert=USD`;
  const res = await fetch(url, {
    headers: { "X-CMC_PRO_API_KEY": apiKey },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    console.error("Erro CoinMarketCap:", res.status, await res.text());
    return {};
  }

  const json = await res.json();
  const out: Record<string, CmcQuote> = {};

  for (const symbol of symbols) {
    const entry = json?.data?.[symbol];
    // a API pode devolver um array quando há tickers duplicados; pegamos o primeiro
    const d = Array.isArray(entry) ? entry[0] : entry;
    if (!d) continue;
    const quote = d.quote?.USD;
    out[symbol] = {
      symbol,
      name: d.name,
      priceUsd: quote?.price ?? 0,
      change24h: quote?.percent_change_24h ?? null,
      change7d: quote?.percent_change_7d ?? null,
      marketCap: quote?.market_cap ?? null,
      fdv: quote?.fully_diluted_market_cap ?? null,
      volume24h: quote?.volume_24h ?? null,
      circulatingSupply: d.circulating_supply ?? null,
      totalSupply: d.total_supply ?? null,
    };
  }

  return out;
}

// Lista de criptos recém-listadas / em alta, para o "radar de novas criptos"
export async function fetchNewCmcListings(): Promise<CmcQuote[]> {
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) return [];

  const url = `${BASE_URL}/cryptocurrency/listings/latest?sort=date_added&sort_dir=desc&limit=25`;
  const res = await fetch(url, {
    headers: { "X-CMC_PRO_API_KEY": apiKey },
    next: { revalidate: 0 },
  });
  if (!res.ok) return [];

  const json = await res.json();
  return (json?.data ?? []).map((d: any) => ({
    symbol: d.symbol,
    name: d.name,
    priceUsd: d.quote?.USD?.price ?? 0,
    change24h: d.quote?.USD?.percent_change_24h ?? null,
    change7d: d.quote?.USD?.percent_change_7d ?? null,
    marketCap: d.quote?.USD?.market_cap ?? null,
    fdv: d.quote?.USD?.fully_diluted_market_cap ?? null,
    volume24h: d.quote?.USD?.volume_24h ?? null,
    circulatingSupply: d.circulating_supply ?? null,
    totalSupply: d.total_supply ?? null,
  }));
}
