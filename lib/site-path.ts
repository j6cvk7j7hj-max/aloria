const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function assetPath(path: string) {
  if (
    !basePath ||
    !path.startsWith('/') ||
    path.startsWith('//') ||
    path === basePath ||
    path.startsWith(`${basePath}/`)
  )
    return path;
  return `${basePath}${path}`;
}

export function siteHref(href: string) {
  if (!basePath || !href.startsWith('/') || href.startsWith('//')) return href;
  const url = new URL(href, 'https://aloria.invalid');
  const path = assetPath(url.pathname);
  return `${path.endsWith('/') ? path : `${path}/`}${url.search}${url.hash}`;
}

export function localPathname(pathname: string) {
  if (basePath && pathname === basePath) return '/';
  return basePath && pathname.startsWith(`${basePath}/`)
    ? pathname.slice(basePath.length)
    : pathname;
}
