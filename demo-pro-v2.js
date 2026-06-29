(() => {
  'use strict';

  const posterData = {
    wystawa: ['JOANNA TURKIEWICZ–DĄBROWSKA', 'PRZE<br>CI<br>WIEŃ<br>STWA', 'WYSTAWA MALARSTWA', 'Wystawa czynna 17 maja – 12 lipca<br>Dom Carla i Gerharta Hauptmannów'],
    koncert: ['LETNIE BRZMIENIA', 'KON<br>CERT<br>NA<br>ŻYWO', 'MUZYKA • EMOCJE • ENERGIA', 'Sobota, godz. 19:00<br>Skwer Radiowej Trójki'],
    rodzinne: ['WSPÓLNY CZAS', 'PIK<br>NIK<br>RO<br>DZINNY', 'ZABAWA DLA MAŁYCH I DUŻYCH', 'Niedziela, godz. 12:00<br>Wstęp wolny'],
    kino: ['KINO ZA ROGIEM', 'SE<br>ANS<br>FIL<br>MOWY', 'DUŻE EMOCJE NA MAŁEJ SALI', 'Piątek, godz. 18:00<br>Liczba miejsc ograniczona'],
    sport: ['KARKONOSKA PRZYGODA', 'ROW<br>ER<br>I<br>GÓRY', 'ADRENALINA I DOBRA ZABAWA', 'Start o godz. 10:00<br>Trasa rodzinna i sportowa'],
    warsztaty: ['PRACOWNIA TWÓRCZA', 'ZRÓB<br>TO<br>SAM', 'WARSZTATY DLA KAŻDEGO', 'Zapisy w MOKSiAL<br>Materiały zapewnia organizator']
  };

  const track = document.querySelector('#mascot-track');
  const status = document.querySelector('#status');
  const screen = document.querySelector('#signage-demo');
  const mascot = new ProMascot({ host: track, startPosition: 0.08 });
  window.proMascot = mascot;

  mascot.ready.then(() => status.textContent = 'model PRO 2.0 gotowy').catch(() => status.textContent = 'błąd wczytywania modelu');

  document.querySelectorAll('[data-demo]').forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.demo;
      const data = posterData[category] || posterData.wystawa;
      document.querySelector('#demo-poster').className = `poster poster--${category}`;
      document.querySelector('#poster-eyebrow').textContent = data[0];
      document.querySelector('#poster-title').innerHTML = data[1];
      document.querySelector('#poster-subtitle').textContent = data[2];
      document.querySelector('#poster-details').innerHTML = data[3];
      notifyMascotPosterChange({ category, title: data[1].replaceAll('<br>', ' ') });
    });
  });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.action;
      if (action === 'climb-left') await mascot.climb('left');
      if (action === 'climb-right') await mascot.climb('right');
      if (action === 'lean-left') await mascot.leanOn('left');
      if (action === 'lean-right') await mascot.leanOn('right');
      if (action === 'blink') await mascot.blink();
      if (action === 'look') await mascot.lookUp(1400, ++mascot.token);
      if (action === 'happy') await mascot.perform('happy', 1600, ++mascot.token);
      if (action === 'surprised') await mascot.perform('surprised', 1500, ++mascot.token);
    });
  });

  document.querySelector('#debug-toggle').addEventListener('change', (event) => screen.classList.toggle('debug', event.target.checked));

  const width = document.querySelector('#setting-width');
  const speed = document.querySelector('#setting-speed');
  const idle = document.querySelector('#setting-idle');
  const random = document.querySelector('#setting-random');

  function applySettings() {
    mascot.updateSettings({
      width: Number(width.value),
      height: Math.round(Number(width.value) * 1.5),
      moveDuration: Number(speed.value),
      idleMinMs: Number(idle.value) * 1000,
      idleMaxMs: Number(idle.value) * 1000 + 12000,
      randomBehaviors: random.checked
    });
    document.querySelector('#setting-width-value').textContent = `${width.value}px`;
    document.querySelector('#setting-speed-value').textContent = `${speed.value} ms`;
    document.querySelector('#setting-idle-value').textContent = `${idle.value} s`;
  }

  [width, speed, idle, random].forEach((control) => {
    control.addEventListener('input', applySettings);
    control.addEventListener('change', applySettings);
  });
  applySettings();

  track.addEventListener('mascot:reaction-start', (event) => status.textContent = `stworek reaguje: ${event.detail.category}`);
  track.addEventListener('mascot:reaction-end', (event) => status.textContent = `gotowy • ${event.detail.category}`);

  function updateClock() {
    const now = new Date();
    document.querySelector('#clock').textContent = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    document.querySelector('#date').textContent = now.toLocaleDateString('pl-PL', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  updateClock();
  setInterval(updateClock, 1000);
})();
