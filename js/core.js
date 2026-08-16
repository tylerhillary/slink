/* ==========================================================================
   SLINK360 — CORE
   Shell behaviour: page enter, header, mobile drawer, accordions, clock,
   and the global alert API.

   Loaded as a classic script so showAlert/showSuccess/showError/showWarning/
   showInfo stay on the global scope — skill-selection.js and contact.js call
   them by bare name.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --------------------------------------------------------------- header */

  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;

      header.classList.toggle('is-stuck', y > 24);

      // Retract when scrolling down past the fold, restore on the way up.
      var goingDown = y > lastY && y > 320;
      if (!document.body.classList.contains('nav-open')) {
        header.classList.toggle('is-hidden', goingDown);
      }

      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* --------------------------------------------------------------- drawer */

  function initDrawer() {
    var toggle = document.querySelector('.nav-toggle');
    var drawer = document.getElementById('navDrawer');
    if (!toggle || !drawer) return;

    // Stagger index for the drawer links.
    var items = drawer.querySelectorAll('.nav-drawer__item');
    for (var i = 0; i < items.length; i++) {
      items[i].style.setProperty('--i', String(i));
    }

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (open) {
        document.querySelector('.site-header').classList.remove('is-hidden');
      }
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    drawer.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 940 && drawer.classList.contains('is-open')) setOpen(false);
    });
  }

  /* ------------------------------------------------------------ accordion */

  function initAccordions() {
    var buttons = document.querySelectorAll('.faq__q');

    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq__item');
        if (!item) return;
        var open = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  /* ---------------------------------------------------------------- clock */

  function initClock() {
    var el = document.getElementById('local-time');
    if (!el) return;

    function tick() {
      try {
        el.textContent = new Intl.DateTimeFormat('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Lagos',
        }).format(new Date());
      } catch (err) {
        el.textContent = new Date().toTimeString().slice(0, 5);
      }
    }

    tick();
    setInterval(tick, 30000);
  }

  /* ------------------------------------------------------------- year tag */

  function initYear() {
    var nodes = document.querySelectorAll('[data-year]');
    var year = String(new Date().getFullYear());
    Array.prototype.forEach.call(nodes, function (n) { n.textContent = year; });
  }

  /* ----------------------------------------------------------- scroll spy */

  function initScrollSpy() {
    var links = document.querySelectorAll('.legal-nav a[href^="#"]');
    if (!links.length) return;

    var map = {};
    var targets = [];

    Array.prototype.forEach.call(links, function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) {
        map[id] = link;
        targets.push(section);
      }
    });

    if (!targets.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(links, function (l) { l.classList.remove('is-active'); });
        var active = map[entry.target.id];
        if (active) active.classList.add('is-active');
      });
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    targets.forEach(function (t) { observer.observe(t); });
  }

  /* ---------------------------------------------------------- smooth hash */

  function initSmoothHash() {
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;

      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  }

  /* ------------------------------------------------------------------ run */

  function boot() {
    initHeader();
    initDrawer();
    initAccordions();
    initClock();
    initYear();
    initScrollSpy();
    initSmoothHash();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

/* ==========================================================================
   GLOBAL ALERT API
   Declared at top level on purpose: other scripts call these by bare name.
   ========================================================================== */

var __slinkAlertTimer = null;

function showAlert(message, type, title, duration) {
  if (!message) return null;

  type = type || 'info';
  duration = typeof duration === 'number' ? duration : 6000;

  if (__slinkAlertTimer) {
    clearTimeout(__slinkAlertTimer);
    __slinkAlertTimer = null;
  }

  var existing = document.querySelector('.alert');
  if (existing) existing.remove();

  var icons = { info: 'ℹ', success: '✓', warning: '!', error: '✕' };
  var titles = {
    info: 'Heads up',
    success: 'Done',
    warning: 'Check this',
    error: 'Something went wrong',
  };

  var el = document.createElement('div');
  el.className = 'alert alert-' + type;
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');

  var heading = title || titles[type] || 'Notice';
  var icon = icons[type] || icons.info;

  var iconEl = document.createElement('div');
  iconEl.className = 'alert-icon';
  iconEl.setAttribute('aria-hidden', 'true');
  iconEl.textContent = icon;

  var content = document.createElement('div');
  content.className = 'alert-content';

  var titleEl = document.createElement('div');
  titleEl.className = 'alert-title';
  titleEl.textContent = heading;

  var msgEl = document.createElement('div');
  msgEl.className = 'alert-message';
  msgEl.textContent = message;

  content.appendChild(titleEl);
  content.appendChild(msgEl);

  var close = document.createElement('button');
  close.className = 'alert-close';
  close.type = 'button';
  close.setAttribute('aria-label', 'Close notification');
  close.textContent = '×';

  el.appendChild(iconEl);
  el.appendChild(content);
  el.appendChild(close);

  function dismiss() {
    el.classList.remove('show');
    el.addEventListener('transitionend', function () { el.remove(); }, { once: true });
    setTimeout(function () { if (el.isConnected) el.remove(); }, 600);
  }

  close.addEventListener('click', dismiss);
  document.body.appendChild(el);

  requestAnimationFrame(function () { el.classList.add('show'); });

  if (duration > 0) {
    __slinkAlertTimer = setTimeout(dismiss, duration);
  }

  return el;
}

function showSuccess(message, title, duration) {
  return showAlert(message, 'success', title, duration);
}

function showError(message, title, duration) {
  return showAlert(message, 'error', title, duration);
}

function showWarning(message, title, duration) {
  return showAlert(message, 'warning', title, duration);
}

function showInfo(message, title, duration) {
  return showAlert(message, 'info', title, duration);
}

window.showAlert = showAlert;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;
