'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');

const EMAIL_LOG_COLLECTION = 'emailLog';

let sendgridClient = null;
let smtpTransport = null;

function getSendgrid() {
  if (!sendgridClient) {
    // eslint-disable-next-line global-require
    sendgridClient = require('@sendgrid/mail');
    sendgridClient.setApiKey(config.sendgridApiKey);
  }
  return sendgridClient;
}

function getSmtpTransport() {
  if (!smtpTransport) {
    // eslint-disable-next-line global-require
    const nodemailer = require('nodemailer');
    smtpTransport = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: { user: config.smtpUser, pass: config.smtpPass },
    });
  }
  return smtpTransport;
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

const HTML_ENTITIES = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  mdash: '—', ndash: '–', hellip: '…', middot: '·',
  rarr: '→', larr: '←', rsquo: '’', lsquo: '‘',
  ldquo: '“', rdquo: '”', times: '×', copy: '©',
};

function decodeEntities(value) {
  return String(value)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const key = name.toLowerCase();
      return Object.prototype.hasOwnProperty.call(HTML_ENTITIES, key) ? HTML_ENTITIES[key] : match;
    });
}

function htmlToText(html) {
  const text = String(html)
    .replace(/<head[\s\S]*?<\/head>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h1|h2|h3|li|table)>/gi, '\n')
    .replace(/<li>/gi, '  - ')
    .replace(/<[^>]+>/g, '');

  return decodeEntities(text)
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Low-level send. Returns { ok, provider, error }.
 */
async function deliver({ to, subject, html, text, replyTo }) {
  const provider = config.resolvedProvider;

  if (provider === 'none') {
    functions.logger.warn('Mail transport not configured — email not sent', {
      to,
      subject,
      hint: 'Set SENDGRID_API_KEY, or SMTP_USER and SMTP_PASS, in functions/.env',
    });
    return { ok: false, provider: 'none', error: 'mail-transport-not-configured' };
  }

  const from = { email: config.fromEmail, name: config.fromName };
  const replyToAddress = replyTo || config.replyToEmail || undefined;
  const plain = text || htmlToText(html);

  try {
    if (provider === 'sendgrid') {
      await getSendgrid().send({
        to,
        from,
        subject,
        html,
        text: plain,
        ...(replyToAddress ? { replyTo: replyToAddress } : {}),
      });
    } else {
      await getSmtpTransport().sendMail({
        to,
        from: `"${from.name}" <${from.email}>`,
        subject,
        html,
        text: plain,
        ...(replyToAddress ? { replyTo: replyToAddress } : {}),
      });
    }
    return { ok: true, provider };
  } catch (error) {
    const detail = error?.response?.body || error?.message || String(error);
    functions.logger.error('Email delivery failed', { to, subject, provider, detail });
    return { ok: false, provider, error: detail };
  }
}

/**
 * Send exactly once for a given lockId, even if the Cloud Function retries.
 *
 * The lock is a Firestore document created with `create()`, which throws
 * ALREADY_EXISTS on a second attempt — that is the whole guarantee.
 */
async function sendOnce({ lockId, to, subject, html, text, replyTo, meta = {} }) {
  if (!isValidEmail(to)) {
    functions.logger.warn('Skipped email — recipient address is not valid', { to, subject, lockId });
    return { ok: false, skipped: true, reason: 'invalid-recipient' };
  }

  const firestore = admin.firestore();
  const lockRef = firestore.collection(EMAIL_LOG_COLLECTION).doc(lockId);

  try {
    await lockRef.create({
      to,
      subject,
      status: 'sending',
      provider: config.resolvedProvider,
      ...meta,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    if (error?.code === 6 || error?.code === 'already-exists') {
      functions.logger.info('Email already sent for this lock — skipping duplicate', { lockId, to, subject });
      return { ok: true, skipped: true, reason: 'already-sent' };
    }
    functions.logger.error('Could not claim email lock', { lockId, error: error?.message || error });
    // Fall through and still attempt delivery rather than silently dropping mail.
  }

  const result = await deliver({ to, subject, html, text, replyTo });

  try {
    await lockRef.set({
      status: result.ok ? 'sent' : 'failed',
      provider: result.provider,
      ...(result.error ? { lastError: String(result.error).slice(0, 1500) } : {}),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    functions.logger.warn('Could not update email log', { lockId, error: error?.message || error });
  }

  return { ...result, skipped: false };
}

module.exports = {
  sendOnce,
  deliver,
  isValidEmail,
  htmlToText,
  EMAIL_LOG_COLLECTION,
};
