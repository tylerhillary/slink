// Live validation for the email address and mobile number.
//
// A mistyped email is the single most costly error on this form: the
// registration succeeds, the shortlist is sent, and it goes nowhere. Nobody
// finds out until the member gives up. Catching it at the keyboard is worth
// more than any message we could add to the confirmation page.
//
// When feedback appears matters as much as what it says:
//
//   - A field is "touched" once you have left it. Errors only appear after
//     that. Typing "a@" into an empty field should not be scolded while you
//     are still mid-word.
//   - Success appears immediately, as you type. The moment an address or a
//     number becomes valid you get a tick, without leaving the field.
//   - Once a field has shown an error, it re-checks on every keystroke, so
//     the error clears the instant you fix it rather than at the next blur.
//
// Exposes window.slinkValidators so the submit handler validates with exactly
// the same rules. Two sets of rules that disagree is worse than none.

(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Email
     ------------------------------------------------------------------ */

  // Pragmatic rather than RFC 5322 complete. The full grammar permits
  // addresses no real provider issues, and rejecting a valid oddity is a
  // worse failure here than accepting one.
  var EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

  var COMMON_DOMAINS = [
    'gmail.com', 'yahoo.com', 'yahoo.co.uk', 'googlemail.com', 'hotmail.com',
    'hotmail.co.uk', 'outlook.com', 'live.com', 'icloud.com', 'me.com',
    'aol.com', 'protonmail.com', 'proton.me', 'zoho.com', 'gmx.com',
    'mail.com', 'yandex.com',
  ];

  function levenshtein(a, b) {
    if (a === b) return 0;
    var prev = [];
    var i;
    var j;
    for (j = 0; j <= b.length; j += 1) prev[j] = j;
    for (i = 1; i <= a.length; i += 1) {
      var current = [i];
      for (j = 1; j <= b.length; j += 1) {
        current[j] = Math.min(
          prev[j] + 1,
          current[j - 1] + 1,
          prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1)
        );
      }
      prev = current;
    }
    return prev[b.length];
  }

  // "gmial.com" -> "gmail.com". Only suggests, never rewrites: plenty of
  // legitimate domains sit close to a common one.
  function suggestDomain(domain) {
    if (!domain || COMMON_DOMAINS.indexOf(domain) !== -1) {
      return null;
    }
    var best = null;
    var bestDistance = Infinity;
    for (var i = 0; i < COMMON_DOMAINS.length; i += 1) {
      var d = levenshtein(domain, COMMON_DOMAINS[i]);
      if (d < bestDistance) {
        bestDistance = d;
        best = COMMON_DOMAINS[i];
      }
    }
    // Distance 1-2 is a typo; 3+ is a different domain entirely.
    return bestDistance > 0 && bestDistance <= 2 ? best : null;
  }

  function validateEmail(raw) {
    var value = (raw || '').trim();

    if (!value) {
      return { state: 'empty', message: '' };
    }
    if (/\s/.test(value)) {
      return { state: 'invalid', message: 'An email address cannot contain spaces.' };
    }
    var at = value.indexOf('@');
    if (at === -1) {
      return { state: 'incomplete', message: 'Include an @ — for example name@example.com' };
    }
    if (value.indexOf('@', at + 1) !== -1) {
      return { state: 'invalid', message: 'That has more than one @ in it.' };
    }
    var local = value.slice(0, at);
    var domain = value.slice(at + 1).toLowerCase();

    if (!local) {
      return { state: 'invalid', message: 'Add the part before the @.' };
    }
    if (!domain) {
      return { state: 'incomplete', message: 'Add the part after the @ — gmail.com, for example.' };
    }
    if (domain.indexOf('.') === -1) {
      return { state: 'incomplete', message: 'The domain needs a dot — gmail.com, not gmail.' };
    }
    if (value.indexOf('..') !== -1) {
      return { state: 'invalid', message: 'That has two dots in a row.' };
    }
    if (!EMAIL_RE.test(value)) {
      return { state: 'invalid', message: "That doesn't look like a complete email address." };
    }

    var suggestion = suggestDomain(domain);
    if (suggestion) {
      return {
        state: 'suspect',
        message: 'Did you mean ' + local + '@' + suggestion + '?',
        suggestion: local + '@' + suggestion,
      };
    }

    return { state: 'valid', message: 'That address looks right.' };
  }

  /* ------------------------------------------------------------------
     Phone
     ------------------------------------------------------------------ */

  // Per dialling code: how many digits the national number has once any
  // trunk "0" is stripped, which digits it may start with, and how to group
  // it for reading.
  // Nigerian mobile prefixes are narrower than "starts with 7, 8 or 9": every
  // network sits in 70, 71, 80, 81, 90 or 91 once the trunk 0 is stripped.
  // Checking only the first digit let a UK number pass as Nigerian.
  var PHONE_RULES = {
    '+234': { name: 'Nigerian', length: 10, starts: /^(70|71|80|81|90|91)/, groups: [3, 3, 4], example: '803 123 4567' },
    '+1': { name: 'US or Canadian', length: 10, starts: /^[2-9]/, groups: [3, 3, 4], example: '415 555 0123' },
    '+44': { name: 'UK', length: 10, starts: /^[17]/, groups: [4, 6], example: '7700 900123' },
    '+233': { name: 'Ghanaian', length: 9, starts: /^[2345]/, groups: [3, 3, 3], example: '24 123 4567' },
    '+254': { name: 'Kenyan', length: 9, starts: /^[17]/, groups: [3, 3, 3], example: '712 345 678' },
  };

  // People write their number the way they say it, which in Nigeria, the UK,
  // Ghana and Kenya means a leading 0. That trunk prefix is not part of the
  // international number: "+234" + "0803..." is not a real number, and until
  // this was fixed that is exactly what got stored.
  function normalisePhone(raw, countryCode) {
    var digits = String(raw || '').replace(/\D/g, '');
    var rule = PHONE_RULES[countryCode];
    var dial = String(countryCode || '').replace(/\D/g, '');

    // Pasted in full international form, with or without the +.
    if (dial && digits.indexOf(dial) === 0 && digits.length > dial.length) {
      digits = digits.slice(dial.length);
    }
    // Trunk zero.
    while (digits.charAt(0) === '0') {
      digits = digits.slice(1);
    }
    // Over-long and still starting with the dialling code (double paste).
    if (rule && digits.length > rule.length && dial && digits.indexOf(dial) === 0) {
      digits = digits.slice(dial.length);
    }
    return digits;
  }

  function groupDigits(digits, groups) {
    var out = [];
    var i = 0;
    for (var g = 0; g < groups.length && i < digits.length; g += 1) {
      out.push(digits.substr(i, groups[g]));
      i += groups[g];
    }
    if (i < digits.length) {
      out.push(digits.slice(i));
    }
    return out.join(' ');
  }

  function validatePhone(raw, countryCode) {
    var digits = normalisePhone(raw, countryCode);
    var rule = PHONE_RULES[countryCode];

    if (!digits) {
      return { state: 'empty', message: '', digits: '' };
    }
    if (!rule) {
      // Unknown dialling code: fall back to a permissive length check.
      return digits.length >= 7 && digits.length <= 15
        ? { state: 'valid', message: '', digits: digits }
        : { state: 'invalid', message: 'That number looks the wrong length.', digits: digits };
    }
    if (!rule.starts.test(digits)) {
      return {
        state: 'invalid',
        message: 'That does not look like a ' + rule.name + ' mobile number. Example: ' + rule.example,
        digits: digits,
      };
    }
    if (digits.length < rule.length) {
      return {
        state: 'incomplete',
        message: (rule.length - digits.length) + ' more digit' + (rule.length - digits.length === 1 ? '' : 's') + ' to go.',
        digits: digits,
      };
    }
    if (digits.length > rule.length) {
      return {
        state: 'invalid',
        message: 'That is ' + (digits.length - rule.length) + ' digit'
          + (digits.length - rule.length === 1 ? '' : 's') + ' too many for a ' + rule.name + ' number.',
        digits: digits,
      };
    }

    return {
      state: 'valid',
      message: 'We will reach you on ' + countryCode + ' ' + groupDigits(digits, rule.groups) + '.',
      digits: digits,
    };
  }

  /* ------------------------------------------------------------------
     Wiring
     ------------------------------------------------------------------ */

  var OK_STATES = { valid: true };
  var QUIET_STATES = { empty: true, incomplete: true };

  function render(field, feedback, input, result, touched) {
    field.classList.remove('field--valid', 'field--invalid', 'field--suspect');
    feedback.classList.remove('is-error', 'is-ok', 'is-warn');
    feedback.textContent = '';
    input.removeAttribute('aria-invalid');

    if (result.state === 'empty') {
      return;
    }

    if (OK_STATES[result.state]) {
      field.classList.add('field--valid');
      feedback.classList.add('is-ok');
      feedback.textContent = result.message;
      return;
    }

    if (result.state === 'suspect') {
      field.classList.add('field--suspect');
      feedback.classList.add('is-warn');
      feedback.textContent = '';
      var text = document.createTextNode(result.message.replace(/\?$/, '') + '? ');
      feedback.appendChild(text);
      var fix = document.createElement('button');
      fix.type = 'button';
      fix.className = 'field__fix';
      fix.textContent = 'Use ' + result.suggestion;
      fix.addEventListener('click', function () {
        input.value = result.suggestion;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.focus();
      });
      feedback.appendChild(fix);
      return;
    }

    // Errors and half-finished input stay quiet until the field has been
    // left once. After that they track every keystroke.
    if (!touched && QUIET_STATES[result.state]) {
      return;
    }
    if (!touched && result.state === 'invalid') {
      return;
    }

    field.classList.add('field--invalid');
    feedback.classList.add('is-error');
    feedback.textContent = result.message;
    input.setAttribute('aria-invalid', 'true');
  }

  function attach(inputId, feedbackId, run) {
    var input = document.getElementById(inputId);
    var feedback = document.getElementById(feedbackId);
    if (!input || !feedback) {
      return;
    }
    var field = input.closest('.field');
    if (!field) {
      return;
    }

    var touched = false;

    var check = function () {
      render(field, feedback, input, run(input.value), touched);
    };

    input.addEventListener('input', check);
    input.addEventListener('blur', function () {
      touched = true;
      check();
    });

    return { input: input, check: check, markTouched: function () { touched = true; } };
  }

  document.addEventListener('DOMContentLoaded', function () {
    attach('email', 'emailFeedback', validateEmail);

    var countryCode = document.getElementById('countryCode');
    var phone = attach('mobileNumber', 'mobileFeedback', function (value) {
      return validatePhone(value, countryCode ? countryCode.value : '+234');
    });

    // Changing the country changes what counts as valid, so re-check, and
    // update the placeholder to that country's shape.
    if (countryCode && phone) {
      countryCode.addEventListener('change', function () {
        var rule = PHONE_RULES[countryCode.value];
        if (rule) {
          phone.input.placeholder = rule.example;
        }
        phone.check();
      });
    }
  });

  // One set of rules, shared with the submit handler.
  window.slinkValidators = {
    validateEmail: validateEmail,
    validatePhone: validatePhone,
    normalisePhone: normalisePhone,
  };
})();
