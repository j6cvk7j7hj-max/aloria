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

The public website is [Aloria on GitHub Pages](https://j6cvk7j7hj-max.github.io/aloria/).

The `Deploy Aloria to GitHub Pages` workflow builds and publishes the website on every push to `main`. Pages must use **GitHub Actions** as its publishing source. Publishing the repository root directly displays this README instead of the website.

`pnpm build:pages` exports all eight pages to `dist/client`, with links, images, fonts, and metadata configured for `/aloria/`. Only that built folder is published. The normal `pnpm build` remains the server build for Sites.

GitHub Pages hosts static files, so the inquiry form sends requests to the existing Sites API. That API allows this GitHub Pages origin and continues to keep submissions and photos in private D1/R2 storage. Keep the Sites backend available for inquiries; GitHub Pages does not contain the database or uploaded photos.

## Pages

Home, Services, About Aloria, Contact, and individual pages for Space Planning, Concept Board, Furniture Curation, and Signature Design. Service copy lives in `lib/services.ts`. Original brand imagery is in `public/images`; the generated social card is `public/og.png`.

## Project inquiries

`POST /api/inquiries` validates and stores inquiries in D1 (`DB`) and optional photos in private R2 (`FILES`). The form supports four images, 5 MB each and 15 MB total. Retries are idempotent. There is no public endpoint to list inquiries or retrieve photos.

For local storage, after the first build apply the generated schema:

```sh
pnpm exec wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_nice_husk.sql
```

Sites applies the packaged Drizzle migrations when publishing. Local test data is not deployed. The site owner can inspect inquiry rows using the Sites database tools; photo object references are stored with each inquiry. Email notifications and an inbox UI are not configured.

## Brand and motion

Self-hosted Cormorant Garamond, warm ivory and brown, square buttons, original brand images, and restrained CSS/IntersectionObserver reveals. Reduced-motion preferences disable the entrance and hover movement. Brand images illustrate the studio’s aesthetic and are not labeled as completed client work.

## Remaining studio details

Add Mia’s real studio email, Instagram, and Pinterest links once supplied. Pricing and a measurement guide can be added when ready. The website is public at https://aloria-interiors.glossy-bison-4514.chatgpt.site. A custom domain can be connected separately.

## Navigation

SiteLink uses native document links. This avoids a production-only dynamic-import failure in the current vinext client router while preserving keyboard, touch, query parameters, and navigation without JavaScript.
