import { studioPageMetadata } from '@/lib/metadata';
import { ServiceCards } from '@/components/service-cards';
import { ProjectCta } from '@/components/project-cta';
export async function generateMetadata() {
  return studioPageMetadata(
    'Online Interior Design Services',
    'Explore space planning, concept boards, furniture curation, and Signature Design. Thoughtful online design support tailored to your space.',
    '/services',
  );
}

export default function ServicesPage() {
  return (
    <main id="main-content">
      <section className="page-intro">
        <p className="section-label">SERVICES</p>
        <h1>Thoughtful design support, tailored to your space.</h1>
        <p>
          Choose the level of design support that fits your project, from space
          planning and concept development to curated furnishings and complete
          room design.
        </p>
      </section>
      <section className="services-page-cards" aria-label="Our design services">
        <ServiceCards />
      </section>
      <ProjectCta />
    </main>
  );
}
