import { env } from 'cloudflare:workers';

function tokenFrom(request: Request) {
  const authorization = request.headers.get('Authorization') || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

async function equalSecret(received: string, expected?: string) {
  if (!received || !expected) return false;
  const encoder = new TextEncoder();
  const [receivedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(received)),
    crypto.subtle.digest('SHA-256', encoder.encode(expected)),
  ]);
  const left = new Uint8Array(receivedHash);
  const right = new Uint8Array(expectedHash);
  let difference = 0;
  for (let index = 0; index < left.length; index += 1)
    difference |= left[index] ^ right[index];
  return difference === 0;
}

export function privateHeaders(contentType = 'application/json') {
  return {
    'Cache-Control': 'private, no-store, max-age=0',
    'Content-Type': contentType,
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
  };
}

export async function isOwner(request: Request) {
  return equalSecret(tokenFrom(request), env.INQUIRY_OWNER_TOKEN);
}

export async function isDeliveryRunner(request: Request) {
  return equalSecret(tokenFrom(request), env.INQUIRY_DELIVERY_TOKEN);
}
