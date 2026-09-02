import { headers } from 'next/headers';
import { assetPath, siteHref } from '@/lib/site-path';

export async function requestOrigin() {
  // Static exports have no incoming request from which to read a Host header.
  if (process.env.NEXT_PUBLIC_SITE_ORIGIN)
    return new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN);
  // Sites routes the direct Host header to this site. Do not use forwarded-host headers.
  const host = (await headers()).get('host');
  if (!host || !/^[a-z0-9.-]+(?::[0-9]+)?$/i.test(host))
    throw new Error('Invalid site origin');
  const local = /^(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(host);
  return new URL(`${local ? 'http' : 'https'}://${host}`);
}

export async function studioPageMetadata(
  title: string,
  description: string,
  path: string,
): Promise<import('next').Metadata> {
  const origin = await requestOrigin();
  const fullTitle = title.includes('Aloria') ? title : `${title} | Aloria`;
  const image = new URL(assetPath('/og.png'), origin).toString();
  const canonical = new URL(siteHref(path), origin).toString();
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: 'Aloria',
      title: fullTitle,
      description,
      url: canonical,
      images: [
        {
          url: image,
          width: 1536,
          height: 1024,
          alt: 'Aloria — Timeless interiors inspired by European elegance.',
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
