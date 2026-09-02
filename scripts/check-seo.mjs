import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import site from '../lib/site-config.json' with { type: 'json' };

const output = process.argv[2] || 'dist/client';
const urls = site.routes.map((path) => `${site.origin}${path}`);
const titles = new Set();
const descriptions = new Set();
const links = new Map();

function decode(value) {
  return value.replace(
    /&(amp|lt|gt|quot|apos|#x[\da-f]+|#\d+);/gi,
    (entity, code) => {
      if (code.startsWith('#'))
        return String.fromCodePoint(
          code[1].toLowerCase() === 'x'
            ? parseInt(code.slice(2), 16)
            : Number(code.slice(1)),
        );
      return (
        { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[code] || entity
      );
    },
  );
}

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [
      name,
      decode(value),
    ]),
  );
}

function metaTags(html) {
  return [...html.matchAll(/<meta\b[^>]*>/g)].map(([tag]) => attributes(tag));
}

for (const path of site.routes) {
  const url = `${site.origin}${path}`;
  const html = readFileSync(join(output, path.slice(1), 'index.html'), 'utf8');
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/)?.[1];
  assert.ok(head, `${path}: missing document head`);
  const pageTitles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/g)];
  assert.equal(
    pageTitles.length,
    1,
    `${path}: needs one title in the initial HTML`,
  );
  const title = decode(pageTitles[0][1]);
  assert.ok(
    title.includes(site.name),
    `${path}: title must identify the studio`,
  );
  assert.ok(!titles.has(title), `${path}: duplicate page title`);
  titles.add(title);
  const metas = metaTags(head);
  const descriptionsOnPage = metas.filter(
    (item) => item.name === 'description',
  );
  assert.equal(descriptionsOnPage.length, 1, `${path}: needs one description`);
  const description = descriptionsOnPage[0].content;
  assert.ok(description?.trim(), `${path}: empty description`);
  assert.ok(!descriptions.has(description), `${path}: duplicate description`);
  descriptions.add(description);
  const canonicals = [...head.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => attributes(tag))
    .filter((item) => item.rel === 'canonical');
  assert.equal(
    canonicals.length,
    1,
    `${path}: needs one canonical in the head`,
  );
  // vinext formats a root URL without its final slash; URL normalizes that
  // equivalent form while still catching incorrect domains and page paths.
  assert.equal(
    new URL(canonicals[0].href).href,
    url,
    `${path}: wrong canonical domain or path`,
  );
  for (const item of metaTags(html).filter((tag) =>
    ['robots', 'googlebot', 'bingbot'].includes(tag.name),
  )) {
    assert.ok(
      !/\b(noindex|nofollow|none)\b/i.test(item.content),
      `${path}: blocked from search`,
    );
  }
  const meta = (key) =>
    metas.find((item) => item.name === key || item.property === key)?.content;
  assert.equal(
    new URL(meta('og:url')).href,
    url,
    `${path}: sharing URL differs from canonical`,
  );
  assert.equal(
    meta('og:title'),
    title,
    `${path}: sharing title differs from title`,
  );
  assert.equal(
    meta('twitter:card'),
    'summary_large_image',
    `${path}: missing sharing card`,
  );
  const image = new URL(meta('og:image'));
  assert.equal(
    image.origin,
    site.origin,
    `${path}: sharing image uses another host`,
  );
  assert.ok(
    existsSync(join(output, image.pathname.slice(1))),
    `${path}: missing sharing image`,
  );
  assert.equal(
    [...html.matchAll(/<h1\b/g)].length,
    1,
    `${path}: unclear primary heading`,
  );
  assert.match(html, /<html\b[^>]*lang="en"/, `${path}: missing language`);
  assert.ok(
    html.includes('id="main-content"'),
    `${path}: missing main content`,
  );
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    const img = attributes(tag);
    assert.ok('alt' in img, `${path}: image needs an alt attribute`);
    assert.ok(
      Number(img.width) > 0 && Number(img.height) > 0,
      `${path}: image dimensions missing`,
    );
  }
  const documents = [
    ...html.matchAll(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    ),
  ].map(([, json]) => JSON.parse(json));
  assert.ok(
    documents.length > 0,
    `${path}: structured data missing from initial HTML`,
  );
  const graph = documents.flatMap((document) => {
    assert.equal(document['@context'], 'https://schema.org');
    return document['@graph'] || [document];
  });
  const organization = graph.find((node) => node['@type'] === 'Organization');
  assert.equal(
    organization?.url,
    `${site.origin}/`,
    `${path}: studio identity missing`,
  );
  assert.equal(
    graph.find((node) => node['@type'] === 'WebSite')?.url,
    `${site.origin}/`,
  );
  assert.equal(
    graph.find((node) => node['@id'] === `${url}#webpage`)?.url,
    url,
  );
  if (path !== '/') {
    const breadcrumb = graph.find((node) => node['@type'] === 'BreadcrumbList');
    assert.ok(
      breadcrumb?.itemListElement.length >= 2,
      `${path}: breadcrumbs missing`,
    );
    breadcrumb.itemListElement.forEach((item, index) => {
      assert.equal(item.position, index + 1);
      assert.ok(
        urls.includes(item.item),
        `${path}: breadcrumb points to an unknown page`,
      );
    });
    assert.equal(breadcrumb.itemListElement.at(-1).item, url);
    assert.ok(
      html.includes('aria-label="Breadcrumb"'),
      `${path}: breadcrumb markup has no visible equivalent`,
    );
  }
  if (/^\/services\/[^/]+\/$/.test(path)) {
    const service = graph.find((node) => node['@type'] === 'Service');
    assert.equal(service?.url, url, `${path}: service entity missing`);
    assert.equal(service.provider['@id'], organization['@id']);
    assert.ok(service.areaServed.some((area) => area.name === 'Florida'));
    assert.equal(
      service.availableChannel.serviceUrl,
      `${site.origin}/contact/`,
    );
  }
  const destinations = [...html.matchAll(/<a\b[^>]*>/g)]
    .map(([tag]) => attributes(tag).href)
    .filter(Boolean)
    .map((href) => {
      const target = new URL(href, url);
      target.search = '';
      target.hash = '';
      return target.toString();
    });
  links.set(
    url,
    destinations.filter((target) => urls.includes(target)),
  );
  console.log(`SEO OK ${path} — ${title}`);
}

