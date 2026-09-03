/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import { studioPageMetadata } from '@/lib/metadata';
import { assetPath } from '@/lib/site-path';
import { ProjectCta } from '@/components/project-cta';
import { Reveal } from '@/components/reveal';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageStructuredData } from '@/components/structured-data';

const title = 'About Aloria | Hollywood, FL Online Interior Design';
const description =
  'Meet Mia, founder of Aloria, an online interior design studio based in Hollywood, Florida, creating European-inspired rooms for clients in Florida and nationwide.';
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'About Aloria', path: '/about' },
];

export function generateMetadata() {
  return studioPageMetadata(title, description, '/about');
}

export default function AboutPage() {
  return (
    <main id="main-content">
      <PageStructuredData
        path="/about"
        name={title}
        description={description}
        type="AboutPage"
        breadcrumbs={breadcrumbs}
      />
      <section className="page-intro about-intro">
        <Breadcrumbs items={breadcrumbs} />
        <p className="section-label">ABOUT ALORIA</p>
        <h1>Thoughtful interiors inspired by timeless European elegance.</h1>
      </section>
      <div className="about-panorama">
        <img
          src={assetPath('/images/about.avif')}
          alt="A light-filled European-inspired room with a classical fireplace, gold mirror, and warm cream sofa"
          width="1832"
          height="1029"
          fetchPriority="high"
        />
      </div>
      <section className="founder section-container">
        <Reveal>
          <p className="section-label">A NOTE FROM MIA</p>
          <h2>
            A considered home.
            <br />A personal approach.
          </h2>
        </Reveal>
        <div>
          <p>
            Hi, I’m Mia, founder of Aloria, an online interior design studio
            based in Hollywood, Florida and serving clients across Florida and
            nationwide. My approach to interior design is rooted in a love of
            timeless architecture, thoughtful space planning, warm natural
            materials, and interiors that feel refined without sacrificing
            comfort. I created Aloria to offer approachable online design
            services that help clients make confident decisions and create homes
            that feel considered, personal, and lasting.
          </p>
          <p>
            Beautiful interiors should feel personal, functional, and enduring
            rather than driven by short-lived trends. Every project begins with
            understanding the space, the client, and the way the room will
            actually be lived in.
          </p>
          <p>
            Inspired by European architecture, classic proportions, warm
            neutrals, layered textures, and timeless furnishings.
          </p>
          <p>
            For now, every consultation and design service takes place online;
            Aloria does not schedule in-person meetings or on-site project work.
            As the studio grows, selected local, in-person projects may become
            available in the future.
          </p>
          <span className="founder-signature">Mia</span>
        </div>
      </section>
      <ProjectCta />
    </main>
  );
}
