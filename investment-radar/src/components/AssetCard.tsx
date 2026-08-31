import Link from "next/link";
import { Card, ChangeValue, Badge } from "./ui/primitives";
import { ScoreGauge } from "./ScoreGauge";

export interface AssetCardData {
  symbol: string;
  name: string | null;
  asset_type: "acao_br" | "acao_us" | "cripto";
  price: number | null;
  change_24h: number | null;
  score: number | null;
  classification: string | null;
}

function formatPrice(price: number | null, assetType: string) {
  if (price === null) return "—";
  const currency = assetType === "acao_br" ? "R$" : "US$";
  return `${currency} ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: assetType === "cripto" && price < 1 ? 6 : 2 })}`;
}

export function AssetCard({ asset }: { asset: AssetCardData }) {
  return (
    <Link href={`/ativo/${asset.symbol}?tipo=${asset.asset_type}`}>
      <Card className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:border-brass/40">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-text">{asset.symbol}</span>
            {asset.classification && <Badge tone="brass">{asset.classification}</Badge>}
          </div>
          <p className="truncate text-xs text-text-muted">{asset.name}</p>
        </div>

        <div className="text-right">
          <p className="tabular font-mono text-sm text-text">{formatPrice(asset.price, asset.asset_type)}</p>
          <ChangeValue value={asset.change_24h} />
        </div>

        {asset.score !== null && <ScoreGauge score={asset.score} size={48} />}
      </Card>
    </Link>
  );
}
