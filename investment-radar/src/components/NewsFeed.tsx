import { Badge, Card } from "./ui/primitives";

export interface NewsAlertData {
  id: string;
  region: "brasil" | "eua" | "cripto";
  headline: string;
  summary: string;
  impact: "positivo" | "neutro" | "negativo";
  changes_thesis: boolean;
  related_symbols: string[] | null;
  source_name: string | null;
  source_url: string | null;
  created_at: string;
}

const REGION_LABEL: Record<string, string> = {
  brasil: "🇧🇷 Brasil",
  eua: "🇺🇸 EUA",
  cripto: "₿ Cripto",
};

const IMPACT_TONE: Record<string, "pos" | "neg" | "muted"> = {
  positivo: "pos",
  negativo: "neg",
  neutro: "muted",
};

export function NewsFeed({ items }: { items: NewsAlertData[] }) {
  if (items.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-text-muted">
        Nenhuma notícia processada ainda. O radar roda a cada hora — volte em instantes.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge tone="muted">{REGION_LABEL[item.region]}</Badge>
            <Badge tone={IMPACT_TONE[item.impact]}>{item.impact}</Badge>
            {item.changes_thesis && <Badge tone="warn">muda a tese</Badge>}
          </div>
          <a
            href={item.source_url ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="block font-medium leading-snug text-text hover:text-brass"
          >
            {item.headline}
          </a>
          <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-faint">
            <span>{item.source_name}</span>
            {item.related_symbols && item.related_symbols.length > 0 && (
              <span className="font-mono">· {item.related_symbols.join(", ")}</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
