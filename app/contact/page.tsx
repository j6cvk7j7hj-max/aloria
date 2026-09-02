import type { Metadata } from 'next';
import { Suspense } from 'react';
import { InquiryForm } from '@/components/inquiry-form';
export const metadata: Metadata = {
  title: 'Begin Your Project',
  description:
    'Tell Aloria about your space. Begin your online interior design project with a thoughtful, personal approach.',
};
export default function ContactPage() {
  return (
    <main id="main-content" className="contact-page section-container">
      <div className="contact-intro">
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
