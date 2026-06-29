(function (global) {
  'use strict';

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const REACTIONS = {
    koncert: { type: 'center', state: 'dance', bubble: '🎵', fraction: 0.52, duration: 3200 },
    wystawa: { type: 'lean', side: 'right', variant: 'back', bubble: '🖼️' },
    rodzinne: { type: 'center', state: 'happy', bubble: '🥳', fraction: 0.44, duration: 2600 },
    kino: { type: 'center', state: 'look', bubble: '🎬', fraction: 0.65, duration: 2300 },
    sport: { type: 'climb', side: 'left', bubble: '🤯' },
    warsztaty: { type: 'lean', side: 'left', variant: 'hand', bubble: '💡' },
    teatr: { type: 'center', state: 'point', bubble: '👏', fraction: 0.58, duration: 2500 },
    default: { type: 'center', state: 'look', bubble: '👀', fraction: 0.56, duration: 2200 }
  };

  class InteractiveMascot {
    constructor(options = {}) {
      this.host = typeof options.host === 'string' ? document.querySelector(options.host) : options.host;
      if (!this.host) throw new Error('InteractiveMascot: nie znaleziono elementu hosta.');

      this.options = {
        size: 108,
        startZone: 'track',
        startFraction: 0.08,
        listenWindowEvents: true,
        qrSafetyGap: 4,
        zones: {
          track: '#mascot-track',
          leftQr: '#qr-left',
          rightQr: '#qr-right'
        },
        ...options
      };

      this.token = 0;
      this.zoneRects = {};
      this.currentLeft = 0;
      this.currentBottom = 0;
      this.resizeObserver = null;
      this.onPosterEvent = (event) => this.react(event.detail || {});

      this.build();
      this.measure();
      this.placeImmediately(this.getTrackPosition(this.options.startFraction));
      this.setState('idle');
      this.bind();
    }

    build() {
      const layer = document.createElement('div');
      layer.className = 'mascot-layer';
      layer.setAttribute('aria-hidden', 'true');

      const mascot = document.createElement('div');
      mascot.className = 'mascot state-idle facing-right target-right';
      mascot.style.setProperty('--mascot-size', `${this.options.size}px`);

      const reaction = document.createElement('div');
      reaction.className = 'mascot__reaction';
      reaction.textContent = '👀';

      const character = document.createElement('div');
      character.className = 'mascot__character';
      character.innerHTML = `
        <div class="mascot__ear mascot__ear--left"></div>
        <div class="mascot__ear mascot__ear--right"></div>
        <div class="mascot__leg mascot__leg--left"></div>
        <div class="mascot__leg mascot__leg--right"></div>
        <div class="mascot__arm mascot__arm--left"></div>
        <div class="mascot__arm mascot__arm--right"></div>
        <div class="mascot__body"></div>
        <div class="mascot__shorts"></div>
        <div class="mascot__badge">SP</div>
        <div class="mascot__head">
          <span class="mascot__eye mascot__eye--left"><i></i></span>
          <span class="mascot__eye mascot__eye--right"><i></i></span>
          <span class="mascot__brow mascot__brow--left"></span>
          <span class="mascot__brow mascot__brow--right"></span>
          <span class="mascot__nose"></span>
          <span class="mascot__mouth"></span>
        </div>`;

      mascot.append(reaction, character);
      layer.append(mascot);
      this.host.append(layer);

      this.layer = layer;
      this.element = mascot;
      this.reaction = reaction;
    }

    bind() {
      if (this.options.listenWindowEvents) {
        global.addEventListener('signage:poster-change', this.onPosterEvent);
      }

      if ('ResizeObserver' in global) {
        this.resizeObserver = new ResizeObserver(() => {
          this.measure();
          this.placeImmediately({ left: this.currentLeft, bottom: this.currentBottom });
        });
        this.resizeObserver.observe(this.host);
      }
    }

    measure() {
      const hostRect = this.host.getBoundingClientRect();
      this.hostWidth = hostRect.width || 1;
      this.hostHeight = hostRect.height || 1;
      this.mascotWidth = this.element.offsetWidth || this.options.size;
      this.mascotHeight = this.element.offsetHeight || this.options.size * 1.18;
      this.zoneRects = {};

      Object.entries(this.options.zones || {}).forEach(([name, selector]) => {
        const element = typeof selector === 'string' ? this.host.querySelector(selector) : selector;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        this.zoneRects[name] = {
          left: rect.left - hostRect.left,
          top: rect.top - hostRect.top,
          width: rect.width,
          height: rect.height,
          right: rect.right - hostRect.left,
          bottom: rect.bottom - hostRect.top
        };
      });
    }

    setState(state) {
      [...this.element.classList]
        .filter((name) => name.startsWith('state-'))
        .forEach((name) => this.element.classList.remove(name));
      this.element.classList.add(`state-${state}`);
    }

    setTargetSide(side = 'right') {
      this.element.classList.remove('target-left', 'target-right');
      this.element.classList.add(side === 'left' ? 'target-left' : 'target-right');
    }

    face(direction = 'right') {
      this.element.classList.toggle('facing-left', direction === 'left');
      this.element.classList.toggle('facing-right', direction !== 'left');
    }

    getTrackPosition(fraction = 0.5) {
      const rect = this.zoneRects.track || {
        left: 0,
        width: this.hostWidth,
        bottom: this.hostHeight
      };
      const normalized = clamp(Number(fraction) || 0, 0, 1);
      const range = Math.max(0, rect.width - this.mascotWidth);
      return {
        left: rect.left + range * normalized,
        bottom: this.hostHeight - rect.bottom - 2
      };
    }

    getQrSidePosition(side = 'left', elevated = false) {
      const rect = this.zoneRects[side === 'left' ? 'leftQr' : 'rightQr'];
      if (!rect) return this.getTrackPosition(side === 'left' ? 0 : 1);

      const gap = this.options.qrSafetyGap;
      let left;

      if (side === 'left') {
        left = rect.right + gap;
      } else {
        left = rect.left - this.mascotWidth - gap;
      }

      left = clamp(left, 0, Math.max(0, this.hostWidth - this.mascotWidth));

      return {
        left,
        bottom: elevated
          ? this.hostHeight - rect.top + 2
          : this.hostHeight - rect.bottom - 2
      };
    }

    placeImmediately(position) {
      this.currentLeft = position.left;
      this.currentBottom = position.bottom;
      this.element.style.transitionDuration = '0ms, 0ms';
      this.element.style.left = `${position.left}px`;
      this.element.style.bottom = `${position.bottom}px`;
      void this.element.offsetWidth;
      this.element.style.removeProperty('transition-duration');
    }

    async moveTo(position, duration = 1550, state = 'walk', token = this.token) {
      this.face(position.left < this.currentLeft ? 'left' : 'right');
      this.setState(state);
      this.element.style.transitionDuration = `${duration}ms, ${Math.min(1050, duration)}ms`;
      this.element.style.left = `${position.left}px`;
      this.element.style.bottom = `${position.bottom}px`;
      this.currentLeft = position.left;
      this.currentBottom = position.bottom;

      await wait(duration);
      if (token !== this.token) return false;
      if (state === 'walk' || state === 'climb') this.setState('idle');
      return true;
    }

    async say(text, duration = 1400, token = this.token) {
      this.reaction.textContent = text;
      this.element.classList.add('is-speaking');
      await wait(duration);
      if (token !== this.token) return false;
      this.element.classList.remove('is-speaking');
      return true;
    }

    async perform(state, duration = 2400, token = this.token) {
      this.setState(state);
      await wait(duration);
      if (token !== this.token) return false;
      this.setState('idle');
      return true;
    }

    async performCenterReaction(config, token) {
      const arrived = await this.moveTo(this.getTrackPosition(config.fraction || 0.5), 1550, 'walk', token);
      if (!arrived) return;

      await Promise.all([
        this.say(config.bubble, 1450, token),
        this.perform(config.state, config.duration || 2400, token)
      ]);

      if (token !== this.token) return;
      this.setState('look');
      await wait(850);
      if (token === this.token) this.setState('idle');
    }

    async leanOn(side = 'left', variant = 'hand', token = ++this.token, bubble = '👀') {
      const position = this.getQrSidePosition(side, false);
      const arrived = await this.moveTo(position, 1500, 'walk', token);
      if (!arrived) return;

      this.setTargetSide(side);

      if (variant === 'hand') {
        this.face(side === 'left' ? 'left' : 'right');
        this.setState('lean-hand');
      } else {
        this.face(side === 'left' ? 'right' : 'left');
        this.setState('lean-back');
      }

      await this.say(bubble, 1550, token);
      if (token !== this.token) return;
      await wait(800);
      if (token === this.token) this.setState('idle');
    }

    async climb(side = 'left', token = ++this.token, bubble = '😄') {
      const groundPosition = this.getQrSidePosition(side, false);
      const topPosition = this.getQrSidePosition(side, true);

      const arrived = await this.moveTo(groundPosition, 1450, 'walk', token);
      if (!arrived) return;

      this.setTargetSide(side);
      this.face(side === 'left' ? 'left' : 'right');

      const climbed = await this.moveTo(topPosition, 1100, 'climb', token);
      if (!climbed) return;

      this.face(side === 'left' ? 'right' : 'left');
      this.setState('look');
      await this.say(bubble, 1450, token);
      if (token !== this.token) return;
      this.setState('happy');
      await wait(1100);
      if (token === this.token) this.setState('idle');
    }

    normalizeCategory(value = '') {
      const text = String(value).toLowerCase();
      if (/koncert|muzyk|festival|festiwal/.test(text)) return 'koncert';
      if (/wystaw|galeri|malar|sztuk/.test(text)) return 'wystawa';
      if (/rodzin|dzieci|piknik/.test(text)) return 'rodzinne';
      if (/kino|film|seans/.test(text)) return 'kino';
      if (/sport|rower|bieg|downhill/.test(text)) return 'sport';
      if (/warsztat|zajęcia|pracown/.test(text)) return 'warsztaty';
      if (/teatr|spektakl/.test(text)) return 'teatr';
      return 'default';
    }

    async react(input = {}) {
      const token = ++this.token;
      const category = this.normalizeCategory(input.category || input.type || input.kind || input.title);
      const config = { ...REACTIONS.default, ...(REACTIONS[category] || {}) };

      this.element.classList.remove('is-speaking');
      this.element.dispatchEvent(new CustomEvent('mascot:reaction-start', {
        bubbles: true,
        detail: { category, input }
      }));

      if (config.type === 'climb') {
        await this.climb(config.side, token, input.bubble || config.bubble);
      } else if (config.type === 'lean') {
        await this.leanOn(config.side, config.variant, token, input.bubble || config.bubble);
      } else {
        await this.performCenterReaction({ ...config, bubble: input.bubble || config.bubble }, token);
      }

      if (token !== this.token) return;
      this.element.dispatchEvent(new CustomEvent('mascot:reaction-end', {
        bubbles: true,
        detail: { category, input }
      }));
    }

    destroy() {
      this.token += 1;
      global.removeEventListener('signage:poster-change', this.onPosterEvent);
      if (this.resizeObserver) this.resizeObserver.disconnect();
      this.layer.remove();
    }
  }

  global.InteractiveMascot = InteractiveMascot;
  global.notifyMascotPosterChange = function notifyMascotPosterChange(detail) {
    global.dispatchEvent(new CustomEvent('signage:poster-change', { detail }));
  };
})(window);
