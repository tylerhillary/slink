'use strict';

const crypto = require('crypto');
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const config = require('./config');
const { isValidEmail } = require('./mailer');

const REGISTRATIONS = 'registrations';
const TEACHERS = 'teachers';
const MATCHES = 'matches';

/* ------------------------------------------------------------------ *
 * Normalisation helpers
 * ------------------------------------------------------------------ */

function normalise(skill) {
  if (typeof skill !== 'string') return '';
  return skill.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toTitleCase(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  return value.trim().toLowerCase().split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function skillNames(value) {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  const names = raw.map((skill) => {
    if (typeof skill === 'string') return skill.trim();
    if (skill && typeof skill === 'object') return String(skill.name || skill.title || '').trim();
    return '';
  }).filter(Boolean);
  return Array.from(new Set(names));
}

function indexOf(value) {
  return Array.from(new Set(skillNames(value).map(normalise).filter(Boolean)));
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

/** Stable id for a pair of people, so the same two are never matched twice. */
function pairKey(emailA, emailB) {
  const pair = [String(emailA || '').trim().toLowerCase(), String(emailB || '').trim().toLowerCase()].sort();
  return crypto.createHash('sha1').update(pair.join('|')).digest('hex').slice(0, 24);
}

/* ------------------------------------------------------------------ *
 * Candidate shaping
 * ------------------------------------------------------------------ */

/**
 * Reads the two roles a member holds, which are tracked separately.
 *
 * `learnStatus` is about the skill they came here to learn. `teachSlotsUsed`
 * is about how many people they are currently teaching. Teaching someone must
 * never close off a member's own place in the queue to learn — that was the
 * behaviour of the old single `status` flag, and it stranded scarce tutors.
 *
 * Legacy documents written under that old scheme carry `status: 'matched'`
 * with neither new field. They are read as "learning goal met, one teaching
 * slot in use", which frees the remaining slots rather than keeping them shut.
 */
function readRoles(data) {
  const archived = data.status === 'archived';
  const legacyMatched = data.status === 'matched';

  const learnStatus = data.learnStatus
    || (legacyMatched ? 'matched' : 'pending');

  const teachSlotsUsed = Number.isFinite(data.teachSlotsUsed)
    ? data.teachSlotsUsed
    : (legacyMatched ? 1 : 0);

  const teachCapacity = Number.isFinite(data.teachCapacity) && data.teachCapacity > 0
    ? data.teachCapacity
    : config.defaultTeachCapacity;

  return { archived, learnStatus, teachSlotsUsed, teachCapacity };
}

function shapeRegistration(doc) {
  const data = doc.data() || {};
  const teachSkills = skillNames(data.teachSkills);
  const selectedSkill = String(data.selectedSkill || '').trim();
  const { archived, learnStatus, teachSlotsUsed, teachCapacity } = readRoles(data);
  return {
    id: doc.id,
    collection: REGISTRATIONS,
    source: 'registration',
    fullName: data.fullName || data.name || '',
    email: String(data.email || data.contactEmail || '').trim(),
    phone: data.phone || data.contactPhone || '',
    location: data.location || '',
    status: data.status || 'pending',
    archived,
    learnStatus,
    teachSlotsUsed,
    teachCapacity,
    matchId: data.matchId || null,
    teachSkills,
    teachIndex: new Set(Array.isArray(data.teachSkillsIndex) && data.teachSkillsIndex.length
      ? data.teachSkillsIndex.map(normalise).filter(Boolean)
      : indexOf(teachSkills)),
    selectedSkill,
    selectedSkillIndex: normalise(data.selectedSkillIndex || selectedSkill),
  };
}

function shapeTeacher(doc) {
  const data = doc.data() || {};
  const teachSkills = skillNames(data.skillsOffered || data.skills || data.skillsLabel);
  const selectedSkill = String(data.skillWanted || data.selectedSkill || '').trim();
  const { archived, learnStatus, teachSlotsUsed, teachCapacity } = readRoles(data);
  return {
    id: doc.id,
    collection: TEACHERS,
    source: 'teacher profile',
    fullName: data.name || data.fullName || '',
    email: String(data.email || data.contactEmail || '').trim(),
    phone: data.phone || data.contactPhone || '',
    location: data.location || data.city || '',
    status: data.status || 'verified',
    archived,
    learnStatus,
    teachSlotsUsed,
    teachCapacity,
    matchId: null,
    teachSkills,
    teachIndex: new Set(Array.isArray(data.skillsIndex) && data.skillsIndex.length
      ? data.skillsIndex.map(normalise).filter(Boolean)
      : indexOf(teachSkills)),
    selectedSkill,
    selectedSkillIndex: normalise(selectedSkill),
  };
}

async function runQuery(collectionName, build, shape) {
  try {
    const snapshot = await build(admin.firestore().collection(collectionName)).get();
    return snapshot.docs.map(shape);
  } catch (error) {
    if (error?.code === 9 || error?.code === 'failed-precondition') {
      functions.logger.warn('Skipping candidate query — Firestore index not ready', {
        collection: collectionName, detail: error?.message,
      });
    } else {
      functions.logger.error('Candidate query failed', { collection: collectionName, detail: error?.message || error });
    }
    return [];
  }
}

/**
 * Gathers everyone who could plausibly pair with this person, from both
 * directions: people who teach what they want, and people who want what
 * they teach.
 */
async function gatherCandidates(me) {
  const limit = config.candidateFetchLimit;
  const learnLower = me.selectedSkillIndex;
  const learnTitle = toTitleCase(me.selectedSkill);
  const myTeachLower = Array.from(me.teachIndex);
  const myTeachTitle = me.teachSkills.map(toTitleCase).filter(Boolean);

  const plans = [];

  // Direction A — they can teach what I want to learn.
  if (learnLower) {
    plans.push(runQuery(REGISTRATIONS, (c) => c.where('teachSkillsIndex', 'array-contains', learnLower).limit(limit), shapeRegistration));
    plans.push(runQuery(TEACHERS, (c) => c.where('skillsIndex', 'array-contains', learnLower).limit(limit), shapeTeacher));
    if (learnTitle) {
      plans.push(runQuery(REGISTRATIONS, (c) => c.where('teachSkills', 'array-contains', learnTitle).limit(limit), shapeRegistration));
      plans.push(runQuery(TEACHERS, (c) => c.where('skillsOffered', 'array-contains', learnTitle).limit(limit), shapeTeacher));
    }
  }

  // Direction B — they want to learn something I teach.
  for (const group of chunk(myTeachLower, 10)) {
    plans.push(runQuery(REGISTRATIONS, (c) => c.where('selectedSkillIndex', 'in', group).limit(limit), shapeRegistration));
  }
  for (const group of chunk(myTeachTitle, 10)) {
    plans.push(runQuery(REGISTRATIONS, (c) => c.where('selectedSkill', 'in', group).limit(limit), shapeRegistration));
  }

  const results = await Promise.all(plans);

  const byKey = new Map();
  for (const candidate of results.flat()) {
    const key = candidate.email ? `e:${candidate.email.toLowerCase()}` : `${candidate.collection}:${candidate.id}`;
    // Prefer a verified teacher profile over a bare registration for the same person.
    const existing = byKey.get(key);
    if (!existing || (existing.collection === REGISTRATIONS && candidate.collection === TEACHERS)) {
      byKey.set(key, candidate);
    }
  }
  return Array.from(byKey.values());
}

/* ------------------------------------------------------------------ *
 * Scoring
 * ------------------------------------------------------------------ */

const SCORE_RECIPROCAL = 150;
const SCORE_THEY_TEACH_ME = 50;
const SCORE_I_TEACH_THEM = 40;

function hasFreeTeachingSlot(person) {
  return person.teachSlotsUsed < person.teachCapacity;
}

function stillNeedsToLearn(person) {
  return person.learnStatus === 'pending' && Boolean(person.selectedSkillIndex);
}

function score(me, candidate) {
  if (!candidate.email || !isValidEmail(candidate.email)) return null;
  if (candidate.collection === me.collection && candidate.id === me.id) return null;
  if (candidate.email.toLowerCase() === String(me.email).toLowerCase()) return null;
  if (candidate.archived || me.archived) return null;

  // Each direction is checked against the relevant role only. A tutor with a
  // free slot stays available no matter how many people they already teach,
  // and a member whose own goal is still open stays available to be taught.
  const theyTeachMyGoal = stillNeedsToLearn(me)
    && hasFreeTeachingSlot(candidate)
    && candidate.teachIndex.has(me.selectedSkillIndex);

  const iTeachTheirGoal = stillNeedsToLearn(candidate)
    && hasFreeTeachingSlot(me)
    && me.teachIndex.has(candidate.selectedSkillIndex);

  if (!theyTeachMyGoal && !iTeachTheirGoal) return null;

  const reciprocal = theyTeachMyGoal && iTeachTheirGoal;
  let total = reciprocal ? SCORE_RECIPROCAL : (theyTeachMyGoal ? SCORE_THEY_TEACH_ME : SCORE_I_TEACH_THEM);

  if (candidate.collection === TEACHERS) total += 20;
  if (me.location && candidate.location && normalise(me.location) === normalise(candidate.location)) total += 15;
  if (candidate.phone) total += 5;

  return {
    candidate,
    score: total,
    reciprocal,
    // Skill the candidate will teach me (null when they cannot).
    theyTeach: theyTeachMyGoal ? (me.selectedSkill || '') : null,
    // Skill I will teach the candidate (null when I cannot).
    iTeach: iTeachTheirGoal ? (candidate.selectedSkill || '') : null,
  };
}

async function alreadyPaired(emailA, emailB) {
  try {
    const snap = await admin.firestore().collection(MATCHES).doc(pairKey(emailA, emailB)).get();
    return snap.exists;
  } catch (error) {
    functions.logger.warn('Could not check existing pair', { detail: error?.message || error });
    return false;
  }
}

/**
 * Picks the single best available partner, or null.
 */
async function findBestPartner(me) {
  if (!me.selectedSkillIndex && !me.teachIndex.size) {
    return { partner: null, reason: 'no-skills-on-registration' };
  }
  if (!stillNeedsToLearn(me) && !hasFreeTeachingSlot(me)) {
    return { partner: null, reason: 'nothing-left-to-match-on-this-record' };
  }

  const candidates = await gatherCandidates(me);
  if (!candidates.length) {
    return { partner: null, reason: 'no-candidates-found' };
  }

  const ranked = candidates
    .map((candidate) => score(me, candidate))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return { partner: null, reason: 'no-candidate-met-criteria' };
  }

  const threshold = config.requireReciprocal ? SCORE_RECIPROCAL : config.minMatchScore;

  for (const entry of ranked) {
    if (entry.score < threshold) break;
    // eslint-disable-next-line no-await-in-loop
    if (await alreadyPaired(me.email, entry.candidate.email)) continue;
    return { partner: entry, reason: null };
  }

  return {
    partner: null,
    reason: config.requireReciprocal
      ? 'no-reciprocal-match-available'
      : `best-score-${ranked[0].score}-below-threshold-${threshold}`,
  };
}

/* ------------------------------------------------------------------ *
 * Committing the pair
 * ------------------------------------------------------------------ */

function publicProfile(person) {
  return {
    id: person.id,
    collection: person.collection,
    source: person.source,
    fullName: person.fullName,
    email: person.email,
    phone: person.phone || '',
    location: person.location || '',
    teachSkills: person.teachSkills,
    selectedSkill: person.selectedSkill || '',
  };
}

/**
 * Writes the match and flips both registrations to `matched`, atomically.
 *
 * Returns { created: true, matchId } on success, or { created: false, reason }
 * when someone else won the race — which is the correct outcome, not an error.
 */
async function commitMatch({ me, entry }) {
  const firestore = admin.firestore();
  const partner = entry.candidate;
  const matchId = pairKey(me.email, partner.email);
  const matchRef = firestore.collection(MATCHES).doc(matchId);
  const myRef = firestore.collection(REGISTRATIONS).doc(me.id);
  const partnerRef = firestore.collection(partner.collection).doc(partner.id);

  // Who ends up learning what. Either side may be null in a one-way match.
  const iLearn = entry.theyTeach;
  const partnerLearns = entry.iTeach;

  const bail = (message) => {
    const error = new Error(message);
    error.benign = true;
    throw error;
  };

  /** Re-checks availability against the live document inside the transaction. */
  const assertAvailable = (snap, who, learns, teaches) => {
    if (!snap.exists) bail(`${who}-disappeared`);
    const roles = readRoles(snap.data() || {});
    if (roles.archived) bail(`${who}-archived`);
    if (learns && roles.learnStatus !== 'pending') bail(`${who}-already-learning`);
    if (teaches && roles.teachSlotsUsed >= roles.teachCapacity) bail(`${who}-has-no-free-slot`);
    return roles;
  };

  try {
    await firestore.runTransaction(async (tx) => {
      const existingMatch = await tx.get(matchRef);
      if (existingMatch.exists) bail('pair-already-introduced');

      const mySnap = await tx.get(myRef);
      const partnerSnap = await tx.get(partnerRef);

      assertAvailable(mySnap, 'registration', Boolean(iLearn), Boolean(partnerLearns));
      assertAvailable(partnerSnap, 'partner', Boolean(partnerLearns), Boolean(iLearn));

      tx.create(matchRef, {
        status: 'introduced',
        reciprocal: entry.reciprocal,
        score: entry.score,
        // Skill flowing in each direction.
        aLearns: entry.theyTeach || null,
        bLearns: entry.iTeach || null,
        a: publicProfile(me),
        b: publicProfile(partner),
        participantEmails: [me.email.toLowerCase(), partner.email.toLowerCase()],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        introducedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Counterpart details are deliberately minimal here — the registrations
      // collection is broadly readable, so contact details stay in `matches`.
      // `status` is still written for the older client code, but it now
      // tracks the learning goal only: teaching someone does not mean you are
      // finished here.
      const sideUpdate = (learns, teaches, counterpart) => {
        const update = {
          matchId,
          matchedAt: admin.firestore.FieldValue.serverTimestamp(),
          matchedWith: { id: counterpart.id, name: counterpart.fullName, source: counterpart.source },
        };
        if (learns) {
          update.learnStatus = 'matched';
          update.status = 'matched';
        }
        if (teaches) {
          update.teachSlotsUsed = admin.firestore.FieldValue.increment(1);
        }
        return update;
      };

      tx.set(myRef, sideUpdate(Boolean(iLearn), Boolean(partnerLearns), partner), { merge: true });
      tx.set(partnerRef, sideUpdate(Boolean(partnerLearns), Boolean(iLearn), me), { merge: true });
    });

    return { created: true, matchId };
  } catch (error) {
    if (error?.benign) {
      functions.logger.info('Match not committed', { matchId, reason: error.message });
      return { created: false, reason: error.message };
    }
    functions.logger.error('Match transaction failed', { matchId, detail: error?.message || error });
    return { created: false, reason: `transaction-failed: ${error?.message || error}` };
  }
}

module.exports = {
  normalise,
  toTitleCase,
  skillNames,
  indexOf,
  readRoles,
  hasFreeTeachingSlot,
  stillNeedsToLearn,
  shapeRegistration,
  shapeTeacher,
  gatherCandidates,
  score,
  findBestPartner,
  commitMatch,
  publicProfile,
  pairKey,
  REGISTRATIONS,
  TEACHERS,
  MATCHES,
  SCORE_RECIPROCAL,
};
