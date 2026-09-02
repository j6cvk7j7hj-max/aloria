'use client';

import { useState } from 'react';
import { SiteLink as Link } from '@/components/site-link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

const navigation = [
  ['Home', '/'],
  ['Services', '/services'],
  ['About', '/about'],
  ['Contact', '/contact'],
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (url: string) =>
    url === '/' ? pathname === '/' : pathname.startsWith(url);
  return (
    <header
      className={`site-header ${pathname === '/' ? 'header-over-hero' : ''}`}
    >
      <Link className="wordmark" href="/" aria-label="Aloria home">
        ALORIA
      </Link>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(([label, url]) => (
          <Link
            key={url}
            href={url}
            aria-current={active(url) ? 'page' : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="mobile-nav">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                className="menu-button"
                aria-label="Open navigation"
              />
            }
          >
            <Menu strokeWidth={1} size={27} />
          </SheetTrigger>
          <SheetContent className="aloria-menu" side="right">
            <SheetTitle className="menu-wordmark">ALORIA</SheetTitle>
            <SheetDescription className="sr-only">
              Explore Aloria
            </SheetDescription>
            <nav aria-label="Mobile navigation">
              {navigation.map(([label, url]) => (
                <Link
                  key={url}
                  href={url}
                  onClick={() => setOpen(false)}
                  aria-current={active(url) ? 'page' : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <p className="menu-tagline">
              Timeless interiors inspired by European elegance.
            </p>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
