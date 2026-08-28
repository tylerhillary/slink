#!/usr/bin/env node
/**
 * Runs the whole registration pipeline WITHOUT Cloud Functions.
 *
 * Every registration still waiting gets its acknowledgement email, gets
 * matched if a partner exists, and both sides get introduced — exactly what
 * the deployed trigger does, driven from here instead. This is the free-plan
 * path: no Blaze upgrade required.
 *
 *   node scripts/process-queue.js              process the queue
 *   node scripts/process-queue.js --dry-run    show what it would do
 *   node scripts/process-queue.js --watch      keep running every 2 minutes
 *   node scripts/process-queue.js --limit 10   cap how many are handled
 *
 * Safe to run as often as you like. Acknowledgements are guarded by locks in
 * `emailLog` and a pair can only be introduced once, so re-running never
 * sends anybody a duplicate.
 *
 * Needs a service account key (free, no billing):
 *   Firebase Console -> Project settings -> Service accounts
 *   -> Generate new private key -> save as functions/service-account.json
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');
const KEY_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS
  || path.join(__dirname, '..', 'service-account.json');

/** Minimal .env reader — avoids adding a dependency just for this script. */
function loadEnv(file) {
  if (!fs.existsSync(file)) return 0;
  let count = 0;
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value && !process.env[key]) {
      process.env[key] = value;
      count += 1;
    }
  }
  return count;
}

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
  loadEnv(ENV_PATH);
  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'slink-website';

  const dryRun = process.argv.includes('--dry-run');
  const watch = process.argv.includes('--watch');
  const limit = Number(arg('--limit', 0)) || undefined;
  const intervalMinutes = Number(arg('--every', 2)) || 2;

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

  const config = require('../lib/config');
  const pipeline = require('../lib/pipeline');

  console.log('\n  Slink360 queue runner');
  console.log('    project      :', config.projectId);
  console.log('    mail         :', config.resolvedProvider, config.resolvedProvider === 'none' ? '<- nothing will send' : '');
  console.log('    introduce    :', config.autoIntroduce ? 'automatic' : 'OFF (acknowledgements only)');
  console.log('    reciprocal   :', config.requireReciprocal ? 'required' : 'not required');
  console.log('    capacity     :', config.defaultTeachCapacity, 'students per tutor');
  if (dryRun) console.log('    MODE         : DRY RUN, no email will be sent and nothing will be written');

  if (config.resolvedProvider === 'none' && !dryRun) {
    die('No mail transport configured.', 'Set SMTP_PASS in functions/.env, then run scripts/send-test-email.js to verify it.');
  }

  const runOnce = async () => {
    const startedAt = Date.now();

    if (dryRun) {
      const snapshot = await admin.firestore()
        .collection('registrations').where('status', '==', 'pending')
        .limit(limit || config.sweepBatchSize).get();
      console.log(`\n  ${snapshot.size} registration(s) waiting:`);
      for (const doc of snapshot.docs) {
        const d = doc.data() || {};
        console.log(`    ${doc.id}  ${d.fullName || '(no name)'} <${d.email || 'no email'}>`);
        console.log(`      wants: ${d.selectedSkill || '-'}   teaches: ${(d.teachSkills || []).join(', ') || '-'}`);
      }
      console.log('\n  Dry run — nothing sent. Drop --dry-run to process these.\n');
      return;
    }

    const summary = await pipeline.processPendingQueue({ limit, notifyAdminOnMiss: true });

    console.log(`\n  Processed ${summary.scanned} registration(s) in ${((Date.now() - startedAt) / 1000).toFixed(1)}s`);
    console.log(`    acknowledgements sent : ${summary.acknowledged}`);
    console.log(`    matches introduced    : ${summary.matched}`);
    if (summary.skippedOld) console.log(`    skipped (too old)     : ${summary.skippedOld}`);

    for (const r of summary.results) {
      const state = r.matched ? `MATCHED ${r.matchId}` : `waiting (${r.reason || 'no reason given'})`;
      console.log(`    - ${r.registrationId}: ${state}`);
    }
    console.log('');
  };

  await runOnce();

  if (watch) {
    console.log(`  Watching. Re-checking every ${intervalMinutes} minute(s). Ctrl+C to stop.\n`);
    setInterval(() => {
      runOnce().catch((error) => console.error('  Run failed:', error?.message || error));
    }, intervalMinutes * 60 * 1000);
  } else {
    process.exit(0);
  }
}

main().catch((error) => die(`Runner failed: ${error?.message || error}`));
