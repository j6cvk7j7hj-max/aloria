import { headers } from 'next/headers';

export async function requestOrigin() {
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
  const image = new URL('/og.png', origin).toString();
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: new URL(path, origin).toString() },
    openGraph: {
      type: 'website',
      siteName: 'Aloria',
      title: fullTitle,
      description,
      url: new URL(path, origin).toString(),
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
