// The skill marquee, built from real registrations and nothing else.
//
// ## Where the skills come from
//
// `directory` only — the anonymised projection of registrations filed from
// the website and the app. One row per real account, carrying what that
// person teaches and what they want.
//
// Deliberately *not* the `skills` catalogue. That collection grows from
// whatever anybody types into the registration form and is never pruned, so
// it holds `photo`, `Seeing`, `swert`, `wertyu` and worse alongside the real
// entries. Those words are in the database, which makes them real data; they
// are not skills anybody is trading, which is what this strip claims to show.
// Reading `directory` instead means the authenticity check does the
// moderation for free: a skill appears here only because a real account
// registered it.
//
// ## When there is nothing
//
// The section removes itself. It ships with no pills at all — there is no
// static list to fall back to, because a fallback list is exactly the
// invented data this is meant to be free of. An empty exchange shows nothing
// rather than a strip of skills nobody offers.
//
// That is also why this is not progressive enhancement the way js/stats.js is:
// the figures there have honest written copy underneath them, and this has
// nothing honest to say until somebody registers.
//
// Markup contract:
//   <section data-skill-section hidden>
//     <div class="marquee__track" data-skill-track></div>   (empty in the HTML)

(function () {
  'use strict';

  /** Below this the strip reads as broken rather than sparse. */
  var MIN_SKILLS = 4;

  function pill(name) {
    var span = document.createElement('span');
    span.className = 'skill-pill';

    var dot = document.createElement('span');
    dot.className = 'skill-pill__dot';
    span.appendChild(dot);

    // textContent, never innerHTML: these strings were typed by registrants.
    span.appendChild(document.createTextNode(name));
    return span;
  }

  function hide(section) {
    if (section) section.remove();
  }

  /**
   * The section ships `hidden` and is revealed only once there are real
   * skills in it.
   *
   * That way round on purpose: hidden-by-default means a visitor with
   * JavaScript off, or a slow database, or a blocked request never sees a
   * heading promising "skills members are trading this month" above an empty
   * strip. The failure mode is a section that is not there, which claims
   * nothing.
   */
  function reveal(section) {
    if (section) section.removeAttribute('hidden');
  }

  function render(tracks, names) {
    tracks.forEach(function (track, index) {
      // Each track starts at a different point in the list, so two marquees
      // running in opposite directions do not show the same word side by side.
      var step = Math.ceil(names.length / Math.max(tracks.length, 1));
      var offset = (index * step) % names.length;
      var ordered = names.slice(offset).concat(names.slice(0, offset));

      track.textContent = '';
      ordered.forEach(function (name) {
        track.appendChild(pill(name));
      });
    });
  }

  async function load() {
    var section = document.querySelector('[data-skill-section]');
    var tracks = Array.prototype.slice.call(
      document.querySelectorAll('[data-skill-track]')
    );
    if (!tracks.length) return;

    try {
      // The same imports and the same pinned SDK version as js/stats.js, so
      // the page does not ship two copies of Firestore.
      var [{ collection, getDocs }, { db }] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js'),
        import('./firebase-init.js'),
      ]);

      var seen = Object.create(null);
      var names = [];

      function add(value) {
        var text = String(value || '').trim();
        if (!text) return;

        var key = text.toLowerCase();
        if (seen[key]) return;

        seen[key] = true;
        names.push(text);
      }

      var directory = await getDocs(collection(db, 'directory'));
      directory.forEach(function (doc) {
        var data = doc.data() || {};
        (data.teachSkills || []).forEach(add);
        add(data.learnSkill);
      });

      if (names.length < MIN_SKILLS) {
        hide(section);
        return;
      }

      names.sort(function (a, b) {
        return a.localeCompare(b);
      });
      render(tracks, names);
      reveal(section);
    } catch (error) {
      // Unreachable database, blocked request, offline visitor. There is no
      // honest thing to put here, so the section goes rather than sitting
      // empty above its own heading.
      hide(section);
      if (window.console && console.debug) {
        console.debug('Skill strip hidden; no live skills to show.', error);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
