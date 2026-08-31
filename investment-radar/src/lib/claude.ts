import Anthropic from "@anthropic-ai/sdk";
import type { AssetAnalysis, ClassifiedNews, NewsItem } from "./types";

// Este arquivo só deve ser importado por código de servidor (rotas /api, cron).
// A chave nunca deve chegar ao navegador.
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada.");
  return new Anthropic({ apiKey });
}

// Configurável via env caso a Anthropic lance um modelo mais novo no futuro.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

function extractJson(text: string): any {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleaned);
}

/**
 * Gera a análise no estilo "fundamentos + valuation + margem de segurança" para uma ação ou cripto,
 * a partir dos dados numéricos já buscados nas APIs (nunca inventados pelo modelo).
 */
export async function generateAssetAnalysis(params: {
  symbol: string;
  assetType: "acao_br" | "acao_us" | "cripto";
  facts: Record<string, unknown>;
}): Promise<AssetAnalysis> {
  const client = getClient();

  const systemPrompt = `Você é um analista que segue rigorosamente um modelo de valuation por fundamentos.
Regras:
- Use APENAS os números fornecidos em "dados". Nunca invente indicadores que não foram dados.
- Para ações: avalie P/L, P/VP, dividend yield, ROE, sustentabilidade do lucro.
- Para cripto: avalie tokenomics (supply, FDV vs market cap), liquidez (volume/market cap), e se for meme coin, deixe claro que fundamentos tradicionais não se aplicam e o peso maior é liquidez+narrativa+risco de concentração.
- Sempre inclua uma ressalva de que isso é uma análise educacional, não recomendação personalizada.
- Devolva SOMENTE um JSON válido, sem markdown, sem texto fora do JSON, no formato:
{
  "score": <número de 0 a 10>,
  "breakdown": { "<fator>": <número de -2 a 2>, ... },
  "classification": "<ex: 🟢 Atrativa, 🟡 Razoável, 🟠 Cara, 🔴 Muito cara, ⚠️ Alto risco>",
  "text": "<análise em português, em texto corrido com quebras de linha \\n, no mesmo estilo didático de: quanto a empresa/projeto ganha, quanto estou pagando, quanto retorna pra mim, e se isso é sustentável>"
}`;

  const userPrompt = `Ativo: ${params.symbol} (${params.assetType})
Dados: ${JSON.stringify(params.facts, null, 2)}`;

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2500,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Resposta da Claude API sem bloco de texto.");
  }

  try {
    const parsed = extractJson(textBlock.text);
    return {
      score: parsed.score,
      breakdown: parsed.breakdown ?? {},
      classification: parsed.classification,
      text: parsed.text,
    };
  } catch {
    // Se ainda assim vier um JSON quebrado, não derruba o resto do radar —
    // devolve um resultado neutro sinalizando o problema, em vez de lançar erro.
    return {
      score: 5,
      breakdown: {},
      classification: "⚠️ Análise indisponível",
      text: "Não foi possível gerar a análise completa desta vez. Tente reanalisar em instantes.",
    };
  }
}

/**
 * Resume e classifica um lote de notícias: o que aconteceu, por que importa,
 * qual o impacto provável e se muda a tese de compra/venda de algum ativo acompanhado.
 */
export async function classifyNewsBatch(
  items: NewsItem[],
  watchedSymbols: string[]
): Promise<ClassifiedNews[]> {
  if (items.length === 0) return [];
  const client = getClient();

  const systemPrompt = `Você organiza um radar diário de investimentos (ações BR, ações US e cripto) para um investidor brasileiro.
Para cada notícia da lista, devolva um resumo de 1-2 frases em português, o impacto provável (positivo, neutro ou negativo),
se isso muda a tese de compra/venda de algum ativo, e quais símbolos de ativos acompanhados (se algum) são afetados.
Os símbolos acompanhados são: ${watchedSymbols.join(", ") || "nenhum específico"}.
Devolva SOMENTE um JSON válido: um array de objetos no formato
{ "headline": "<mesmo headline recebido>", "summary": "...", "impact": "positivo|neutro|negativo", "changesThesis": true|false, "relatedSymbols": ["..."] }`;

  const userPrompt = JSON.stringify(
    items.map((i) => ({ headline: i.headline, source: i.sourceName, region: i.region })),
    null,
    2
  );

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") return [];

  const parsedList = extractJson(textBlock.text) as Array<{
    headline: string;
    summary: string;
    impact: "positivo" | "neutro" | "negativo";
    changesThesis: boolean;
    relatedSymbols: string[];
  }>;

  return items
    .map((item) => {
      const match = parsedList.find((p) => p.headline === item.headline);
      if (!match) return null;
      return { ...item, ...match };
    })
    .filter((x): x is ClassifiedNews => x !== null);
}
