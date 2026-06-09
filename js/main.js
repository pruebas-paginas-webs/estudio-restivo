/* =====================================================================
   ESTUDIO RESTIVO — interactions
   ===================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Fonts se cargan de forma no-bloqueante desde el <head> (preload + onload swap). */

  /* ---------- Nav scroll state + scroll progress ---------- */
  var nav = document.getElementById('nav');
  var scrollBar = document.getElementById('scrollBar');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-scrolled', y > 20);
    if (scrollBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Mobile menu (burger morph + overlay) ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');

  function setMenu(open) {
    if (!burger || !menu) return;
    burger.classList.toggle('is-open', open);
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
  }
  if (menu) {
    Array.prototype.forEach.call(menu.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- Reveal on scroll (staggered) ---------- */
  var reveals = document.querySelectorAll('.reveal');

  // assign a small incremental delay within each parent group
  var groups = {};
  var gi = 0;
  Array.prototype.forEach.call(reveals, function (el) {
    var pid = el.parentElement.__rid || (el.parentElement.__rid = ++gi);
    if (!groups[pid]) groups[pid] = 0;
    el.dataset.delay = groups[pid] * 80;
    groups[pid] += 1;
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          el.style.transitionDelay = (el.dataset.delay || 0) + 'ms';
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Active nav link (scroll spy) ---------- */
  var linkFor = {};
  Array.prototype.forEach.call(document.querySelectorAll('.nav__link'), function (a) {
    linkFor[a.getAttribute('href').replace('#', '')] = a;
  });
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && linkFor[entry.target.id]) {
          Object.keys(linkFor).forEach(function (k) { linkFor[k].classList.remove('is-active'); });
          linkFor[entry.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['quienes', 'areas', 'clientes', 'contacto'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }

  /* ---------- Hero parallax (subtle, desktop only) ---------- */
  var heroFig = document.querySelector('.hero__figure');
  if (heroFig && !reduceMotion && window.matchMedia('(min-width: 1024px)').matches) {
    var pTick = false;
    window.addEventListener('scroll', function () {
      if (!pTick) {
        window.requestAnimationFrame(function () {
          var y = window.scrollY || window.pageYOffset;
          if (y < window.innerHeight) heroFig.style.transform = 'translateY(' + (y * 0.06) + 'px)';
          pTick = false;
        });
        pTick = true;
      }
    }, { passive: true });
  }

  /* ---------- Magnetic button ---------- */
  if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-magnetic]'), function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - r.left - r.width / 2;
        var my = e.clientY - r.top - r.height / 2;
        btn.style.transform = 'translate(' + (mx * 0.15) + 'px,' + (my * 0.28) + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- Contact form → Web3Forms ---------- */
  var form = document.getElementById('contactForm');
  var statusEl = document.getElementById('formStatus');
  var submitBtn = document.getElementById('submitBtn');

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'form-status is-shown ' + (type === 'ok' ? 'is-ok' : 'is-error');
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!form.checkValidity()) { form.reportValidity(); return; }

      var key = form.querySelector('[name="access_key"]');
      if (key && key.value === 'YOUR_WEB3FORMS_ACCESS_KEY') {
        showStatus('Falta configurar la Access Key gratuita de Web3Forms en index.html.', 'error');
        return;
      }

      var labelSpan = submitBtn ? submitBtn.querySelector('span') : null;
      var originalLabel = labelSpan ? labelSpan.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; }
      if (labelSpan) { labelSpan.textContent = 'Enviando…'; }

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success) {
            form.reset();
            showStatus('¡Gracias! Tu consulta fue enviada. Te respondemos a la brevedad.', 'ok');
          } else {
            showStatus('No pudimos enviar tu consulta. Probá nuevamente o llamanos por teléfono.', 'error');
          }
        })
        .catch(function () {
          showStatus('No pudimos enviar tu consulta. Revisá tu conexión e intentá de nuevo.', 'error');
        })
        .finally(function () {
          if (submitBtn) { submitBtn.disabled = false; }
          if (labelSpan) { labelSpan.textContent = originalLabel; }
        });
    });
  }
})();
