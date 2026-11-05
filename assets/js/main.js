/* WeCare Hospital: site interactions.
   Every feature is progressive enhancement: pages stay readable without JavaScript. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Sticky header state ---------- */
  var header = document.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var label = toggle.querySelector('[data-nav-label]');
    var setTop = function () {
      var rect = header.getBoundingClientRect();
      nav.style.setProperty('--nav-top', Math.max(0, rect.bottom) + 'px');
    };
    var setOpen = function (open) {
      setTop();
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';
      if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100 && nav.classList.contains('is-open')) setOpen(false); });
  }

  /* ---------- Accordion ---------- */
  document.querySelectorAll('[data-accordion]').forEach(function (acc) {
    acc.querySelectorAll('.accordion__trigger').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        panel.setAttribute('data-open', String(!open));
      });
    });
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) {
      // Anything already on screen at load is shown immediately.
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
      else io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Scroll-spy for in-page indexes ---------- */
  document.querySelectorAll('[data-scrollspy]').forEach(function (list) {
    var links = Array.prototype.slice.call(list.querySelectorAll('a[href^="#"]'));
    var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    if (!('IntersectionObserver' in window) || !targets.length) return;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          var on = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  });

  /* ---------- Doctor directory filter ---------- */
  var directory = document.querySelector('[data-directory]');
  if (directory) {
    var cards = Array.prototype.slice.call(directory.querySelectorAll('.doc-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var search = document.getElementById('doctor-search');
    var status = document.querySelector('[data-directory-status]');
    var empty = document.querySelector('[data-directory-empty]');
    var names = {};
    chips.forEach(function (c) { names[c.getAttribute('data-filter')] = c.textContent; });
    var current = 'all';
    var params = new URLSearchParams(window.location.search);
    if (params.get('dept') && names[params.get('dept')]) current = params.get('dept');

    var apply = function () {
      var q = (search && search.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var text = card.textContent.toLowerCase();
        var match = (current === 'all' || card.getAttribute('data-dept') === current) && (!q || text.indexOf(q) !== -1);
        card.hidden = !match;
        if (match) shown++;
      });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === current)); });
      if (status) {
        var where = current === 'all' ? 'all departments' : names[current];
        status.textContent = 'Showing ' + shown + ' profile' + (shown === 1 ? '' : 's') + ' in ' + where + (q ? ' matching "' + q + '"' : '') + '.';
      }
      if (empty) empty.hidden = shown !== 0;
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { current = c.getAttribute('data-filter'); apply(); }); });
    if (search) search.addEventListener('input', apply);
    var reset = document.querySelector('[data-directory-reset]');
    if (reset) reset.addEventListener('click', function () { current = 'all'; if (search) search.value = ''; apply(); });
    apply();
  }

  /* ---------- Pre-select department from ?dept= on the appointment form ---------- */
  var deptSelect = document.getElementById('appt-department');
  if (deptSelect) {
    var d = new URLSearchParams(window.location.search).get('dept');
    if (d && deptSelect.querySelector('option[value="' + d.replace(/[^\w-]/g, '') + '"]')) deptSelect.value = d;
  }
  var dateInput = document.getElementById('appt-date');
  if (dateInput) {
    var t = new Date(); t.setDate(t.getDate() + 1);
    dateInput.min = t.toISOString().slice(0, 10);
  }

  /* ---------- Forms: validation and sending ----------
     After validation, a form is sent in one of two ways:
     1. data-endpoint set (see forms.endpoint in site.config.json): the enquiry is POSTed there,
        and "received" is shown only after a successful response.
     2. No endpoint: the visitor sends it from their own WhatsApp or email app, pre-filled.
     Nothing is ever reported as received unless the endpoint confirms it. */
  var validators = {
    required: function (v) { return v.trim().length > 0; },
    name: function (v) { return /^[\p{L} .'-]{2,80}$/u.test(v.trim()); },
    phone: function (v) { var digits = v.replace(/[\s()-]/g, '').replace(/^(\+91|0091|91|0)/, ''); return /^[6-9]\d{9}$/.test(digits); },
    email: function (v) { return v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
    age: function (v) { if (v.trim() === '') return true; var n = Number(v); return Number.isInteger(n) && n >= 0 && n <= 120; },
    futureDate: function (v) { if (!v) return false; var picked = new Date(v + 'T00:00:00'); var today = new Date(); today.setHours(0, 0, 0, 0); return picked > today; },
    checked: function (v, el) { return el.checked; },
    choice: function (v, el) { return !!el.form.querySelector('input[name="' + el.name + '"]:checked'); }
  };

  function fieldOf(el) { return el.closest('.field'); }
  function validateField(el) {
    var rules = (el.getAttribute('data-validate') || '').split(/\s+/).filter(Boolean);
    var ok = rules.every(function (r) { return validators[r] ? validators[r](el.value || '', el) : true; });
    var field = fieldOf(el);
    if (field) field.classList.toggle('has-error', !ok);
    var group = el.type === 'radio' ? el.form.querySelectorAll('input[name="' + el.name + '"]') : [el];
    Array.prototype.forEach.call(group, function (g) { g.setAttribute('aria-invalid', String(!ok)); });
    return ok;
  }

  function collect(form) {
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    return data;
  }

  function sendToBackend(endpoint, data) {
    // text/plain avoids a CORS preflight, which Google Apps Script web apps do not answer.
    return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(data) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r; });
  }
  window.WeCareForms = { sendToBackend: sendToBackend };

  // Readable label/value pairs for the summary and the outgoing message.
  function summaryPairs(form, data) {
    var pairs = [];
    form.querySelectorAll('[data-summary-label]').forEach(function (el) {
      var value = data[el.name];
      if (el.type === 'radio') { if (!el.checked) return; value = el.getAttribute('data-summary-value') || el.value; }
      else if (el.tagName === 'SELECT') { value = el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : ''; }
      if (!value || String(value).trim() === '') return;
      pairs.push([el.getAttribute('data-summary-label'), String(value).trim().slice(0, 500)]);
    });
    return pairs;
  }

  function showState(box, state) {
    box.querySelectorAll('[data-state]').forEach(function (el) { el.hidden = el.getAttribute('data-state') !== state; });
    box.hidden = false;
    box.focus();
  }

  function prepareSend(form, pairs) {
    var box = form.querySelector('[data-form-success]');
    var list = box.querySelector('[data-summary]');
    list.innerHTML = '';
    pairs.forEach(function (p) {
      var dt = document.createElement('dt'); dt.textContent = p[0];
      var dd = document.createElement('dd'); dd.textContent = p[1];
      list.appendChild(dt); list.appendChild(dd);
    });
    var subject = form.getAttribute('data-subject') || 'Website enquiry';
    var text = subject + ' from the WeCare website\n\n' + pairs.map(function (p) { return p[0] + ': ' + p[1]; }).join('\n');
    var wa = box.querySelector('[data-send="whatsapp"]');
    if (wa) wa.href = 'https://wa.me/' + form.getAttribute('data-wa') + '?text=' + encodeURIComponent(text);
    var mail = box.querySelector('[data-send="email"]');
    if (mail) mail.href = 'mailto:' + form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(text);
    showState(box, 'send');
  }

  document.querySelectorAll('form[data-enquiry]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    var errorBox = form.querySelector('[data-form-errors]');
    var successBox = form.querySelector('[data-form-success]');
    var controls = Array.prototype.slice.call(form.querySelectorAll('[data-validate]'));

    controls.forEach(function (el) {
      var evt = (el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT') ? 'change' : 'blur';
      el.addEventListener(evt, function () { if (el.type === 'radio' || fieldOf(el).classList.contains('has-error') || el.value) validateField(el); });
      el.addEventListener('input', function () { if (fieldOf(el) && fieldOf(el).classList.contains('has-error')) validateField(el); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (successBox) successBox.hidden = true;
      var seen = {};
      var invalid = controls.filter(function (el) {
        if (el.type === 'radio') { if (seen[el.name]) return false; seen[el.name] = true; }
        return !validateField(el);
      });
      if (invalid.length) {
        var ul = errorBox.querySelector('ul');
        ul.innerHTML = '';
        invalid.forEach(function (el) {
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = '#' + el.id;
          a.textContent = el.getAttribute('data-error-summary') || 'Check this field';
          a.addEventListener('click', function (ev) { ev.preventDefault(); el.focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        errorBox.hidden = false;
        errorBox.focus();
        return;
      }
      errorBox.hidden = true;
      var data = collect(form);
      var pairs = summaryPairs(form, data);
      var endpoint = (form.getAttribute('data-endpoint') || '').trim();
      if (!endpoint) { prepareSend(form, pairs); return; }
      var submit = form.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.setAttribute('aria-busy', 'true'); }
      data.form = form.id; data.submittedAt = new Date().toISOString();
      sendToBackend(endpoint, data).then(function () {
        showState(successBox, 'received');
        form.querySelectorAll('input:not([type=radio]):not([type=checkbox]), textarea').forEach(function (el) { el.value = ''; });
      }).catch(function () {
        prepareSend(form, pairs);
        successBox.querySelector('[data-state="failed"]').hidden = false;
      }).then(function () {
        if (submit) { submit.disabled = false; submit.removeAttribute('aria-busy'); }
      });
    });

    form.addEventListener('reset', function () {
      form.querySelectorAll('.has-error').forEach(function (f) { f.classList.remove('has-error'); });
      if (errorBox) errorBox.hidden = true;
      if (successBox) successBox.hidden = true;
    });
  });
})();
