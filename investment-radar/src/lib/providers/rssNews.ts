import Parser from "rss-parser";
import type { NewsItem } from "../types";

const parser = new Parser();

// Feeds públicos e gratuitos, sem necessidade de chave de API.
const FEEDS: { url: string; sourceName: string; region: NewsItem["region"] }[] = [
  { url: "https://www.infomoney.com.br/mercados/feed/", sourceName: "InfoMoney", region: "brasil" },
  { url: "https://www.infomoney.com.br/politica/feed/", sourceName: "InfoMoney Política", region: "brasil" },
  { url: "https://www.moneytimes.com.br/feed/", sourceName: "Money Times", region: "brasil" },
  { url: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain", sourceName: "WSJ Markets", region: "eua" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", sourceName: "CNBC Markets", region: "eua" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", sourceName: "CoinDesk", region: "cripto" },
  { url: "https://cointelegraph.com/rss", sourceName: "Cointelegraph", region: "cripto" },
];

export async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return (parsed.items ?? []).slice(0, 10).map((item) => ({
        headline: item.title ?? "",
        link: item.link ?? "",
        sourceName: feed.sourceName,
        publishedAt: item.isoDate ?? item.pubDate ?? null,
        region: feed.region,
      }));
    })
  );

  const news: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") news.push(...r.value);
    else console.error("Erro ao buscar feed RSS:", r.reason);
  }
  return news;
}
