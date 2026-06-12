/* ============================================================
   THE FREIGHTER — interactions
   Kinetic type · 3D live map · reveal · forms
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionMul = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion')) || 1;

  /* ---------- 1. Kinetic hero ---------- */
  const hero = document.querySelector('.hero');
  const title = document.querySelector('.hero-title');
  const x3d = document.querySelector('.hero-title .x3d');
  const lines = [...document.querySelectorAll('.hero-title .ln')];

  function buildExtrude(dx, dy, depth) {
    // dx,dy in [-1,1]; build a stacked hard shadow for a 3D extrusion
    let s = [];
    const ux = -dx, uy = -dy;
    for (let i = 1; i <= depth; i++) {
      s.push(`${(ux * i).toFixed(1)}px ${(uy * i).toFixed(1)}px 0 var(--x-color, var(--ink))`);
    }
    return s.join(', ');
  }

  if (hero && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;   // -0.5..0.5
      ty = (e.clientY - r.top) / r.height - 0.5;
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      lines.forEach((ln, i) => {
        const d = (i + 1) / lines.length;
        ln.style.transform = `translate(${cx * 18 * d}px, ${cy * 8 * d}px)`;
      });
      if (x3d) {
        const depth = 9;
        x3d.style.setProperty('--extrude', buildExtrude(cx * 2.4, cy * 2.4, depth));
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  } else if (x3d) {
    x3d.style.setProperty('--extrude', buildExtrude(-2, -2, 9));
  }

  /* ---------- 2. 3D live map ---------- */
  const mapPlane = document.querySelector('.map-plane');
  const mapStage = document.querySelector('.map-stage');
  const mapSvg = document.querySelector('.map-svg');

  if (mapSvg) {
    const shipLayer = mapSvg.querySelector('#ship-layer');
    const arcs = [...mapSvg.querySelectorAll('.arc')];
    const ships = arcs.map((arc, i) => {
      const len = arc.getTotalLength();
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      g.setAttribute('r', '3.4');
      g.setAttribute('class', 'ship');
      shipLayer.appendChild(g);
      return { arc, len, dot: g, t: Math.random(), speed: 0.04 + Math.random() * 0.05 };
    });
    let last = performance.now();
    function animMap(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const m = reduce ? 0 : motionMul();
      ships.forEach((s) => {
        s.t += s.speed * dt * m;
        if (s.t > 1) s.t -= 1;
        const p = s.arc.getPointAtLength(s.t * s.len);
        s.dot.setAttribute('cx', p.x);
        s.dot.setAttribute('cy', p.y);
        s.dot.style.opacity = (s.t < 0.04 || s.t > 0.96) ? 0 : 1;
      });
      requestAnimationFrame(animMap);
    }
    requestAnimationFrame(animMap);

    // tilt parallax on the 3D plane
    if (mapStage && mapPlane && !reduce) {
      let rx = 50, rz = 0, trx = 50, trz = 0;
      mapStage.addEventListener('pointermove', (e) => {
        const r = mapStage.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        trx = 50 - py * 12;
        trz = px * 14;
      });
      mapStage.addEventListener('pointerleave', () => { trx = 50; trz = 0; });
      const tloop = () => {
        rx += (trx - rx) * 0.06;
        rz += (trz - rz) * 0.06;
        mapPlane.style.transform = `translate(-50%, -50%) rotateX(${rx}deg) rotateZ(${rz}deg)`;
        requestAnimationFrame(tloop);
      };
      requestAnimationFrame(tloop);
    }
  }

  /* ---------- 3. Live counters ---------- */
  document.querySelectorAll('[data-count]').forEach((el) => {
    const base = parseInt(el.dataset.count, 10);
    let cur = base;
    el.textContent = cur.toLocaleString('it-IT');
    setInterval(() => {
      if (reduce) return;
      cur += Math.floor(Math.random() * 3);
      el.textContent = cur.toLocaleString('it-IT');
    }, 2200 + Math.random() * 1500);
  });

  // rotating route readout
  const routeEl = document.querySelector('[data-route]');
  if (routeEl && !reduce) {
    const routes = ['MI → PA · 1.420 KM', 'TO → BA · 1.010 KM', 'BO → NA · 580 KM', 'MI → RM · 574 KM', 'VE → RC · 1.190 KM', 'GE → LE · 1.080 KM'];
    let ri = 0;
    setInterval(() => { ri = (ri + 1) % routes.length; routeEl.textContent = routes[ri]; }, 2600);
  }

  /* ---------- 4. Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => {
    io.observe(el);
    requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('in');
    });
  });
  setTimeout(() => document.querySelectorAll('.reveal:not(.in)').forEach((el) => el.classList.add('in')), 1400);

  /* ---------- 5. Forms ---------- */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // The hero form IS the .field (flex) box, so the error goes as a sibling
  // right after it — not inside, where it would squeeze beside input+button.
  function errHost(form) { return form.classList.contains('field') ? form.parentNode : form; }
  function err(form, msg) {
    const host = errHost(form);
    let e = host.querySelector(':scope > .errline');
    if (!e) {
      e = document.createElement('div'); e.className = 'errline';
      if (host === form) form.appendChild(e); else form.insertAdjacentElement('afterend', e);
    }
    e.textContent = msg;
  }
  function clearErr(form) { const e = errHost(form).querySelector(':scope > .errline'); if (e) e.remove(); }

  document.querySelectorAll('[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErr(form);
      const email = (form.querySelector('input[type="email"]') || {}).value || '';
      if (!EMAIL.test(email.trim())) { err(form, '× Inserisci una email valida'); return; }
      const kind = form.dataset.form;
      if (kind === 'final') {
        const role = form.querySelector('select[name="ruolo"]');
        if (role && !role.value) { err(form, '× Seleziona un ruolo'); return; }
      }
      const btn = form.querySelector('button[type="submit"], button:not([type])');
      const lbl = btn ? btn.querySelector('.lbl') : null;
      const labelText = lbl ? lbl.textContent : '';
      const restore = () => { if (btn) btn.disabled = false; if (lbl) lbl.textContent = labelText; };
      if (btn) { btn.disabled = true; if (lbl) lbl.textContent = 'INVIO…'; }

      const honeypot = (form.querySelector('input[name="website"]') || {}).value || '';
      fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: kind, website: honeypot }),
      })
        .then((r) => r.json().then((d) => ({ ok: r.ok, d })).catch(() => ({ ok: r.ok, d: {} })))
        .then(({ ok, d }) => {
          if (!ok) { restore(); err(form, '× ' + ((d && d.error) || 'Errore, riprova')); return; }
          done(form, kind, email.trim());
        })
        .catch(() => { restore(); err(form, '× Errore di rete, riprova'); });
    });
  });

  function done(form, kind, email) {
    const safe = email.replace(/[<>]/g, '');
    if (kind === 'final') {
      const role = form.querySelector('select[name="ruolo"]').value;
      const label = { brokerage: 'BROKERAGE', caricatore: 'CARICATORE', vettore: 'VETTORE', altro: 'ALTRO' }[role] || 'LISTA';
      const card = document.createElement('div');
      card.className = 'final-success';
      card.innerHTML = `
        <span class="ck">✓</span>
        <span class="pill">Lista · ${label}</span>
        <h3>Ci sei. Ora tocca a noi.</h3>
        <p>Abbiamo registrato <b>${safe}</b> per la beta privata. Ti scriviamo entro 48 ore per una demo sui tuoi carichi reali.</p>
        <p style="opacity:.85;font-family:var(--mono);font-size:11px;text-transform:uppercase;">Niente spam. Promesso.</p>`;
      form.replaceWith(card);
    } else {
      const field = form.querySelector('.field') || form;
      field.classList.add('ok');
      field.innerHTML = `<span class="okmsg">✓ Sei nella lista. Email: ${safe}</span>`;
    }
  }
})();
