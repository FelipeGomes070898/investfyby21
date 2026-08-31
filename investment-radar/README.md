# Radar de Investimentos

Sistema web que acompanha ações brasileiras, ações americanas e criptomoedas, gera uma análise de
fundamentos + valuation com a Claude API a cada hora, e monta um radar de notícias classificadas por
impacto. Funciona no navegador (responsivo — layout diferente para celular e PC).

## Como funciona

- **Cripto**: preço cruzado entre **CoinMarketCap** e **CoinGecko** (se as duas fontes divergirem
  muito, isso aparece nos dados enviados à Claude API).
- **Ações BR**: dados via [brapi.dev](https://brapi.dev) (P/L, P/VP, dividend yield, ROE).
- **Ações US**: dados via [Finnhub](https://finnhub.io).
- **Notícias**: feeds RSS gratuitos (InfoMoney, Money Times, WSJ, CNBC, CoinDesk, Cointelegraph),
  resumidos e classificados (positivo/neutro/negativo, muda a tese ou não) pela Claude API.
- **Análise de cada ativo**: a Claude API recebe só números reais buscados nas APIs acima (nunca
  inventa dado de mercado) e devolve um score de 0 a 10, um breakdown por fator e um texto de análise.
- **Atualização automática**: a cada 1 hora, via GitHub Actions (grátis) chamando a rota
  `/api/cron/hourly`.
- **Login**: e-mail/senha ou Google, via Supabase Auth.

⚠️ Isso é uma ferramenta educacional de análise. Nenhuma parte do sistema é uma recomendação
personalizada de compra ou venda.

---

## 1. Pré-requisitos (contas gratuitas)

Crie conta nos seguintes serviços — todos têm plano gratuito suficiente para começar:

1. **GitHub** — para hospedar o código: https://github.com
2. **Vercel** — para hospedar o site: https://vercel.com (dá pra logar direto com o GitHub)
3. **Supabase** — banco de dados + login: https://supabase.com
4. **Anthropic (Claude API)** — https://platform.claude.com/settings/workspaces/default/keys
   - ⚠️ Gere uma chave **nova**. Nunca reutilize uma chave que já foi exposta em algum lugar público.
5. **CoinMarketCap** — https://pro.coinmarketcap.com/account (plano "Basic" grátis)
6. **brapi.dev** — https://brapi.dev (gera um token grátis)
7. **Finnhub** — https://finnhub.io/register (plano grátis)
8. CoinGecko não exige conta para o uso básico feito aqui.

---

## 2. Subir o código para o GitHub

Dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Radar de investimentos - versão inicial"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/investment-radar.git
git push -u origin main
```

(Crie o repositório vazio no GitHub antes, em https://github.com/new — não marque "Add README").

---

## 3. Configurar o Supabase

1. Crie um novo projeto em https://supabase.com/dashboard.
2. Vá em **SQL Editor > New query**, cole o conteúdo do arquivo `supabase/schema.sql` deste
   repositório, e rode. Isso cria todas as tabelas e regras de segurança.
3. Vá em **Project Settings > API** e copie:
   - `Project URL` → vai virar `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → vai virar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → vai virar `SUPABASE_SERVICE_ROLE_KEY` (mantenha em segredo, nunca vá para o
     navegador)

### Ativar login com Google

1. No Supabase: **Authentication > Providers > Google** → habilite.
2. Crie um OAuth Client ID em https://console.cloud.google.com/apis/credentials (tipo "Web
   application").
3. Em "Authorized redirect URIs", cole a URL que o próprio Supabase mostra na tela do provedor Google
   (algo como `https://SEU_PROJETO.supabase.co/auth/v1/callback`).
4. Cole o Client ID e o Client Secret de volta na tela do Supabase e salve.
5. Em **Authentication > URL Configuration**, defina a "Site URL" como a URL do seu site na Vercel
   (você vai ter essa URL depois do passo 4) e adicione `/auth/callback` nas "Redirect URLs".

---

## 4. Deploy na Vercel

1. Em https://vercel.com/new, importe o repositório do GitHub que você acabou de criar.
2. Em **Environment Variables**, adicione todas as variáveis do arquivo `.env.example`:

   | Nome | Onde conseguir |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase > Project Settings > API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase > Project Settings > API |
   | `SUPABASE_SERVICE_ROLE_KEY` | Supabase > Project Settings > API |
   | `ANTHROPIC_API_KEY` | platform.claude.com |
   | `COINMARKETCAP_API_KEY` | pro.coinmarketcap.com/account |
   | `COINGECKO_API_KEY` | opcional, deixe em branco se não tiver |
   | `BRAPI_TOKEN` | brapi.dev |
   | `FINNHUB_API_KEY` | finnhub.io |
   | `CRON_SECRET` | invente uma senha longa qualquer, ex: gere em https://1password.com/password-generator |

3. Clique em **Deploy**. Em 1-2 minutos seu site estará no ar em algo como
   `https://investment-radar-seunome.vercel.app`.
4. Volte no Supabase (**Authentication > URL Configuration**) e atualize a Site URL com esse domínio,
   se ainda não tinha feito.

---

## 5. Ativar a atualização automática a cada hora (grátis)

O plano gratuito da Vercel só executa "cron jobs" 1x por dia — por isso este projeto usa o **GitHub
Actions** (gratuito) para chamar a rota a cada hora:

1. No GitHub, vá em **Settings > Secrets and variables > Actions** do seu repositório.
2. Adicione dois secrets:
   - `APP_URL` → a URL do seu site na Vercel (sem barra no final), ex: `https://investment-radar-seunome.vercel.app`
   - `CRON_SECRET` → o mesmo valor que você colocou na Vercel
3. Pronto — o workflow em `.github/workflows/hourly-radar.yml` já está configurado para rodar a cada
   hora automaticamente. Você pode forçar uma execução manual em **Actions > Radar horário > Run
   workflow** para testar agora.

Para testar manualmente pelo terminal:

```bash
curl -X POST "https://SEU_SITE.vercel.app/api/cron/hourly" \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

---

## 6. Rodando localmente (opcional, para desenvolver)

```bash
npm install
cp .env.example .env.local   # preencha com suas chaves
npm run dev
```

Abra http://localhost:3000.

---

## Estrutura do projeto

```
src/
  app/
    login/, signup/, auth/callback/     → autenticação
    (dashboard)/                        → área logada (sidebar no PC, menu inferior no celular)
      dashboard/                        → radar diário (visão geral)
      acoes-br/, acoes-us/, crypto/     → listagens por categoria
      ativo/[symbol]/                   → detalhe: score, régua de preços, histórico, análise
      watchlist/, settings/
    api/
      cron/hourly/                      → roda a cada hora: busca dados + chama a Claude API
      analyze/                          → reanálise sob demanda de um ativo
      watchlist/                        → CRUD da watchlist do usuário
  lib/
    providers/                          → CoinMarketCap, CoinGecko, brapi, Finnhub, RSS de notícias
    claude.ts                           → toda a integração com a Claude API
    supabase/                           → clientes de banco/autenticação
supabase/schema.sql                     → schema completo do banco (rode isso no Supabase)
.github/workflows/hourly-radar.yml      → gatilho horário gratuito
```

## Próximos passos possíveis

- Adicionar o "radar de novas criptos / meme coins" usando `fetchNewCmcListings` e `fetchTrending`
  (já existem no código, só faltam ligar numa página).
- Enviar notificações push/e-mail quando `changes_thesis = true` (hoje isso só aparece destacado no
  dashboard).
- Adicionar mais tickers de ações BR/US por padrão em `src/lib/defaultAssets.ts`.
