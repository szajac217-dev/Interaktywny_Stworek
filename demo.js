(() => {
  'use strict';

  const posters = {
    wystawa: { eyebrow: 'JOANNA TURKIEWICZ–DĄBROWSKA', title: 'PRZE<br>CI<br>WIEŃ<br>STWA', subtitle: 'WYSTAWA MALARSTWA', details: 'Wystawa czynna 17 maja – 12 lipca<br>Dom Carla i Gerharta Hauptmannów' },
    koncert: { eyebrow: 'LETNIE BRZMIENIA', title: 'KON<br>CERT<br>NA<br>ŻYWO', subtitle: 'MUZYKA • EMOCJE • ENERGIA', details: 'Sobota, godz. 19:00<br>Skwer Radiowej Trójki' },
    rodzinne: { eyebrow: 'WSPÓLNY CZAS', title: 'PIK<br>NIK<br>RO<br>DZINNY', subtitle: 'ZABAWA DLA MAŁYCH I DUŻYCH', details: 'Niedziela, godz. 12:00<br>Wstęp wolny' },
    kino: { eyebrow: 'KINO ZA ROGIEM', title: 'SE<br>ANS<br>FIL<br>MOWY', subtitle: 'DUŻE EMOCJE NA MAŁEJ SALI', details: 'Piątek, godz. 18:00<br>Liczba miejsc ograniczona' },
    sport: { eyebrow: 'KARKONOSKA PRZYGODA', title: 'ROW<br>ER<br>I<br>GÓRY', subtitle: 'ADRENALINA I DOBRA ZABAWA', details: 'Start o godz. 10:00<br>Trasa rodzinna i sportowa' },
    warsztaty: { eyebrow: 'PRACOWNIA TWÓRCZA', title: 'ZRÓB<br>TO<br>SAM', subtitle: 'WARSZTATY DLA KAŻDEGO', details: 'Zapisy w MOKSiAL<br>Materiały zapewnia organizator' }
  };

  const poster = document.querySelector('#demo-poster');
  const status = document.querySelector('#status');
  const screen = document.querySelector('#signage-demo');
  const host = document.querySelector('#mascot-host');

  const mascot = new InteractiveMascot({
    host,
    size: 108,
    startZone: 'track',
    startFraction: 0.08,
    zones: { track: '#mascot-track', leftQr: '#qr-left', rightQr: '#qr-right' }
  });

  function showPoster(category) {
    const data = posters[category] || posters.wystawa;
    poster.className = `poster poster--${category}`;
    poster.dataset.category = category;
    document.querySelector('#poster-eyebrow').textContent = data.eyebrow;
    document.querySelector('#poster-title').innerHTML = data.title;
    document.querySelector('#poster-subtitle').textContent = data.subtitle;
    document.querySelector('#poster-details').innerHTML = data.details;
    status.textContent = `reakcja: ${category}`;
    notifyMascotPosterChange({ category, title: data.title.replaceAll('<br>', ' ') });
  }

  document.querySelectorAll('[data-demo]').forEach((button) => {
    button.addEventListener('click', () => showPoster(button.dataset.demo));
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.action;
      status.textContent = `ruch specjalny: ${action}`;
      if (action === 'climb-left') await mascot.climb('left');
      if (action === 'climb-right') await mascot.climb('right');
      if (action === 'lean-left-hand') await mascot.leanOn('left', 'hand');
      if (action === 'lean-right-hand') await mascot.leanOn('right', 'hand');
      if (action === 'lean-left-back') await mascot.leanOn('left', 'back');
      if (action === 'lean-right-back') await mascot.leanOn('right', 'back');
      status.textContent = 'gotowy';
    });
  });

  document.querySelector('#debug-toggle').addEventListener('change', (event) => {
    screen.classList.toggle('debug', event.target.checked);
  });

  host.addEventListener('mascot:reaction-start', (event) => {
    status.textContent = `stworek reaguje: ${event.detail.category}`;
  });

  host.addEventListener('mascot:reaction-end', (event) => {
    status.textContent = `gotowy • ostatnia reakcja: ${event.detail.category}`;
  });

  function updateClock() {
    const now = new Date();
    document.querySelector('#clock').textContent = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    document.querySelector('#date').textContent = now.toLocaleDateString('pl-PL', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  updateClock();
  setInterval(updateClock, 1000);
  status.textContent = 'gotowy';
  setTimeout(() => mascot.leanOn('right', 'back'), 900);
})();
