# App Check setup

Slink360 has no login. The registration form writes to Firestore as an
anonymous visitor, which is the right trade — asking people to create an
account before they have seen a single match would cost more registrations
than it saved — but it leaves the write path open to anyone with a script.

The security rules already control the *shape* and *size* of what can be
written. They cannot control *how much*. Without App Check, a loop can put
thousands of junk registrations into the desk queue, poison the public
directory that drives the homepage figures, and run up the Firestore bill.

App Check closes that. It proves a write came from this site, in a real
browser, and the rules then refuse everything else.

## Do this in two stages

**Enforcement before configuration rejects every registration on the site.**
Stage 1 is safe to deploy immediately. Do not skip to stage 2.

---

## Stage 1 — configure and monitor

### 1. Create a reCAPTCHA v3 site key

1. Go to <https://www.google.com/recaptcha/admin/create>
2. Label it `Slink360`
3. Type: **reCAPTCHA v3**
4. Domains: add your production domain, and `localhost` if you want the form
   to work while developing
5. Accept and submit

You get two keys. The **site key** is public and goes in the code. The
**secret key** stays private and goes into the Firebase console in the next
step — do not commit it anywhere.

### 2. Register the app in Firebase

1. Firebase console → your project → **Build → App Check**
2. Find the web app under **Apps**, click it
3. Choose **reCAPTCHA v3** as the provider
4. Paste the **secret key** from step 1
5. Save

### 3. Put the site key in the code

In `js/firebase-init.js`:

```js
const RECAPTCHA_SITE_KEY = "";   // <- paste the SITE key here
```

This one is public by design; it identifies the site to reCAPTCHA and is
meant to ship in client code. Committing it is fine.

### 4. Deploy and watch

Deploy the site, then leave it for a few days of real traffic.

Firebase console → **App Check → Requests**. You are looking for the
verified count to climb and the unverified count to stay near zero.

Some unverified traffic is normal and expected: people on very old browsers,
someone with scripts blocked, a bot that got as far as loading the page. What
you are checking is that *real registrations* are coming through verified.
If the unverified count is high, something is misconfigured — fix it before
stage 2, because enforcement would turn those into failed registrations.

### Working locally

App Check has no reCAPTCHA domain to verify against on `localhost`. The code
already asks the SDK to print a debug token to the browser console when it
detects localhost. Copy that token into Firebase console → App Check → Apps →
**⋮ → Manage debug tokens**. Treat a debug token like a password: anyone
holding it can bypass App Check.

---

## Stage 2 — enforce

Only once stage 1 shows healthy verified traffic.

In `firestore.rules`, find:

```
function appCheckOk() {
  return true;  // stage 2: change to `request.app != null`
}
```

Change it to:

```
function appCheckOk() {
  return request.app != null;
}
```

Then:

```bash
firebase deploy --only firestore:rules
```

Test a real registration immediately afterwards. If it fails, revert the
function to `return true;` and redeploy — that restores service in under a
minute while you work out what went wrong.

### Do not enforce in the Firebase console as well

The console has its own per-service enforcement toggle. Leave it off. The
rules function above is the single place this is controlled, so there is one
switch to flip and one switch to flip back. Two independent switches is how
an outage happens at 2am.

---

## What this does not cover

App Check stops automated abuse from outside your site. It does not stop a
determined person filling in the real form by hand, repeatedly. If that
becomes a problem the answer is a rate limit keyed on email or IP in a Cloud
Function, not more client-side checks.

It also does not protect the `read` path, because there isn't one — member
registrations cannot be read from a browser at all.
