import { canonicalUrl, site } from '@/lib/metadata';
import type { services } from '@/lib/services';

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

const organizationId = `${site.origin}/#organization`;
const websiteId = `${site.origin}/#website`;
const areaServed = [
  { '@type': 'State', name: 'Florida' },
  { '@type': 'Country', name: 'United States' },
];

export function StudioStructuredData() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': organizationId,
            name: site.name,
            url: `${site.origin}/`,
            description: site.description,
            founder: {
              '@type': 'Person',
              name: 'Mia',
              url: canonicalUrl('/about'),
            },
            location: { '@type': 'State', name: 'Florida' },
            areaServed,
          },
          {
            '@type': 'WebSite',
            '@id': websiteId,
            name: site.name,
            url: `${site.origin}/`,
            publisher: { '@id': organizationId },
            inLanguage: 'en-US',
          },
        ],
      }}
    />
  );
}

export type Breadcrumb = { name: string; path: string };

export function PageStructuredData({
  path,
  name,
  description,
  type = 'WebPage',
  breadcrumbs,
  service,
}: {
  path: string;
  name: string;
  description: string;
  type?: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';
  breadcrumbs?: Breadcrumb[];
  service?: (typeof services)[number];
}) {
  const url = canonicalUrl(path);
  const graph: Record<string, unknown>[] = [
    {
      '@type': type,
      '@id': `${url}#webpage`,
      url,
      name,
      description,
      inLanguage: 'en-US',
      isPartOf: { '@id': websiteId },
      about: { '@id': organizationId },
      ...(breadcrumbs && { breadcrumb: { '@id': `${url}#breadcrumb` } }),
      ...(service && { mainEntity: { '@id': `${url}#service` } }),
    },
  ];
  if (breadcrumbs)
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: canonicalUrl(item.path),
      })),
    });
  if (service)
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      url,
      name: service.title,
      serviceType: service.seoTitle,
      description: service.seoDescription,
      image: `${site.origin}/images/${service.slug}.avif`,
      provider: { '@id': organizationId },
      areaServed,
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: canonicalUrl('/contact'),
        availableLanguage: 'English',
        serviceLocation: {
          '@type': 'VirtualLocation',
          url: canonicalUrl('/contact'),
        },
      },
    });
  return (
    <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
  );
}
