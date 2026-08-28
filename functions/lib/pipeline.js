'use strict';

/**
 * The whole registration pipeline, independent of what calls it.
 *
 * A Cloud Functions trigger calls this, and so does the standalone runner in
 * scripts/process-queue.js. Nothing in here knows or cares which — that is
 * what lets the same logic run on the free plan without Cloud Functions.
 *
 * Re-running it is safe. Acknowledgement emails are guarded by the locks in
 * `emailLog`, and a pair can only be committed once because the match id is
 * derived from both email addresses. Polling this in a loop is therefore a
 * legitimate way to drive it, not a workaround.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');
const templates = require('./templates');
const { sendOnce } = require('./mailer');
const matching = require('./matching');

/**
 * Acknowledge a registration, then try to pair it.
 *
 * @param {string}  registrationId
 * @param {object}  data     the registration document data
 * @param {object}  ref      DocumentReference, used to seed missing fields
 * @param {boolean} notifyAdminOnMiss  email the desk when nobody fits yet
 */
async function processRegistration({ registrationId, data, ref, notifyAdminOnMiss = true }) {
  const result = { registrationId, acknowledged: false, matched: false, reason: null };

  // --- 1. Acknowledgement, sent first and independently of matching. ---
  try {
    const mail = templates.registrationReceived({ registration: data, registrationId });
    const sent = await sendOnce({
      lockId: `reg-${registrationId}-ack`,
      to: data.email,
      subject: mail.subject,
      html: mail.html,
      meta: { kind: 'registration-ack', registrationId },
    });
    result.acknowledged = Boolean(sent.ok);
    result.acknowledgementSkipped = Boolean(sent.skipped);
  } catch (error) {
    functions.logger.error('Acknowledgement email failed', { registrationId, detail: error?.message || error });
  }

  // --- 2. Fill in the fields the browser does not write. ---
  if (ref) {
    try {
      const seed = {};
      const learnIndex = matching.normalise(data.selectedSkill);
      if (learnIndex && !data.selectedSkillIndex) seed.selectedSkillIndex = learnIndex;
      // The two roles are tracked separately: teaching somebody must never
      // close off this member's own place in the queue to learn.
      if (!data.learnStatus) seed.learnStatus = 'pending';
      if (!Number.isFinite(data.teachSlotsUsed)) seed.teachSlotsUsed = 0;
      if (!Number.isFinite(data.teachCapacity)) seed.teachCapacity = config.defaultTeachCapacity;
      if (Object.keys(seed).length) await ref.set(seed, { merge: true });
      Object.assign(data, seed);
    } catch (error) {
      functions.logger.warn('Could not seed role fields', { registrationId, detail: error?.message || error });
    }
  }

  // --- 3. Matching. ---
  try {
    const matched = await attemptMatch({ registrationId, data, notifyAdminOnMiss });
    result.matched = Boolean(matched.matched);
    result.matchId = matched.matchId || null;
    result.reason = matched.reason || null;
  } catch (error) {
    functions.logger.error('Matching failed', { registrationId, detail: error?.message || error });
    result.reason = `matching-threw: ${error?.message || error}`;
  }

  return result;
}

async function attemptMatch({ registrationId, data, notifyAdminOnMiss }) {
  if (!config.autoIntroduce) {
    functions.logger.info('Automatic introductions disabled — registration left pending', { registrationId });
    if (notifyAdminOnMiss) {
      await notifyAdminUnmatched({ registrationId, data, reason: 'auto-introductions-disabled' });
    }
    return { matched: false, reason: 'auto-introductions-disabled' };
  }

  // Deliberately not skipping on `status === 'matched'`. That only means this
  // member's own learning goal is met — they may still have teaching slots
  // free, and findBestPartner checks both roles before giving up.
  if (data.status === 'archived') {
    return { matched: false, reason: 'archived' };
  }

  const me = matching.shapeRegistration({ id: registrationId, data: () => data });

  if (!me.email) {
    functions.logger.warn('Registration has no email — cannot introduce', { registrationId });
    if (notifyAdminOnMiss) {
      await notifyAdminUnmatched({ registrationId, data, reason: 'registration-has-no-email' });
    }
    return { matched: false, reason: 'registration-has-no-email' };
  }

  const { partner, reason } = await matching.findBestPartner(me);

  if (!partner) {
    functions.logger.info('No partner available yet', { registrationId, reason });
    if (notifyAdminOnMiss) {
      await notifyAdminUnmatched({ registrationId, data, reason });
    }
    return { matched: false, reason };
  }

  const commit = await matching.commitMatch({ me, entry: partner });
  if (!commit.created) {
    functions.logger.info('Match was not committed', { registrationId, reason: commit.reason });
    return { matched: false, reason: commit.reason };
  }

  await sendIntroductions({
    matchId: commit.matchId,
    a: me,
    b: partner.candidate,
    aLearns: partner.theyTeach,
    bLearns: partner.iTeach,
    reciprocal: partner.reciprocal,
    score: partner.score,
  });

  return { matched: true, matchId: commit.matchId };
}

function unmetGoalOf(person) {
  return person.learnStatus === 'pending' && person.selectedSkill ? person.selectedSkill : null;
}

/**
 * Emails both sides of a committed match, plus the admin desk.
 *
 * Who gets what depends on the role each person holds in this pair:
 *
 *   reciprocal  - each is the other's student. Both get the student email,
 *                 which already carries the "and you teach them X" half. One
 *                 message each rather than a student email and a tutor email
 *                 landing in the same inbox at the same moment.
 *   one-way     - the student gets the introduction and makes first contact;
 *                 the tutor gets a "you have a student" notice, plus an
 *                 honest note about their own learning goal.
 *
 * Each side is locked separately so a partial failure can be retried.
 */
