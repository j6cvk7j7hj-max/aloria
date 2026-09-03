# Aloria

An eight-page online interior design website for Mia’s Aloria studio, rebuilt from the [original Wix site](https://miagorbachev.wixsite.com/my-site-2) and her brand brief.

## Development

Requires Node.js 22.13+ and pnpm.

```sh
pnpm install
pnpm dev
```

The preview runs at http://localhost:3000. `pnpm build` produces the Cloudflare Worker and static assets. `pnpm exec tsc --noEmit` checks types.

## GitHub Pages

The production domain is [Aloria](https://aloriadesign.com/), hosted on GitHub Pages with HTTPS enabled.

The `Deploy Aloria to GitHub Pages` workflow builds and publishes the website on every push to `main`. Pages must use **GitHub Actions** as its publishing source. Publishing the repository root directly displays this README instead of the website.

`pnpm build:pages` exports all eight pages to `dist/client`, with links, images, fonts, and metadata configured for the root of `aloriadesign.com`. Only that built folder is published. The normal `pnpm build` remains the server build for Sites.

GitHub Pages hosts static files, so the inquiry form sends requests to the existing Sites API. That API allows the HTTPS custom domain, its `www` variant, and the original GitHub Pages origin, and continues to keep submissions and photos in private D1/R2 storage. Keep the Sites backend available for inquiries; GitHub Pages does not contain the database or uploaded photos.

## Pages

Home, Services, About Aloria, Contact, and individual pages for Space Planning, Concept Board, Furniture Curation, and Signature Design. Service copy lives in `lib/services.ts`. Original brand imagery is in `public/images`; the generated social card is `public/og.png`.

## Project inquiries

`POST /api/inquiries` validates and stores inquiries in D1 (`DB`) and optional photos in private R2 (`FILES`). The form supports four images, 5 MB each and 15 MB total. Retries are idempotent. A private delivery queue sends owner notifications through Resend when that service is connected. An authenticated, owner-only feed lets the Mac sync each inquiry and its private photos to `~/Desktop/Aloria Inquiries`.

For local storage, after the first build apply the generated schema:

```sh
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nice_husk.sql
```

Sites applies the packaged Drizzle migrations when publishing. Local test data is not deployed. Inquiry storage succeeds independently of notification delivery, so an email outage never discards a saved inquiry. A scheduled GitHub Actions workflow retries pending notifications every five minutes. See [INQUIRIES.md](INQUIRIES.md) for the complete data flow, private endpoint, Desktop agent, and email setup.

## Brand and motion

Self-hosted Cormorant Garamond, warm ivory and brown, square buttons, original brand images, and restrained CSS/IntersectionObserver reveals. Reduced-motion preferences disable the entrance and hover movement. Brand images illustrate the studio’s aesthetic and are not labeled as completed client work.

## Remaining studio details

Add Aloria’s Instagram and Pinterest links once supplied. Pricing and a measurement guide can be added when ready. The public Sites deployment remains available at https://aloria-interiors.glossy-bison-4514.chatgpt.site and runs the private inquiry backend; its page canonicals identify the primary custom domain.

## Search visibility

See [SEO.md](SEO.md) for the researched search strategy, page targets, current Google guidance, and the remaining Search Console ownership setup. The site describes Aloria as an online studio based in Hollywood, Florida. Services are currently delivered entirely online across Florida and nationwide; Aloria is not currently eligible for a Google Business Profile.

`lib/site-config.json` defines the primary origin and page inventory. Search metadata is shared through `lib/metadata.ts`; service search copy lives in `lib/services.ts`. Structured data is server-rendered. Static `app/robots.txt` and `app/sitemap.xml` are emitted by vinext for both hosting environments.

`pnpm build:pages` includes the SEO checks in `scripts/check-seo.mjs`, so CI rejects missing metadata, mismatched sitemap URLs, unlinked pages, and broken SEO assets before deployment. `pnpm check:seo` reruns the checks on `dist/client` after a Pages build. When adding pages, update the route inventory and sitemap together. Use real modification dates if adding `lastmod` values; do not stamp the current date on every build.

## Navigation

SiteLink uses native document links. This avoids a production-only dynamic-import failure in the current vinext client router while preserving keyboard, touch, query parameters, and navigation without JavaScript.
