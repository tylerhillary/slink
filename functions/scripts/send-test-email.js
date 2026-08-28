#!/usr/bin/env node
/**
 * Sends one real acknowledgement email using functions/.env, so you can prove
 * the mail credentials work before deploying anything.
 *
 *   node scripts/send-test-email.js you@example.com
 *
 * This talks to the mail provider only. It does not touch Firestore, does not
 * deploy, and does not need the Blaze plan — that is required for sending from
 * inside a deployed function, not from your own machine.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ENV_PATH = path.join(__dirname, '..', '.env');

/** Minimal .env reader — avoids adding a dependency just for this script. */
function loadEnv(file) {
  if (!fs.existsSync(file)) return 0;
  let count = 0;
  // Windows editors often save with a UTF-8 BOM; strip it or the first key breaks.
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

function fail(message, hint) {
  console.error(`\n  FAILED  ${message}`);
  if (hint) console.error(`\n  ${hint}`);
  console.error('');
  process.exit(1);
}

async function main() {
  const recipient = process.argv[2];
  if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    fail('No recipient given.', 'Usage:  node scripts/send-test-email.js you@example.com');
  }

  const loaded = loadEnv(ENV_PATH);
  if (!loaded) {
    fail(
      'functions/.env has no usable settings.',
      'Copy .env.example to .env, then fill in SMTP_PASS (or SENDGRID_API_KEY).',
    );
  }

  process.env.GCLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'slink-website';

  const config = require('../lib/config');
  const templates = require('../lib/templates');
  const { deliver, htmlToText } = require('../lib/mailer');

  console.log('\n  Transport');
  console.log('    provider :', config.resolvedProvider);
  console.log('    from     :', `${config.fromName} <${config.fromEmail}>`);
  if (config.resolvedProvider === 'smtp') {
    console.log('    host     :', `${config.smtpHost}:${config.smtpPort}`, config.smtpSecure ? '(TLS)' : '(plain)');
    console.log('    user     :', config.smtpUser);
    console.log('    password :', config.smtpPass ? `set, ${config.smtpPass.replace(/\s/g, '').length} characters` : 'EMPTY');
  }

  if (config.resolvedProvider === 'none') {
    // Say *why* nothing is configured rather than just that nothing is.
    console.error('\n  No mail transport is configured, so nothing can send.');
    console.error(`\n  Reading: ${ENV_PATH}`);
    try {
      const stat = fs.statSync(ENV_PATH);
      console.error(`  Last saved: ${stat.mtime.toLocaleString()}`);
      const raw = fs.readFileSync(ENV_PATH, 'utf8').replace(/^﻿/, '');
      for (const key of ['SMTP_PASS', 'SENDGRID_API_KEY']) {
        const line = raw.split(/\r?\n/).find((l) => l.trim().startsWith(`${key}=`));
        if (!line) {
          console.error(`  ${key}: line is missing from the file`);
        } else {
          const value = line.slice(line.indexOf('=') + 1).trim();
          console.error(`  ${key}: ${value ? `${value.replace(/\s/g, '').length} characters found` : 'EMPTY — nothing after the "=" sign'}`);
        }
      }
      console.error('\n  If a value looks empty but you typed one, the edit was not saved to');
      console.error('  disk. Check that you edited functions/.env (not .env.example) and that');
      console.error('  your editor actually wrote the file.');
    } catch (error) {
      console.error(`  Could not inspect the file: ${error.message}`);
    }
    console.error('');
    process.exit(1);
  }

  if (config.resolvedProvider === 'smtp') {
    const stripped = config.smtpPass.replace(/\s/g, '');
    if (stripped.length !== 16) {
      console.log(`\n  Note: Gmail App Passwords are 16 characters; yours is ${stripped.length}.`);
      console.log('  If this send fails on authentication, that is the likely reason.');
    }
  }

  // The exact email a new registrant receives.
  const mail = templates.registrationReceived({
    registration: {
      fullName: 'Test Registrant',
      email: recipient,
      location: 'Port Harcourt',
      selectedSkill: 'Python',
      teachSkills: ['Product Design', 'Figma'],
    },
    registrationId: 'smoke-test',
  });

  console.log('\n  Sending');
  console.log('    to      :', recipient);
  console.log('    subject :', mail.subject);

  const result = await deliver({
    to: recipient,
    subject: `[TEST] ${mail.subject}`,
    html: mail.html,
    text: htmlToText(mail.html),
  });

  if (!result.ok) {
    const detail = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
    let hint = 'Check the credentials in functions/.env.';
    if (/invalid login|username and password not accepted|535/i.test(detail)) {
      hint = 'Authentication was rejected. Use a Gmail App Password (16 characters), not the account password,\n  '
        + 'and make sure 2-Step Verification is on for that account.';
    } else if (/forbidden|401|403|unauthorized/i.test(detail)) {
      hint = 'The provider rejected the sender. With SendGrid the from-address must be a verified sender identity.';
    } else if (/ETIMEDOUT|ECONNREFUSED|ENOTFOUND/i.test(detail)) {
      hint = 'Could not reach the mail server. Check your network, or whether the SMTP port is blocked.';
    }
    fail(`Delivery failed: ${detail}`, hint);
  }

  console.log(`\n  SENT via ${result.provider}. Check ${recipient} — including the spam folder on the first send.`);
  console.log('  If it arrived, the same credentials will work once deployed.\n');
}

main().catch((error) => fail(error?.message || String(error)));
