import { createClient } from "@/lib/supabase/server";
import { AssetCard, type AssetCardData } from "@/components/AssetCard";
import { Card } from "@/components/ui/primitives";

export const revalidate = 0;

export default async function AcoesBrPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("asset_snapshots")
    .select("*")
    .eq("asset_type", "acao_br")
    .order("score", { ascending: false });

  const assets = (data ?? []) as AssetCardData[];

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-3xl italic text-text">Ações Brasil</p>
        <p className="mt-1 text-sm text-text-muted">Fundamentos, valuation e score gerados a cada hora.</p>
      </div>
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((a) => (
          <AssetCard key={a.symbol} asset={a} />
        ))}
        {assets.length === 0 && (
          <Card className="p-6 text-center text-sm text-text-muted sm:col-span-2 lg:col-span-3">
            Nenhuma ação BR processada ainda.
          </Card>
        )}
      </div>
    </div>
  );
}
