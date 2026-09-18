(() => {
  const KEY = 'altages-consent-v1';
  const TTL = 180 * 24 * 60 * 60 * 1000;
  const id = window.ALTAGES_ANALYTICS_ID || '';
  const enabled = /^G-[A-Z0-9]+$/.test(id);
  let loaded = false;
  let expiryTimer;
  let memoryChoice = null;
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY));
      if (value?.version === 1 && typeof value.analytics === 'boolean' &&
          Number.isFinite(value.expires) && value.expires > Date.now() && value.expires <= Date.now() + TTL) return value;
    } catch { /* Storage can be unavailable. Default to no tracking. */ }
    return null;
  };
  function clearCookies() {
    const names = document.cookie.split(';').map(c => c.trim().split('=')[0]).filter(n => /^_ga(?:_|$)/.test(n));
    const parts = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < parts.length - 1; i++) domains.push(parts.slice(i).join('.'));
    for (const name of names) for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax${domain ? `; Domain=${domain}` : ''}`;
    }
  }
  function stop() {
    window[`ga-disable-${id}`] = true;
    clearTimeout(expiryTimer);
    clearCookies();
    if (loaded) location.reload();
  }
  function start(choice) {
    if (!enabled || !choice?.analytics || loaded) return;
    loaded = true;
    window[`ga-disable-${id}`] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'});
    window.gtag('consent', 'update', {analytics_storage: 'granted'});
    window.gtag('js', new Date());
    window.gtag('config', id, {
      allow_google_signals: false, allow_ad_personalization_signals: false,
      cookie_expires: TTL / 1000, cookie_update: false,
      page_location: location.origin + location.pathname, page_referrer: '',
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    script.id = 'altages-analytics';
    document.head.append(script);
    const checkExpiry = () => {
      if (Date.now() >= choice.expires) { stop(); return; }
      expiryTimer = setTimeout(checkExpiry, Math.min(choice.expires - Date.now(), 2147483647));
    };
    checkExpiry();
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'cookie-dialog';
  dialog.setAttribute('aria-labelledby', 'cookie-title');
  dialog.setAttribute('aria-describedby', 'cookie-description');
  dialog.innerHTML = `<button type="button" class="cookie-close" aria-label="Fermer sans modifier mon choix">×</button>
    <h2 id="cookie-title">Votre choix, en toute simplicité.</h2>
    <p id="cookie-description">Avec votre accord, Google Analytics nous aide à comprendre la fréquentation du site. Vous pouvez refuser et continuer votre visite normalement.</p>
    <p class="cookie-unavailable" hidden>La mesure d’audience n’est pas activée. Aucun script Google Analytics n’est chargé.</p>
    <div class="cookie-actions"><button type="button" class="button cookie-choice" data-choice="no">Tout refuser</button><button type="button" class="button cookie-choice" data-choice="yes">Tout accepter</button></div>
    <p class="cookie-links"><a href="/cookies/">En savoir plus sur les cookies</a> · <a href="/confidentialite/">Confidentialité</a></p>`;
  document.body.append(dialog);
  dialog.querySelector('.cookie-unavailable').hidden = enabled;
  dialog.querySelector('[data-choice="yes"]').disabled = !enabled;
  if (!enabled) dialog.querySelector('#cookie-description').textContent = 'Seul votre choix est mémorisé sur ce navigateur lorsque vous l’enregistrez.';
  document.querySelectorAll('[data-analytics-status]').forEach(el => {
    if (enabled) el.textContent = 'Google Analytics est disponible sur ce site et reste désactivé tant que vous ne l’avez pas accepté.';
  });
  dialog.querySelector('.cookie-close').addEventListener('click', () => dialog.close());
  document.querySelectorAll('[data-cookie-settings]').forEach(button => button.addEventListener('click', () => {
    if (dialog.open) dialog.close();
    dialog.showModal();
  }));
  dialog.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    memoryChoice = {version: 1, analytics: enabled && button.dataset.choice === 'yes', expires: Date.now() + TTL};
    try { localStorage.setItem(KEY, JSON.stringify(memoryChoice)); } catch { /* Choice lasts for this page only. */ }
    dialog.close();
    if (memoryChoice.analytics) start(memoryChoice); else stop();
  }));
  memoryChoice = read();
  if (enabled && memoryChoice?.analytics) start(memoryChoice);
  else {clearCookies(); if (enabled && !memoryChoice) dialog.show();}
  window.addEventListener('storage', event => {
    if (event.key !== KEY && event.key !== null) return;
    memoryChoice = read();
    if (!memoryChoice?.analytics) stop(); else start(memoryChoice);
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && loaded && (!memoryChoice?.analytics || Date.now() >= memoryChoice.expires)) stop();
  });
})();
