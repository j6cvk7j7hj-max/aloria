import { studioPageMetadata } from '@/lib/metadata';
import { Suspense } from 'react';
import { InquiryForm } from '@/components/inquiry-form';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { PageStructuredData } from '@/components/structured-data';

const title = 'Contact Aloria | Begin Your Interior Design Project';
const description =
  'Tell Aloria about your room, style, and budget. Start an online interior design project with our Florida-based studio, serving clients nationwide.';
const breadcrumbs = [
  { name: 'Home', path: '/' },
  { name: 'Contact', path: '/contact' },
];

export function generateMetadata() {
  return studioPageMetadata(title, description, '/contact');
}

export default function ContactPage() {
  return (
    <main id="main-content" className="contact-page section-container">
      <PageStructuredData
        path="/contact"
        name={title}
        description={description}
        type="ContactPage"
        breadcrumbs={breadcrumbs}
      />
      <div className="contact-intro">
        <Breadcrumbs items={breadcrumbs} />
        <p className="section-label">CONTACT ALORIA</p>
        <h1>
          Let’s begin
          <br />
          your project.
        </h1>
        <p>
          A beautiful home begins with a conversation. Tell us a little about
          your space and the design support you’re looking for.
        </p>
        <div className="contact-location">
          <p>
            Based in Florida
            <br />
            Online design, serving nationwide
          </p>
        </div>
      </div>
      <Suspense fallback={<p>Preparing your project inquiry…</p>}>
        <InquiryForm />
      </Suspense>
    </main>
  );
}
