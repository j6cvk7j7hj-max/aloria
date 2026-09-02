import { SiteLink as Link } from '@/components/site-link';
export default function NotFound() {
  return (
    <main id="main-content" className="page-intro not-found">
      <p className="section-label">ALORIA</p>
      <h1>A little out of place.</h1>
      <p>We couldn’t find that page. Let’s take you somewhere familiar.</p>
      <Link className="outline-button" href="/">
        RETURN HOME <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
