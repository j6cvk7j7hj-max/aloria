import type { ComponentProps } from 'react';
import { siteHref } from '@/lib/site-path';

// Use document navigation: these editorial pages do not need a client router.
// Native links also keep navigation available before JavaScript loads.
export function SiteLink({ children, href, ...props }: ComponentProps<'a'>) {
  return (
    <a {...props} href={href ? siteHref(href) : href}>
      {children}
    </a>
  );
}
