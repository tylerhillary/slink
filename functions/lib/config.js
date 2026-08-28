'use strict';

const functions = require('firebase-functions');

function legacyConfig() {
  try {
    return functions.config() || {};
  } catch (error) {
    return {};
  }
}

const legacy = legacyConfig();
const slinkLegacy = legacy.slink || legacy.skillbank || {};
const mailLegacy = legacy.mail || {};

function readString(envKey, legacyValue, fallback) {
  const fromEnv = process.env[envKey];
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim();
  }
  if (typeof legacyValue === 'string' && legacyValue.trim()) {
    return legacyValue.trim();
  }
  return fallback;
}

function readBool(envKey, legacyValue, fallback) {
  const raw = readString(envKey, legacyValue, null);
  if (raw === null || raw === undefined) {
    return fallback;
  }
  return ['1', 'true', 'yes', 'on'].includes(String(raw).toLowerCase());
}

function readInt(envKey, legacyValue, fallback) {
  const raw = readString(envKey, legacyValue, null);
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const config = {
  // --- Brand / contact -------------------------------------------------
  brandName: 'Slink360',
  parentBrand: 'Radius Technology',
  // Slink360 is a Radius Technology product, and the emails say so. Set this
  // to the Radius site and every mention becomes a link; leave it empty and
  // the same mentions render as plain text.
  parentBrandUrl: readString('SLINK_PARENT_URL', slinkLegacy.parent_url, 'https://radiustechnology.vercel.app'),
  siteUrl: readString('SLINK_SITE_URL', slinkLegacy.site_url, 'https://slink-beta.vercel.app'),
  adminEmail: readString('SLINK_ADMIN_EMAIL', slinkLegacy.admin_email, 'skillbank0@gmail.com'),
  adminPhone: readString('SLINK_ADMIN_PHONE', slinkLegacy.admin_phone, '+234 812 820 4201'),
  supportEmail: readString('SLINK_SUPPORT_EMAIL', slinkLegacy.support_email, 'skillbank0@gmail.com'),

  // --- Mail transport --------------------------------------------------
  // 'auto' picks SendGrid when an API key is present, otherwise SMTP.
  mailProvider: readString('SLINK_MAIL_PROVIDER', mailLegacy.provider, 'auto').toLowerCase(),
  sendgridApiKey: readString('SENDGRID_API_KEY', mailLegacy.sendgrid_key, ''),
  smtpHost: readString('SMTP_HOST', mailLegacy.smtp_host, 'smtp.gmail.com'),
  smtpPort: readInt('SMTP_PORT', mailLegacy.smtp_port, 465),
  smtpSecure: readBool('SMTP_SECURE', mailLegacy.smtp_secure, true),
  smtpUser: readString('SMTP_USER', mailLegacy.smtp_user, ''),
  smtpPass: readString('SMTP_PASS', mailLegacy.smtp_pass, ''),

  fromEmail: readString('SLINK_MAIL_FROM_EMAIL', mailLegacy.from_email, 'skillbank0@gmail.com'),
  fromName: readString('SLINK_MAIL_FROM_NAME', mailLegacy.from_name, 'Slink360 (Radius Technology)'),
  replyToEmail: readString('SLINK_MAIL_REPLY_TO', mailLegacy.reply_to, ''),

  // --- Matching behaviour ----------------------------------------------
  // Master switch. Set false to keep sending the acknowledgement mail while
  // pausing every automatic introduction.
  autoIntroduce: readBool('SLINK_AUTO_INTRODUCE', slinkLegacy.auto_introduce, true),
  // When true, only a genuine two-way trade is introduced automatically.
  requireReciprocal: readBool('SLINK_REQUIRE_RECIPROCAL', slinkLegacy.require_reciprocal, false),
  // Minimum score before an automatic introduction is sent.
  minMatchScore: readInt('SLINK_MIN_MATCH_SCORE', slinkLegacy.min_match_score, 40),
  // Include phone numbers in the introduction emails.
  sharePhone: readBool('SLINK_SHARE_PHONE', slinkLegacy.share_phone, true),
  // How many learners one member may teach at the same time. Teaching does
  // not consume a member's own place in the queue to learn.
  defaultTeachCapacity: readInt('SLINK_TEACH_CAPACITY', slinkLegacy.teach_capacity, 3),
  // How many candidate documents to pull per query plan.
  candidateFetchLimit: readInt('SLINK_CANDIDATE_LIMIT', slinkLegacy.candidate_limit, 25),
  // Registrations older than this are ignored by the catch-up sweep.
  sweepMaxAgeDays: readInt('SLINK_SWEEP_MAX_AGE_DAYS', slinkLegacy.sweep_max_age_days, 30),
  sweepBatchSize: readInt('SLINK_SWEEP_BATCH_SIZE', slinkLegacy.sweep_batch_size, 40),
};

config.projectId = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'slink-website';

config.mailEnabled = Boolean(
  (config.mailProvider !== 'smtp' && config.sendgridApiKey) ||
  (config.mailProvider !== 'sendgrid' && config.smtpUser && config.smtpPass)
);

config.resolvedProvider = (() => {
  if (config.mailProvider === 'sendgrid') {
    return config.sendgridApiKey ? 'sendgrid' : 'none';
  }
  if (config.mailProvider === 'smtp') {
    return config.smtpUser && config.smtpPass ? 'smtp' : 'none';
  }
  if (config.sendgridApiKey) {
    return 'sendgrid';
  }
  if (config.smtpUser && config.smtpPass) {
    return 'smtp';
  }
  return 'none';
})();

module.exports = config;
