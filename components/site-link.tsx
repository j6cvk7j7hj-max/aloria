import type { ComponentProps } from 'react';

// Use document navigation: these editorial pages do not need a client router.
// Native links also keep navigation available before JavaScript loads.
export function SiteLink({ children, ...props }: ComponentProps<'a'>) {
  return <a {...props}>{children}</a>;
}
