import type { CryptoQuote, StockQuote } from "./types";

// Monta o objeto de "fatos" que vai para a Claude API — só números reais que já buscamos,
// nunca deixamos o modelo inventar dado de mercado.
export function stockFacts(q: StockQuote) {
  return {
    preco: q.price,
    moeda: q.currency,
    variacao_24h_pct: q.change24h,
    pl: q.pl,
    pvp: q.pvp,
    dividend_yield_pct: q.dividendYield,
    roe_pct: q.roe,
    market_cap: q.marketCap,
  };
}

export function cryptoFacts(q: CryptoQuote) {
  const fdvToMcap =
    q.fdv && q.marketCap ? Number((q.fdv / q.marketCap).toFixed(2)) : null;
  const volumeToMcap =
    q.volume24h && q.marketCap ? Number(((q.volume24h / q.marketCap) * 100).toFixed(2)) : null;

  return {
    preco_usd: q.priceUsd,
    variacao_24h_pct: q.change24h,
    variacao_7d_pct: q.change7d,
    market_cap: q.marketCap,
    fdv: q.fdv,
    razao_fdv_marketcap: fdvToMcap, // muito > 1 = grande diluição futura por desbloqueio de tokens
    volume_24h: q.volume24h,
    razao_volume_marketcap_pct: volumeToMcap, // baixo = pouca liquidez, risco de manipulação
    supply_circulante: q.circulatingSupply,
    supply_total: q.totalSupply,
    divergencia_precos_entre_fontes_pct: q.priceDivergencePct,
    fontes_confirmando: [
      q.sources.coinmarketcap ? "CoinMarketCap" : null,
      q.sources.coingecko ? "CoinGecko" : null,
    ].filter(Boolean),
  };
}
