import { headers } from 'next/headers';

export async function requestOrigin() {
  // Sites routes the direct Host header to this site. Do not use forwarded-host headers.
  const host = (await headers()).get('host');
  if (!host || !/^[a-z0-9.-]+(?::[0-9]+)?$/i.test(host))
    throw new Error('Invalid site origin');
  const local = /^(localhost|127\.0\.0\.1)(:[0-9]+)?$/.test(host);
  return new URL(`${local ? 'http' : 'https'}://${host}`);
}
