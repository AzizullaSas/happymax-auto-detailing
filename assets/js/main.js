/* HappyMax Auto Detailing — interactions */
(() => {
  'use strict';

  const TZ = 'Pacific/Honolulu';

  const PRICES = {
    express:   { sedan: 89,   suv: 109,  truck: 129 },
    signature: { sedan: 249,  suv: 289,  truck: 329 },
    ceramic:   { sedan: 1199, suv: 1399, truck: 1599 },
  };
  const PLANS = {
    express:   { name: 'Express Shine',      time: '≈ 1.5 hrs' },
    signature: { name: 'Signature Detail',   time: '≈ 4 hrs' },
    ceramic:   { name: 'Ceramic Pro 5-Year', time: '1–2 days' },
  };
  const SIZES = { sedan: 'Sedan / Coupe', suv: 'SUV / Crossover', truck: 'Truck / Van' };
  const ADDONS = {
    pet:        ['Pet hair removal', 45],
    headlights: ['Headlight restoration', 89],
    engine:     ['Engine bay detail', 69],
    ozone:      ['Ozone odor treatment', 79],
    waterspot:  ['Water-spot removal', 99],
    trim:       ['Plastic trim restoration', 59],
  };

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const money = (n) => '$' + n.toLocaleString('en-US');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Honolulu date helpers ---------- */
  const hst = (() => {
    const o = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(new Date()).forEach((p) => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, min: +o.minute };
  })();
  // Calendar days are kept as UTC-noon dates so weekday math never drifts.
  const addDays = (date, n) => new Date(date.getTime() + n * 864e5);
  const isoDay = (date) => date.toISOString().slice(0, 10);
  const fromIso = (s) => new Date(s + 'T12:00:00Z');
  const fmtDay = (date) => date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });

  const today = new Date(Date.UTC(hst.y, hst.m - 1, hst.d, 12));
  let nextOpen = addDays(today, 1);
  if (nextOpen.getUTCDay() === 0) nextOpen = addDays(nextOpen, 1);

  $('#nextSlot').textContent = `${fmtDay(nextOpen)} · 8:00 AM`;
  $('#year').textContent = hst.y;

  const openNow = $('#openNow');
  const dow = today.getUTCDay();
  const minutes = hst.h * 60 + hst.min;
  const closeAt = dow === 6 ? 16 * 60 : 18 * 60;
  const isOpen = dow !== 0 && minutes >= 7 * 60 && minutes < closeAt;
  openNow.hidden = false;
  openNow.classList.toggle('is-open', isOpen);
  openNow.textContent = isOpen
    ? `Open now · until ${dow === 6 ? '4' : '6'}:00 PM HST`
    : 'Closed now · online booking is open 24/7';

  /* ---------- Header, mobile dock ---------- */
  const header = $('#header');
  const dock = $('.dock');
  const hero = $('.hero');
  let bookVisible = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 12);
    dock.classList.toggle('show', y > hero.offsetHeight * 0.6 && !bookVisible);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { bookVisible = en.isIntersecting; onScroll(); }, { threshold: 0.05 })
      .observe($('#book'));
  }
  onScroll();

  /* ---------- Mobile nav ---------- */
  const toggle = $('.nav-toggle');
  const setNav = (open) => {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setNav(!document.body.classList.contains('nav-open')));
  $$('#nav a').forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });

  /* ---------- Scroll spy ---------- */
  const navLinks = $$('#nav a[href^="#"]:not(.nav-book)');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => spy.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // small stagger between siblings
    reveals.forEach((el) => {
      const sibs = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      const i = sibs.indexOf(el);
      if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 70 + 'ms';
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- Hero counters ---------- */
  const countUp = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const t0 = performance.now();
    const dur = 1500;
    const step = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const v = target * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduceMotion) {
    $$('[data-count]').forEach((el) => {
      el.textContent = '0';
      setTimeout(() => countUp(el), 650);
    });
  }

  /* ---------- Pricing + booking estimate ---------- */
  const form = $('#bookForm');
  const f = form.elements;
  const success = $('#bookSuccess');
  let size = 'sedan';

  const updateSummary = () => {
    const pkg = f.package.value || 'signature';
    const base = PRICES[pkg][size];
    const addons = $$('input[name="addons"]:checked', form).map((c) => ADDONS[c.value]);
    const total = addons.reduce((sum, [, price]) => sum + price, base);

    $('#sumPlan').textContent = PLANS[pkg].name;
    $('#sumSize').textContent = `${SIZES[size]} · ${PLANS[pkg].time}`;
    $('#sumLines').innerHTML = [[PLANS[pkg].name, base], ...addons]
      .map(([label, price]) => `<li><span>${label}</span><span>${money(price)}</span></li>`)
      .join('');
    $('#sumTotal').textContent = money(total);
  };

  const setSize = (s, animate) => {
    size = s;
    $$('[data-price]').forEach((el) => {
      el.textContent = PRICES[el.dataset.price][s].toLocaleString('en-US');
      if (animate && !reduceMotion && el.closest('.plan-price')) {
        el.classList.remove('bump');
        void el.offsetWidth; // restart the animation
        el.classList.add('bump');
      }
    });
    $$('input[name="size-view"], input[name="size"]').forEach((r) => { r.checked = r.value === s; });
    updateSummary();
  };

  $$('input[name="size-view"], input[name="size"]').forEach((r) =>
    r.addEventListener('change', () => setSize(r.value, true)));

  $$('[data-pick]').forEach((btn) => btn.addEventListener('click', () => {
    const radio = form.querySelector(`input[name="package"][value="${btn.dataset.pick}"]`);
    if (radio) { radio.checked = true; updateSummary(); }
  }));

  form.addEventListener('change', (e) => {
    if (e.target.name === 'package' || e.target.name === 'addons') updateSummary();
  });

  /* ---------- Booking form ---------- */
  f.date.min = isoDay(addDays(today, 1));
  f.date.value = isoDay(nextOpen);

  const digits = (v) => v.replace(/\D/g, '');
  const phone10 = (v) => {
    const d = digits(v);
    return d.length === 11 && d[0] === '1' ? d.slice(1) : d;
  };
  const validPhone = (v) => /^[2-9]\d{2}[2-9]\d{6}$/.test(phone10(v));
  const prettyPhone = (v) => phone10(v).replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

  f.phone.addEventListener('blur', () => {
    if (validPhone(f.phone.value)) f.phone.value = prettyPhone(f.phone.value);
  });

  const clearError = (e) => {
    const field = e.target.closest('.field');
    if (field) field.classList.remove('invalid');
  };
  form.addEventListener('input', clearError);
  form.addEventListener('change', clearError);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (f.company.value) return; // honeypot

    const name = f.name.value.trim();
    const day = f.date.value ? fromIso(f.date.value) : null;
    const checks = [
      [f.name, /\p{L}.*\p{L}/u.test(name)],
      [f.phone, validPhone(f.phone.value)],
      [f.date, !!day && f.date.value >= f.date.min && day.getUTCDay() !== 0],
      [f.area, !!f.area.value],
    ];
    checks.forEach(([el, ok]) => el.closest('.field').classList.toggle('invalid', !ok));
    const bad = checks.find(([, ok]) => !ok);
    if (bad) { bad[0].focus(); return; }

    // Demo only: nothing is sent anywhere yet.
    $('#sName').textContent = name.split(/\s+/)[0];
    $('#sId').textContent = 'HMX-' + Math.floor(1000 + Math.random() * 9000);
    $('#sPhone').textContent = prettyPhone(f.phone.value);
    $('#sWhen').textContent = `${fmtDay(day)} (${f.time.value})`;

    form.hidden = true;
    success.hidden = false;
    success.focus({ preventScroll: true });
    success.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  });

  $('#bookAgain').addEventListener('click', () => {
    form.reset();
    f.date.value = isoDay(nextOpen);
    setSize(f.size.value, false);
    success.hidden = true;
    form.hidden = false;
    f.name.focus();
  });

  setSize('sedan', false);

  /* ---------- Before / after slider ---------- */
  const ba = $('#ba');
  const range = $('.ba-range', ba);
  const setPos = (v) => ba.style.setProperty('--pos', v + '%');
  let touched = false;
  let dragging = false;

  const fromPointer = (x) => {
    const r = ba.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
    range.value = v;
    setPos(v);
  };
  range.addEventListener('input', () => { touched = true; setPos(range.value); });
  ba.addEventListener('pointerdown', (e) => { touched = true; dragging = true; fromPointer(e.clientX); });
  window.addEventListener('pointermove', (e) => { if (dragging) fromPointer(e.clientX); });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });

  // one gentle sweep the first time the slider comes into view, as a hint
  if ('IntersectionObserver' in window && !reduceMotion) {
    const hint = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      hint.disconnect();
      const t0 = performance.now() + 500;
      const dur = 1800;
      const step = (now) => {
        if (touched) return;
        const p = Math.max(0, Math.min((now - t0) / dur, 1));
        const v = 50 + Math.sin(p * Math.PI * 2) * 22 * (1 - p * 0.4);
        setPos(p < 1 ? v : 50);
        range.value = p < 1 ? v : 50;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    hint.observe(ba);
  }
})();
