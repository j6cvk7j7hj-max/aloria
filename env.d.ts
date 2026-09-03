declare namespace Cloudflare {
  interface Env {
    FILES: R2Bucket;
    INQUIRY_OWNER_TOKEN?: string;
    INQUIRY_DELIVERY_TOKEN?: string;
    RESEND_API_KEY?: string;
    INQUIRY_EMAIL_FROM?: string;
    INQUIRY_EMAIL_TO?: string;
  }
}
