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

/**
 * Registrations that count as a member of the exchange.
 *
 * `connected` and `verified` are the admin console's vocabulary for a learner
 * who has been introduced to a tutor; `matched` is this module's. They mean
 * the same thing, and leaving the console's spellings out here undercounted
 * the exchange by every member the desk had actually placed — 13 of 36 on
 * 14 September 2026, which is a third of the site's headline figure.
 */
const ACTIVE_STATUSES = ['pending', 'matched', 'connected', 'verified'];

/**
 * Skills that are placeholders rather than skills.
 *
 * The registration form takes free text, so `None` arrives as often as
 * `Python` does. Counting it inflates "skills being traded", and projecting it
 * into the public directory puts a word nobody chose on a real person's card.
 *
 * Mirrors `Skill.looksPublishable` in the mobile app. If you extend one,
 * extend the other.
 */
const PLACEHOLDER_SKILLS = new Set([
  'none', 'n/a', 'na', 'nil', 'null', 'test', 'testing', 'asdf', 'abc', 'xxx',
]);

function normalise(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** True for a skill worth counting and worth publishing. */
function isRealSkill(value) {
  const key = normalise(value);
  return key.length >= 3 && !PLACEHOLDER_SKILLS.has(key);
}

/**
 * Rows left behind by the September rules investigation.
 *
 * Six documents, all `SL-2602-TEST` / `integration-test@example.com`, wanting
 * a skill called "Zzz Integration Test". They are `pending` and otherwise
 * well-formed, so nothing else here would exclude them — and without this they
 * would be counted as members and published into the public directory.
 *
 * Delete the documents and this guard becomes dead code, which is the right
 * end state. It stays until then because a recount is run far more often than
 * a cleanup.
 */
function isTestRow(data) {
  return data.reference === 'SL-2602-TEST'
    || String(data.email || '').endsWith('@example.com');
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

    if (!ACTIVE_STATUSES.includes(status) || isTestRow(data)) {
      return;
    }

    activeMembers += 1;
    if (status === 'matched') {
      matchedMembers += 1;
    }

    const teachSkills = (Array.isArray(data.teachSkills) ? data.teachSkills : [])
      .filter(isRealSkill);
    teachSkills.map(normalise).forEach((skill) => skillsOffered.add(skill));

    if (isRealSkill(data.selectedSkill)) {
      skillsWanted.add(normalise(data.selectedSkill));
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
 * Whether a registration is worth projecting into the public directory.
 *
 * Shared by the writer and the dry-run counter. They used to decide
 * separately, and the counter's answer was only ever "is it already there?" —
 * so `--dry-run` reported entries the real run would then skip. A dry run that
 * disagrees with the real run is worse than none, because it is believed.
 *
 * Nothing teachable means the matcher can never surface the entry: it starts
 * from "do they teach what you asked for?" and drops the row when the answer
 * is no. Such a row would be fetched and discarded on every single query.
 */
function isPublishableEntry(entry) {
  return entry.teachSkills.filter(isRealSkill).length > 0 && Boolean(entry.state);
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

    if (!isPublishableEntry(entry)) {
      continue;
    }
    const teachSkills = entry.teachSkills.filter(isRealSkill);

    batch.set(ref, {
      teachSkills,
      teachSkillsIndex: Array.from(new Set(teachSkills.map(normalise).filter(Boolean))),
      // A goal of "None" becomes no goal rather than a card reading
      // "Wants: None". The matcher already scores an empty goal as a one-way
      // match, so nothing is lost by being honest here.
      learnSkill: isRealSkill(entry.data.selectedSkill) ? entry.data.selectedSkill : '',
      learnSkillIndex: isRealSkill(entry.data.selectedSkill)
        ? normalise(entry.data.selectedSkill)
        : '',
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
    if (!isPublishableEntry(entry)) {
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    const existing = await db.collection('directory').doc(entry.id).get();
    if (!existing.exists) {
      missing += 1;
    }
  }
  return missing;
}

module.exports = { recomputeStats, STATS_DOC, ACTIVE_STATUSES };
