import { env } from 'cloudflare:workers';
export function getDatabase() {
  if (!env.DB) throw new Error('Project inquiry storage is unavailable.');
  return env.DB;
}
export function getPhotoStorage() {
  if (!env.FILES) throw new Error('Photo storage is unavailable.');
  return env.FILES;
}
