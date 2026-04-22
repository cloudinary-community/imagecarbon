# Image Carbon

Optimize Images, Save the Planet

[imagecarbon.com](https://imagecarbon.com)

## What's inside?

Curious about how it works? Here are the major components:

* [Cloudinary](https://cloudinary.com/?utm_source=imagecarbon.com&utm_medium=referral&utm_campaign=devx_imagecarbon&utm_content=github)
* [co2.js](https://developers.thegreenwebfoundation.org/co2js/overview/)
* [Next.js](https://nextjs.org/)
* [Puppeteer](https://pptr.dev/) + [Sparticuz Chromium](https://github.com/Sparticuz/chromium) (serverless page fetch for `/api/scrape`)
* [Supabase](https://supabase.com/)
* [Netlify](https://www.netlify.com/) (see **Netlify deploy** below)

## Styling

The app uses **Tailwind CSS** (see `tailwind.config.js`, `postcss.config.mjs`, and `src/styles/globals.css`). **Sass is not used**—layout and components use Tailwind utilities and small shared helpers (for example `src/lib/heroClasses.js`). Next.js may still install `sass` as an optional dependency of the framework; it is not part of this app’s styles.

## Supabase setup

1. Create a Supabase project and run the SQL in `supabase/migrations/20260421000000_initial.sql` (SQL editor or [Supabase CLI](https://supabase.com/docs/guides/cli)).
2. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (server-only; used by API routes and `getServerSideProps`). Use the **service_role** secret from **Settings → API**, not the **anon** `public` key—anon is blocked by RLS on `sites` / `images`, which causes `violates row-level security policy` on insert if misconfigured.
3. Optional: copy old cache rows from Xata into `sites` / `images` (`site_url`, `date_collected`, `screenshot`, and the three JSON text columns on `images`).

## Netlify deploy

1. Connect the repo in the [Netlify UI](https://app.netlify.com/) (or use the Netlify CLI). The included `netlify.toml` runs `npm run build` and enables **`@netlify/plugin-nextjs` v5** (Next.js **15**).
2. Set the same environment variables you would use locally (Cloudinary, Supabase, optional GA, etc.) under **Site configuration → Environment variables**.
3. Use **Node 20+** for the build (set `NODE_VERSION` in Netlify or rely on `.nvmrc`; `package.json` declares `engines.node`).

`next build` alone is enough for local checks; Netlify runs the plugin during **`netlify build`** on their builders.

## Scraping (`/api/scrape`)

Image discovery runs in **Node.js** with **Puppeteer** and **`@sparticuz/chromium-min`** (same stack as `/api/screenshot`). Set `CHROME_EXECUTABLE_PATH` locally to your Chrome/Chromium binary for faster dev; in production the function downloads the Sparticuz Chromium pack on cold start.

Serverless **time and bundle size** limits apply on any host. If `/api/scrape` times out on Netlify, increase the function timeout in the Netlify UI (plan-dependent) or run scraping on a machine with a longer limit.