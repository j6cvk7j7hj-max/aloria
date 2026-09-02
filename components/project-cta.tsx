import Link from 'next/link';
import { Reveal } from '@/components/reveal';
export function ProjectCta() {
  return (
    <section className="project-cta" aria-labelledby="project-cta-title">
      <Reveal>
        <h2 id="project-cta-title">
          Let’s create a home you’ll love coming back to.
        </h2>
        <p>
          Whether you’re redesigning one room or starting fresh, Aloria offers
          thoughtful online design services tailored to your space.
        </p>
        <Link className="solid-button" href="/contact">
          START YOUR PROJECT <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </section>
  );
}
