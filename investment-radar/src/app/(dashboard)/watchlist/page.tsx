import { createClient } from "@/lib/supabase/server";
import { WatchlistManager } from "@/components/WatchlistManager";

export const revalidate = 0;

export default async function WatchlistPage() {
  const supabase = createClient();
  const { data } = await supabase.from("watchlist").select("id, symbol, asset_type").order("created_at");

  return (
    <div className="space-y-5">
      <div>
        <p className="font-display text-3xl italic text-text">Minha watchlist</p>
        <p className="mt-1 text-sm text-text-muted">
          Estes ativos são somados à lista padrão e monitorados a cada hora, com análise da Claude API.
        </p>
      </div>
      <WatchlistManager items={data ?? []} />
    </div>
  );
}
