export type AssetType = "acao_br" | "acao_us" | "cripto";

export type Classification =
  | "muito_barata"
  | "barata"
  | "razoavel"
  | "cara"
  | "muito_cara"
  | "alto_risco";

export interface CryptoQuote {
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
  sources: {
    coinmarketcap: boolean;
    coingecko: boolean;
  };
  // divergência percentual de preço entre as duas fontes — útil para saber se os dados são confiáveis
  priceDivergencePct: number | null;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change24h: number | null;
  currency: string;
  pl: number | null;
  pvp: number | null;
  dividendYield: number | null;
  roe: number | null;
  marketCap: number | null;
  provider: string;
}

export interface NewsItem {
  headline: string;
  link: string;
  sourceName: string;
  publishedAt: string | null;
  region: "brasil" | "eua" | "cripto";
}

export interface ClassifiedNews extends NewsItem {
  summary: string;
  impact: "positivo" | "neutro" | "negativo";
  changesThesis: boolean;
  relatedSymbols: string[];
}

export interface AssetAnalysis {
  score: number; // 0-10
  breakdown: Record<string, number>;
  classification: string;
  text: string;
}
