/* ==========================================================================
   SLINK360 — MOTION
   Scroll reveals, masked heading lines, counters, drawn rules, marquees and
   the scroll progress bar.

   Every effect is a progressive enhancement: with JS off or reduced motion
   on, the page is fully readable and nothing is left hidden.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------ viewport watcher */

  /* A rect-based watcher rather than IntersectionObserver: it fires reliably
     in every rendering context, and the element count per page is small
     enough that the scroll cost is negligible. Each entry fires once. */

  var watchers = [];
  var sweepQueued = false;

  function watch(el, margin, cb) {
    watchers.push({ el: el, margin: margin, cb: cb });
  }

  function sweep() {
    sweepQueued = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;

    for (var i = watchers.length - 1; i >= 0; i--) {
      var w = watchers[i];
      var r = w.el.getBoundingClientRect();
      if (r.top < vh - w.margin && r.bottom > 0) {
        watchers.splice(i, 1);
        w.cb(w.el);
      }
    }
  }

  function queueSweep() {
    if (sweepQueued || !watchers.length) return;
    sweepQueued = true;
    requestAnimationFrame(sweep);
  }

  window.addEventListener('scroll', queueSweep, { passive: true });
  window.addEventListener('resize', queueSweep);
  window.addEventListener('load', queueSweep);

  /* --------------------------------------------------------- scroll reveal */

  function initReveal() {
    var nodes = document.querySelectorAll('[data-reveal], .rule-draw');
    if (!nodes.length) return;

    if (reduceMotion) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add('is-visible'); });
      return;
    }

    // Containers marked [data-stagger] cascade their revealed children.
    Array.prototype.forEach.call(document.querySelectorAll('[data-stagger]'), function (group) {
      var step = parseInt(group.getAttribute('data-stagger'), 10) || 90;
      Array.prototype.forEach.call(group.querySelectorAll('[data-reveal]'), function (kid, i) {
        if (!kid.style.getPropertyValue('--reveal-delay')) {
          kid.style.setProperty('--reveal-delay', i * step + 'ms');
        }
      });
    });

    // Explicit per-element delays.
    Array.prototype.forEach.call(nodes, function (n) {
      var delay = n.getAttribute('data-reveal-delay');
      if (delay) n.style.setProperty('--reveal-delay', delay + 'ms');
    });

    // Masked heading lines cascade within their own heading.
    Array.prototype.forEach.call(document.querySelectorAll('.line-mask'), function (line) {
      var siblings = line.parentElement.querySelectorAll('.line-mask');
      var index = Array.prototype.indexOf.call(siblings, line);
      line.style.setProperty('--line-delay', Math.max(index, 0) * 100 + 'ms');
    });

    Array.prototype.forEach.call(nodes, function (n) {
      watch(n, 70, function (el) { el.classList.add('is-visible'); });
    });
  }

  /* -------------------------------------------------------------- counters */

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function format(value, decimals) {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;

    var decimals = parseInt(el.getAttribute('data-count-decimals'), 10) || 0;
    var duration = parseInt(el.getAttribute('data-count-duration'), 10) || 1400;
    var start = performance.now();

    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      el.textContent = format(target * easeOutExpo(p), decimals);
      if (p < 1) requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
  }

  function initCounters() {
    var nodes = document.querySelectorAll('[data-count]');
    if (!nodes.length) return;

    if (reduceMotion) {
      Array.prototype.forEach.call(nodes, function (n) {
        n.textContent = format(parseFloat(n.getAttribute('data-count')),
          parseInt(n.getAttribute('data-count-decimals'), 10) || 0);
      });
      return;
    }

    Array.prototype.forEach.call(nodes, function (n) {
      n.textContent = '0';
      watch(n, 110, runCount);
    });
  }

  /* ------------------------------------------------------- scroll progress */

  function initProgress() {
    var bar = document.querySelector('.scroll-progress');
    if (!bar) return;

    var ticking = false;

    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      bar.style.scale = (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ' 1';
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    window.addEventListener('resize', update);
    update();
  }

  /* --------------------------------------------------------------- marquee */

  function initMarquee() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-marquee]'), function (rail) {
      var track = rail.querySelector('.marquee__track');
      if (!track || track.dataset.cloned === 'true') return;

      // A second copy makes the -100% translate loop seamlessly.
      var clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      rail.appendChild(clone);
      track.dataset.cloned = 'true';
      clone.dataset.cloned = 'true';

      var speed = rail.getAttribute('data-marquee');
      if (speed) rail.style.setProperty('--marquee-dur', speed + 's');
    });
  }

  /* ------------------------------------------------------------------- run */

  function boot() {
    initMarquee();
    initReveal();
    initCounters();
    initProgress();

    sweep();
    // Late images and web fonts shift the layout; re-check once settled.
    setTimeout(sweep, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
