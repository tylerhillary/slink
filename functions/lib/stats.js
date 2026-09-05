'use strict';

/**
 * Public statistics, derived from the real registrations.
 *
 * The website used to display hard-coded figures. It now displays whatever
 * this module last wrote to `public/stats` — a single document holding
 * counts and nothing else, which is why it is safe to make world-readable
 * when `registrations` is not.
 *
 * Counting happens here, on the server, for two reasons: the browser cannot
 * read `registrations` (by design), and one document read is cheaper than
 * scanning the collection on every page view.
 *
 * Re-running this is always safe. It recomputes from scratch rather than
 * incrementing, so it cannot drift.
 */

const admin = require('firebase-admin');

const STATS_DOC = 'public/stats';

/** Registrations that count as a member of the exchange. */
const ACTIVE_STATUSES = ['pending', 'matched'];

function normalise(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Read every registration and derive the public counts.
 *
 * @param {admin.firestore.Firestore} db
 * @param {object}  [options]
 * @param {boolean} [options.backfillDirectory] also create any missing
 *        anonymised directory entries for registrations that predate it
 * @param {boolean} [options.dryRun] compute and return, but write nothing
 * @returns {Promise<object>} the stats that were (or would be) written
 */
async function recomputeStats(db, { backfillDirectory = false, dryRun = false } = {}) {
  const snapshot = await db.collection('registrations').get();

  const skillsOffered = new Set();
  const skillsWanted = new Set();
  const states = new Set();

  let activeMembers = 0;
  let matchedMembers = 0;

  const backfill = [];

  snapshot.forEach((doc) => {
    const data = doc.data() || {};
    const status = normalise(data.status) || 'pending';

    if (!ACTIVE_STATUSES.includes(status)) {
      return;
    }

    activeMembers += 1;
    if (status === 'matched') {
      matchedMembers += 1;
    }

    const teachSkills = Array.isArray(data.teachSkills) ? data.teachSkills : [];
    teachSkills.map(normalise).filter(Boolean).forEach((skill) => skillsOffered.add(skill));

    const learnSkill = normalise(data.selectedSkill);
    if (learnSkill) {
      skillsWanted.add(learnSkill);
    }

    const state = typeof data.location === 'string' ? data.location.trim() : '';
    if (state) {
      states.add(state);
    }

    if (backfillDirectory) {
      backfill.push({ id: doc.id, data, teachSkills, state });
    }
  });

  // Every distinct skill on the exchange, in either direction.
  const allSkills = new Set([...skillsOffered, ...skillsWanted]);

  const stats = {
    activeMembers,
    matchedMembers,
    skillsOffered: skillsOffered.size,
    skillsWanted: skillsWanted.size,
    skillsTotal: allSkills.size,
    statesCovered: states.size,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  let directoryCreated = 0;

  if (backfillDirectory && backfill.length && !dryRun) {
    directoryCreated = await backfillDirectoryEntries(db, backfill);
  } else if (backfillDirectory && dryRun) {
    directoryCreated = await countMissingDirectoryEntries(db, backfill);
  }

  if (!dryRun) {
    await db.doc(STATS_DOC).set(stats, { merge: true });
  }

  return {
    ...stats,
    updatedAt: null, // the sentinel is not useful to a caller
    scanned: snapshot.size,
    directoryCreated,
  };
}

/**
 * Give older registrations the anonymised directory entry that newer ones
 * write for themselves. The directory document id is the registration id, so
 * running this twice creates nothing the second time.
 */
async function backfillDirectoryEntries(db, entries) {
  let created = 0;
  let batch = db.batch();
  let queued = 0;

  for (const entry of entries) {
    const ref = db.collection('directory').doc(entry.id);
    // eslint-disable-next-line no-await-in-loop
    const existing = await ref.get();
    if (existing.exists) {
      continue;
    }

    const teachSkills = entry.teachSkills.filter((s) => typeof s === 'string' && s.trim());
    if (!teachSkills.length || !entry.state) {
      continue; // not enough to make a useful entry
    }

    batch.set(ref, {
      teachSkills,
      teachSkillsIndex: Array.from(new Set(teachSkills.map(normalise).filter(Boolean))),
      learnSkill: entry.data.selectedSkill || null,
      learnSkillIndex: normalise(entry.data.selectedSkill) || null,
      location: entry.state,
      status: 'active',
      joinedAt: entry.data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
    });

    created += 1;
    queued += 1;

    if (queued >= 400) {
      // eslint-disable-next-line no-await-in-loop
      await batch.commit();
      batch = db.batch();
      queued = 0;
    }
  }

  if (queued) {
    await batch.commit();
  }

  return created;
}

async function countMissingDirectoryEntries(db, entries) {
  let missing = 0;
  for (const entry of entries) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await db.collection('directory').doc(entry.id).get();
    if (!existing.exists) {
      missing += 1;
    }
  }
  return missing;
}

module.exports = { recomputeStats, STATS_DOC, ACTIVE_STATUSES };
