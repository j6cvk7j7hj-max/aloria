import type { Inquiry } from '@/lib/inquiry';
import { services } from '@/lib/services';

export type StoredPhoto = {
  key: string;
  name: string;
  type: string;
  size: number;
};

export type StoredInquiry = {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  service: string;
  details: Inquiry;
  photos: StoredPhoto[];
};

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function serviceName(slug: string) {
  return (
    services.find((service) => service.slug === slug)?.title ||
    (slug === 'not-sure' ? 'Guidance requested' : slug)
  );
}

export function storedInquiryFromRow(row: {
  id: string;
  created_at: number;
  name: string;
  email: string;
  service: string;
  details: string;
  photos: string;
}): StoredInquiry {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    email: row.email,
    service: row.service,
    details: parseJson<Inquiry>(row.details, {} as Inquiry),
    photos: parseJson<StoredPhoto[]>(row.photos, []),
  };
}
