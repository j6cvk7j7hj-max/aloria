/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import { SiteLink as Link } from '@/components/site-link';
import { services } from '@/lib/services';
import { assetPath } from '@/lib/site-path';
import { Reveal } from '@/components/reveal';

export function ServiceCards() {
  return (
    <div className="service-grid">
      {services.map((service, index) => (
        <Reveal
          key={service.slug}
          delay={index * 140}
          className="service-card-reveal"
        >
          <article className="service-card">
            <Link
              href={`/services/${service.slug}`}
              className="service-image"
              tabIndex={-1}
              aria-hidden="true"
            >
              <img
                src={assetPath(`/images/${service.slug}.avif`)}
                srcSet={`${assetPath(`/images/${service.slug}.avif`)} 586w, ${assetPath(`/images/${service.slug}-large.avif`)} 1172w`}
                sizes="(max-width: 767px) 90vw, (max-width: 1100px) 44vw, 22vw"
                alt=""
                width="586"
                height="436"
                loading="lazy"
              />
            </Link>
            <div className="service-card-copy">
              <span className="service-number">{service.number}</span>
              <h3>
                <Link
                  href={`/services/${service.slug}`}
                  aria-label={service.title}
                >
                  {service.title.split(' ').map((word, wordIndex) => (
                    <span className="service-title-line" key={word}>
                      {wordIndex > 0 ? ' ' : ''}
                      {word}
                    </span>
                  ))}
                </Link>
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
        </Reveal>
      ))}
    </div>
  );
}
