import { z } from 'zod';
import { serviceSlugs } from './services';
const required = (label: string, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `Please add ${label}.`)
    .max(max, `Please keep ${label} under ${max} characters.`);
const optional = z.string().trim().max(1500).default('');
export const inquirySchema = z.object({
  name: required('your name', 120),
  email: z.email('Please enter a valid email address.').max(254),
  location: required('your location'),
  service: z.enum(serviceSlugs, { error: 'Please choose a service.' }),
  room: required('your room type'),
  dimensions: required('approximate room dimensions'),
  budget: required('your budget range'),
  timeline: required('your desired timeline'),
  description: required('a short project description', 4000),
  ceiling: optional,
  windows: optional,
  doors: optional,
  doorSwing: optional,
  outlets: optional,
  furniture: optional,
  style: optional,
  roomUse: optional,
  occupants: optional,
  inspiration: optional,
  colorsLove: optional,
  colorsAvoid: optional,
  keep: optional,
});
export type Inquiry = z.infer<typeof inquirySchema>;
export const emptyInquiry: Inquiry = {
  name: '',
  email: '',
  location: '',
  service: 'not-sure',
  room: '',
  dimensions: '',
  budget: '',
  timeline: '',
  description: '',
  ceiling: '',
  windows: '',
  doors: '',
  doorSwing: '',
  outlets: '',
  furniture: '',
  style: '',
  roomUse: '',
  occupants: '',
  inspiration: '',
  colorsLove: '',
  colorsAvoid: '',
  keep: '',
};
export const photoLimits = {
  count: 4,
  each: 5 * 1024 * 1024,
  total: 15 * 1024 * 1024,
};
export const photoTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
];
