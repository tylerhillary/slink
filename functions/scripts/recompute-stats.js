#!/usr/bin/env node
/**
 * Recount the exchange from the real registrations, and publish the result.
 *
 * The website reads `public/stats` for the member, skill and state figures
 * shown on the homepage and About page. This script is what fills it in.
 * It also backfills the anonymised `directory` entries for registrations
 * that were created before the directory existed.
 *
 *   node scripts/recompute-stats.js              recount and publish
 *   node scripts/recompute-stats.js --dry-run    show the numbers, write nothing
 *   node scripts/recompute-stats.js --watch      keep it fresh every 15 minutes
 *
 * Safe to run as often as you like: it recomputes from scratch rather than
 * incrementing, and directory entries are keyed by registration id, so a
 * second run creates nothing new.
 *
 * Needs a service account key (free, no billing):
 *   Firebase Console -> Project settings -> Service accounts
 *   -> Generate new private key -> save as functions/service-account.json
 */
'use strict';

const fs = require('fs');
const path = require('path');

const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, '..', 'service-account.json');

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
}

function die(message, hint) {
  console.error(`\n  ${message}`);
  if (hint) console.error(`\n  ${hint}`);
  console.error('');
  process.exit(1);
}

async function main() {
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'slink-website';

  const dryRun = process.argv.includes('--dry-run');
  const watch = process.argv.includes('--watch');
  const intervalMinutes = Number(arg('--every', 15)) || 15;

  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    if (fs.existsSync(KEY_PATH)) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      admin.initializeApp({ credential: admin.credential.cert(require(KEY_PATH)) });
    } else {
      die(
        `No service account key found at ${KEY_PATH}`,
        'Firebase Console -> Project settings -> Service accounts -> Generate new private key.\n'
        + '  Save it as functions/service-account.json (it is gitignored). This is free —\n'
        + '  a service account key does not require the Blaze plan.',
      );
    }
  }

  const db = admin.firestore();
  const { recomputeStats } = require('../lib/stats');

  console.log('\n  Slink360 statistics');
  console.log('    project :', process.env.GCLOUD_PROJECT);
  if (dryRun) console.log('    MODE    : DRY RUN, nothing will be written');

  const runOnce = async () => {
    const startedAt = Date.now();
    const result = await recomputeStats(db, { backfillDirectory: true, dryRun });

    console.log(`\n  ${new Date().toLocaleTimeString()}  scanned ${result.scanned} registration(s) in ${Date.now() - startedAt}ms`);
    console.log('    active members   :', result.activeMembers);
    console.log('    of those matched :', result.matchedMembers);
    console.log('    skills offered   :', result.skillsOffered);
    console.log('    skills wanted    :', result.skillsWanted);
    console.log('    distinct skills  :', result.skillsTotal);
    console.log('    states covered   :', result.statesCovered);
    console.log(
      '    directory        :',
      dryRun
        ? `${result.directoryCreated} entr(y/ies) would be backfilled`
        : `${result.directoryCreated} entr(y/ies) backfilled`,
    );

    if (!dryRun) {
      console.log('\n    published to public/stats — the site will show these figures.');
    }

    if (result.activeMembers === 0) {
      console.log('\n    No active members yet. The site falls back to its written copy');
      console.log('    rather than displaying zeros.');
    }
  };

  await runOnce();

  if (watch) {
    console.log(`\n  Watching. Recounting every ${intervalMinutes} minute(s). Ctrl-C to stop.`);
    setInterval(() => {
      runOnce().catch((error) => console.error('  Recount failed:', error?.message || error));
    }, intervalMinutes * 60 * 1000);
  } else {
    console.log('');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('\n  Failed:', error?.message || error, '\n');
  process.exit(1);
});
