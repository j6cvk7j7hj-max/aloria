#!/usr/bin/env node

import {
  chmod,
  mkdir,
  open,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

const args = process.argv.slice(2);
const configIndex = args.indexOf('--config');
if (configIndex < 0 || !args[configIndex + 1])
  throw new Error('A configuration file is required.');

const configPath = args[configIndex + 1];
const config = JSON.parse(await readFile(configPath, 'utf8'));
const supportDir = dirname(configPath);
const statePath = join(supportDir, 'state.json');
const lockPath = join(supportDir, 'sync.lock');
const destination = config.destination;

function safeSegment(value, fallback = 'Project') {
  const clean = String(value || '')
    .normalize('NFKC')
    .replace(/[\p{Cc}\u202a-\u202e\u2066-\u2069]/gu, '')
    .replace(/[<>:"/\\|?*]/g, ' ')
    .replace(/^\.+|[. ]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return (clean || fallback).slice(0, 48);
}

function datePart(timestamp) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(timestamp));
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}

function serviceName(slug) {
  return (
    {
      'space-planning': 'Space Planning',
      'concept-board': 'Concept Board',
      'furniture-curation': 'Furniture Curation',
      'signature-design': 'Signature Design',
      'not-sure': 'Guidance Requested',
    }[slug] || safeSegment(slug, 'Design Service')
  );
}

function recordBase(inquiry) {
  return [
    safeSegment(inquiry.name, 'New Client'),
    safeSegment(inquiry.details?.room, 'Project'),
    safeSegment(serviceName(inquiry.service)),
    datePart(inquiry.createdAt),
    inquiry.id,
  ].join(' - ');
}

function readableRecord(inquiry) {
  const fields = [
    ['Client', inquiry.name],
    ['Client email', inquiry.email],
    [
      'Received',
      new Date(inquiry.createdAt).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        dateStyle: 'long',
        timeStyle: 'short',
      }) + ' ET',
    ],
    ['Service', serviceName(inquiry.service)],
    ['Client location', inquiry.details?.location],
    ['Room / job', inquiry.details?.room],
    ['Approximate dimensions', inquiry.details?.dimensions],
    ['Budget range', inquiry.details?.budget],
    ['Desired timeline', inquiry.details?.timeline],
    ['Project description', inquiry.details?.description],
    ['Ceiling height', inquiry.details?.ceiling],
    ['Window dimensions', inquiry.details?.windows],
    ['Door dimensions', inquiry.details?.doors],
    ['Door swing directions', inquiry.details?.doorSwing],
    ['Outlets or fixed features', inquiry.details?.outlets],
    ['Existing furniture', inquiry.details?.furniture],
    ['Preferred styles', inquiry.details?.style],
    ['How the room is used', inquiry.details?.roomUse],
    ['People using the room', inquiry.details?.occupants],
    ['Inspiration / Pinterest', inquiry.details?.inspiration],
    ['Colors loved', inquiry.details?.colorsLove],
    ['Colors to avoid', inquiry.details?.colorsAvoid],
    ['Elements that must remain', inquiry.details?.keep],
    ['Inquiry ID', inquiry.id],
    [
      'Email delivery',
      inquiry.emailStatus === 'sent' ? 'Sent to Mia' : inquiry.emailStatus,
    ],
  ];
  return [
    'ALORIA PROJECT INQUIRY',
    '======================',
    '',
    ...fields
      .filter(
        ([, value]) =>
          value !== undefined && value !== null && String(value).trim(),
      )
      .flatMap(([label, value]) => [`${label}:`, String(value).trim(), '']),
    `Photos: ${inquiry.photos?.length || 0}`,
    ...(inquiry.photos || []).map(
      (photo, index) => `${index + 1}. ${photo.name}`,
    ),
    '',
  ].join('\n');
}

async function atomicJson(path, value) {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporary, path);
  await chmod(path, 0o600);
}