// Check the actual sitemap and reachable HTML, not just the route configuration.
const sitemap = readFileSync(join(output, 'sitemap.xml'), 'utf8');
assert.match(
  sitemap,
  /<urlset\b[^>]*xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9"/,
);
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, url]) => decode(url),
);
assert.deepEqual(
  sitemapUrls.toSorted((a, b) => a.localeCompare(b)),
  urls.toSorted((a, b) => a.localeCompare(b)),
  'Sitemap must contain each canonical page once',
);
const robots = readFileSync(join(output, 'robots.txt'), 'utf8');
assert.match(robots, /^User-agent: \*$/im);
assert.ok(
  robots.includes(`Sitemap: ${site.origin}/sitemap.xml`),
  'robots.txt must advertise the sitemap',
);
assert.ok(
  !/^Disallow:\s*\/\s*$/im.test(robots),
  'robots.txt blocks the entire site',
);

const reached = new Set();
const queue = [`${site.origin}/`];
while (queue.length) {
  const url = queue.shift();
  if (reached.has(url)) continue;
  reached.add(url);
  queue.push(...links.get(url));
}
assert.equal(
  reached.size,
  urls.length,
  'Every page must be reachable by HTML links from Home',
);
const expectedHtml = new Set([
  '404.html',
  ...site.routes.map((path) => `${path.slice(1)}index.html`),
]);
for (const file of readdirSync(output, { recursive: true })) {
  if (file.endsWith('.html'))
    assert.ok(
      expectedHtml.has(file),
      `Exported page is absent from the sitemap: ${file}`,
    );
}
const notFound = readFileSync(join(output, '404.html'), 'utf8');
assert.ok(
  metaTags(notFound).some(
    (tag) => tag.name === 'robots' && /\bnoindex\b/.test(tag.content),
  ),
  '404 must be marked noindex',
);
console.log(
  `SEO checks passed: ${urls.length} crawlable pages, sitemap, structured data, and 404.`,
);
