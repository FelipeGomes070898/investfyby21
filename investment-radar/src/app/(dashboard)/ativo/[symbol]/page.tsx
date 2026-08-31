import { createClient } from "@/lib/supabase/server";
import { Card, ChangeValue, Badge } from "@/components/ui/primitives";
import { ScoreGauge } from "@/components/ScoreGauge";
import { ScenarioLadder } from "@/components/ScenarioLadder";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { ReanalyzeButton } from "@/components/ReanalyzeButton";
import { WatchlistToggle } from "@/components/WatchlistToggle";

export const revalidate = 0;

const ASSET_TYPE_LABEL: Record<string, string> = {
  acao_br: "Ação Brasil",
  acao_us: "Ação EUA",
  cripto: "Criptomoeda",
};

export default async function AtivoPage({
  params,
  searchParams,
}: {
  params: { symbol: string };
  searchParams: { tipo?: string };
}) {
  const symbol = decodeURIComponent(params.symbol).toUpperCase();
  const assetType = (searchParams.tipo ?? "acao_br") as "acao_br" | "acao_us" | "cripto";

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: snapshot }, { data: history }, { data: watchlistRow }] = await Promise.all([
    supabase.from("asset_snapshots").select("*").eq("symbol", symbol).eq("asset_type", assetType).maybeSingle(),
    supabase
      .from("asset_history")
      .select("recorded_at, price, score")
      .eq("symbol", symbol)
      .eq("asset_type", assetType)
      .order("recorded_at", { ascending: true })
      .limit(200),
    user
      ? supabase
          .from("watchlist")
          .select("id")
          .eq("symbol", symbol)
          .eq("asset_type", assetType)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const currencySymbol = assetType === "acao_br" ? "R$" : "US$";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-2xl font-semibold text-text">{symbol}</p>
            <Badge tone="muted">{ASSET_TYPE_LABEL[assetType]}</Badge>
          </div>
          <p className="text-sm text-text-muted">{snapshot?.name ?? "—"}</p>
        </div>
        <WatchlistToggle symbol={symbol} assetType={assetType} initialWatchlistId={watchlistRow?.id ?? null} />
      </div>

      {!snapshot ? (
        <Card className="p-6 text-sm text-text-muted">
          Ainda não há dados para este ativo. Clique em "Reanalisar agora" para buscar pela primeira vez.
          <div className="mt-3">
            <ReanalyzeButton symbol={symbol} assetType={assetType} />
          </div>
        </Card>
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-6 p-5">
            <div>
              <p className="tabular font-mono text-3xl text-text">
                {currencySymbol} {snapshot.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <ChangeValue value={snapshot.change_24h} />
            </div>
            {snapshot.score !== null && (
              <div className="flex items-center gap-3">
                <ScoreGauge score={snapshot.score} size={64} />
                <div>
                  <p className="text-sm text-text-muted">Score do radar</p>
                  <Badge tone="brass">{snapshot.classification}</Badge>
                </div>
              </div>
            )}
            <ReanalyzeButton symbol={symbol} assetType={assetType} />
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm font-medium text-text-muted">Fundamentos observados</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Object.entries(snapshot.fundamentals ?? {}).map(([key, value]) => (
                <div key={key} className="rounded-md border border-ink-line bg-ink-raised px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-text-faint">{key.replace(/_/g, " ")}</p>
                  <p className="tabular font-mono text-sm text-text">
                    {Array.isArray(value)
                      ? value.join(", ") || "—"
                      : value === null || value === undefined
                      ? "—"
                      : String(value)}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm font-medium text-text-muted">Histórico de preço</p>
            <PriceHistoryChart data={history ?? []} />
          </Card>

          <ScenarioLadder assetType={assetType} currentPrice={snapshot.price} facts={snapshot.fundamentals ?? {}} />

          <Card className="p-5">
            <p className="mb-3 text-sm font-medium text-text-muted">Análise (gerada pela Claude API)</p>
            <div className="whitespace-pre-line text-sm leading-relaxed text-text">{snapshot.analysis}</div>
            <p className="mt-4 text-xs text-text-faint">
              Isso é uma análise educacional baseada nos dados buscados automaticamente, não uma
              recomendação personalizada de compra ou venda.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
