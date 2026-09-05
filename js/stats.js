// Live figures, read from the database rather than typed into the HTML.
//
// The site used to hard-code its member counts. It now reads `public/stats`,
// a single document the server recomputes from the real registrations. That
// document holds counts and nothing else, which is why it is readable when
// `registrations` is not.
//
// Progressive enhancement, deliberately: the HTML ships with honest written
// copy already in place, and this script replaces it only once it has a real
// number. If Firestore is unreachable, or the count is zero, the visitor sees
// the written copy instead of a broken dash or an embarrassing "0".
//
// Markup contract:
//   <span data-stat="activeMembers" data-stat-min="1">By hand</span>
//   <span data-stat-label="activeMembers">Every registration read by a person</span>
//
// data-stat        which figure to show
// data-stat-min    don't show the figure below this value (default 1)
// data-stat-suffix appended when shown, e.g. "+"
// data-stat-label  swapped for the matching label when its figure is shown

(function () {
  'use strict';

  // What each figure is called once it has a number to show. Singular and
  // plural, because "1 members" undermines everything else on the page.
  var LABELS = {
    activeMembers: ['Member on the exchange', 'Members on the exchange'],
    matchedMembers: ['Member matched so far', 'Members matched so far'],
    skillsTotal: ['Skill being traded', 'Skills being traded'],
    skillsOffered: ['Skill offered', 'Skills offered'],
    statesCovered: ['State represented', 'States represented'],
  };

  function labelFor(key, value) {
    var pair = LABELS[key];
    if (!pair) return null;
    return value === 1 ? pair[0] : pair[1];
  }

  function applyStats(stats) {
    var shown = {};

    document.querySelectorAll('[data-stat]').forEach(function (el) {
      var key = el.getAttribute('data-stat');
      var value = stats[key];
      var min = Number(el.getAttribute('data-stat-min') || 1);

      // No number, not a number, or too small to be worth stating.
      if (typeof value !== 'number' || !isFinite(value) || value < min) {
        return;
      }

      var suffix = el.getAttribute('data-stat-suffix') || '';
      el.textContent = String(value) + suffix;
      el.classList.add('is-live');
      shown[key] = value;
    });

    // Only swap a label when its figure actually made it onto the page.
    document.querySelectorAll('[data-stat-label]').forEach(function (el) {
      var key = el.getAttribute('data-stat-label');
      if (!(key in shown)) {
        return;
      }
      var label = labelFor(key, shown[key]);
      if (label) {
        el.textContent = label;
      }
    });
  }

  async function loadStats() {
    if (!document.querySelector('[data-stat]')) {
      return; // nothing on this page wants a figure
    }

    try {
      var [{ doc, getDoc }, { db }] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js'),
        import('./firebase-init.js'),
      ]);

      var snapshot = await getDoc(doc(db, 'public', 'stats'));
      if (!snapshot.exists()) {
        return; // never published yet — leave the written copy alone
      }

      applyStats(snapshot.data() || {});
    } catch (error) {
      // The written copy in the HTML is already true. Silence is the right
      // failure mode here; there is nothing for the visitor to act on.
      console.warn('Live figures unavailable; showing written copy instead.', error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStats);
  } else {
    loadStats();
  }
})();
