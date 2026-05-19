# The Freighter — Landing Site

Landing page Astro per la raccolta email della beta privata.
Stack: Astro 4 + Vercel + Vercel Postgres.

## Sviluppo locale

```bash
cd landing-site
npm install
cp .env.example .env   # popola le var (vedi sotto)
npm run dev            # http://localhost:4321
```

Variabili `.env` (per testare in locale):
- `DATABASE_URL` — connection string Neon (Vercel Dashboard → Storage → tuo DB → `.env.local`)
- `ADMIN_PASSWORD` — password per `/admin`
- `IP_HASH_SALT` — qualsiasi stringa random (genera con `openssl rand -hex 32`)

In alternativa, una volta collegato il progetto a Vercel: `vercel env pull .env` le scarica tutte automaticamente.

## Setup database (una volta sola)

1. Su Vercel Dashboard → progetto → **Storage** → **Create** → **Postgres** (free tier).
2. Aprire SQL editor del DB e incollare `db/schema.sql`.
3. Eseguire.

## Deploy

```bash
git init && git add . && git commit -m "Initial landing"
gh repo create the-freighter-landing --private --source=. --push
```

Su Vercel:
1. **Add New Project** → importa il repo.
2. Framework: Astro (auto-detected).
3. Settings → Environment Variables: aggiungi `ADMIN_PASSWORD` e `IP_HASH_SALT`.
4. Settings → Storage: collega il Postgres creato sopra.
5. Deploy.

## Dominio (freighter.online)

Su Vercel: **Settings → Domains → Add** → `freighter.online`.
Vercel ti dice quali record DNS aggiungere. Per Aruba/Namecheap/GoDaddy:

| Tipo | Nome | Valore |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

Propagazione: 1-2 ore di solito. HTTPS attivato automaticamente.

## Struttura

```
landing-site/
├── astro.config.mjs              # site: freighter.online, vercel adapter, sitemap
├── package.json
├── tsconfig.json
├── db/schema.sql                 # SQL della tabella waitlist
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── styles/landing.css        # CSS del designer (intatto, 1244 righe)
└── src/
    └── pages/
        ├── index.astro           # landing
        ├── admin.astro           # pagina admin protetta da Basic Auth
        └── api/
            ├── waitlist.ts       # POST submission
            └── waitlist/
                ├── export.ts     # GET CSV
                └── reset.ts      # POST truncate
```

## Workflow operativo

- **Vedere iscrizioni**: `https://freighter.online/admin` (Basic Auth con `ADMIN_PASSWORD`).
- **Esportare CSV**: bottone in /admin.
- **Azzerare**: bottone in /admin (doppia conferma).

## SEO baseline implementata

- `<html lang="it">`, canonical, OG tags completi, Twitter card, theme-color.
- JSON-LD Organization + WebSite.
- Sitemap auto-generata in `/sitemap-index.xml` via `@astrojs/sitemap`.
- `robots.txt` con `Disallow: /admin` e `/api/`.
- Heading hierarchy: un solo H1 (hero), H2 per sezioni, H3 per card.
- `<meta name="robots" content="noindex">` su /admin.

## Da fare prima del lancio

- [ ] Generare `og-image.png` (1200×630) e metterla in `public/og-image.png`.
- [ ] Generare `logo.png` per JSON-LD (qualsiasi formato/dimensione decente).
- [ ] Privacy Policy + Cookie Policy (template iubenda free) e linkarle in footer.
- [ ] Testare invio email da pagina pubblica e verificare arrivo in `/admin`.
- [ ] Lighthouse audit ≥ 95 su tutte e 4 le metriche.
- [ ] Verificare OG preview su [opengraph.xyz](https://www.opengraph.xyz/).
- [ ] Submit sitemap su Google Search Console.

## Palette colore

Default: `data-palette="indigo"` (viola, deciso dall'utente).
Le 5 palette del designer (sienna, cobalt, forest, indigo, ink) sono ancora switchabili modificando l'attributo `data-palette` sull'`<html>` in `src/pages/index.astro`.