async function fetchPrivate(path) {
  const response = await fetch(new URL(path, config.apiBase), {
    headers: { Authorization: `Bearer ${config.token}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok)
    throw new Error(`Aloria server returned ${response.status}.`);
  return response;
}

async function syncInquiry(inquiry) {
  const base = recordBase(inquiry);
  const finalDirectory = join(destination, base);
  const marker = join(finalDirectory, '.aloria-inquiry-id');
  try {
    if ((await readFile(marker, 'utf8')).trim() === inquiry.id) return;
  } catch {
    // The inquiry has not been copied completely yet.
  }
  const temporary = join(destination, `.aloria-tmp-${inquiry.id}`);
  await rm(temporary, { recursive: true, force: true });
  await mkdir(temporary, { recursive: true, mode: 0o700 });
  const textName = `${base}.txt`;
  const jsonName = `${base}.json`;
  await writeFile(join(temporary, textName), readableRecord(inquiry), {
    mode: 0o600,
  });
  await writeFile(
    join(temporary, jsonName),
    `${JSON.stringify(inquiry, null, 2)}\n`,
    { mode: 0o600 },
  );
  await writeFile(join(temporary, '.aloria-inquiry-id'), `${inquiry.id}\n`, {
    mode: 0o600,
  });
  if (inquiry.photos?.length) {
    const photosDirectory = join(temporary, 'Photos');
    await mkdir(photosDirectory, { mode: 0o700 });
    for (let index = 0; index < inquiry.photos.length; index += 1) {
      const photo = inquiry.photos[index];
      const response = await fetchPrivate(
        `/api/owner/inquiries/${encodeURIComponent(inquiry.id)}/photos/${index}`,
      );
      const filename = `${String(index + 1).padStart(2, '0')} - ${safeSegment(photo.name, 'project-photo')}`;
      await writeFile(
        join(photosDirectory, filename),
        new Uint8Array(await response.arrayBuffer()),
        { mode: 0o600 },
      );
    }
  }
  try {
    const info = await stat(finalDirectory);
    if (info.isDirectory())
      throw new Error(
        `A different folder already uses ${basename(finalDirectory)}.`,
      );
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  await rename(temporary, finalDirectory);
}

async function updateStatus(status) {
  const lines = [
    'ALORIA INQUIRY SYNC STATUS',
    '==========================',
    '',
    `Last checked: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'long', timeStyle: 'short' })} ET`,
    `Result: ${status.ok ? 'Up to date' : 'Needs attention'}`,
    `Latest sequence copied: ${status.afterSequence || 0}`,
    `Email connection: ${status.emailConfigured ? 'Connected' : 'Waiting for the sending service to be connected'}`,
    ...(status.error
      ? ['', `Error: ${String(status.error).slice(0, 300)}`]
      : []),
    '',
    'This folder updates while this Mac is awake, logged in, and online.',
    'Saved website inquiries remain stored privately online if this Mac is asleep.',
    '',
  ];
  await writeFile(join(destination, 'SYNC STATUS.txt'), lines.join('\n'), {
    mode: 0o600,
  });
}

await mkdir(supportDir, { recursive: true, mode: 0o700 });
await mkdir(destination, { recursive: true, mode: 0o700 });
let lock;
for (let attempt = 0; attempt < 2; attempt += 1) {
  try {
    lock = await open(lockPath, 'wx', 0o600);
    await lock.writeFile(`${process.pid}\n`);
    break;
  } catch (error) {
    if (error?.code !== 'EEXIST') throw error;
    const priorPid = Number.parseInt(await readFile(lockPath, 'utf8'), 10);
    try {
      process.kill(priorPid, 0);
      process.exit(0);
    } catch {
      await rm(lockPath, { force: true });
    }
  }
}
if (!lock) throw new Error('Could not acquire the inquiry sync lock.');

let state = { afterSequence: 0, lastSuccessAt: null };
try {
  state = { ...state, ...JSON.parse(await readFile(statePath, 'utf8')) };
} catch {
  // A missing state file means this is the first run.
}

try {
  let hasMore = true;
  let emailConfigured = false;
  while (hasMore) {
    const response = await fetchPrivate(
      `/api/owner/inquiries?after=${state.afterSequence}&limit=25`,
    );
    const page = await response.json();
    emailConfigured = Boolean(page.emailConfigured);
    for (const inquiry of page.inquiries || []) {
      await syncInquiry(inquiry);
      state.afterSequence = inquiry.sequence;
      state.lastSuccessAt = new Date().toISOString();
      await atomicJson(statePath, state);
    }
    hasMore = Boolean(page.hasMore) && (page.inquiries?.length || 0) > 0;
  }
  await updateStatus({ ok: true, ...state, emailConfigured });
} catch (error) {
  await updateStatus({ ok: false, ...state, error: error?.message || error });
  throw error;
} finally {
  await lock?.close().catch(() => undefined);
  await rm(lockPath, { force: true }).catch(() => undefined);
}
