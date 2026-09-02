/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import type { Metadata } from 'next';
import Link from 'next/link';
import { requestOrigin } from '@/lib/metadata';
import { notFound } from 'next/navigation';
import { services } from '@/lib/services';
import { Reveal } from '@/components/reveal';

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
  const image = new URL(
    `/images/${service.slug}.avif`,
    await requestOrigin(),
  ).toString();
  return {
    title: service.title,
    description: service.description,
    openGraph: {
      title: `${service.title} | Aloria`,
      description: service.description,
      images: [{ url: image, width: 586, height: 436, alt: service.alt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${service.title} | Aloria`,
      description: service.description,
      images: [image],
    },
  };
}
export default async function ServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);
  if (!service) notFound();
  return (
    <main id="main-content">
      <section className="service-hero">
        <div className="service-hero-copy">
          <Link className="back-link" href="/services">
            ← ALL SERVICES
          </Link>
          <p className="section-label">
            {service.number} — {service.title}
          </p>
          <h1>{service.headline}</h1>
          <p>{service.intro}</p>
          <Link
            className="outline-button"
            href={`/contact?service=${service.slug}`}
          >
            {service.cta} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="service-hero-image">
          <img
            src={`/images/${service.slug}.avif`}
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
