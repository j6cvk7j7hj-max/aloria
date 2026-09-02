import type { NextConfig } from 'next';

const nextConfig: NextConfig =
  process.env.ALORIA_GITHUB_PAGES === 'true'
    ? {
        output: 'export',
        // Native links handle the repository path. Using an asset prefix keeps
        // vinext's prerender requests rooted correctly while exporting assets
        // for the public GitHub Pages address.
        assetPrefix: `${process.env.NEXT_PUBLIC_SITE_ORIGIN}${process.env.NEXT_PUBLIC_BASE_PATH}`,
      }
    : {};

export default nextConfig;
