// Confirmation page. Shows the member the reference they just earned, so they
// have something to quote if they need to reach the desk about their entry.
//
// The reference arrives two ways: in the URL (survives a refresh or a copied
// link) and in sessionStorage (carries the email and skill, which we keep out
// of the URL). Neither is a secret, and neither reaches the server from here.

(function () {
  'use strict';

  var REFERENCE_PATTERN = /^SL-\d{4}-[A-Z0-9]{4}$/;

  function readStashed() {
    try {
      var raw = sessionStorage.getItem('slinkRegistration');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el && value) {
      el.textContent = value;
    }
  }

  function reveal(rowId) {
    var row = document.getElementById(rowId);
    if (row) {
      row.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var params = new URLSearchParams(window.location.search);
    var stashed = readStashed() || {};

    var reference = params.get('ref') || stashed.reference || '';
    reference = String(reference).trim().toUpperCase();

    var referenceEl = document.getElementById('registrationReference');

    if (REFERENCE_PATTERN.test(reference)) {
      if (referenceEl) {
        referenceEl.textContent = reference;
      }
    } else if (referenceEl) {
      // Someone reached this page without registering, or edited the URL.
      referenceEl.textContent = 'Not available';
      referenceEl.classList.add('receipt__value--plain');
    }

    if (stashed.email) {
      setText('registrationEmail', stashed.email);
      reveal('registrationEmailRow');
    }

    if (stashed.skill) {
      setText('registrationSkill', stashed.skill);
      reveal('registrationSkillRow');
    }

    // One-shot: a refresh should still show the reference from the URL, but
    // there is no reason to keep the email address in the tab any longer.
    try {
      sessionStorage.removeItem('slinkRegistration');
    } catch (error) {
      /* nothing to clean up */
    }
  });
})();
