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
          your space and the design support you’re looking for. We’ll
          collaborate through photos, measurements, video, and digital design
          plans.
        </p>
        <div className="contact-location">
          <p>
            Florida-based design studio
            <br />
            Services currently delivered entirely online
          </p>
        </div>
      </div>
      <Suspense fallback={<p>Preparing your project inquiry…</p>}>
        <InquiryForm />
      </Suspense>
      <section
        className="contact-next-steps"
        aria-labelledby="next-steps-title"
      >
        <p className="section-label">WHAT HAPPENS NEXT</p>
        <h2 id="next-steps-title">A clear, personal beginning.</h2>
        <ol>
          <li>
            <span>01</span>
            <h3>We review your space</h3>
            <p>
              Your inquiry, measurements, and optional photos arrive privately
              for review.
            </p>
          </li>
          <li>
            <span>02</span>
            <h3>You hear from Mia</h3>
            <p>
              Mia replies by email with any questions and the best next step for
              your room.
            </p>
          </li>
          <li>
            <span>03</span>
            <h3>Your project is confirmed</h3>
            <p>
              If the project is a fit, you receive the scope, timing, and
              payment schedule in writing before design begins.
            </p>
          </li>
        </ol>
      </section>
    </main>
  );
}
