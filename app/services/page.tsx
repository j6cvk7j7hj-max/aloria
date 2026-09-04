import { studioPageMetadata } from '@/lib/metadata';
import { ServiceCards } from '@/components/service-cards';
import { ProjectCta } from '@/components/project-cta';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageStructuredData } from '@/components/structured-data';

const title = 'Online Interior Design Services';
const description =
  'Explore Aloria’s Florida-based online interior design services: space planning, concept boards, furniture curation, and complete room design nationwide.';
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
];

export function generateMetadata() {
  return studioPageMetadata(title, description, '/services');
}

export default function ServicesPage() {
  return (
    <main id="main-content">
      <PageStructuredData
        path="/services"
        name={title}
        description={description}
        type="CollectionPage"
        breadcrumbs={breadcrumbs}
      />
      <section className="page-intro">
        <Breadcrumbs items={breadcrumbs} />
        <p className="section-label">SERVICES</p>
        <h1>Thoughtful design support, tailored to your space.</h1>
        <p>
          Choose the level of design support that fits your project, from space
          planning and concept development to curated furnishings and complete
          room design. Every service is currently delivered online by our
          Florida-based studio for homes across the state and throughout the
          United States.
        </p>
      </section>
      <section className="services-page-cards" aria-label="Our design services">
        <ServiceCards />
      </section>
      <ProjectCta />
    </main>
  );
}
