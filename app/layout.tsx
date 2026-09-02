import type { Metadata } from 'next';
import '@fontsource-variable/cormorant-garamond';
import { requestOrigin } from '@/lib/metadata';
import { assetPath } from '@/lib/site-path';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const origin = await requestOrigin();
  const title = 'Aloria | Timeless European-Inspired Interiors';
  const description =
    'Thoughtful online interior design inspired by timeless European elegance. Space planning, concept boards, furniture curation, and complete room design.';
  const image = new URL(assetPath('/og.png'), origin).toString();
  return {
    metadataBase: origin,
    title: { default: title, template: '%s | Aloria' },
    description,
    icons: { icon: assetPath('/favicon.svg') },
    openGraph: {
      type: 'website',
      siteName: 'Aloria',
      title,
      description,
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
      title,
      description,
      images: [image],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
