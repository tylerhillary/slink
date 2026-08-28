# Slink360 — automatic matching and email

Cloud Functions that acknowledge every registration, pair members
automatically, and email each side according to the role they hold.

## Two ways to run it

All the behaviour lives in `lib/pipeline.js`, which knows nothing about Cloud
Functions. That means it runs either way:

| | Cloud Functions | Standalone runner |
|---|---|---|
| Plan needed | **Blaze** (functions require billing) | **Spark — free** |
| Speed | Seconds after registration | However often you run it |
| Setup | `firebase deploy --only functions` | A service account key |
| Entry point | `index.js` | `scripts/process-queue.js` |

Both call the same pipeline, so members receive identical emails. You can
start on the free runner and move to Cloud Functions later without changing
any logic.

### Free plan — the standalone runner

Cloud Functions cannot run on Spark; Firebase removed that in 2020. The runner
sidesteps it by doing the same work from wherever you run Node.

1. Firebase Console → **Project settings → Service accounts → Generate new
   private key**. Save it as `functions/service-account.json`. This is free and
   needs no billing. It is gitignored — never commit it.

2. ```bash
   node scripts/process-queue.js --dry-run
   ```
   Lists who is waiting without sending anything.

3. ```bash
   node scripts/process-queue.js
   ```
   Acknowledges, matches, and introduces. Run it as often as you like — safe
   by design (see *Why re-running is safe* below).

   `--watch` keeps it running and re-checks every 2 minutes; `--every 5`
   changes that interval; `--limit 10` caps a batch.

### Paid plan — Cloud Functions

| Trigger | Fires on | Does |
|---|---|---|
| `onRegistrationCreated` | new doc in `registrations` | Sends the acknowledgement email immediately, then looks for a partner and introduces the pair if one exists |
| `onContactSubmissionCreated` | new doc in `contactSubmissions` | Emails the admin desk, with reply-to set to the sender |
| `sweepUnmatchedRegistrations` | every 6 hours (Africa/Lagos) | Retries everyone still waiting, so a member is introduced the day their counterpart finally joins |

### Why re-running is safe

Every outbound message takes a lock in `emailLog` using a deterministic id, so
a second attempt is skipped rather than sent. A pair's match id is a hash of
both email addresses, so the same two people can never be introduced twice.
Polling the queue is therefore a legitimate way to drive this, not a hack.

## The two roles

A member is never simply "matched". Two things are tracked separately, and
this is the point of the design:

| Field | Meaning |
|---|---|
| `learnStatus` | `pending` until the skill they came to learn is covered |
| `teachSlotsUsed` / `teachCapacity` | How many people they are teaching, out of `SLINK_TEACH_CAPACITY` (default 3) |

**Teaching somebody never uses up your own place in the queue to learn.** A
member who is the only tutor for a scarce skill can take several students and
still be first in line for the skill *they* asked for. An earlier version
collapsed both roles into a single `status` flag, which stranded exactly those
people — they taught one person and then disappeared from the exchange.

Legacy documents carrying the old `status: 'matched'` are read as "learning
goal met, one teaching slot in use", which frees their remaining slots rather
than keeping them shut.

`status` is still written for the older browser code, but it now tracks the
learning goal only.

## How a match is chosen

Candidates come from both directions: members whose `teachSkillsIndex`
contains the new member's learn goal, and members whose learn goal is in the
new member's teach list. Verified `teachers` profiles are searched too.

| Signal | Points |
|---|---|
| Reciprocal — each teaches what the other wants | 150 |
| One-way — they teach your goal | 50 |
| One-way — you teach their goal | 40 |
| Verified `teachers` profile | +20 |
| Same state | +15 |
| Has a phone number | +5 |

Each direction is checked against the relevant role only: a tutor needs a free
teaching slot, a learner needs `learnStatus === 'pending'`. The highest score
above `SLINK_MIN_MATCH_SCORE` wins. Anyone archived, already paired with this
person before, or missing a valid email is skipped.

The pair is committed in a Firestore transaction that re-checks both roles
against live documents. If two learners race for the last slot of the same
tutor, one transaction wins and the other retries — nobody is double-booked.

## Who gets which email

| Situation | Student receives | Tutor receives |
|---|---|---|
| Reciprocal (each teaches the other) | "Meet your tutor" — covers both halves of the trade | *(same email; each is the other's student)* |
| One-way | "Meet your tutor" | "You have a student" |

**The student always makes first contact.** Their email says so plainly and
carries a ready-to-send message plus a `mailto:` button that opens their mail
app with it already written. The tutor's email tells them the student is
coming and that they need do nothing until it arrives.

The tutor's email also closes the loop on *their* own goal:

- matched reciprocally → "Your own goal is covered too"
- still unmet → "Still looking for your tutor": names the skill nobody teaches
  yet, promises to write the day someone joins, tells them not to register
  again, and reassures them that teaching has not cost them their place.

One message per person per match, never two at once.

## Setup

1. **Blaze plan.** Outbound email and Cloud Scheduler both need it. The free
   Spark plan blocks external network calls, so nothing will send.

2. **Pick a mail transport** and put the credentials in `functions/.env`
   (copy `.env.example`). `.env` is gitignored — keep it that way.

   *Gmail (simplest, uses the address you already own):* turn on 2-Step
   Verification for `skillbank0@gmail.com`, create an App Password at
   <https://myaccount.google.com/apppasswords>, and set `SMTP_USER` and
   `SMTP_PASS`. The App Password is 16 characters — not the account password.
   Gmail allows roughly 500 messages a day.

   *SendGrid:* verify a sender identity, then set `SENDGRID_API_KEY`. Free tier
   is 100 a day.

3. **Prove the credentials work** before deploying anything:

   ```bash
   node scripts/send-test-email.js you@example.com
   ```

   This sends one real acknowledgement email straight from your machine. It
   does not touch Firestore and does not need the Blaze plan, so it isolates
   "are my mail credentials right?" from every other deployment question, and
   it names the likely cause when a send fails.

4. **Deploy.**

   ```bash
   firebase deploy --only "functions,firestore:rules"
   ```

   Quote the target list. PowerShell splits `functions,firestore:rules` into
   two separate arguments without the quotes, and the deploy fails with
   "Cannot understand what targets to deploy".

## Controlling the automation

All in `functions/.env`:

- `SLINK_TEACH_CAPACITY=3` — concurrent students per tutor. Raise it if your
  scarce tutors can carry more; set a per-tutor `teachCapacity` on a
  registration document to override it for one person.
- `SLINK_AUTO_INTRODUCE=false` — keeps acknowledgement emails flowing but stops
  every automatic introduction. Registrations stay pending for manual pairing.
- `SLINK_REQUIRE_RECIPROCAL=true` — only introduces genuine two-way trades.
- `SLINK_SHARE_PHONE=false` — leaves phone numbers out of the emails.

## Collections

- `matches` — both parties' contact details and the skills flowing each way.
  Closed to all client access; written only by these functions.
- `emailLog` — one doc per outbound message, used as the idempotency lock. A
  retried function invocation cannot send the same email twice. Also records
  delivery failures in `lastError`.

Both are server-only in `firestore.rules`.

## Checking it works

Cloud Functions logs record every decision:

```bash
firebase functions:log --only onRegistrationCreated
```

Look for `Introduction sent` (with the match id and score), `No partner
available yet` (with the reason), or `Mail transport not configured` — that
last one means step 2 above is incomplete.
