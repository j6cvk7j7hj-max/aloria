import { studioPageMetadata } from '@/lib/metadata';
import { ServiceCards } from '@/components/service-cards';
import { ProjectCta } from '@/components/project-cta';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageStructuredData } from '@/components/structured-data';

const title = 'Online Interior Design Services';
const description =
  'Explore Aloria’s online interior design services for Florida homes and clients nationwide: space planning, concept boards, furniture curation, and full room design.';
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
          room design. Our services are delivered online for homes across
          Florida and throughout the United States.
        </p>
      </section>
      <section className="services-page-cards" aria-label="Our design services">
        <ServiceCards />
      </section>
      <ProjectCta />
    </main>
  );
}
