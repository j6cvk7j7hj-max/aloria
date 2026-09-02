/* oxlint-disable next/no-img-element -- Local AVIF assets are already compressed and have explicit dimensions. */
import { studioPageMetadata } from '@/lib/metadata';
import { ProjectCta } from '@/components/project-cta';
import { Reveal } from '@/components/reveal';
export async function generateMetadata() {
  return studioPageMetadata(
    'About Aloria',
    'Meet Mia, founder of Aloria, an online interior design studio inspired by timeless European elegance, thoughtful planning, and warm natural materials.',
    '/about',
  );
}

export default function AboutPage() {
  return (
    <main id="main-content">
      <section className="page-intro about-intro">
        <p className="section-label">ABOUT ALORIA</p>
        <h1>Thoughtful interiors inspired by timeless European elegance.</h1>
      </section>
      <div className="about-panorama">
        <img
          src="/images/about.avif"
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
            Hi, I’m Mia, founder of Aloria. My approach to interior design is
            rooted in a love of timeless architecture, thoughtful space
            planning, warm natural materials, and interiors that feel refined
            without sacrificing comfort. I created Aloria to offer approachable
            online design services that help clients make confident decisions
            and create homes that feel considered, personal, and lasting.
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
          <span className="founder-signature">Mia</span>
        </div>
      </section>
      <ProjectCta />
    </main>
  );
}
