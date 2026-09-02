import type { Metadata } from 'next';
import site from '@/lib/site-config.json';

export { site };

// Keep one preferred domain across Pages, the Sites backend, and query variants.
export function canonicalUrl(path: string) {
  const url = new URL(path, site.origin);
  url.search = '';
  url.hash = '';
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url.toString();
}

type SharingImage = {
  path: string;
  width: number;
  height: number;
  alt: string;
};

export function studioPageMetadata(
  title: string,
  description: string,
  path: string,
  sharingImage: SharingImage = {
    path: '/og.png',
    width: 1536,
    height: 1024,
    alt: 'Aloria — Timeless interiors inspired by European elegance.',
  },
): Metadata {
  const fullTitle = title.includes(site.name)
    ? title
    : `${title} | ${site.name}`;
  const image = new URL(sharingImage.path, site.origin).toString();
  const canonical = canonicalUrl(path);
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: 'en_US',
      title: fullTitle,
      description,
      url: canonical,
      images: [
        {
          url: image,
          width: sharingImage.width,
          height: sharingImage.height,
          alt: sharingImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
    },
  };
}
