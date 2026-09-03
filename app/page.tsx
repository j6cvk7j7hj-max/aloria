/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import { SiteLink as Link } from '@/components/site-link';
import { assetPath } from '@/lib/site-path';
import { ServiceCards } from '@/components/service-cards';
import { ProjectCta } from '@/components/project-cta';
import { Reveal } from '@/components/reveal';
import { PageStructuredData } from '@/components/structured-data';
import { site, studioPageMetadata } from '@/lib/metadata';

const title = 'Online Interior Design in Hollywood, FL';

export function generateMetadata() {
  return studioPageMetadata(title, site.description, '/');
}

export default function Home() {
  return (
    <main id="main-content">
      <PageStructuredData
        path="/"
        name={title}
        description={site.description}
      />
      <section className="hero" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src={assetPath('/images/hero.avif')}
          alt="A grand European interior with a sweeping staircase, classical moldings, and flowers"
          width="1535"
          height="997"
          fetchPriority="high"
        />
        <div className="hero-inner">
          <div className="hero-copy">
            <h1 id="hero-title">ALORIA</h1>
            <span className="hero-rule" aria-hidden="true" />
            <p>
              Timeless interiors
              <br />
              inspired by
              <br />
              European elegance.
            </p>
            <Link className="outline-button" href="/contact">
              BEGIN YOUR PROJECT
            </Link>
          </div>
        </div>
      </section>
      <section
        className="philosophy split-section"
        aria-labelledby="philosophy-title"
      >
        <div className="split-copy">
          <p className="section-label">OUR PHILOSOPHY</p>
          <h2 id="philosophy-title">
            Every beautiful home begins with thoughtful design.
          </h2>
          <p>
            At Aloria, every project begins with intention. Inspired by timeless
            European architecture, we design interiors that balance beauty,
            comfort, and purpose. Rather than following trends, we create
            interiors that feel personal, refined, and timeless.
          </p>
          <Link className="text-link" href="/about">
            LEARN MORE <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="split-image">
          <img
            src={assetPath('/images/philosophy.avif')}
            alt="Warm daylight and fresh flowers beside a classical marble fireplace"
            width="1235"
            height="819"
            loading="lazy"
          />
        </div>
      </section>
      <section
        className="home-services section-container"
        aria-labelledby="services-title"
      >
        <Reveal>
          <p className="section-label">OUR SERVICES</p>
          <h2 id="services-title">Beautiful spaces begin with a plan.</h2>
        </Reveal>
        <ServiceCards />
      </section>
      <section
        className="split-section about-home"
        aria-labelledby="about-title"
      >
        <div className="split-image">
          <img
            src={assetPath('/images/about.avif')}
            alt="An elegant room with a marble fireplace, gold mirror, cream sofa, and soft natural light"
            width="1832"
            height="1029"
            loading="lazy"
          />
        </div>
        <div className="split-copy">
          <Reveal>
            <p className="section-label">ABOUT ALORIA</p>
            <h2 id="about-title">
              Timeless interiors, designed with intention.
            </h2>
          </Reveal>
          <p>
            Aloria is an online interior design studio based in Hollywood,
            Florida, serving clients across Florida and nationwide with a
            timeless, European-inspired approach. Every service is currently
            delivered entirely online, making it possible to collaborate
            thoughtfully through measurements, photos, video, and digital design
            plans. Whether redesigning a single room or starting fresh, our goal
            is to help clients create homes they will love for years to come.
          </p>
          <Link className="outline-button" href="/about">
            LEARN MORE <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <ProjectCta />
    </main>
  );
}
