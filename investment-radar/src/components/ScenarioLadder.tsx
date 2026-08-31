import clsx from "clsx";
import { Card } from "./ui/primitives";
import {
  buildStockLadder,
  buildCryptoLadder,
  formatCompact,
  type StockLadderRow,
  type CryptoLadderRow,
} from "@/lib/scenarioLadder";

export function ScenarioLadder({
  assetType,
  currentPrice,
  facts,
}: {
  assetType: "acao_br" | "acao_us" | "cripto";
  currentPrice: number;
  facts: Record<string, any>;
}) {
  const currencySymbol = assetType === "acao_br" ? "R$" : assetType === "acao_us" ? "US$" : "US$";

  if (assetType === "cripto") {
    const rows = buildCryptoLadder({
      currentPrice,
      marketCap: facts.market_cap ?? null,
      fdv: facts.fdv ?? null,
    });
    return (
      <Card className="overflow-x-auto p-4">
        <p className="mb-3 text-sm font-medium text-text-muted">Régua de preços — cenários hipotéticos</p>
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-ink-line text-left text-xs text-text-faint">
              <th className="pb-2 font-normal">Preço</th>
              <th className="pb-2 font-normal">Market cap</th>
              <th className="pb-2 font-normal">FDV</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r: CryptoLadderRow, i) => (
              <tr
                key={i}
                className={clsx(
                  "border-b border-ink-line/50 tabular",
                  r.isCurrent && "bg-brass-soft"
                )}
              >
                <td className="py-2 font-mono">{currencySymbol} {r.price.toFixed(r.price < 1 ? 6 : 2)}</td>
                <td className="py-2 font-mono">{formatCompact(r.marketCap, currencySymbol)}</td>
                <td className="py-2 font-mono">{formatCompact(r.fdv, currencySymbol)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-text-faint">
          Mantém supply e FDV/market cap proporcionais ao preço atual — não é uma projeção, é só a
          matemática dos múltiplos em cada preço hipotético.
        </p>
      </Card>
    );
  }

  const rows = buildStockLadder({
    currentPrice,
    pl: facts.pl ?? null,
    pvp: facts.pvp ?? null,
    dividendYield: facts.dividend_yield_pct ?? null,
  });

  return (
    <Card className="overflow-x-auto p-4">
      <p className="mb-3 text-sm font-medium text-text-muted">Régua de preços — cenários hipotéticos</p>
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-ink-line text-left text-xs text-text-faint">
            <th className="pb-2 font-normal">Preço</th>
            <th className="pb-2 font-normal">P/L</th>
            <th className="pb-2 font-normal">P/VP</th>
            <th className="pb-2 font-normal">DY hipotético</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r: StockLadderRow, i) => (
            <tr
              key={i}
              className={clsx("border-b border-ink-line/50 tabular", r.isCurrent && "bg-brass-soft")}
            >
              <td className="py-2 font-mono">{currencySymbol} {r.price.toFixed(2)}</td>
              <td className="py-2 font-mono">{r.pl ? r.pl.toFixed(2) : "—"}</td>
              <td className="py-2 font-mono">{r.pvp ? r.pvp.toFixed(2) : "—"}</td>
              <td className="py-2 font-mono">{r.dy ? `${r.dy.toFixed(2)}%` : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-text-faint">
        Mantém lucro por ação, valor patrimonial e dividendo por ação constantes — mostra como os
        múltiplos mudariam em cada preço, não uma previsão.
      </p>
    </Card>
  );
}
