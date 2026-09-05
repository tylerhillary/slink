// Cookie consent, and the analytics that depend on it.
//
// The cookie policy promises that analytics cookies are only set once the
// visitor agrees. This file is what makes that true: nothing from Google
// Analytics is loaded until someone presses Accept, and a Decline is
// remembered so we stop asking.
//
// Exposes window.slinkAnalytics.track(name, params) for the rest of the site.
// Calls made before consent are dropped, not queued — we would rather lose an
// event than hold one against someone who said no.

(function () {
  'use strict';

  var STORAGE_KEY = 'slink.consent.v1';
  var MEASUREMENT_ID = 'G-KPQSCM484L';

  var state = { status: null, loaded: false };

  function readChoice() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      // Private browsing, or cookies blocked entirely. Treat as undecided but
      // never loop the banner: we simply won't be able to remember the answer.
      return null;
    }
  }

  function storeChoice(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (error) {
      /* nothing we can do; the session still honours the choice in memory */
    }
  }

  function loadAnalytics() {
    if (state.loaded || !MEASUREMENT_ID) {
      return;
    }
    state.loaded = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  }

  function dismissBanner(banner) {
    if (!banner) {
      return;
    }
    banner.classList.remove('is-visible');
    window.setTimeout(function () {
      if (banner.parentNode) {
        banner.parentNode.removeChild(banner);
      }
    }, 300);
  }

  function decide(choice, banner) {
    state.status = choice;
    storeChoice(choice);
    if (choice === 'accepted') {
      loadAnalytics();
    }
    dismissBanner(banner);
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie choices');

    banner.innerHTML = [
      '<div class="cookie-banner__inner">',
      '  <p class="cookie-banner__text">',
      '    We use a small number of analytics cookies to see which pages help people',
      '    and which do not. Nothing is set unless you agree, and we never sell what',
      '    we collect. <a href="cookie-policy.html">Read the cookie policy</a>.',
      '  </p>',
      '  <div class="cookie-banner__actions">',
      '    <button type="button" class="btn btn--outline btn--sm" data-consent="declined">Decline</button>',
      '    <button type="button" class="btn btn--primary btn--sm" data-consent="accepted">Accept</button>',
      '  </div>',
      '</div>',
    ].join('');

    banner.addEventListener('click', function (event) {
      var target = event.target.closest('[data-consent]');
      if (target) {
        decide(target.getAttribute('data-consent'), banner);
      }
    });

    return banner;
  }

  function init() {
    state.status = readChoice();

    if (state.status === 'accepted') {
      loadAnalytics();
      return;
    }

    if (state.status === 'declined') {
      return;
    }

    var banner = buildBanner();
    document.body.appendChild(banner);
    // Next frame, so the entrance transition has a starting state to move from.
    window.requestAnimationFrame(function () {
      banner.classList.add('is-visible');
    });
  }

  window.slinkAnalytics = {
    track: function (name, params) {
      if (state.status !== 'accepted' || typeof window.gtag !== 'function') {
        return;
      }
      window.gtag('event', name, params || {});
    },
    hasConsent: function () {
      return state.status === 'accepted';
    },
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
