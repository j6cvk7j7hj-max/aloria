import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

const origin = 'https://j6cvk7j7hj-max.github.io';
const basePath = '/aloria';
const result = spawnSync('vinext', ['build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    ALORIA_GITHUB_PAGES: 'true',
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_ORIGIN: origin,
    NEXT_PUBLIC_INQUIRY_ENDPOINT:
      'https://aloria-interiors.glossy-bison-4514.chatgpt.site/api/inquiries',
  },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status || 1);

const routes = [
  '',
  'about',
  'contact',
  'services',
  'services/space-planning',
  'services/concept-board',
  'services/furniture-curation',
  'services/signature-design',
];

// vinext's prerenderer does not follow trailing-slash redirects. Export with
// its default routing, then arrange HTML as directory indexes for Pages.
for (const route of routes.filter(Boolean)) {
  const directory = join('dist/client', route);
  mkdirSync(directory, { recursive: true });
  renameSync(`${directory}.html`, join(directory, 'index.html'));
}

// Fail before publishing if an export skipped a page or generated a broken
// link. This also catches assets accidentally placed under /aloria twice.
for (const route of routes) {
  const file = join('dist/client', route, 'index.html');
  const html = readFileSync(file, 'utf8');
  if (!html.includes('id="main-content"') || !html.includes('ALORIA'))
    throw new Error(`The exported page is incomplete: ${file}`);
  for (const [, reference] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const url = new URL(
      reference.replaceAll('&amp;', '&'),
      `${origin}${basePath}/`,
    );
    if (url.origin !== origin) continue;
    if (!url.pathname.startsWith(`${basePath}/`))
      throw new Error(
        `A reference is outside the repository path: ${reference}`,
      );
    const relative = decodeURIComponent(
      url.pathname.slice(basePath.length + 1),
    );
    const target = join(
      'dist/client',
      relative,
      url.pathname.endsWith('/') ? 'index.html' : '',
    );
    if (!existsSync(target))
      throw new Error(`A published file is missing: ${target}`);
  }
}
writeFileSync('dist/client/.nojekyll', '');
console.log(
  `GitHub Pages export ready: ${routes.length} pages in dist/client.`,
);
