/**
 * Security rules tests.
 *
 * These exist because the rules are the only thing protecting the member
 * database. There is no login, so there is no second line of defence: if a
 * rule regresses, every member's name, email and phone number is public
 * again, and nothing in the UI would look any different.
 *
 * Run with:   npm run test:rules
 * (starts the Firestore emulator, runs these, shuts it down)
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');

const RULES = fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8');

let testEnv;

/** A registration that satisfies every rule, used as the baseline to mutate. */
function validRegistration(overrides) {
  return Object.assign({
    fullName: 'Amara Okafor',
    email: 'amara@example.com',
    age: 27,
    gender: 'female',
    location: 'Rivers',
    selectedSkill: 'Python',
    selectedSkillIndex: 'python',
    teachSkills: ['Product Design'],
    teachSkillsIndex: ['product design'],
    intent: 'learn',
    status: 'pending',
    source: 'skill-selection',
    reference: 'SL-2609-4K7Q',
    consent: true,
    consentVersion: '2026-09-05',
  }, overrides || {});
}

function validDirectoryEntry(overrides) {
  return Object.assign({
    teachSkills: ['Product Design'],
    teachSkillsIndex: ['product design'],
    learnSkill: 'Python',
    learnSkillIndex: 'python',
    location: 'Rivers',
    status: 'active',
  }, overrides || {});
}

const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

/* ------------------------------------------------------------------ */
/* Registrations: write-only from a browser                            */
/* ------------------------------------------------------------------ */

test('a well-formed registration can be created', async (db) => {
  await assertSucceeds(db.collection('registrations').add(validRegistration()));
});

test('registrations CANNOT be read back', async (db) => {
  await assertFails(db.collection('registrations').get());
});

test('a single registration CANNOT be read by id', async (db) => {
  await assertFails(db.collection('registrations').doc('anything').get());
});

test('registrations CANNOT be updated', async (db) => {
  await assertFails(db.collection('registrations').doc('anything').update({ fullName: 'Someone Else' }));
});

test('registrations CANNOT be deleted', async (db) => {
  await assertFails(db.collection('registrations').doc('anything').delete());
});

/* ------------------------------------------------------------------ */
/* Registration validation                                             */
/* ------------------------------------------------------------------ */

test('under-18 is rejected', async (db) => {
  await assertFails(db.collection('registrations').add(validRegistration({ age: 17 })));
});

test('exactly 18 is accepted', async (db) => {
  await assertSucceeds(db.collection('registrations').add(validRegistration({ age: 18 })));
});

test('consent must be given, not omitted', async (db) => {
  const noConsent = validRegistration();
  delete noConsent.consent;
  await assertFails(db.collection('registrations').add(noConsent));
});

test('consent must be true, not false', async (db) => {
  await assertFails(db.collection('registrations').add(validRegistration({ consent: false })));
});

test('a 5000-character name is rejected (storage abuse)', async (db) => {
  await assertFails(db.collection('registrations').add(validRegistration({ fullName: 'a'.repeat(5000) })));
});

test('a 300-character email is rejected', async (db) => {
  await assertFails(db.collection('registrations').add(
    validRegistration({ email: 'a'.repeat(290) + '@example.com' })));
});

test('more than 20 teach skills is rejected', async (db) => {
  const many = [];
  for (let i = 0; i < 25; i += 1) many.push('Skill ' + i);
  await assertFails(db.collection('registrations').add(validRegistration({ teachSkills: many })));
});

test('an unexpected extra field is rejected', async (db) => {
  await assertFails(db.collection('registrations').add(validRegistration({ isAdmin: true })));
});

/* ------------------------------------------------------------------ */
/* The public directory: anonymised by construction                    */
/* ------------------------------------------------------------------ */

test('a directory entry can be created and read', async (db) => {
  await assertSucceeds(db.collection('directory').add(validDirectoryEntry()));
  await assertSucceeds(db.collection('directory').get());
});

test('a directory entry carrying a name is REJECTED', async (db) => {
  await assertFails(db.collection('directory').add(validDirectoryEntry({ fullName: 'Amara Okafor' })));
});

test('a directory entry carrying an email is REJECTED', async (db) => {
  await assertFails(db.collection('directory').add(validDirectoryEntry({ email: 'amara@example.com' })));
});

test('a directory entry carrying a phone number is REJECTED', async (db) => {
  await assertFails(db.collection('directory').add(validDirectoryEntry({ phone: '+2348031234567' })));
});

test('directory entries cannot be edited once written', async (db) => {
  await assertFails(db.collection('directory').doc('anything').update({ location: 'Lagos' }));
});

/* ------------------------------------------------------------------ */
/* Everything else that holds personal data                            */
/* ------------------------------------------------------------------ */

test('teachers (names and contact details) CANNOT be read', async (db) => {
  await assertFails(db.collection('teachers').get());
});

test('matches (both parties contact details) CANNOT be read', async (db) => {
  await assertFails(db.collection('matches').get());
});

test('emailLog CANNOT be read', async (db) => {
  await assertFails(db.collection('emailLog').get());
});

test('contact submissions can be written but never read', async (db) => {
  await assertSucceeds(db.collection('contactSubmissions').add({
    name: 'Amara Okafor',
    email: 'amara@example.com',
    topic: 'support',
    subject: 'A question',
    message: 'Hello',
    timestamp: new Date(),
  }));
  await assertFails(db.collection('contactSubmissions').get());
});

/* ------------------------------------------------------------------ */
/* Public statistics                                                   */
/* ------------------------------------------------------------------ */

test('public stats can be read by anyone', async (db) => {
  await assertSucceeds(db.doc('public/stats').get());
});

test('public stats CANNOT be written from a browser', async (db) => {
  await assertFails(db.doc('public/stats').set({ activeMembers: 99999 }));
});

/* ------------------------------------------------------------------ */

async function main() {
  testEnv = await initializeTestEnvironment({
    projectId: 'slink-rules-test',
    firestore: { rules: RULES, host: '127.0.0.1', port: 8080 },
  });

  let passed = 0;
  const failures = [];

  for (const { name, fn } of tests) {
    await testEnv.clearFirestore();
    const db = testEnv.unauthenticatedContext().firestore();
    try {
      await fn(db);
      console.log('  ✓ ' + name);
      passed += 1;
    } catch (error) {
      console.log('  ✗ ' + name);
      failures.push({ name, message: error && error.message });
    }
  }

  await testEnv.cleanup();

  console.log('\n  ' + passed + ' passed, ' + failures.length + ' failed, ' + tests.length + ' total\n');

  if (failures.length) {
    failures.forEach((f) => console.error('  FAILED: ' + f.name + '\n    ' + f.message));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