async function sendIntroductions({ matchId, a, b, aLearns, bLearns, reciprocal, score }) {
  let toA;
  let toB;

  if (reciprocal) {
    toA = templates.studentIntroduction({ student: a, tutor: b, learnSkill: aLearns, teachBack: bLearns, matchId });
    toB = templates.studentIntroduction({ student: b, tutor: a, learnSkill: bLearns, teachBack: aLearns, matchId });
  } else if (aLearns) {
    toA = templates.studentIntroduction({ student: a, tutor: b, learnSkill: aLearns, teachBack: null, matchId });
    toB = templates.tutorNotification({
      tutor: b, student: a, teachSkill: aLearns, tutorLearns: null, tutorGoal: unmetGoalOf(b), matchId,
    });
  } else {
    toB = templates.studentIntroduction({ student: b, tutor: a, learnSkill: bLearns, teachBack: null, matchId });
    toA = templates.tutorNotification({
      tutor: a, student: b, teachSkill: bLearns, tutorLearns: null, tutorGoal: unmetGoalOf(a), matchId,
    });
  }

  const results = await Promise.all([
    sendOnce({
      lockId: `match-${matchId}-a`,
      to: a.email,
      subject: toA.subject,
      html: toA.html,
      meta: { kind: 'match-intro', matchId, side: 'a' },
    }),
    sendOnce({
      lockId: `match-${matchId}-b`,
      to: b.email,
      subject: toB.subject,
      html: toB.html,
      meta: { kind: 'match-intro', matchId, side: 'b' },
    }),
  ]);

  const delivered = results.every((result) => result.ok);

  try {
    await admin.firestore().collection(matching.MATCHES).doc(matchId).set({
      emails: {
        a: results[0].ok ? 'sent' : 'failed',
        b: results[1].ok ? 'sent' : 'failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      status: delivered ? 'introduced' : 'introduction-partially-failed',
    }, { merge: true });
  } catch (error) {
    functions.logger.warn('Could not record introduction email status', { matchId, detail: error?.message || error });
  }

  try {
    const adminMail = templates.adminMatchNotice({
      a: matching.publicProfile(a),
      b: matching.publicProfile(b),
      aLearns, bLearns, reciprocal, score, matchId,
    });
    await sendOnce({
      lockId: `match-${matchId}-admin`,
      to: config.adminEmail,
      subject: adminMail.subject,
      html: adminMail.html,
      meta: { kind: 'match-admin', matchId },
    });
  } catch (error) {
    functions.logger.warn('Admin match notice failed', { matchId, detail: error?.message || error });
  }

  functions.logger.info('Introduction sent', {
    matchId, reciprocal, score, aEmail: a.email, bEmail: b.email, delivered,
  });
}

async function notifyAdminUnmatched({ registrationId, data, reason }) {
  try {
    const mail = templates.adminUnmatchedNotice({ registration: data, registrationId, reason: reason || 'unknown' });
    await sendOnce({
      lockId: `reg-${registrationId}-unmatched`,
      to: config.adminEmail,
      subject: mail.subject,
      html: mail.html,
      meta: { kind: 'registration-unmatched', registrationId },
    });
  } catch (error) {
    functions.logger.warn('Unmatched admin notice failed', { registrationId, detail: error?.message || error });
  }
}

/** Notifies the desk of a contact-form submission. */
async function processContactSubmission({ submissionId, data }) {
  const mail = templates.adminContactNotice({ submission: data, submissionId });
  return sendOnce({
    lockId: `contact-${submissionId}`,
    to: config.adminEmail,
    subject: mail.subject,
    html: mail.html,
    replyTo: mail.replyTo,
    meta: { kind: 'contact-admin', submissionId },
  });
}

/**
 * Walks every registration still waiting and runs the pipeline over each.
 *
 * This is what both the scheduled function and the standalone runner use.
 * Sequential on purpose: each match changes the pool the next one sees.
 */
async function processPendingQueue({ limit, maxAgeDays, notifyAdminOnMiss = false } = {}) {
  const batchSize = limit || config.sweepBatchSize;
  const ageDays = maxAgeDays === undefined ? config.sweepMaxAgeDays : maxAgeDays;
  const cutoff = ageDays ? Date.now() - ageDays * 24 * 60 * 60 * 1000 : 0;

  const summary = { scanned: 0, acknowledged: 0, matched: 0, skippedOld: 0, results: [] };

  const snapshot = await admin.firestore()
    .collection('registrations')
    .where('status', '==', 'pending')
    .limit(batchSize)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data() || {};
    const createdAt = data.createdAt?.toMillis?.() ?? 0;
    if (cutoff && createdAt && createdAt < cutoff) {
      summary.skippedOld += 1;
      continue;
    }

    summary.scanned += 1;
    // eslint-disable-next-line no-await-in-loop
    const result = await processRegistration({
      registrationId: doc.id,
      data,
      ref: doc.ref,
      notifyAdminOnMiss,
    });
    if (result.acknowledged) summary.acknowledged += 1;
    if (result.matched) summary.matched += 1;
    summary.results.push(result);
  }

  return summary;
}

module.exports = {
  processRegistration,
  processContactSubmission,
  processPendingQueue,
  attemptMatch,
  sendIntroductions,
  notifyAdminUnmatched,
  unmetGoalOf,
};
