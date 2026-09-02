import type { Metadata } from 'next';
import '@fontsource-variable/cormorant-garamond';
import { site } from '@/lib/metadata';
import { assetPath } from '@/lib/site-path';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { StudioStructuredData } from '@/components/structured-data';
import './globals.css';

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(site.origin),
    title: {
      default: 'Aloria | Online Interior Design',
      template: '%s | Aloria',
    },
    description: site.description,
    icons: { icon: assetPath('/favicon.svg') },
    robots: { 'max-image-preview': 'large' },
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
        <StudioStructuredData />
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
