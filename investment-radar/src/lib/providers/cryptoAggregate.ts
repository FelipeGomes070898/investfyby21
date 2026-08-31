import { fetchCmcQuotes } from "./coinmarketcap";
import { fetchGeckoQuotes } from "./coingecko";
import type { CryptoQuote } from "../types";

// symbol -> id do coingecko, para os ativos fixos que acompanhamos por padrão.
// Ao adicionar um ativo novo na watchlist, é necessário mapear o id do coingecko aqui
// (ou resolver dinamicamente via /search, se preferir evoluir isso depois).
export const COINGECKO_ID_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  DOGE: "dogecoin",
  ADA: "cardano",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  TON: "the-open-network",
  SHIB: "shiba-inu",
  PEPE: "pepe",
};

// Cruza CoinMarketCap + CoinGecko para o mesmo conjunto de símbolos.
// Se as duas fontes divergirem muito em preço (>3%), sinalizamos isso — pode indicar
// baixa liquidez, delay de alguma API, ou dado suspeito.
export async function fetchCrossReferencedCrypto(symbols: string[]): Promise<CryptoQuote[]> {
  const geckoIds = symbols.map((s) => COINGECKO_ID_MAP[s]).filter(Boolean) as string[];

  const [cmcData, geckoData] = await Promise.all([
    fetchCmcQuotes(symbols),
    fetchGeckoQuotes(geckoIds),
  ]);

  return symbols.map((symbol) => {
    const cmc = cmcData[symbol];
    const geckoId = COINGECKO_ID_MAP[symbol];
    const gecko = geckoId ? geckoData[geckoId] : undefined;

    const priceCmc = cmc?.priceUsd;
    const priceGecko = gecko?.priceUsd;

    let divergence: number | null = null;
    if (priceCmc && priceGecko) {
      divergence = (Math.abs(priceCmc - priceGecko) / ((priceCmc + priceGecko) / 2)) * 100;
    }

    // Preço final: média das duas fontes quando ambas existem, senão a que estiver disponível
    const priceUsd =
      priceCmc && priceGecko ? (priceCmc + priceGecko) / 2 : priceCmc ?? priceGecko ?? 0;

    return {
      symbol,
      name: cmc?.name ?? gecko?.name ?? symbol,
      priceUsd,
      change24h: cmc?.change24h ?? gecko?.change24h ?? null,
      change7d: cmc?.change7d ?? gecko?.change7d ?? null,
      marketCap: cmc?.marketCap ?? gecko?.marketCap ?? null,
      fdv: cmc?.fdv ?? gecko?.fdv ?? null,
      volume24h: cmc?.volume24h ?? gecko?.volume24h ?? null,
      circulatingSupply: cmc?.circulatingSupply ?? gecko?.circulatingSupply ?? null,
      totalSupply: cmc?.totalSupply ?? gecko?.totalSupply ?? null,
      sources: { coinmarketcap: !!cmc, coingecko: !!gecko },
      priceDivergencePct: divergence,
    };
  });
}
