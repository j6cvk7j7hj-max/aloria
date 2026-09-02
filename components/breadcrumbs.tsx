import { SiteLink } from '@/components/site-link';
import type { Breadcrumb } from '@/components/structured-data';

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.path}>
            {index > 0 && <span aria-hidden="true">/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page">{item.name}</span>
            ) : (
              <SiteLink href={item.path}>{item.name}</SiteLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
