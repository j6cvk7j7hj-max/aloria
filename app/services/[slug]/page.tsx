/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import type { Metadata } from 'next';
import { SiteLink as Link } from '@/components/site-link';
import { studioPageMetadata } from '@/lib/metadata';
import { assetPath } from '@/lib/site-path';
import { notFound } from 'next/navigation';
import { services } from '@/lib/services';
import { Reveal } from '@/components/reveal';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageStructuredData } from '@/components/structured-data';

export function generateStaticParams() {
  return services.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) return {};
  return studioPageMetadata(
    service.seoTitle,
    service.seoDescription,
    `/services/${service.slug}`,
    {
      path: `/images/${service.slug}.avif`,
      width: 586,
      height: 436,
      alt: service.alt,
    },
  );
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: service.title, path: `/services/${service.slug}` },
  ];
  return (
    <main id="main-content">
      <PageStructuredData
        path={`/services/${service.slug}`}
        name={service.seoTitle}
        description={service.seoDescription}
        breadcrumbs={breadcrumbs}
        service={service}
      />
      <section className="service-hero">
        <div className="service-hero-copy">
          <Breadcrumbs items={breadcrumbs} />
          <p className="section-label">
            {service.number} — {service.title}
          </p>
          <h1>{service.headline}</h1>
          <p>{service.intro}</p>
          <p className="service-area">
            Delivered entirely online by a Florida-based studio for homes across
            the state and nationwide.
          </p>
          <Link
            className="outline-button"
            href={`/contact?service=${service.slug}`}
          >
            {service.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="service-hero-image">
          <img
            src={assetPath(`/images/${service.slug}.avif`)}
            srcSet={`${assetPath(`/images/${service.slug}.avif`)} 586w, ${assetPath(`/images/${service.slug}-large.avif`)} 1172w`}
            sizes="(max-width: 767px) 100vw, 52vw"
            alt={service.alt}
            width="586"
            height="436"
            fetchPriority="high"
          />
        </div>
      </section>
      <section className="service-includes section-container">
        <Reveal>
          <p className="section-label">THOUGHTFULLY CONSIDERED</p>
          <h2>What’s included</h2>
        </Reveal>
        <div>
          <ul>
            {service.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {'note' in service && <p className="service-note">{service.note}</p>}
        </div>
      </section>
      <section className="process section-container">
        <Reveal>
          <p className="section-label">THE PROCESS</p>
          <h2>
            From your first idea
            <br />
            to a considered plan.
          </h2>
        </Reveal>
        <ol>
          {service.steps.map(([title, copy], index) => (
            <li key={title}>
              <span className="service-number">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </li>
          ))}
        </ol>
      </section>
      <section
        className="service-questions section-container"
        aria-labelledby="questions-title"
      >
        <div>
          <p className="section-label">A FEW USEFUL DETAILS</p>
          <h2 id="questions-title">Before you choose.</h2>
        </div>
        <dl>
          {service.questions.map((question) => (
            <div key={question.question}>
              <dt>{question.question}</dt>
              <dd>
                <p>{question.answer}</p>
                {'related' in question && (
                  <Link className="text-link" href={question.related.path}>
                    {question.related.label} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="preparation section-container">
        <div>
          <p className="section-label">BEFORE WE BEGIN</p>
          <h2>Tell us about your space.</h2>
        </div>
        <div>
          <p>{service.preparation}</p>
          <p className="preparation-note">
            Start with what you know. You can share more details as we get to
            know your project.
          </p>
          <Link
            className="solid-button"
            href={`/contact?service=${service.slug}`}
          >
            BEGIN YOUR PROJECT <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
