import { createClient } from "@/lib/supabase/server";
import { Card, ChangeValue, Badge } from "@/components/ui/primitives";
import { AssetCard, type AssetCardData } from "@/components/AssetCard";
import { NewsFeed, type NewsAlertData } from "@/components/NewsFeed";

export const revalidate = 0;

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: snapshots }, { data: news }] = await Promise.all([
    supabase.from("asset_snapshots").select("*").order("fetched_at", { ascending: false }),
    supabase.from("news_alerts").select("*").order("created_at", { ascending: false }).limit(12),
  ]);

  const all = (snapshots ?? []) as AssetCardData[];
  const lastUpdate = snapshots?.[0]?.fetched_at as string | undefined;

  const topGainers = [...all]
    .filter((a) => a.change_24h !== null)
    .sort((a, b) => (b.change_24h ?? 0) - (a.change_24h ?? 0))
    .slice(0, 3);
  const topLosers = [...all]
    .filter((a) => a.change_24h !== null)
    .sort((a, b) => (a.change_24h ?? 0) - (b.change_24h ?? 0))
    .slice(0, 3);
  const thesisChangingNews = (news ?? []).filter((n) => n.changes_thesis);

  return (
    <div className="space-y-8">
      <section>
        <p className="font-display text-3xl italic text-text">Radar diário</p>
        <p className="mt-1 text-sm text-text-muted">
          {lastUpdate
            ? `Última atualização: ${new Date(lastUpdate).toLocaleString("pt-BR")}`
            : "Aguardando a primeira atualização do radar."}
        </p>
      </section>

      {thesisChangingNews.length > 0 && (
        <section>
          <p className="mb-2 text-sm font-medium text-warn">⚠️ Notícias que podem mudar sua tese</p>
          <NewsFeed items={thesisChangingNews as NewsAlertData[]} />
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium text-pos">🟢 Maiores altas (24h)</p>
          <div className="space-y-2">
            {topGainers.map((a) => (
              <div key={`${a.asset_type}-${a.symbol}`} className="flex items-center justify-between text-sm">
                <span className="font-mono text-text">{a.symbol}</span>
                <ChangeValue value={a.change_24h} />
              </div>
            ))}
            {topGainers.length === 0 && <p className="text-sm text-text-faint">Sem dados ainda.</p>}
          </div>
        </Card>
        <Card className="p-4">
          <p className="mb-3 text-sm font-medium text-neg">🔴 Maiores quedas (24h)</p>
          <div className="space-y-2">
            {topLosers.map((a) => (
              <div key={`${a.asset_type}-${a.symbol}`} className="flex items-center justify-between text-sm">
                <span className="font-mono text-text">{a.symbol}</span>
                <ChangeValue value={a.change_24h} />
              </div>
            ))}
            {topLosers.length === 0 && <p className="text-sm text-text-faint">Sem dados ainda.</p>}
          </div>
        </Card>
      </section>

      <section>
        <p className="mb-3 text-sm font-medium text-text-muted">Todos os ativos acompanhados</p>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {all.map((a) => (
            <AssetCard key={`${a.asset_type}-${a.symbol}`} asset={a} />
          ))}
          {all.length === 0 && (
            <Card className="p-6 text-center text-sm text-text-muted sm:col-span-2 lg:col-span-3">
              Nenhum ativo processado ainda. Rode o cron (<code className="font-mono">/api/cron/hourly</code>) para
              popular o radar.
            </Card>
          )}
        </div>
      </section>

      <section>
        <p className="mb-3 text-sm font-medium text-text-muted">Últimas notícias do radar</p>
        <NewsFeed items={(news ?? []) as NewsAlertData[]} />
      </section>
    </div>
  );
}
