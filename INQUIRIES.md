# Aloria inquiry delivery

The public form saves each valid inquiry to Aloria’s private Sites database and stores optional photographs in private object storage. The visitor receives a success message only after that storage succeeds. Email and Desktop delivery happen afterward, so either delivery channel can retry without risking the original inquiry.

## What the client experiences

1. A visitor can enter on the homepage, Services page, a specific service page, About page, or a shared link. Every page has direct navigation to Services and Contact.
2. A service-page button opens Contact with that service already selected. The visitor can change it or choose “I’d love your guidance.”
3. The form asks for contact information, location, room or job, dimensions, budget, timing, and a project description. Optional planning details and up to four photos help Mia understand the space.
4. Client and browser validation catches missing or invalid fields. The server separately validates the values, file types, file signatures, sizes, and allowed website origin.
5. After the database row and private photo objects are saved, the page confirms receipt. Mia then reviews the inquiry and replies to the client’s supplied email address.

Aloria is based in Hollywood, Florida. The site clearly states that every consultation and service is currently delivered online through measurements, photographs, video, and digital plans. No in-person meeting or on-site project work is offered yet. The About page explains that selected local in-person projects may become available as the studio grows.

## Where the information goes

- **Authoritative copy:** Cloudflare D1 through Sites stores every form answer and the delivery state. R2 stores original photographs privately.
- **Mia’s email:** Resend sends a plain-text summary to `mia@aloriadesign.com`. Reply-To is the client’s validated address, so replying reaches the client directly. The message identifies the inquiry and lists photograph names; the originals remain private and copy to the Mac rather than becoming public email links.
- **Mia’s Desktop:** a macOS LaunchAgent checks the authenticated owner feed every five minutes. It writes one named folder per inquiry under `~/Desktop/Aloria Inquiries`, containing a readable text file, complete JSON record, and `Photos` folder when applicable.

A folder name follows this pattern:

```text
Jane Smith - Living Room - Space Planning - 2026-09-03 - 01234567-89ab-cdef-0123-456789abcdef
```

The full inquiry ID prevents two clients with the same name and room from overwriting each other. Files are written to a temporary directory and renamed only after the whole inquiry succeeds. The sync cursor advances only afterward. The Mac never deletes the server copy.

Desktop delivery works while this Mac is awake, logged in, and online. If it is asleep or disconnected, the website still saves the inquiry immediately; the agent catches up after the Mac returns. `SYNC STATUS.txt` in the Desktop folder records the latest check and whether email has been connected.

## Private access and secrets

The owner feed, photograph downloads, backfill route, and delivery runner are never linked in the website or included in the sitemap. They send `no-store` and `noindex` headers and require long, separate bearer tokens. Tokens are never placed in public JavaScript, URLs, Git, or the LaunchAgent property list. The Mac’s protected application-support configuration is readable only by the owner account.

The email worker uses a separate delivery token and an expiring database lease. New inquiries are attempted promptly after saving; the scheduled workflow retries queued messages. Resend’s idempotency key is the inquiry UUID, and permanent sent state is kept in D1. Because provider idempotency keys expire after 24 hours, a rare duplicate remains possible after an ambiguous outage lasting longer than that window.

## Resend connection

1. In Resend, add `notify.aloriadesign.com` as the sending domain.
2. Add the exact SPF and DKIM records Resend displays to the domain’s DNS dashboard. These records belong to the `notify` subdomain. Do not replace the root iCloud MX records that receive mail for `mia@aloriadesign.com`.
3. Wait for Resend to mark the domain verified.
4. Create a sending-only API key. Store it as the Sites secret `RESEND_API_KEY`; never commit or post it in chat.
5. Configure `INQUIRY_EMAIL_FROM` as `Aloria Website <inquiries@notify.aloriadesign.com>` and `INQUIRY_EMAIL_TO` as `mia@aloriadesign.com`, deploy the environment revision, and send one clearly marked test inquiry.

The implementation uses Resend’s documented HTTPS send endpoint, `reply_to`, and `Idempotency-Key`. [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [domain verification](https://resend.com/docs/dashboard/domains/introduction), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys)

## Owner operations

- `POST /api/owner/backfill` registers pre-delivery inquiries for Desktop sync without emailing old records. Two known automated QA submissions are excluded from Desktop copying by exact inquiry ID.
- `GET /api/owner/inquiries?after=0&limit=25` returns the authenticated, ordered owner feed.
- `GET /api/owner/inquiries/:id/photos/:index` returns one authenticated private photo.
- `POST /api/owner/delivery` drains the queued email outbox using the separate delivery credential.

Run `pnpm install:inquiry-sync -- --token-file <protected-token-file>` to install or update the LaunchAgent. The installer copies a private Node runtime and the sync program into `~/Library/Application Support/Aloria Inquiry Sync`, writes protected configuration, loads `com.aloria.inquiry-sync`, and removes the temporary token file.
