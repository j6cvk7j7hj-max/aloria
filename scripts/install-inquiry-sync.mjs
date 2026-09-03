#!/usr/bin/env node

import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
  chmod,
} from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const tokenFileIndex = args.indexOf('--token-file');
if (tokenFileIndex < 0 || !args[tokenFileIndex + 1])
  throw new Error('Use --token-file with the protected owner token file.');

const tokenPath = resolve(args[tokenFileIndex + 1]);
const token = (await readFile(tokenPath, 'utf8')).trim();
if (token.length < 32) throw new Error('The owner token is invalid.');

const home = homedir();
const supportDir = join(
  home,
  'Library',
  'Application Support',
  'Aloria Inquiry Sync',
);
const runtimeDir = join(supportDir, 'runtime');
const logsDir = join(supportDir, 'logs');
const destination = join(home, 'Desktop', 'Aloria Inquiries');
const agentsDir = join(home, 'Library', 'LaunchAgents');
const label = 'com.aloria.inquiry-sync';
const plistPath = join(agentsDir, `${label}.plist`);
const installedNode = join(runtimeDir, 'node');
const installedSync = join(supportDir, 'inquiry-sync.mjs');
const configPath = join(supportDir, 'config.json');
const sourceSync = new URL('./inquiry-sync.mjs', import.meta.url);

const xml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

await mkdir(runtimeDir, { recursive: true, mode: 0o700 });
await mkdir(logsDir, { recursive: true, mode: 0o700 });
await mkdir(destination, { recursive: true, mode: 0o700 });
await mkdir(agentsDir, { recursive: true, mode: 0o700 });

const nodeTemporary = `${installedNode}.tmp`;
await copyFile(process.execPath, nodeTemporary);
await chmod(nodeTemporary, 0o700);
await rename(nodeTemporary, installedNode);
await copyFile(sourceSync, installedSync);
await chmod(installedSync, 0o700);
await writeFile(
  configPath,
  `${JSON.stringify(
    {
      apiBase: 'https://aloria-interiors.glossy-bison-4514.chatgpt.site',
      token,
      destination,
    },
    null,
    2,
  )}\n`,
  { mode: 0o600 },
);
await chmod(configPath, 0o600);

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${xml(installedNode)}</string>
    <string>${xml(installedSync)}</string>
    <string>--config</string>
    <string>${xml(configPath)}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>StartInterval</key>
  <integer>60</integer>
  <key>ProcessType</key>
  <string>Background</string>
  <key>Umask</key>
  <integer>63</integer>
  <key>StandardOutPath</key>
  <string>${xml(join(logsDir, 'sync.log'))}</string>
  <key>StandardErrorPath</key>
  <string>${xml(join(logsDir, 'sync-error.log'))}</string>
</dict>
</plist>
`;
const plistTemporary = `${plistPath}.tmp`;
await writeFile(plistTemporary, plist, { mode: 0o600 });
await rename(plistTemporary, plistPath);
await chmod(plistPath, 0o600);

const domain = `gui/${process.getuid()}`;
spawnSync('/bin/launchctl', ['bootout', `${domain}/${label}`], {
  stdio: 'ignore',
});
const bootstrap = spawnSync(
  '/bin/launchctl',
  ['bootstrap', domain, plistPath],
  {
    encoding: 'utf8',
  },
);
if (bootstrap.status !== 0)
  throw new Error(
    `Could not start Aloria Inquiry Sync: ${bootstrap.stderr.trim()}`,
  );
spawnSync('/bin/launchctl', ['kickstart', '-k', `${domain}/${label}`], {
  stdio: 'ignore',
});
await rm(tokenPath, { force: true });
console.log(
  `Aloria Inquiry Sync installed. Files will appear in ${destination}`,
);
