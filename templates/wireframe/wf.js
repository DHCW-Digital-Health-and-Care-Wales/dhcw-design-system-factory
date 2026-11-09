/* Wireframe-only behaviour: English/Welsh switch, low-fidelity mode and note
   markers. Add data-cy="Welsh text" to any element whose text should switch;
   leave data-cy empty when the translation isn't ready. */
(function () {
  var root = document.documentElement;

  function load(key) {
    try { return window.localStorage.getItem('wf-' + key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { window.localStorage.setItem('wf-' + key, value); } catch (e) { /* storage unavailable */ }
  }

  function setLanguage(lang) {
    var nodes = document.querySelectorAll('[data-cy]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (!el.hasAttribute('data-en')) el.setAttribute('data-en', el.textContent);
      var cy = el.getAttribute('data-cy');
      if (lang === 'cy') {
        el.textContent = cy || '[CY: needs translation]';
        el.classList.toggle('wf-missing', !cy);
      } else {
        el.textContent = el.getAttribute('data-en');
        el.classList.remove('wf-missing');
      }
    }
    root.setAttribute('lang', lang);
    syncSwitches(lang);
    var title = document.querySelector('title');
    if (title && title.hasAttribute('data-cy')) {
      document.title = lang === 'cy' ? (title.getAttribute('data-cy') || '[CY: needs translation]') : title.getAttribute('data-en');
    }
    save('lang', lang);
  }

  /* A proposed language switch on the page (data-wf-language-switch) offers the
     other language, named in that language, and switches the page when clicked. */
  function syncSwitches(lang) {
    var switches = document.querySelectorAll('[data-wf-language-switch]');
    for (var i = 0; i < switches.length; i++) {
      var other = lang === 'cy' ? 'en' : 'cy';
      switches[i].textContent = other === 'cy' ? 'Cymraeg' : 'English';
      switches[i].setAttribute('lang', other);
      switches[i].setAttribute('hreflang', other);
    }
  }

  function makeButton(label, pressed, onClick) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.setAttribute('aria-pressed', String(pressed));
    b.addEventListener('click', function () {
      var now = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(now));
      onClick(now);
    });
    return b;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var lang = load('lang') === 'cy' ? 'cy' : 'en';
    var lowfi = load('lowfi') === 'true';
    var notes = load('notes') !== 'false';

    root.classList.toggle('wf-lowfi', lowfi);
    root.classList.toggle('wf-show-notes', notes);
    if (lang === 'cy') setLanguage('cy'); else syncSwitches('en');

    var bar = document.createElement('div');
    bar.className = 'wf-toolbar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Wireframe controls');
    if (!document.querySelector('[data-wf-language-switch]')) {
      bar.appendChild(makeButton('Cymraeg', lang === 'cy', function (on) { setLanguage(on ? 'cy' : 'en'); }));
    }
    bar.appendChild(makeButton('Low fidelity', lowfi, function (on) { root.classList.toggle('wf-lowfi', on); save('lowfi', on); }));
    bar.appendChild(makeButton('Notes', notes, function (on) { root.classList.toggle('wf-show-notes', on); save('notes', on); }));

    if (document.querySelector('.wf-modal')) {
      bar.appendChild(makeButton('Warning', true, function (on) { root.classList.toggle('wf-hide-modal', !on); }));
    }

    var panel = document.querySelector('.wf-notes');
    (panel || document.body).appendChild(bar);
  });

  /* Click-through: any element with data-wf-href goes there when clicked, and
     Escape on a .wf-modal with data-wf-escape goes there. */
  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest ? event.target.closest('[data-wf-href]') : null;
    if (target) window.location.href = target.getAttribute('data-wf-href');
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape' || root.classList.contains('wf-hide-modal')) return;
    var modal = document.querySelector('.wf-modal[data-wf-escape]');
    if (modal) window.location.href = modal.getAttribute('data-wf-escape');
  });

  document.addEventListener('click', function (event) {
    var link = event.target && event.target.closest ? event.target.closest('[data-wf-language-switch]') : null;
    if (!link) return;
    event.preventDefault();
    setLanguage(root.getAttribute('lang') === 'cy' ? 'en' : 'cy');
  });
}());
