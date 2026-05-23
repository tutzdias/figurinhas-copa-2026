# Figurinhas Copa 2026

Sticker album tracker for the FIFA Copa 2026. Mobile-first React + Supabase PWA-style web app.

## Tech

- React 18 + Babel Standalone (no bundler — JSX is transpiled in the browser)
- Supabase for auth + sticker persistence
- [`number-flow`](https://number-flow.barvian.me/) vanilla web component for animated number transitions

## Files

### Entry points
| File | Purpose |
|---|---|
| `index.html` | **Main app** — current Home design (aura + percentage hero) |
| `index_older.html` | Previous Home design (trophy video background), preserved for reference |

### Shared modules
| File | Purpose |
|---|---|
| `app.jsx` | Root component, auth gating, screen routing, Supabase sticker sync |
| `screens.jsx` | `HomeScreen` (original) + `AllCountriesScreen` + `CountryDetailScreen` + helpers (`countryProgress`, `flowAnimate`, `flowUpdate`) |
| `auth-screen.jsx` | Sign-in / sign-up screen |
| `icons.jsx` | Inline SVG icon components |
| `data.js` | Album catalog (groups, countries, sticker counts — 901 stickers total) |
| `supabase-client.js` | Supabase init + `addSticker` / `removeSticker` / `fetchStickers` / auth helpers |
| `styles.css` | Shared styles for AllCountries, CountryDetail, Auth screens + the original Home |

### Home-only overrides (loaded by `index.html`)
| File | Purpose |
|---|---|
| `home.jsx` | Replaces `window.HomeScreen` with the new aura-design Home |
| `home.css` | New-Home-only styles, scoped to `.home2` so other screens stay untouched |

### Assets
- `uploads/` — user uploads (background video, etc.)
- `assets/` — static images (trophy.webp etc., used by `index_older.html`)

## Local setup

1. Copy `supabase-client.example.js` → `supabase-client.js` (or edit in place) and fill in `SUPABASE_URL` + `SUPABASE_ANON_KEY` from your Supabase project's API settings.
2. Serve the directory with any static file server (Vite, `python3 -m http.server`, etc.).
3. Open `/index.html` for the current design or `/index_older.html` to compare against the previous one.

There is **no build step** — every `.jsx` file is transpiled in the browser by `@babel/standalone`.
