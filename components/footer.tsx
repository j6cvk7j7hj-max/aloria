import { SiteLink as Link } from '@/components/site-link';
import { services } from '@/lib/services';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="wordmark" href="/" aria-label="Aloria home">
            ALORIA
          </Link>
          <p>
            Timeless interiors inspired
            <br />
            by European elegance.
          </p>
        </div>
        <nav aria-label="Footer navigation">
          <Link href="/">Home</Link>
          <Link href="/services">Services</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <nav aria-label="Our services">
          {services.map((service) => (
            <Link key={service.slug} href={`/services/${service.slug}`}>
              {service.title}
            </Link>
          ))}
        </nav>
        <div className="footer-location">
          <p>
            Florida-based design studio
            <br />
            Services delivered entirely online
          </p>
          <Link className="text-link" href="/contact">
            GET IN TOUCH <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Aloria Interior Design. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
