// Gera a "régua de preços" no mesmo espírito do exemplo da PETR4:
// mantém os fundamentos constantes (LPA, dividendo por ação, VPA / market cap por unidade)
// e recalcula os múltiplos em vários preços hipotéticos.

const STEPS_PCT = [-40, -30, -20, -10, 0, 15, 30, 50, 80];

export interface StockLadderRow {
  price: number;
  pl: number | null;
  pvp: number | null;
  dy: number | null;
  isCurrent: boolean;
}

export function buildStockLadder(params: {
  currentPrice: number;
  pl: number | null;
  pvp: number | null;
  dividendYield: number | null;
}): StockLadderRow[] {
  const { currentPrice, pl, pvp, dividendYield } = params;
  if (!currentPrice) return [];

  // "congela" os fundamentos por ação a partir do preço e múltiplos atuais
  const eps = pl ? currentPrice / pl : null; // lucro por ação
  const bookValue = pvp ? currentPrice / pvp : null; // valor patrimonial por ação
  const dividendPerShare = dividendYield ? (currentPrice * dividendYield) / 100 : null;

  return STEPS_PCT.map((pct) => {
    const price = currentPrice * (1 + pct / 100);
    return {
      price,
      pl: eps ? price / eps : null,
      pvp: bookValue ? price / bookValue : null,
      dy: dividendPerShare ? (dividendPerShare / price) * 100 : null,
      isCurrent: pct === 0,
    };
  });
}

export interface CryptoLadderRow {
  price: number;
  marketCap: number | null;
  fdv: number | null;
  isCurrent: boolean;
}

export function buildCryptoLadder(params: {
  currentPrice: number;
  marketCap: number | null;
  fdv: number | null;
}): CryptoLadderRow[] {
  const { currentPrice, marketCap, fdv } = params;
  if (!currentPrice) return [];

  return STEPS_PCT.map((pct) => {
    const price = currentPrice * (1 + pct / 100);
    const factor = price / currentPrice;
    return {
      price,
      marketCap: marketCap ? marketCap * factor : null,
      fdv: fdv ? fdv * factor : null,
      isCurrent: pct === 0,
    };
  });
}

export function formatCompact(n: number | null, currency = "US$") {
  if (n === null) return "—";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${currency} ${(n / 1_000_000_000).toFixed(2)}bi`;
  if (abs >= 1_000_000) return `${currency} ${(n / 1_000_000).toFixed(2)}mi`;
  return `${currency} ${n.toFixed(2)}`;
}
