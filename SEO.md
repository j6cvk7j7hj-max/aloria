# Aloria search setup

Primary website: [aloriadesign.com](https://aloriadesign.com/). Research reviewed September 3, 2026.

Aloria’s current positioning is **an online interior design studio based in Hollywood, Florida, serving clients across Florida and nationwide**. Consultations and design work are currently entirely online. Aloria does not yet offer in-person meetings or on-site project work, and the website does not publish a street address or phone number.

## Implemented in the website

- Unique search titles and descriptions for all eight pages, with Florida and online-service context where relevant.
- Canonicals and sharing URLs pointing to the corresponding page on `aloriadesign.com`, including when the same source runs on Sites. Contact query variants point to the clean contact URL.
- A [sitemap](https://aloriadesign.com/sitemap.xml) listing all eight canonical pages, advertised in [robots.txt](https://aloriadesign.com/robots.txt). No artificial modification dates, query variants, or API URLs are included.
- Server-rendered Organization, WebSite, page, Service, and BreadcrumbList structured data. Studio and service entities share a stable identity. Unknown prices, addresses, reviews, credentials, and social profiles are omitted.
- Visible breadcrumbs, clearer service explanations, and useful questions with links between related services. The homepage keeps its original section order and design.
- Initial HTML contains the content, navigation, metadata, and structured data. Images retain dimensions, compressed AVIF files, and descriptive or appropriately decorative alt text. Below-the-fold images remain lazy-loaded and the main image is prioritized.
- `pnpm build:pages` runs an SEO gate before publishing. It checks page titles, descriptions, canonical domains and paths, sharing metadata, image references, JSON-LD, sitemap coverage, crawlable navigation, and the noindex 404 page. Run `pnpm check:seo` to repeat those checks against an existing export.

The Pages build and sitemap route inventory are in `lib/site-config.json`. When adding a page, also update `app/sitemap.xml`; the build rejects a mismatch. Keep the Sites inquiry backend available. SEO changes do not move inquiry data or photographs into GitHub.

## Search intent by page

These targets reflect Aloria’s actual services. They are starting hypotheses, not measured keyword volumes or ranking forecasts. Refine them using real Search Console queries after the site is indexed.

| Page               | Main search intent                                                        |
| ------------------ | ------------------------------------------------------------------------- |
| Home               | Hollywood FL online interior design; European-inspired interiors          |
| Services           | Online interior design services; choosing the right design support        |
| Space Planning     | Online space planning; furniture layouts; room layout help                |
| Concept Board      | Interior design concept boards; mood boards; color and material direction |
| Furniture Curation | Online furniture curation; furniture and décor sourcing                   |
| Signature Design   | Complete online room design; coordinated room design plan                 |
| About              | Aloria; Mia; Hollywood Florida online interior design studio              |
| Contact            | Contact Aloria; start an online interior design project                   |

## What current research changes

**The site is live, but search visibility is not established yet.** Public web searches reviewed on September 3, 2026 did not surface `aloriadesign.com` for `Aloria`, `Alloria`, `"Aloria" "Hollywood"`, the exact domain, or a `site:aloriadesign.com` query. This is a limited observation rather than proof of Google’s indexing status or a measured ranking. Verify the actual status with Search Console URL Inspection. Google also notes that a missing result from the `site:` operator does not by itself prove a technical problem. [Google’s site-operator guidance](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site)

**A search result is generated for the query.** When the site is indexed, Google may use the page title and description as inputs but can rewrite both. An illustrative result for a relevant search could read “Online Interior Design in Hollywood, FL | Aloria” with a description of the four online services. It is an example, not a claim about the result Google currently shows. [Title-link guidance](https://developers.google.com/search/docs/appearance/title-link), [Snippet guidance](https://developers.google.com/search/docs/appearance/snippet)

**The name needs time and consistency.** Searches for `Aloria` and the misspelling `Alloria` currently show unrelated brands. Use the correct spelling Aloria consistently on the website, business profiles, and real social accounts. Do not add repeated misspellings or keyword-stuffed copy. A person who already has the URL can reach the site directly while search engines discover and evaluate it.

**AI search uses the same foundations.** Google’s 2026 guidance emphasizes original, helpful material, crawlability, clear structure, and relevant imagery. It says special AI markup and `llms.txt` do not improve visibility in Google Search. The application here is clear service information and accessible HTML; future content should draw on Mia’s own design decisions and real work. [Google’s AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)

**Search Console now reports AI impressions separately.** Google says its generative AI impressions report reached websites worldwide on August 31, 2026. New sites may need sufficient impressions before the report appears. Inclusion in Search generative AI features is enabled by default; verify the property’s actual setting once connected. [AI performance report](https://support.google.com/webmasters/answer/16984139), [AI inclusion control](https://support.google.com/webmasters/answer/16908024)

**Questions should help visitors choose.** Google ended FAQ rich results starting May 7, 2026. Aloria’s questions are normal, readable page content; they do not use FAQ markup or promise expanded search listings. [Google documentation updates](https://developers.google.com/search/updates)

**Local visibility needs accurate business details.** Aloria is based in Hollywood but is currently online-only, so it is not eligible for a Google Business Profile or Maps business listing. If Aloria later begins meeting clients or visiting project sites, confirm the real in-person service area before setting up a profile. A qualifying business that visits clients may use a service-area profile and hide a residential address. [Business Profile eligibility](https://support.google.com/business/answer/7039811), [Business representation guidelines](https://support.google.com/business/answer/3038177)

**Specific pages need a genuine purpose.** Avoid copying the same content into dozens of Florida city pages. Publish a city page only when there is distinctive, accurate local information and a useful service explanation. Google identifies regional doorway pages and keyword stuffing as spam patterns. [Google spam policies](https://developers.google.com/search/docs/essentials/spam-policies)

**Technical signals should agree.** Use the same preferred URLs in canonical tags, internal links, and the sitemap. Keep one unique, descriptive title per page. Organization markup can include only the relevant facts; Service markup describes the offer and does not guarantee a special search display. [Canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [Title guidance](https://developers.google.com/search/docs/appearance/title-link), [Organization guidance](https://developers.google.com/search/docs/appearance/structured-data/organization), [Service vocabulary](https://schema.org/Service)

## Finish Google ownership setup

This repository does not contain a Search Console verification token, and Google account verification and sitemap submission have not been completed by this code change.

1. Sign in to [Google Search Console](https://search.google.com/search-console/welcome) with the Google account that should own Aloria’s search data.
2. Add a **Domain** property for `aloriadesign.com`.
3. Copy the exact TXT verification value Google supplies. In the domain’s DNS dashboard, add a **TXT** record at **@** using that value and the default TTL. Keep the existing website and email records. Return to Search Console and select **Verify**.
4. Under **Sitemaps**, submit `https://aloriadesign.com/sitemap.xml`.
5. Use **URL Inspection** on the homepage and service pages. Run the live test, inspect the selected canonical and indexing eligibility, then request indexing where appropriate.
6. Check the Search generative AI inclusion setting and, as data appears, review both ordinary Search performance and generative AI impressions.

Verification requires the real value from the owner’s Google account; there is no placeholder token to deploy. Sitemap submission helps discovery but does not guarantee indexing. [Ownership verification](https://support.google.com/webmasters/answer/9008080), [Sitemap submission](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## Next local inputs and ongoing work

Add any public social accounts and contact details Mia wants displayed once they are ready. Keep the Hollywood base and online-only wording accurate. If in-person services begin later, update the service-area copy and evaluate Business Profile eligibility at that time. Google describes local ranking in terms of relevance, distance, and prominence; a statewide service statement alone cannot establish proximity to every Florida searcher. [Local ranking guidance](https://support.google.com/business/answer/7091)

As real work becomes available, publish approved project stories that explain the room, constraints, layout choices, materials, and result. Label independent design concepts clearly. Keep business listings and genuine social profiles consistent, and request honest reviews from actual clients if the business qualifies for a profile.

After Search Console collects enough data, compare similar periods for non-brand queries, Florida-related queries, service-page impressions and clicks, and qualified inquiries. Use those results to improve the pages visitors actually need. Google notes that changes can take weeks or longer to show an effect; no ranking position is promised. [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

The public PageSpeed API returned HTTP 429 (shared quota exhausted) during this audit, so no PageSpeed score or Core Web Vitals improvement is claimed. Review [PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Faloriadesign.com%2F) and Search Console’s field data when available.
