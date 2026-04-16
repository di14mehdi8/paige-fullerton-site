/* Paige Fullerton · Spokane Real Estate
   Lightweight JS: nav toggle, scroll reveal, form, year, URL param prefill */

(() => {
  'use strict';

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Mobile nav toggle ----------
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // Close on link click (mobile UX)
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Scroll reveal ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // ---------- Prefill area from URL (?area=kendall-yards) ----------
  const params = new URLSearchParams(window.location.search);
  const areaParam = params.get('area');
  if (areaParam) {
    const map = {
      'south-hill': 'South Hill',
      'kendall-yards': 'Kendall Yards',
      'liberty-lake': 'Liberty Lake',
      'rockwood': 'Rockwood',
      'spokane-valley': 'Spokane Valley',
      'north-spokane': 'North Spokane',
      'coeur-dalene': "Coeur d'Alene, ID"
    };
    const pretty = map[areaParam] || areaParam;
    document.querySelectorAll('select[name="area"], input[name="area"]').forEach((el) => {
      if (el.tagName === 'SELECT') {
        const match = [...el.options].find((o) => o.text === pretty);
        if (match) el.value = match.value || match.text;
      } else {
        el.value = pretty;
      }
    });
  }

  // ---------- Form submit (static — posts to Formspree/Netlify/etc when wired) ----------
  const form = document.getElementById('intake-form');
  if (form) {
    const successEl = form.querySelector('#form-success');
    const errorEl = form.querySelector('#form-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      successEl.classList.remove('success');
      successEl.style.display = 'none';
      errorEl.classList.remove('error');
      errorEl.style.display = 'none';

      // Simple validation
      const requiredFields = form.querySelectorAll('[required]');
      let valid = true;
      requiredFields.forEach((f) => {
        if (!f.value) { valid = false; f.style.borderColor = '#b04040'; }
        else { f.style.borderColor = ''; }
      });
      const intentChecked = form.querySelector('input[name="intent"]:checked');
      const needsIntent = !!form.querySelector('input[name="intent"]');
      if (needsIntent && !intentChecked) {
        valid = false;
      }

      if (!valid) {
        errorEl.textContent = 'Please complete the required fields.';
        errorEl.classList.add('error');
        errorEl.style.display = 'block';
        return;
      }

      const data = Object.fromEntries(new FormData(form).entries());

      // ---- Integration point ----
      // Replace the endpoint below with your Formspree / Netlify / SES-backed Lambda URL.
      const endpoint = form.dataset.endpoint || '';

      try {
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
          });
          if (!res.ok) throw new Error('Network error');
        }
        // Success UI
        const nameField = form.querySelector('[name="name"]');
        if (nameField && successEl) {
          const nameEl = successEl.querySelector('[data-name]');
          if (nameEl) nameEl.textContent = (nameField.value.split(' ')[0]) || 'friend';
        }
        successEl.classList.add('success');
        successEl.style.display = 'block';
        form.reset();
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (err) {
        errorEl.classList.add('error');
        errorEl.style.display = 'block';
      }
    });
  }
})();
