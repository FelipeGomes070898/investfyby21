-- ========================================================
-- Investment Radar — schema do Supabase
-- Rode este arquivo em: Supabase Dashboard > SQL Editor > New query
-- ========================================================

-- Ativos que o usuário decidiu acompanhar de perto
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symbol text not null,               -- ex: PETR4, AAPL, BTC
  asset_type text not null check (asset_type in ('acao_br','acao_us','cripto')),
  created_at timestamptz not null default now(),
  unique(user_id, symbol, asset_type)
);

-- Última foto de cada ativo monitorado pelo radar (preço, fundamentos, score)
-- Não é por usuário: é compartilhada, atualizada 1x/hora pelo cron.
create table if not exists public.asset_snapshots (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  asset_type text not null check (asset_type in ('acao_br','acao_us','cripto')),
  name text,
  price numeric,
  change_24h numeric,                 -- variação %, últimas 24h
  change_7d numeric,
  market_cap numeric,
  volume_24h numeric,
  fundamentals jsonb,                 -- P/L, P/VP, DY, FDV, supply, holders etc (varia por tipo)
  score numeric,                      -- 0-10
  score_breakdown jsonb,              -- { petroleo: 2, producao: 2, ... } ou equivalente cripto
  classification text,                -- ex: "🟢 Atrativa", "🔴 Cara", "🟠 Alto risco"
  analysis text,                      -- texto gerado pela Claude API
  source jsonb,                       -- de onde vieram os dados (cmc, coingecko, brapi, finnhub)
  fetched_at timestamptz not null default now(),
  unique(symbol, asset_type)
);

-- Histórico de preço/score, para os gráficos (1 linha por hora por ativo)
create table if not exists public.asset_history (
  id bigint generated always as identity primary key,
  symbol text not null,
  asset_type text not null,
  price numeric,
  score numeric,
  recorded_at timestamptz not null default now()
);
create index if not exists asset_history_symbol_idx on public.asset_history(symbol, asset_type, recorded_at desc);

-- Notícias/alertas do radar diário, já classificados pela Claude API
create table if not exists public.news_alerts (
  id uuid primary key default gen_random_uuid(),
  region text not null check (region in ('brasil','eua','cripto')),
  headline text not null unique,
  summary text not null,              -- resumo em PT-BR gerado pela Claude API
  related_symbols text[] default '{}',
  impact text not null check (impact in ('positivo','neutro','negativo')),
  changes_thesis boolean not null default false,
  source_url text,
  source_name text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists news_alerts_created_idx on public.news_alerts(created_at desc);

-- Preferências do usuário (perfil simples)
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notify_on_thesis_change boolean not null default true,
  display_name text,
  updated_at timestamptz not null default now()
);

-- ========================================================
-- Row Level Security
-- ========================================================
alter table public.watchlist enable row level security;
alter table public.asset_snapshots enable row level security;
alter table public.asset_history enable row level security;
alter table public.news_alerts enable row level security;
alter table public.user_settings enable row level security;

-- watchlist: cada usuário só vê/edita a própria lista
create policy "watchlist_select_own" on public.watchlist for select using (auth.uid() = user_id);
create policy "watchlist_insert_own" on public.watchlist for insert with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist for delete using (auth.uid() = user_id);

-- snapshots, history e notícias: dados públicos do radar, qualquer usuário logado pode ler
create policy "snapshots_select_authenticated" on public.asset_snapshots for select using (auth.role() = 'authenticated');
create policy "history_select_authenticated" on public.asset_history for select using (auth.role() = 'authenticated');
create policy "news_select_authenticated" on public.news_alerts for select using (auth.role() = 'authenticated');

-- user_settings: só o próprio usuário
create policy "settings_select_own" on public.user_settings for select using (auth.uid() = user_id);
create policy "settings_upsert_own" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "settings_update_own" on public.user_settings for update using (auth.uid() = user_id);

-- Escrita em snapshots/history/news é feita apenas pelo backend usando a service_role key,
-- que ignora RLS — por isso não há policy de insert/update para "authenticated" nessas tabelas.
