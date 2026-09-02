/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import { SiteLink as Link } from '@/components/site-link';
import { services } from '@/lib/services';

export function ServiceCards() {
  return (
    <div className="service-grid">
      {services.map((service) => (
        <article className="service-card" key={service.slug}>
          <Link
            href={`/services/${service.slug}`}
            className="service-image"
            tabIndex={-1}
            aria-hidden="true"
          >
            <img
              src={`/images/${service.slug}.avif`}
              alt=""
              width="586"
              height="436"
              loading="lazy"
            />
          </Link>
          <div className="service-card-copy">
            <span className="service-number">{service.number}</span>
            <h3>
              <Link href={`/services/${service.slug}`}>{service.title}</Link>
            </h3>
            <p>{service.description}</p>
            <Link
              className="text-link"
              href={`/services/${service.slug}`}
              aria-label={`Learn more about ${service.title}`}
            >
              LEARN MORE <span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
